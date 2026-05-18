import { describe, it, expect, beforeEach, afterEach } from "vitest";

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = { ...process.env };
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.DEEPSEEK_API_KEY;
  delete process.env.DASHSCOPE_API_KEY;
});

afterEach(() => {
  process.env = originalEnv;
});

describe("env validation", () => {
  it("getPublicEnvOrNull returns null when PUBLIC keys are missing", async () => {
    const { getPublicEnvOrNull } = await import("@/lib/env");
    expect(getPublicEnvOrNull()).toBeNull();
  });

  it("getServerEnvOrNull returns null when PUBLIC keys are missing", async () => {
    const { getServerEnvOrNull } = await import("@/lib/env");
    expect(getServerEnvOrNull()).toBeNull();
  });

  it("getPublicEnvOrNull returns env when keys are set", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
    const { getPublicEnvOrNull } = await import("@/lib/env");
    const env = getPublicEnvOrNull();
    expect(env).not.toBeNull();
    expect(env!.NEXT_PUBLIC_SUPABASE_URL).toBe("https://test.supabase.co");
  });

  it("getServerEnvOrNull applies defaults", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
    const { getServerEnvOrNull } = await import("@/lib/env");
    const env = getServerEnvOrNull();
    expect(env).not.toBeNull();
    if (env) {
      expect(env.DEFAULT_LLM_PROVIDER).toBe("deepseek");
      expect(env.DEFAULT_LLM_MODEL).toBe("deepseek-chat");
      expect(env.EMBEDDING_MODEL).toBe("tongyi-embedding-vision-flash-2026-03-06");
      expect(env.EMBEDDING_DIMENSIONS).toBe("768");
    }
  });
});
