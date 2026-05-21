import type { ChatMessage } from "@/lib/chat/prompt-builder";

export interface ChatStreamEvent {
  type: "token" | "reasoning" | "error" | "done";
  value?: string;
  error?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  reasoningContent?: string;
  conversationId?: string;
  userMessageId?: string;
  assistantMessageId?: string;
}

export interface ChatStreamOptions {
  characterSlug: string;
  messages: ChatMessage[];
  conversationId?: string;
  model?: string;
  mode?: "single" | "group" | "scene";
  characterSlugs?: string[];
  sceneParams?: { location?: string; mood?: string; time?: string; description?: string };
  spoilerLevel?: string;
  canonLevel?: string;
  onToken: (token: string) => void;
  onReasoning?: (token: string) => void;
  onError: (error: string) => void;
  onDone: (result: { usage?: ChatStreamEvent["usage"]; conversationId?: string; reasoningContent?: string }) => void;
  signal?: AbortSignal;
}

export async function streamChat(options: ChatStreamOptions): Promise<void> {
  const { characterSlug, messages, conversationId, model, mode, characterSlugs, sceneParams, onToken, onReasoning, onError, onDone, signal } = options;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterSlug, messages, conversationId, model, mode, characterSlugs, sceneParams, spoilerLevel: options.spoilerLevel, canonLevel: options.canonLevel }),
      signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      onError(errorData.error ?? `HTTP ${response.status}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError("No response body");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

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
            const event: ChatStreamEvent = JSON.parse(data);
            if (event.type === "token" && event.value) {
              onToken(event.value);
            } else if (event.type === "reasoning" && event.value) {
              onReasoning?.(event.value);
            } else if (event.type === "error") {
              if (event.conversationId) {
                onDone({ conversationId: event.conversationId });
              }
              onError(event.error ?? "Unknown error");
            } else if (event.type === "done") {
              onDone({
                usage: event.usage,
                conversationId: event.conversationId,
                reasoningContent: event.reasoningContent
              });
            }
          } catch {
            // skip malformed SSE data
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    }
    onError(error instanceof Error ? error.message : "Unknown error");
  }
}
