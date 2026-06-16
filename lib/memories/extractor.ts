import { createDeepSeekProvider } from "@/lib/llm/providers/deepseek";
import { getDefaultModelForProvider } from "@/lib/llm/catalog";
import type { LLMMessage } from "@/lib/llm/types";

export interface ExtractionCandidate {
  type: "fact" | "relationship" | "preference" | "timeline" | "summary";
  content: string;
  confidence: number;
}

interface ExtractionParams {
  characterName: string;
  characterSlug: string;
  conversationHistory: Array<{ role: string; content: string }>;
}

export async function extractMemoryCandidates(
  params: ExtractionParams
): Promise<ExtractionCandidate[]> {
  const provider = createDeepSeekProvider();

  const extractionPrompt: LLMMessage[] = [
    {
      role: "system",
      content: `You are a memory extraction assistant. Analyze the roleplay conversation and extract important facts, relationships, preferences, timeline events, and summaries that should be remembered for future conversations with the character.

Return ONLY a JSON array. Each item must have:
- "type": one of "fact", "relationship", "preference", "timeline", "summary"
- "content": a concise statement of what to remember
- "confidence": a number from 0 to 1 indicating how certain this memory is

Rules:
- Extract only meaningful, durable information
- Skip trivial chatter or temporary states
- "fact" for established truths about the world or characters
- "relationship" for dynamics between characters
- "preference" for expressed likes/dislikes
- "timeline" for events that occurred
- "summary" for overall scene/arc summaries
- Keep each content under 200 characters
- Return an empty array if nothing important happened

Example response:
[{"type":"fact","content":"The archive contains ancient scrolls from the Third Dynasty","confidence":0.9},{"type":"relationship","content":"The visitor trusts the archivist with a secret","confidence":0.7}]`
    },
    {
      role: "user",
      content: `Character: ${params.characterName}
Extract memories from this roleplay conversation:\n\n${JSON.stringify(params.conversationHistory, null, 2)}`
    }
  ];

  try {
    const response = await provider.generate({
      model: getDefaultModelForProvider("deepseek"),
      messages: extractionPrompt,
      temperature: 0.3
    });

    const content = response.content.trim();
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item: unknown) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).content === "string" &&
        ["fact", "relationship", "preference", "timeline", "summary"].includes((item as Record<string, unknown>).type as string)
      )
      .map((item: Record<string, unknown>) => ({
        type: item.type as ExtractionCandidate["type"],
        content: String(item.content).slice(0, 200),
        confidence: Math.min(1, Math.max(0, Number(item.confidence) || 0.5))
      }));
  } catch {
    // Extraction is best-effort, don't throw
    return [];
  }
}
