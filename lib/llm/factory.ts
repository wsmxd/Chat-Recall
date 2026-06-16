import type { LLMProvider } from "@/lib/llm/types";
import { getServerEnvOrNull } from "@/lib/env";
import { providerCatalog } from "@/lib/llm/catalog";

export type ProviderFactory = (providerId: string) => LLMProvider;

const providers: Partial<Record<string, () => Promise<LLMProvider>>> = {
  deepseek: () => import("@/lib/llm/providers/deepseek").then((m) => m.createDeepSeekProvider()),
  openai: () => import("@/lib/llm/providers/openai").then((m) => m.createOpenAIProvider()),
  anthropic: () => import("@/lib/llm/providers/anthropic").then((m) => m.createAnthropicProvider()),
  openrouter: () => import("@/lib/llm/providers/openrouter").then((m) => m.createOpenRouterProvider()),
  kimi: () => import("@/lib/llm/providers/openai").then((m) => m.createOpenAIProvider({ id: "kimi", displayName: "Kimi", baseUrl: "https://api.moonshot.cn/v1", apiKeyEnv: "KIMI_API_KEY" })),
  qwen: () => import("@/lib/llm/providers/openai").then((m) => m.createOpenAIProvider({ id: "qwen", displayName: "Qwen", baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", apiKeyEnv: "QWEN_API_KEY" })),
  glm: () => import("@/lib/llm/providers/openai").then((m) => m.createOpenAIProvider({ id: "glm", displayName: "GLM", baseUrl: "https://open.bigmodel.cn/api/paas/v4", baseUrlEnv: "GLM_BASE_URL", apiKeyEnv: "GLM_API_KEY" })),
  minimax: () => import("@/lib/llm/providers/openai").then((m) => m.createOpenAIProvider({ id: "minimax", displayName: "MiniMax", baseUrl: "https://api.minimax.chat/v1", baseUrlEnv: "MINIMAX_BASE_URL", apiKeyEnv: "MINIMAX_API_KEY" }))
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
  if (env.KIMI_API_KEY) return "kimi";
  if (env.QWEN_API_KEY) return "qwen";
  if (env.GLM_API_KEY) return "glm";
  if (env.MINIMAX_API_KEY) return "minimax";
  if (env.DEEPSEEK_API_KEY) return "deepseek";

  return "deepseek";
}

export function getAvailableProviders(): Array<{ id: string; name: string; models: string[] }> {
  return providerCatalog;
}
