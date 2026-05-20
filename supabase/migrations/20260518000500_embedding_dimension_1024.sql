-- Migrate embedding vector dimension from 768 to 1024
-- for text-embedding-v4 model

DROP INDEX IF EXISTS public.document_chunks_embedding_idx;
DROP FUNCTION IF EXISTS public.match_document_chunks;

ALTER TABLE public.document_chunks
  ALTER COLUMN embedding TYPE vector(1024);

CREATE INDEX document_chunks_embedding_idx
ON public.document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

create or replace function public.match_document_chunks(
  query_embedding vector(1024),
  match_count integer default 8,
  filter_lore_pack_ids uuid[] default null,
  filter_character_names text[] default null,
  filter_spoiler_level text default null,
  filter_canon_level text default null
)
returns table (
  id uuid,
  document_id uuid,
  lore_pack_id uuid,
  content text,
  metadata jsonb,
  similarity double precision
)
language sql
stable
as $$
  select
    dc.id,
    dc.document_id,
    dc.lore_pack_id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks dc
  join public.lore_packs lp on lp.id = dc.lore_pack_id
  join public.documents d on d.id = dc.document_id
  where lp.visibility in ('public', 'official')
     or lp.owner_id = auth.uid()
  and (
    filter_lore_pack_ids is null
    or dc.lore_pack_id = any(filter_lore_pack_ids)
  )
  and (
    filter_spoiler_level is null
    or dc.metadata->>'spoiler_level' is null
    or dc.metadata->>'spoiler_level' = filter_spoiler_level
  )
  and (
    filter_canon_level is null
    or dc.metadata->>'canon_level' is null
    or dc.metadata->>'canon_level' = filter_canon_level
  )
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;