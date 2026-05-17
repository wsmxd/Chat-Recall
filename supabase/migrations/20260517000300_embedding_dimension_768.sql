-- Migrate embedding vector dimension from 1536 to 768
-- for tongyi-embedding-vision-flash model

-- Drop existing index and function
DROP INDEX IF EXISTS public.document_chunks_embedding_idx;
DROP FUNCTION IF EXISTS public.match_document_chunks;

-- Alter column dimension
ALTER TABLE public.document_chunks
  ALTER COLUMN embedding TYPE vector(768);

-- Recreate index
CREATE INDEX document_chunks_embedding_idx
ON public.document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Recreate function with new dimension
create or replace function public.match_document_chunks(
  query_embedding vector(768),
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
  where dc.embedding is not null
    and (
      filter_lore_pack_ids is null
      or dc.lore_pack_id = any(filter_lore_pack_ids)
    )
    and (
      filter_character_names is null
      or exists (
        select 1
        from jsonb_array_elements_text(coalesce(dc.metadata -> 'character_names', '[]'::jsonb)) character_name
        where character_name = any(filter_character_names)
      )
    )
    and (
      filter_spoiler_level is null
      or dc.metadata ->> 'spoiler_level' is null
      or dc.metadata ->> 'spoiler_level' <= filter_spoiler_level
    )
    and (
      filter_canon_level is null
      or dc.metadata ->> 'canon_level' = filter_canon_level
    )
  order by dc.embedding <=> query_embedding
  limit least(greatest(match_count, 1), 50);
$$;

grant execute on function public.match_document_chunks(
  vector(768),
  integer,
  uuid[],
  text[],
  text,
  text
) to anon, authenticated, service_role;
