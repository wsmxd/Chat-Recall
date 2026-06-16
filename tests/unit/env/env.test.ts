import { describe, it, expect, beforeEach, afterEach } from "vitest";

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = { ...process.env };
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.DEEPSEEK_API_KEY;
  delete process.env.DASHSCOPE_API_KEY;
  delete process.env.GLM_API_KEY;
  delete process.env.MINIMAX_API_KEY;
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
      expect(env.GLM_BASE_URL).toBe("https://open.bigmodel.cn/api/paas/v4");
      expect(env.MINIMAX_BASE_URL).toBe("https://api.minimax.chat/v1");
      expect(env.EMBEDDING_MODEL).toBe("text-embedding-v4");
      expect(env.EMBEDDING_DIMENSIONS).toBe("1024");
    }
  });

  it("getServerEnvOrNull treats empty optional keys as unset", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
    process.env.OPENAI_API_KEY = "";
    process.env.ANTHROPIC_API_KEY = "";
    process.env.OPENROUTER_API_KEY = "";
    process.env.KIMI_API_KEY = "";
    process.env.GLM_API_KEY = "";
    process.env.MINIMAX_API_KEY = "";
    process.env.QWEN_API_KEY = "qwen-key";

    const { getServerEnvOrNull } = await import("@/lib/env");
    const env = getServerEnvOrNull();

    expect(env).not.toBeNull();
    expect(env?.OPENAI_API_KEY).toBeUndefined();
    expect(env?.MINIMAX_API_KEY).toBeUndefined();
    expect(env?.QWEN_API_KEY).toBe("qwen-key");
  });
});
