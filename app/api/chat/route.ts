import { getPublicCharacterBySlug, getSupabaseCharacterIdBySlug } from "@/lib/characters/queries";
import { buildChatPrompt } from "@/lib/chat/prompt-builder";
import { createConversation, saveMessage } from "@/lib/chat/conversations";
import { createDeepSeekProvider } from "@/lib/llm/providers/deepseek";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth/server";
import { z } from "zod";

const chatRequestSchema = z.object({
  characterSlug: z.string().min(1),
  conversationId: z.string().optional(),
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
      createdAt: z.string()
    })
  ),
  model: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request", details: parsed.error.issues }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { characterSlug, conversationId, messages, model } = parsed.data;

    const character = await getPublicCharacterBySlug(characterSlug);
    if (!character) {
      return new Response(JSON.stringify({ error: "Character not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check auth for conversation persistence
    const supabase = await createSupabaseServerClient();
    const { data: sessionData } = supabase
      ? await supabase.auth.getSession()
      : { data: { session: null } };

    const userId = sessionData?.session?.user?.id ?? null;
    let activeConversationId = conversationId ?? null;
    let userMsgId: string | null = null;

    // Save user message if authenticated
    if (userId) {
      await ensureProfile(userId);

      // Resolve character UUID
      const characterId = await getSupabaseCharacterIdBySlug(characterSlug);

      if (!activeConversationId) {
        const created = await createConversation({
          userId,
          characterId: characterId ?? "",
          title: character.name
        });
        if (created) activeConversationId = created;
      }

      if (activeConversationId) {
        // Find and save the latest user message
        const latestUserMsg = [...messages].reverse().find((m) => m.role === "user");
        if (latestUserMsg) {
          userMsgId = await saveMessage({
            conversationId: activeConversationId,
            role: "user",
            characterId,
            content: latestUserMsg.content
          });
        }
      }
    }

    const llmMessages = buildChatPrompt({
      character,
      messages
    });

    const provider = createDeepSeekProvider();
    let assistantContent = "";

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of provider.stream({
            model: model ?? "deepseek-chat",
            messages: llmMessages,
            temperature: character.card.model.temperature
          })) {
            if (event.type === "token") {
              assistantContent += event.value;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "token", value: event.value })}\n\n`));
            } else if (event.type === "error") {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "error", error: event.error.message })}\n\n`)
              );
            } else if (event.type === "done") {
              // Save assistant message if authenticated
              let assistantMsgId: string | null = null;
              if (userId && activeConversationId && assistantContent) {
                const supabase2 = await createSupabaseServerClient();
                if (supabase2) {
                  const characterId = await getSupabaseCharacterIdBySlug(characterSlug);
                  assistantMsgId = await saveMessage({
                    conversationId: activeConversationId,
                    role: "assistant",
                    characterId,
                    content: assistantContent
                  });
                }
              }

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "done",
                    usage: event.response?.usage,
                    conversationId: activeConversationId,
                    userMessageId: userMsgId,
                    assistantMessageId: assistantMsgId
                  })}\n\n`
                )
              );
            }
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: message })}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
