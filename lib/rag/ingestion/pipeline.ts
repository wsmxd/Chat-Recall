import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createTongyiEmbeddingProvider } from "@/lib/rag/embeddings/tongyi";
import type { EmbeddingProvider } from "@/lib/rag/embeddings/types";
import { chunkMarkdown, type TextChunk } from "./chunker";
import type { Json } from "@/types/database.types";

export interface IngestionResult {
  documentId: string;
  chunksStored: number;
  embeddingDimensions: number;
}

export interface IngestParams {
  lorePackId: string;
  title: string;
  content: string;
  sourceType?: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
  embeddingProvider?: EmbeddingProvider;
}

function createChunksMetadata(
  chunk: TextChunk,
  docMetadata: Record<string, unknown>
): Json {
  return {
    ...docMetadata,
    ...chunk.metadata,
    chunk_index: chunk.index
  } as Json;
}

export async function ingestDocument(params: IngestParams): Promise<IngestionResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase not configured");

  const provider = params.embeddingProvider ?? createTongyiEmbeddingProvider();

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .insert({
      lore_pack_id: params.lorePackId,
      title: params.title,
      source_url: params.sourceUrl ?? null,
      content_hash: hashContent(params.content),
      metadata: (params.metadata ?? {}) as Json
    })
    .select("id")
    .single();

  if (docError || !doc) {
    throw new Error("Failed to create document in database");
  }

  const docMetadata: Record<string, unknown> = {
    source_type: params.sourceType ?? "text",
    ...params.metadata
  };

  const chunks = chunkMarkdown(params.content, docMetadata);

  if (chunks.length === 0) {
    return { documentId: doc.id, chunksStored: 0, embeddingDimensions: provider.dimensions };
  }

  const texts = chunks.map((c) => c.content);
  const result = await provider.embed({ model: provider.model, input: texts });

  const chunkRows = chunks.map((chunk, i) => ({
    document_id: doc.id,
    lore_pack_id: params.lorePackId,
    content: chunk.content,
    embedding: JSON.stringify(result.embeddings[i]),
    token_count: Math.ceil(chunk.content.length / 2),
    metadata: createChunksMetadata(chunk, docMetadata),
    embedding_provider: provider.id as string,
    embedding_model: provider.model,
    embedding_dimension: provider.dimensions
  }));

  const { error: chunkError } = await supabase
    .from("document_chunks")
    .insert(chunkRows);

  if (chunkError) {
    console.error("Chunk insert error:", chunkError);
    throw new Error("Failed to store document chunks in database");
  }

  return {
    documentId: doc.id,
    chunksStored: chunkRows.length,
    embeddingDimensions: provider.dimensions
  };
}

function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36);
}
