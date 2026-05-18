import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1)
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.preprocess((v) => (v === "" ? undefined : v), z.string().min(1).optional()),
  DEEPSEEK_API_KEY: z.preprocess((v) => (v === "" ? undefined : v), z.string().min(1).optional()),
  DEEPSEEK_BASE_URL: z.url().default("https://api.deepseek.com"),
  OPENAI_API_KEY: z.preprocess((v) => (v === "" ? undefined : v), z.string().min(1).optional()),
  OPENAI_BASE_URL: z.string().default("https://api.openai.com/v1"),
  ANTHROPIC_API_KEY: z.preprocess((v) => (v === "" ? undefined : v), z.string().min(1).optional()),
  OPENROUTER_API_KEY: z.preprocess((v) => (v === "" ? undefined : v), z.string().min(1).optional()),
  KIMI_API_KEY: z.preprocess((v) => (v === "" ? undefined : v), z.string().min(1).optional()),
  QWEN_API_KEY: z.preprocess((v) => (v === "" ? undefined : v), z.string().min(1).optional()),
  GLM_API_KEY: z.preprocess((v) => (v === "" ? undefined : v), z.string().min(1).optional()),
  DEFAULT_LLM_PROVIDER: z.string().default("deepseek"),
  DEFAULT_LLM_MODEL: z.string().default("deepseek-chat"),
  DASHSCOPE_API_KEY: z.preprocess((v) => (v === "" ? undefined : v), z.string().min(1).optional()),
  EMBEDDING_PROVIDER: z.string().default("tongyi"),
  EMBEDDING_MODEL: z.string().default("tongyi-embedding-vision-flash-2026-03-06"),
  EMBEDDING_DIMENSIONS: z.string().default("768"),
  EMBEDDING_API_KEY: z.preprocess((v) => (v === "" ? undefined : v), z.string().optional()),
  APP_URL: z.url().default("http://localhost:3000")
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function formatEnvError(error: z.ZodError) {
  return error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
}

export function getPublicEnv(): PublicEnv {
  const parsed = publicEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(`Invalid public environment: ${formatEnvError(parsed.error)}`);
  }

  return parsed.data;
}

export function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(`Invalid server environment: ${formatEnvError(parsed.error)}`);
  }

  return parsed.data;
}

export function getPublicEnvOrNull(): PublicEnv | null {
  const parsed = publicEnvSchema.safeParse(process.env);
  return parsed.success ? parsed.data : null;
}

export function getServerEnvOrNull(): ServerEnv | null {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Env validation failed:", formatEnvError(parsed.error));
    return null;
  }
  return parsed.data;
}

export function getEnvironmentStatus() {
  return {
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    deepseekApiKey: Boolean(process.env.DEEPSEEK_API_KEY),
    dashscopeApiKey: Boolean(process.env.DASHSCOPE_API_KEY),
    embeddingProvider: process.env.EMBEDDING_PROVIDER || "tongyi",
    embeddingModel: process.env.EMBEDDING_MODEL || "tongyi-embedding-vision-flash-2026-03-06"
  };
}

