import type { LLMProvider } from "@/lib/llm/types";
import { getServerEnvOrNull } from "@/lib/env";

export type ProviderFactory = (providerId: string) => LLMProvider;

const providers: Partial<Record<string, () => Promise<LLMProvider>>> = {
  deepseek: () => import("@/lib/llm/providers/deepseek").then((m) => m.createDeepSeekProvider()),
  openai: () => import("@/lib/llm/providers/openai").then((m) => m.createOpenAIProvider()),
  anthropic: () => import("@/lib/llm/providers/anthropic").then((m) => m.createAnthropicProvider()),
  openrouter: () => import("@/lib/llm/providers/openrouter").then((m) => m.createOpenRouterProvider())
};

export async function createProvider(providerId: string): Promise<LLMProvider> {
  const factory = providers[providerId];
  if (factory) return factory();

  // Fallback to DeepSeek if unknown provider
  const fallback = providers.deepseek!;
  return fallback();
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
    { id: "deepseek", name: "DeepSeek", models: ["deepseek-chat", "deepseek-reasoner"] },
    { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1"] },
    { id: "anthropic", name: "Anthropic", models: ["claude-sonnet-4-20250514", "claude-3-5-haiku-20241022"] },
    { id: "openrouter", name: "OpenRouter", models: ["openai/gpt-4o", "anthropic/claude-sonnet-4", "google/gemini-2.5-pro", "deepseek/deepseek-chat"] }
  ];
}
