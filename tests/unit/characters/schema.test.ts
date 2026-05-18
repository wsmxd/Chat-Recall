import { describe, it, expect } from "vitest";
import { characterCardSchema, parseCharacterCard } from "@/lib/characters/schema";

const validCard = {
  schemaVersion: "0.1",
  name: "Test Character",
  persona: { core: "A tester", voice: "Monotone" },
  roleplay: { greeting: "Hello" },
  metadata: {}
};

describe("characterCardSchema", () => {
  it("accepts a valid minimal card", () => {
    expect(() => characterCardSchema.parse(validCard)).not.toThrow();
  });

  it("rejects a card with no name", () => {
    expect(() => characterCardSchema.parse({ ...validCard, name: "" })).toThrow();
  });

  it("rejects a card with no persona core", () => {
    const bad = { ...validCard, persona: { core: "", voice: "X" } };
    expect(() => characterCardSchema.parse(bad)).toThrow();
  });

  it("rejects a card with no persona voice", () => {
    const bad = { ...validCard, persona: { core: "X", voice: "" } };
    expect(() => characterCardSchema.parse(bad)).toThrow();
  });

  it("rejects a card with no greeting", () => {
    const bad = { ...validCard, roleplay: { greeting: "" } };
    expect(() => characterCardSchema.parse(bad)).toThrow();
  });

  it("applies defaults for optional fields", () => {
    const parsed = characterCardSchema.parse(validCard);
    expect(parsed.metadata.tags).toEqual([]);
    expect(parsed.metadata.language).toBe("zh-CN");
    expect(parsed.memory.strategy).toBe("none");
    expect(parsed.memory.pinnedFacts).toEqual([]);
    expect(parsed.model.temperature).toBe(0.8);
  });

  it("rejects temperature out of range", () => {
    expect(() =>
      characterCardSchema.parse({
        ...validCard,
        model: { preferredProfile: "roleplay-balanced", temperature: 3 }
      })
    ).toThrow();
  });

  it("rejects negative temperature", () => {
    expect(() =>
      characterCardSchema.parse({
        ...validCard,
        model: { preferredProfile: "roleplay-balanced", temperature: -0.1 }
      })
    ).toThrow();
  });
});

describe("parseCharacterCard", () => {
  it("parses a valid card", () => {
    const card = parseCharacterCard(validCard);
    expect(card.name).toBe("Test Character");
  });

  it("throws on invalid input", () => {
    expect(() => parseCharacterCard(null)).toThrow();
    expect(() => parseCharacterCard({})).toThrow();
    expect(() => parseCharacterCard("not an object")).toThrow();
  });
});
