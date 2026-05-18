import type { CharacterSummary } from "@/lib/characters/schema";
import type { LLMMessage } from "@/lib/llm/types";
import type { LoreChunk } from "@/lib/rag/types";
import type { MemoryEntry } from "@/lib/memories/queries";

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

export function buildChatPrompt(params: {
  character: CharacterSummary;
  messages: ChatMessage[];
  systemInstructions?: string[];
  loreContext?: LoreChunk[];
  memories?: MemoryEntry[];
}): LLMMessage[] {
  const { character, messages, systemInstructions, loreContext, memories } = params;

  const systemContent = buildSystemPrompt(character);
  const extras: string[] = [];

  if (systemInstructions?.length) {
    extras.push(...systemInstructions);
  }

  if (memories && memories.length > 0) {
    const memoryLines = memories.map((m) => {
      const confidenceNote = m.confidence < 0.8 ? ` [confidence: ${(m.confidence * 100).toFixed(0)}%]` : "";
      return `- [${m.type}] ${m.content}${confidenceNote}`;
    });
    extras.push(`Active Memories:\n${memoryLines.join("\n")}`);
  }

  if (loreContext && loreContext.length > 0) {
    const loreSection = loreContext
      .map((chunk, i) => {
        const source = chunk.metadata?.source_type ?? "lore";
        const title = chunk.metadata?.title ?? "";
        return `[${i + 1}] (score: ${chunk.similarity.toFixed(3)}, source: ${source}${title ? `, title: ${title}` : ""}) ${chunk.content}`;
      })
      .join("\n\n");

    extras.push(`Retrieved Lore:\n${loreSection}`);
  }

  const llmMessages: LLMMessage[] = [
    { role: "system", content: systemContent + (extras.length > 0 ? "\n\n" + extras.join("\n\n") : "") }
  ];

  const recentMessages = messages.slice(-20).map((m) => ({
    role: m.role as LLMMessage["role"],
    content: m.content
  }));

  llmMessages.push(...recentMessages);

  return llmMessages;
}

function buildCharacterProfile(char: CharacterSummary): string {
  const card = char.card;
  const lines = [
    `### ${card.name}${card.subtitle ? ` - ${card.subtitle}` : ""}`,
    `Core: ${card.persona.core}`,
    `Voice: ${card.persona.voice}`
  ];
  if (card.persona.relationshipDefaults) {
    lines.push(`Relationship: ${card.persona.relationshipDefaults}`);
  }
  if (card.roleplay.greeting) {
    lines.push(`Greeting style: ${card.roleplay.greeting}`);
  }
  return lines.join("\n");
}

export function buildGroupChatPrompt(params: {
  characters: CharacterSummary[];
  messages: ChatMessage[];
  loreContext?: LoreChunk[];
  memories?: MemoryEntry[];
}): LLMMessage[] {
  const { characters, messages, loreContext, memories } = params;

  const parts: string[] = [];

  parts.push("You are narrating a group roleplay with the following characters:");
  parts.push("");

  for (const char of characters) {
    parts.push(buildCharacterProfile(char));
    parts.push("");
  }

  parts.push("---");
  parts.push("Instructions:");
  parts.push("- Narrate all characters distinctly, staying true to each voice.");
  parts.push("- Use character names as prefixes when a character speaks (e.g., \"Alice: Hello\").");
  parts.push("- Describe actions, atmosphere, and scene changes as a narrator.");
  parts.push("- Keep dialogue natural and respect each character's boundaries.");
  parts.push("- Do not speak for the user. Allow the user to describe their own actions.");

  const extras: string[] = [];

  if (memories && memories.length > 0) {
    const memoryLines = memories.map((m) => {
      return `- [${m.type}] ${m.content}`;
    });
    extras.push(`Active Memories:\n${memoryLines.join("\n")}`);
  }

  if (loreContext && loreContext.length > 0) {
    const loreSection = loreContext
      .map((chunk, i) => {
        const source = chunk.metadata?.source_type ?? "lore";
        return `[${i + 1}] (source: ${source}) ${chunk.content}`;
      })
      .join("\n\n");
    extras.push(`Retrieved Lore:\n${loreSection}`);
  }

  const systemContent = parts.join("\n") + (extras.length > 0 ? "\n\n" + extras.join("\n\n") : "");

  const llmMessages: LLMMessage[] = [{ role: "system", content: systemContent }];

  const recentMessages = messages.slice(-20).map((m) => ({
    role: m.role as LLMMessage["role"],
    content: m.content
  }));
  llmMessages.push(...recentMessages);

  return llmMessages;
}

export function buildSceneDirectorPrompt(params: {
  characters: CharacterSummary[];
  messages: ChatMessage[];
  sceneParams?: { location?: string; mood?: string; time?: string; description?: string };
  loreContext?: LoreChunk[];
}): LLMMessage[] {
  const { characters, sceneParams, messages, loreContext } = params;

  const parts: string[] = [];

  parts.push("You are a scene director and narrator for a roleplay experience.");
  parts.push("");

  if (sceneParams) {
    parts.push("## Scene Settings");
    if (sceneParams.location) parts.push(`- Location: ${sceneParams.location}`);
    if (sceneParams.mood) parts.push(`- Mood: ${sceneParams.mood}`);
    if (sceneParams.time) parts.push(`- Time: ${sceneParams.time}`);
    if (sceneParams.description) parts.push(`- Setting: ${sceneParams.description}`);
    parts.push("");
  }

  if (characters.length > 0) {
    parts.push("## Characters Present");
    for (const char of characters) {
      parts.push(buildCharacterProfile(char));
      parts.push("");
    }
  }

  parts.push("---");
  parts.push("Instructions:");
  parts.push("- You are the narrator, not a character. Describe the scene, atmosphere, and character actions.");
  parts.push("- When characters speak, format as dialogue with their name.");
  parts.push("- Advance the scene naturally in response to user input.");
  parts.push("- Use vivid sensory details: sights, sounds, smells, temperature.");
  parts.push("- Maintain dramatic tension and pacing appropriate to the mood.");
  parts.push("- The user is a participant in the scene whose actions you should incorporate.");
  parts.push("- You may describe what characters do, but respect when the user takes control of a character.");

  const extras: string[] = [];

  if (loreContext && loreContext.length > 0) {
    const loreSection = loreContext
      .map((chunk, i) => {
        const source = chunk.metadata?.source_type ?? "lore";
        return `[${i + 1}] (source: ${source}) ${chunk.content}`;
      })
      .join("\n\n");
    extras.push(`World Lore:\n${loreSection}`);
  }

  const systemContent = parts.join("\n") + (extras.length > 0 ? "\n\n" + extras.join("\n\n") : "");

  const llmMessages: LLMMessage[] = [{ role: "system", content: systemContent }];

  const recentMessages = messages.slice(-20).map((m) => ({
    role: m.role as LLMMessage["role"],
    content: m.content
  }));
  llmMessages.push(...recentMessages);

  return llmMessages;
}

export function buildGreetingMessage(character: CharacterSummary): string {
  return character.card.roleplay.greeting;
}
