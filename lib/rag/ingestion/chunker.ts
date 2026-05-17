export interface ChunkOptions {
  maxChunkSize?: number;
  overlap?: number;
  separators?: string[];
}

export interface TextChunk {
  content: string;
  index: number;
  metadata: Record<string, unknown>;
}

const DEFAULT_OPTIONS: Required<ChunkOptions> = {
  maxChunkSize: 500,
  overlap: 50,
  separators: ["\n\n", "\n", "。", ".", "！", "!", "？", "?", "；", ";", " "]
};

function splitRecursive(text: string, separators: string[]): string[] {
  if (text.length === 0) return [];

  for (const sep of separators) {
    if (text.includes(sep)) {
      return text.split(sep).filter((s) => s.trim().length > 0);
    }
  }
  return [text];
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 2);
}

export function chunkText(
  text: string,
  options?: ChunkOptions & { metadata?: Record<string, unknown> }
): TextChunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const meta = options?.metadata ?? {};
  const chunks: TextChunk[] = [];
  const maxTokens = opts.maxChunkSize;

  const sentences = splitRecursive(text, opts.separators);

  let currentChunk = "";
  let currentTokens = 0;

  for (const sentence of sentences) {
    const sentenceTokens = estimateTokens(sentence);

    if (currentTokens + sentenceTokens > maxTokens && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        index: chunks.length,
        metadata: { ...meta }
      });

      const overlapText = currentChunk.slice(-(opts.overlap * 2));
      currentChunk = overlapText + sentence;
      currentTokens = estimateTokens(currentChunk);
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence;
      currentTokens += sentenceTokens;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunks.length,
      metadata: { ...meta }
    });
  }

  return chunks;
}

export function chunkMarkdown(
  markdown: string,
  metadata?: Record<string, unknown>
): TextChunk[] {
  const sections = markdown.split(/^#{1,6}\s+/m).filter((s) => s.trim().length > 0);
  const chunks: TextChunk[] = [];

  for (const section of sections) {
    const sectionChunks = chunkText(section, {
      metadata: { ...metadata }
    });
    chunks.push(
      ...sectionChunks.map((c) => ({
        ...c,
        index: chunks.length + c.index
      }))
    );
  }

  return chunks;
}
