import { describe, it, expect } from "vitest";

function estimateTokens(text: string): number {
  const cjkCount = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g) || []).length;
  const otherCount = text.length - cjkCount;
  return Math.ceil(cjkCount + otherCount / 2);
}

describe("estimateTokens", () => {
  it("estimates CJK text correctly (1 char ≈ 1 token)", () => {
    expect(estimateTokens("你好世界")).toBe(4);
  });

  it("estimates English text at ~0.5 tokens per char", () => {
    expect(estimateTokens("hello world")).toBe(6);
  });

  it("estimates mixed CJK + English", () => {
    const count = estimateTokens("你好 world");
    expect(count).toBe(5); // 2 CJK + 6 Latin/2 = 2 + 3 = 5
  });

  it("returns 0 for empty string", () => {
    expect(estimateTokens("")).toBe(0);
  });

  it("handles characters like punctuation", () => {
    expect(estimateTokens("!!!")).toBe(2);
  });
});
