import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1)
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  DEEPSEEK_API_KEY: z.string().min(1).optional(),
  DEEPSEEK_BASE_URL: z.url().default("https://api.deepseek.com"),
  DEFAULT_LLM_PROVIDER: z.string().default("deepseek"),
  DEFAULT_LLM_MODEL: z.string().default("deepseek-chat"),
  EMBEDDING_PROVIDER: z.string().optional(),
  EMBEDDING_MODEL: z.string().optional(),
  EMBEDDING_API_KEY: z.string().optional(),
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
  return parsed.success ? parsed.data : null;
}

export function getEnvironmentStatus() {
  return {
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    deepseekApiKey: Boolean(process.env.DEEPSEEK_API_KEY),
    embeddingProvider: Boolean(process.env.EMBEDDING_PROVIDER),
    embeddingModel: Boolean(process.env.EMBEDDING_MODEL)
  };
}

