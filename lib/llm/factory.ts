import type { LLMProvider } from "@/lib/llm/types";
import { getServerEnvOrNull } from "@/lib/env";

export type ProviderFactory = (providerId: string) => LLMProvider;

const providers: Partial<Record<string, () => Promise<LLMProvider>>> = {
  deepseek: () => import("@/lib/llm/providers/deepseek").then((m) => m.createDeepSeekProvider()),
  openai: () => import("@/lib/llm/providers/openai").then((m) => m.createOpenAIProvider()),
  anthropic: () => import("@/lib/llm/providers/anthropic").then((m) => m.createAnthropicProvider()),
  openrouter: () => import("@/lib/llm/providers/openrouter").then((m) => m.createOpenRouterProvider()),
  kimi: () => import("@/lib/llm/providers/openai").then((m) => m.createOpenAIProvider({ id: "kimi", displayName: "Kimi", baseUrl: "https://api.moonshot.cn/v1", apiKeyEnv: "KIMI_API_KEY" })),
  qwen: () => import("@/lib/llm/providers/openai").then((m) => m.createOpenAIProvider({ id: "qwen", displayName: "Qwen", baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", apiKeyEnv: "QWEN_API_KEY" })),
  glm: () => import("@/lib/llm/providers/openai").then((m) => m.createOpenAIProvider({ id: "glm", displayName: "GLM", baseUrl: "https://open.bigmodel.cn/api/paas/v4", apiKeyEnv: "GLM_API_KEY" }))
};

export async function createProvider(providerId: string): Promise<LLMProvider> {
  const factory = providers[providerId];
  if (factory) return factory();

  // Try as OpenAI-compatible with custom base URL
  return import("@/lib/llm/providers/openai").then((m) => m.createOpenAIProvider());
}

export function resolveProviderId(userConfigProvider?: string): string {
  if (userConfigProvider && providers[userConfigProvider]) return userConfigProvider;

  const env = getServerEnvOrNull();
  if (!env) return "deepseek";

  // Check which API keys are configured
  if (env.OPENAI_API_KEY) return "openai";
  if (env.ANTHROPIC_API_KEY) return "anthropic";
  if (env.OPENROUTER_API_KEY) return "openrouter";
  if (env.DEEPSEEK_API_KEY) return "deepseek";

  return "deepseek";
}

export function getAvailableProviders(): Array<{ id: string; name: string; models: string[] }> {
  return [
    { id: "deepseek", name: "DeepSeek", models: ["deepseek-v4-flash", "deepseek-v4-pro", "deepseek-chat", "deepseek-reasoner"] },
    { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1"] },
    { id: "anthropic", name: "Anthropic", models: ["claude-sonnet-4-20250514", "claude-3-5-haiku-20241022"] },
    { id: "openrouter", name: "OpenRouter", models: ["openai/gpt-4o", "anthropic/claude-sonnet-4", "google/gemini-2.5-pro", "deepseek/deepseek-chat"] },
    { id: "kimi", name: "Kimi (Moonshot)", models: ["moonshot-v1-128k", "moonshot-v1-32k", "kimi-latest"] },
    { id: "qwen", name: "Qwen (Tongyi)", models: ["qwen-max", "qwen-plus", "qwen-turbo"] },
    { id: "glm", name: "GLM (Zhipu)", models: ["glm-4-plus", "glm-4-flash", "glm-4-air"] }
  ];
}
