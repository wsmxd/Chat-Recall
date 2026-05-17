import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createTongyiEmbeddingProvider } from "@/lib/rag/embeddings/tongyi";
import type { Json } from "@/types/database.types";

export interface RetrievalResult {
  chunkId: string;
  documentId: string;
  lorePackId: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export interface RetrieveParams {
  query: string;
  lorePackIds?: string[];
  characterNames?: string[];
  spoilerLevel?: string;
  canonLevel?: string;
  matchCount?: number;
}

export async function retrieveRelevantChunks(
  params: RetrieveParams
): Promise<RetrievalResult[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const provider = createTongyiEmbeddingProvider();

  const queryResult = await provider.embed({
    model: provider.model,
    input: [params.query]
  });

  if (queryResult.embeddings.length === 0) return [];

  const queryEmbedding = queryResult.embeddings[0];

  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: JSON.stringify(queryEmbedding),
    match_count: params.matchCount ?? 8,
    filter_lore_pack_ids: params.lorePackIds?.length ? params.lorePackIds : undefined,
    filter_character_names: params.characterNames?.length ? params.characterNames : undefined,
    filter_spoiler_level: params.spoilerLevel ?? undefined,
    filter_canon_level: params.canonLevel ?? undefined
  });

  if (error || !data) return [];

  return data.map(
    (row: {
      id: string;
      document_id: string;
      lore_pack_id: string;
      content: string;
      metadata: Json;
      similarity: number;
    }) => ({
      chunkId: row.id,
      documentId: row.document_id,
      lorePackId: row.lore_pack_id,
      content: row.content,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      similarity: row.similarity
    })
  );
}
