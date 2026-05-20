-- Add embedding metadata columns to document_chunks
ALTER TABLE public.document_chunks
  ADD COLUMN IF NOT EXISTS embedding_provider text,
  ADD COLUMN IF NOT EXISTS embedding_model text,
  ADD COLUMN IF NOT EXISTS embedding_dimension integer;