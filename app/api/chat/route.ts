import { getPublicCharacterBySlug, getSupabaseCharacterIdBySlug } from "@/lib/characters/queries";
import { buildChatPrompt } from "@/lib/chat/prompt-builder";
import type { LoreChunk } from "@/lib/rag/types";
import { createConversation, saveMessage } from "@/lib/chat/conversations";
import { createDeepSeekProvider } from "@/lib/llm/providers/deepseek";
import { retrieveRelevantChunks } from "@/lib/rag/retrievers/vector-retriever";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth/server";
import { getPinnedFacts, type MemoryEntry } from "@/lib/memories/queries";
import { getUserDefaultProvider } from "@/lib/chat/provider-config";
import { safeError } from "@/lib/api/errors";
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
    if (request.headers.get("content-type")?.includes("application/json") !== true) {
      return new Response(JSON.stringify({ error: "Content-Type must be application/json" }), {
        status: 415,
        headers: { "Content-Type": "application/json" }
      });
    }

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
    const { data: userData } = supabase
      ? await supabase.auth.getUser()
      : { data: { user: null } };

    const userId = userData?.user?.id ?? null;
    let activeConversationId = conversationId ?? null;
    let userMsgId: string | null = null;

    // Verify conversation ownership if provided
    if (userId && activeConversationId) {
      const { getConversation } = await import("@/lib/chat/conversations");
      const existing = await getConversation(activeConversationId, userId);
      if (!existing) {
        return new Response(JSON.stringify({ error: "Conversation not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Save user message if authenticated
    if (userId) {
      await ensureProfile(userId);

      // Resolve character UUID
      const characterId = await getSupabaseCharacterIdBySlug(characterSlug);

      if (!activeConversationId) {
        const created = await createConversation({
          userId,
          characterId: characterId ?? undefined,
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

    // RAG retrieval: find relevant lore chunks
    let loreContext: LoreChunk[] = [];
    const defaultLorePackIds = character.card.knowledge?.defaultLorePackIds;
    if (defaultLorePackIds && defaultLorePackIds.length > 0) {
      const latestUserMsg = [...messages].reverse().find((m) => m.role === "user");
      if (latestUserMsg) {
        try {
          loreContext = await retrieveRelevantChunks({
            query: latestUserMsg.content,
            lorePackIds: defaultLorePackIds,
            spoilerLevel: character.card.knowledge?.spoilerLevel === "user_selected" ? undefined : character.card.knowledge?.spoilerLevel,
            canonLevel: character.card.knowledge?.canonPreference === "canon_first" ? "canon" : undefined
          });
        } catch {
          // RAG is best-effort, don't fail chat on retrieval errors
        }
      }
    }

    // Memory retrieval: get pinned facts and active memories for this character
    let activeMemories: MemoryEntry[] = [];
    if (userId) {
      try {
        const characterId = await getSupabaseCharacterIdBySlug(characterSlug);
        if (characterId) {
          activeMemories = await getPinnedFacts({
            userId,
            characterId
          });
        }
      } catch {
        // Memory retrieval is best-effort
      }
    }

    const llmMessages = buildChatPrompt({
      character,
      messages,
      loreContext: loreContext.length > 0 ? loreContext : undefined,
      memories: activeMemories.length > 0 ? activeMemories : undefined
    });

    // Resolve model: request param > user DB default > env default
    let resolvedModel = model ?? "deepseek-chat";
    if (!model && userId) {
      const userConfig = await getUserDefaultProvider(userId);
      if (userConfig) resolvedModel = userConfig.model;
    }

    const provider = createDeepSeekProvider();
    let assistantContent = "";
    const citations = loreContext.map((chunk) => ({
      chunkId: chunk.chunkId,
      content: chunk.content.slice(0, 200),
      similarity: chunk.similarity,
      source: chunk.metadata?.source_type ?? "lore"
    }));

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of provider.stream({
            model: resolvedModel,
            messages: llmMessages,
            temperature: character.card.model.temperature
          })) {
            if (event.type === "token") {
              assistantContent += event.value;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "token", value: event.value })}\n\n`));
            } else if (event.type === "error") {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "error", error: safeError(event.error) })}\n\n`)
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
                    content: assistantContent,
                    metadata: citations.length > 0 ? { citations } as unknown as import("@/types/database.types").Json : undefined,
                    tokenCount: event.response?.usage?.totalTokens
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
                    assistantMessageId: assistantMsgId,
                    citations: citations.length > 0 ? citations : undefined
                  })}\n\n`
                )
              );

              // Background memory extraction (fire-and-forget)
              if (userId && activeConversationId && assistantContent) {
                const extractionMessages = [
                  ...messages,
                  { id: "latest-assistant", role: "assistant" as const, content: assistantContent, createdAt: new Date().toISOString() }
                ];
                import("@/lib/memories/extractor").then(({ extractMemoryCandidates }) => {
                  extractMemoryCandidates({
                    characterName: character.name,
                    characterSlug,
                    conversationHistory: extractionMessages
                  }).then((candidates) => {
                    if (candidates.length > 0) {
                      import("@/lib/memories/queries").then(({ createMemory }) => {
                        Promise.all(
                          candidates
                            .filter((c) => c.confidence >= 0.6)
                            .slice(0, 5)
                            .map((c) =>
                              createMemory({
                                userId,
                                conversationId: activeConversationId!,
                                type: c.type,
                                content: c.content,
                                confidence: c.confidence,
                                pinned: false
                              })
                            )
                        ).catch(() => {});
                      });
                    }
                  }).catch(() => {});
                });
              }
            }
          }
        } catch (error) {
          const message = safeError(error);
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
    return new Response(JSON.stringify({ error: safeError(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
