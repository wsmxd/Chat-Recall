export type ProviderCatalogItem = {
  id: string;
  name: string;
  models: string[];
  defaultModel: string;
};

export const providerCatalog: ProviderCatalogItem[] = [
  { id: "deepseek", name: "DeepSeek", models: ["deepseek-v4-flash", "deepseek-v4-pro", "deepseek-chat", "deepseek-reasoner"], defaultModel: "deepseek-chat" },
  { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1"], defaultModel: "gpt-4o-mini" },
  { id: "anthropic", name: "Anthropic", models: ["claude-sonnet-4-20250514", "claude-3-5-haiku-20241022"], defaultModel: "claude-sonnet-4-20250514" },
  { id: "openrouter", name: "OpenRouter", models: ["openai/gpt-4o", "anthropic/claude-sonnet-4", "google/gemini-2.5-pro", "deepseek/deepseek-chat"], defaultModel: "anthropic/claude-sonnet-4" },
  { id: "kimi", name: "Kimi (Moonshot)", models: ["moonshot-v1-128k", "moonshot-v1-32k", "kimi-latest"], defaultModel: "moonshot-v1-128k" },
  { id: "qwen", name: "Qwen (Tongyi)", models: ["qwen3.6-flash", "qwen3.6-pro", "qwen-max", "qwen-plus", "qwen-turbo"], defaultModel: "qwen3.6-flash" },
  { id: "glm", name: "GLM (Zhipu)", models: ["glm-5.2", "glm-5.1", "glm-5v-turbo"], defaultModel: "glm-5v-turbo" },
  { id: "minimax", name: "MiniMax", models: ["MiniMax-M3", "MiniMax-M2.7", "MiniMax-M2.5"], defaultModel: "MiniMax-M2.7" }
];

/** Resolve the default model name for a given provider id. */
export function getDefaultModelForProvider(providerId: string): string {
  return providerCatalog.find((p) => p.id === providerId)?.defaultModel ?? "deepseek-chat";
}

export const providerModels = Object.fromEntries(providerCatalog.map((provider) => [provider.id, provider.models]));
export const providerNames = Object.fromEntries(providerCatalog.map((provider) => [provider.id, provider.name]));
