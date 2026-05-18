import { describe, it, expect, beforeEach, afterEach } from "vitest";

let originalNodeEnv: string | undefined;

beforeEach(() => {
  originalNodeEnv = process.env.NODE_ENV;
});

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

describe("safeError", () => {
  it("returns error message in development", async () => {
    process.env.NODE_ENV = "development";
    const { safeError } = await import("@/lib/api/errors");
    expect(safeError(new Error("test error"))).toBe("test error");
  });

  it("returns generic message in production", async () => {
    process.env.NODE_ENV = "production";
    const { safeError } = await import("@/lib/api/errors");
    expect(safeError(new Error("sensitive details"))).toBe("Internal server error");
  });

  it("handles non-Error thrown values in development", async () => {
    process.env.NODE_ENV = "development";
    const { safeError } = await import("@/lib/api/errors");
    expect(safeError("string error")).toBe("Unknown error");
  });

  it("handles non-Error thrown values in production", async () => {
    process.env.NODE_ENV = "production";
    const { safeError } = await import("@/lib/api/errors");
    expect(safeError(42)).toBe("Internal server error");
  });
});
