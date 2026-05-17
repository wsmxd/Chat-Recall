export interface LoreChunk {
  chunkId: string;
  documentId: string;
  lorePackId: string;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
}
