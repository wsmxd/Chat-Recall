# RAG Knowledge Base

## Goal

RAG should help characters stay grounded in niche lore without turning roleplay into a dry search answer. Retrieved context should support the character voice and scene, not dominate it.

Embeddings are a model-expansion foundation layer. They are used to store and retrieve knowledge for any chat model, not only DeepSeek.

## Knowledge Types

- Canon lore: official facts, timelines, places, abilities, relationships
- Fan setting notes: user-created continuity or alternate universe rules
- Character-specific facts: speech habits, boundaries, motivations
- Session lore: facts established during the current roleplay
- Creator notes: style rules and interaction preferences

## Ingestion Pipeline

1. Upload or import source.
2. Normalize text.
3. Split into chunks with metadata.
4. Generate embeddings through the configured embedding provider.
5. Store chunks in Supabase pgvector.
6. Attach chunks to lore packs.
7. Run retrieval tests for representative user prompts.

## Embedding Provider Strategy

The embedding provider should be configured independently from the chat provider.

- Chat model: responsible for roleplay generation.
- Embedding model: responsible for turning knowledge into searchable vectors.
- Vector store: Supabase pgvector stores the provider-independent retrieval layer.
- Retrieval service: returns relevant chunks to whichever chat provider is active.

Changing the chat provider should not require rebuilding the knowledge base. Changing the embedding provider may require re-embedding documents because vector dimensions and semantics can differ.

The current first migration uses `vector(1536)` as the default embedding size. If the selected embedding provider uses a different dimension, add a migration before ingestion to adjust the vector column and search RPC signature.

## Chunk Metadata

Recommended metadata:

- `fandom`
- `world`
- `character_names`
- `source_kind`
- `canon_level`: `canon`, `fanon`, `au`, `user`
- `spoiler_level`
- `timeline_arc`
- `language`
- `license`
- `tags`

## Retrieval Strategy

Start with vector similarity plus metadata filters:

- Active character
- Selected lore pack
- Spoiler level
- Canon preference
- User language

The initial database RPC is `match_document_chunks(query_embedding, match_count, filter_lore_pack_ids, filter_character_names, filter_spoiler_level, filter_canon_level)`.

Later improvements:

- Hybrid keyword plus vector search
- Reranking
- Query rewriting
- Character-aware retrieval
- Memory plus lore blending
- Citation confidence thresholds

## Prompt Integration

The chat orchestrator should pass retrieved chunks as structured evidence:

```text
Retrieved Lore:
- title
- source type
- canon level
- content
- score
```

The prompt should instruct the model to use lore naturally, avoid overexplaining, and never claim uncertain retrieved context as absolute if metadata marks it as fanon or user-created.

## Spoiler Control

Spoiler controls should be first-class:

- User selects allowed arcs, chapters, episodes, or progress markers.
- Retrieval filters out chunks above the selected spoiler level.
- Character cards can define default spoiler behavior.
- Public lore packs should document their spoiler metadata quality.

## Evaluation

Prompt tests should cover:

- Correct fact retrieval
- No-spoiler behavior
- Character voice preservation
- Refusal to invent canon
- Handling conflicting canon and fanon
- Keeping roleplay immersive while using retrieved facts
