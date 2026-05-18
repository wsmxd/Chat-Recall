import { describe, it, expect } from "vitest";
import { themePackSchema, parseThemePack, parseThemePackOrNull } from "@/lib/themes/schema";

const validTheme = {
  schemaVersion: "0.1",
  name: "Test Theme",
  slug: "test-theme",
  tokens: {},
  chat: {},
  assets: {},
  metadata: {}
};

describe("themePackSchema", () => {
  it("accepts a valid minimal theme", () => {
    expect(() => themePackSchema.parse(validTheme)).not.toThrow();
  });

  it("rejects a theme with no name", () => {
    expect(() => themePackSchema.parse({ ...validTheme, name: "" })).toThrow();
  });

  it("rejects a theme with no slug", () => {
    expect(() => themePackSchema.parse({ ...validTheme, slug: "" })).toThrow();
  });

  it("applies defaults for tokens", () => {
    const parsed = themePackSchema.parse(validTheme);
    expect(parsed.tokens).toBeDefined();
    expect(parsed.tokens.color).toBeDefined();
    expect(parsed.chat.bubbleStyle).toBe("soft_panel");
    expect(parsed.chat.messageDensity).toBe("comfortable");
  });

  it("accepts full theme with variants", () => {
    const full = {
      ...validTheme,
      tokens: { color: { background: "#111" } },
      chat: { bubbleStyle: "rounded", messageDensity: "compact" as const },
      variants: {
        dark: { color: { background: "#000" } }
      }
    };
    expect(() => themePackSchema.parse(full)).not.toThrow();
  });
});

describe("parseThemePack", () => {
  it("parses a valid theme", () => {
    const theme = parseThemePack(validTheme);
    expect(theme.name).toBe("Test Theme");
    expect(theme.slug).toBe("test-theme");
  });

  it("throws on invalid input", () => {
    expect(() => parseThemePack(null)).toThrow();
  });
});

describe("parseThemePackOrNull", () => {
  it("returns parsed theme for valid input", () => {
    expect(parseThemePackOrNull(validTheme)).not.toBeNull();
  });

  it("returns null for invalid input", () => {
    expect(parseThemePackOrNull(null)).toBeNull();
    expect(parseThemePackOrNull({})).toBeNull();
  });
});
