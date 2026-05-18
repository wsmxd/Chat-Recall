export type LLMProviderId = "deepseek" | "openai" | "anthropic" | "openrouter" | "kimi" | "qwen" | "glm" | "google" | "local" | "custom-openai";

export type LLMMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
};

export type LLMGenerateOptions = {
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  reasoningEffort?: "low" | "medium" | "high";
  metadata?: Record<string, unknown>;
};

export type LLMResponse = {
  content: string;
  reasoningContent?: string;
  model: string;
  provider: LLMProviderId;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
};

export type LLMStreamEvent =
  | { type: "token"; value: string }
  | { type: "reasoning"; value: string }
  | { type: "metadata"; value: Record<string, unknown> }
  | { type: "done"; response?: LLMResponse }
  | { type: "error"; error: Error };

export interface LLMProvider {
  id: LLMProviderId;
  displayName: string;
  generate(options: LLMGenerateOptions): Promise<LLMResponse>;
  stream(options: LLMGenerateOptions): AsyncIterable<LLMStreamEvent>;
}
