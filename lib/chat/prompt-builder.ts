import type { CharacterSummary } from "@/lib/characters/schema";
import type { LLMMessage } from "@/lib/llm/types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

function buildSystemPrompt(character: CharacterSummary): string {
  const card = character.card;

  const parts: string[] = [];

  parts.push(`You are ${card.name}${card.subtitle ? `, ${card.subtitle}` : ""}.`);

  parts.push("");
  parts.push(`## Core Persona`);
  parts.push(card.persona.core);
  parts.push("");
  parts.push(`## Voice`);
  parts.push(card.persona.voice);

  if (card.persona.values.length > 0) {
    parts.push("");
    parts.push(`## Values`);
    parts.push(card.persona.values.map((v) => `- ${v}`).join("\n"));
  }

  if (card.persona.boundaries.length > 0) {
    parts.push("");
    parts.push(`## Boundaries`);
    parts.push(card.persona.boundaries.map((b) => `- ${b}`).join("\n"));
  }

  if (card.persona.relationshipDefaults) {
    parts.push("");
    parts.push(`## Relationship Context`);
    parts.push(card.persona.relationshipDefaults);
  }

  if (card.roleplay.scenario) {
    parts.push("");
    parts.push(`## Scenario`);
    parts.push(card.roleplay.scenario);
  }

  if (card.roleplay.style.length > 0) {
    parts.push("");
    parts.push(`## Style`);
    parts.push(card.roleplay.style.map((s) => `- ${s}`).join("\n"));
  }

  if (card.roleplay.allowedModes.length > 0) {
    parts.push("");
    parts.push(`## Mode`);
    parts.push(`Current mode: ${card.roleplay.allowedModes[0]}`);
  }

  const pinnedFacts = card.memory?.pinnedFacts;
  if (pinnedFacts && pinnedFacts.length > 0) {
    parts.push("");
    parts.push(`## Pinned Memory`);
    parts.push(pinnedFacts.map((f) => `- ${f}`).join("\n"));
  }

  parts.push("");
  parts.push(
    "Stay in character at all times. Use the defined voice and personality. " +
      "Do not break character or acknowledge that you are an AI unless the scenario explicitly calls for it. " +
      "Respond naturally and immersively."
  );

  return parts.join("\n");
}

function formatMessage(role: string, name: string | undefined, content: string): string {
  if (role === "system") return content;
  return content;
}

export function buildChatPrompt(params: {
  character: CharacterSummary;
  messages: ChatMessage[];
  systemInstructions?: string[];
}): LLMMessage[] {
  const { character, messages, systemInstructions } = params;

  const systemContent = buildSystemPrompt(character);
  const extras = systemInstructions?.length ? "\n\n" + systemInstructions.join("\n") : "";

  const llmMessages: LLMMessage[] = [
    { role: "system", content: systemContent + extras }
  ];

  const recentMessages = messages.slice(-20).map((m) => ({
    role: m.role as LLMMessage["role"],
    content: formatMessage(m.role, character.name, m.content)
  }));

  llmMessages.push(...recentMessages);

  return llmMessages;
}

export function buildGreetingMessage(character: CharacterSummary): string {
  return character.card.roleplay.greeting;
}
