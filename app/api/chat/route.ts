import { getPublicCharacterBySlug } from "@/lib/characters/queries";
import { buildChatPrompt } from "@/lib/chat/prompt-builder";
import { createDeepSeekProvider } from "@/lib/llm/providers/deepseek";
import { z } from "zod";

const chatRequestSchema = z.object({
  characterSlug: z.string().min(1),
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

    const { characterSlug, messages, model } = parsed.data;

    const character = await getPublicCharacterBySlug(characterSlug);
    if (!character) {
      return new Response(JSON.stringify({ error: "Character not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const llmMessages = buildChatPrompt({
      character,
      messages
    });

    const provider = createDeepSeekProvider();

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
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "token", value: event.value })}\n\n`));
            } else if (event.type === "error") {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "error", error: event.error.message })}\n\n`)
              );
            } else if (event.type === "done") {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "done",
                    usage: event.response?.usage
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
