# Architecture

## Proposed Stack

- App: Next.js with App Router
- Language: TypeScript
- UI: React components with a theme-token system
- Backend runtime: Next.js Route Handlers and Server Actions where appropriate
- Database: Supabase Postgres
- Vector storage: Supabase pgvector
- Auth: Supabase Auth
- File storage: Supabase Storage for avatars, cover images, imports, and lore files
- Deployment: Vercel
- Default LLM: DeepSeek
- Embeddings: independent provider layer feeding Supabase pgvector

## High-Level Modules

```text
Client UI
  Chat surface
  Character gallery
  Character editor
  Theme selector
  Knowledge base manager

Application Services
  Chat orchestration
  Prompt assembly
  Memory selection
  RAG retrieval
  Provider routing
  Theme resolution

Domain Modules
  Characters
  Conversations
  Messages
  Lore packs
  Memories
  Themes
  Providers

Infrastructure
  Supabase client
  Postgres repositories
  Vector search
  Storage
  LLM provider adapters
  Deployment config
```

## Request Flow

1. User sends a message in a conversation.
2. Server validates user, character, and conversation permissions.
3. Chat orchestrator loads character card, theme metadata, conversation history, and memory summaries.
4. RAG service retrieves relevant chunks from selected lore packs.
5. Prompt builder combines system rules, character card, scene state, memory, retrieved lore, and recent messages.
6. Provider router selects DeepSeek by default or another configured provider.
7. LLM response streams back to the client.
8. Message, citations, usage, and memory candidates are stored.

## Extension Points

- `LLMProvider`: add new model vendors without changing chat orchestration.
- `EmbeddingProvider`: add or swap embedding vendors without changing chat generation.
- `CharacterCardSchema`: support default, user-created, imported, and forked cards.
- `ThemePack`: add visual identity per character, world, or scene.
- `Retriever`: swap or tune vector, hybrid, rerank, or metadata-filtered retrieval.
- `MemoryStrategy`: choose summarization, pinned facts, relationship state, or timeline memory.
- `PromptTemplate`: allow different prompt families for roleplay, Q&A, narration, or group chat.

## Recommended Architectural Boundaries

- UI components should not call model providers directly.
- Provider adapters should not know about React, Supabase tables, or UI themes.
- Embedding providers should be independent from chat providers.
- RAG retrieval should return structured evidence, not prewritten prompt text.
- Prompt assembly should be deterministic and testable.
- User-generated cards and lore packs should be versioned.
- Default content should live apart from user content so updates do not overwrite user edits.

## Deployment Shape

Vercel hosts the Next.js app. Supabase owns persistent state, auth, storage, vector search, and realtime features. Model provider secrets live in Vercel environment variables or Supabase vault-style storage if later needed for server-side jobs.
