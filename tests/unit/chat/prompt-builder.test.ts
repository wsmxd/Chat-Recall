import { describe, it, expect } from "vitest";
import { buildChatPrompt, buildGreetingMessage } from "@/lib/chat/prompt-builder";
import { parseCharacterCard } from "@/lib/characters/schema";
import type { CharacterSummary } from "@/lib/characters/schema";

const rawCard = {
  schemaVersion: "0.1",
  name: "Test",
  persona: { core: "A tester", voice: "Monotone" },
  roleplay: { greeting: "Hello there", allowedModes: ["chat"] as const },
  metadata: { source: "original", tags: [], language: "en", license: "MIT", redistribution: "instance_only" as const }
};

const testCharacter: CharacterSummary = {
  id: "test-id",
  slug: "test-char",
  name: "Test",
  visibility: "public",
  card: parseCharacterCard(rawCard)
};

describe("buildChatPrompt", () => {
  it("builds a prompt with system message and recent messages", () => {
    const messages = [
      { id: "1", role: "user" as const, content: "Hello", createdAt: new Date().toISOString() }
    ];
    const result = buildChatPrompt({ character: testCharacter, messages });
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0].role).toBe("system");
    expect(result[0].content).toContain("You are Test");
    expect(result[1].role).toBe("user");
    expect(result[1].content).toBe("Hello");
  });

  it("includes character persona in system prompt", () => {
    const result = buildChatPrompt({ character: testCharacter, messages: [] });
    expect(result[0].content).toContain("A tester");
  });

  it("includes lore context when provided", () => {
    const loreContext = [
      {
        chunkId: "1",
        documentId: "d1",
        lorePackId: "lp1",
        content: "Ancient scroll information",
        similarity: 0.95,
        metadata: { source_type: "canon", title: "Scroll of Wisdom" }
      }
    ];
    const result = buildChatPrompt({ character: testCharacter, messages: [], loreContext });
    expect(result[0].content).toContain("Retrieved Lore");
    expect(result[0].content).toContain("Ancient scroll information");
  });

  it("includes active memories when provided", () => {
    const memories = [
      {
        id: "m1",
        ownerId: "u1",
        conversationId: null,
        characterId: null,
        type: "fact" as const,
        content: "The user prefers short replies",
        confidence: 0.9,
        pinned: true,
        sourceMessageIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    const result = buildChatPrompt({ character: testCharacter, messages: [], memories });
    expect(result[0].content).toContain("Active Memories");
    expect(result[0].content).toContain("The user prefers short replies");
  });

  it("shows confidence for low-confidence memories", () => {
    const memories = [
      {
        id: "m1",
        ownerId: "u1",
        conversationId: null,
        characterId: null,
        type: "fact" as const,
        content: "Uncertain fact",
        confidence: 0.5,
        pinned: true,
        sourceMessageIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    const result = buildChatPrompt({ character: testCharacter, messages: [], memories });
    expect(result[0].content).toContain("50%");
  });
});

describe("buildGreetingMessage", () => {
  it("returns the character greeting", () => {
    expect(buildGreetingMessage(testCharacter)).toBe("Hello there");
  });
});
