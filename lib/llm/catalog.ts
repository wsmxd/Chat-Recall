export type ProviderCatalogItem = {
  id: string;
  name: string;
  models: string[];
};

export const providerCatalog: ProviderCatalogItem[] = [
  { id: "deepseek", name: "DeepSeek", models: ["deepseek-v4-flash", "deepseek-v4-pro", "deepseek-chat", "deepseek-reasoner"] },
  { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1"] },
  { id: "anthropic", name: "Anthropic", models: ["claude-sonnet-4-20250514", "claude-3-5-haiku-20241022"] },
  { id: "openrouter", name: "OpenRouter", models: ["openai/gpt-4o", "anthropic/claude-sonnet-4", "google/gemini-2.5-pro", "deepseek/deepseek-chat"] },
  { id: "kimi", name: "Kimi (Moonshot)", models: ["moonshot-v1-128k", "moonshot-v1-32k", "kimi-latest"] },
  { id: "qwen", name: "Qwen (Tongyi)", models: ["qwen3.6-flash", "qwen3.6-pro", "qwen-max", "qwen-plus", "qwen-turbo"] },
  { id: "glm", name: "GLM (Zhipu)", models: ["glm-4.6", "glm-4.5", "glm-4-plus", "glm-4-flash", "glm-4-air"] },
  { id: "minimax", name: "MiniMax", models: ["MiniMax-M2.7", "MiniMax-M1", "MiniMax-Text-01"] }
];

export const providerModels = Object.fromEntries(providerCatalog.map((provider) => [provider.id, provider.models]));
export const providerNames = Object.fromEntries(providerCatalog.map((provider) => [provider.id, provider.name]));
