import { getServerEnvOrNull } from "@/lib/env";
import type { LLMProvider, LLMGenerateOptions, LLMResponse, LLMStreamEvent, LLMMessage } from "@/lib/llm/types";

function convertMessages(messages: LLMMessage[]): { role: string; content: string }[] {
  return messages.map((m) => {
    if (m.role === "system") return { role: "user", content: `[System instructions]: ${m.content}` };
    return { role: m.role, content: m.content };
  });
}

export function createAnthropicProvider(): LLMProvider {
  const id = "anthropic" as const;
  const displayName = "Anthropic";

  async function generate(options: LLMGenerateOptions): Promise<LLMResponse> {
    const env = getServerEnvOrNull();
    const apiKey = env?.ANTHROPIC_API_KEY;
    if (!env || !apiKey) throw new Error("ANTHROPIC_API_KEY is not configured.");

    const systemMsg = options.messages.find((m) => m.role === "system");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: options.model || "claude-sonnet-4-20250514",
        max_tokens: options.maxTokens || 4096,
        system: systemMsg?.content,
        messages: convertMessages(options.messages.filter((m) => m.role !== "system")),
        temperature: options.temperature
      }),
      signal: AbortSignal.timeout(90_000)
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.content?.find((b: { type: string }) => b.type === "text");

    return {
      content: textContent?.text ?? "",
      model: data.model ?? options.model,
      provider: id,
      usage: data.usage
        ? { inputTokens: data.usage.input_tokens, outputTokens: data.usage.output_tokens, totalTokens: data.usage.input_tokens + data.usage.output_tokens }
        : undefined
    };
  }

  async function* stream(options: LLMGenerateOptions): AsyncIterable<LLMStreamEvent> {
    const env = getServerEnvOrNull();
    const apiKey = env?.ANTHROPIC_API_KEY;
    if (!env || !apiKey) {
      yield { type: "error", error: new Error("ANTHROPIC_API_KEY is not configured.") };
      return;
    }

    const systemMsg = options.messages.find((m) => m.role === "system");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: options.model || "claude-sonnet-4-20250514",
        max_tokens: options.maxTokens || 4096,
        system: systemMsg?.content,
        messages: convertMessages(options.messages.filter((m) => m.role !== "system")),
        temperature: options.temperature,
        stream: true
      }),
      signal: AbortSignal.timeout(120_000)
    });

    if (!response.ok) {
      yield { type: "error", error: new Error(`Anthropic API error ${response.status}`) };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield { type: "error", error: new Error("No response body from Anthropic") };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let fullContent = "";
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          try {
            const event = JSON.parse(data);

            if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
              const text = event.delta.text as string;
              fullContent += text;
              yield { type: "token", value: text };
            } else if (event.type === "message_start" && event.message?.usage) {
              inputTokens = event.message.usage.input_tokens || 0;
            } else if (event.type === "message_delta" && event.usage) {
              outputTokens = event.usage.output_tokens || 0;
            }
          } catch {
            // skip malformed SSE
          }
        }
      }
    } catch (error) {
      yield { type: "error", error: error instanceof Error ? error : new Error(String(error)) };
      return;
    } finally {
      reader.releaseLock();
    }

    yield {
      type: "done",
      response: {
        content: fullContent,
        model: options.model,
        provider: id,
        usage: inputTokens || outputTokens
          ? { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens }
          : undefined
      }
    };
  }

  return { id, displayName, generate, stream };
}
