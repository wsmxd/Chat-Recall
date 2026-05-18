import { getServerEnvOrNull } from "@/lib/env";
import type { LLMProvider, LLMGenerateOptions, LLMResponse, LLMStreamEvent } from "@/lib/llm/types";

function buildHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
    "X-Title": "Chat Recall"
  };
}

function parseSSELine(line: string): Record<string, unknown> | null {
  const trimmed = line.trim();
  if (!trimmed || !trimmed.startsWith("data:")) return null;
  const data = trimmed.slice(5).trim();
  if (data === "[DONE]") return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function createOpenRouterProvider(): LLMProvider {
  const id = "openrouter" as const;
  const displayName = "OpenRouter";

  async function generate(options: LLMGenerateOptions): Promise<LLMResponse> {
    const env = getServerEnvOrNull();
    const apiKey = env?.OPENROUTER_API_KEY;
    if (!env || !apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: buildHeaders(apiKey),
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: false
      }),
      signal: AbortSignal.timeout(90_000)
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error ${response.status}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    return {
      content: choice?.message?.content ?? "",
      model: data.model ?? options.model,
      provider: id,
      usage: data.usage
        ? { inputTokens: data.usage.prompt_tokens, outputTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens }
        : undefined
    };
  }

  async function* stream(options: LLMGenerateOptions): AsyncIterable<LLMStreamEvent> {
    const env = getServerEnvOrNull();
    const apiKey = env?.OPENROUTER_API_KEY;
    if (!env || !apiKey) {
      yield { type: "error", error: new Error("OPENROUTER_API_KEY is not configured.") };
      return;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: buildHeaders(apiKey),
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: true
      }),
      signal: AbortSignal.timeout(120_000)
    });

    if (!response.ok) {
      yield { type: "error", error: new Error(`OpenRouter API error ${response.status}`) };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield { type: "error", error: new Error("No response body from OpenRouter") };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let fullContent = "";
    let usage: LLMResponse["usage"];

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const parsed = parseSSELine(line);
          if (!parsed) continue;
          const choice = (parsed.choices as Array<Record<string, unknown>>)?.[0];
          if (!choice) continue;
          const delta = choice.delta as Record<string, string> | undefined;
          if (delta?.content) {
            fullContent += delta.content;
            yield { type: "token", value: delta.content };
          }
          if (parsed.usage) {
            const u = parsed.usage as Record<string, number>;
            usage = { inputTokens: u.prompt_tokens, outputTokens: u.completion_tokens, totalTokens: u.total_tokens };
          }
        }
      }
    } catch (error) {
      yield { type: "error", error: error instanceof Error ? error : new Error(String(error)) };
      return;
    } finally {
      reader.releaseLock();
    }

    yield { type: "done", response: { content: fullContent, model: options.model, provider: id, usage } };
  }

  return { id, displayName, generate, stream };
}
