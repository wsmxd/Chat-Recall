# Project Structure

The project is planned for Next.js, but implementation files have not been created yet.

## Proposed Directory Layout

```text
.
├── app/
│   ├── (marketing)/
│   ├── (app)/
│   │   ├── chat/
│   │   ├── characters/
│   │   ├── knowledge/
│   │   └── settings/
│   ├── api/
│   │   ├── chat/
│   │   ├── providers/
│   │   └── rag/
│   └── layout.tsx
├── components/
│   ├── chat/
│   ├── characters/
│   ├── knowledge/
│   ├── themes/
│   └── ui/
├── config/
│   ├── default-characters/
│   ├── default-themes/
│   └── prompts/
├── docs/
├── lib/
│   ├── auth/
│   ├── chat/
│   ├── characters/
│   ├── llm/
│   │   ├── providers/
│   │   └── types.ts
│   ├── memory/
│   ├── rag/
│   │   ├── embeddings/
│   │   └── retrievers/
│   ├── supabase/
│   └── themes/
├── public/
│   ├── characters/
│   └── themes/
├── scripts/
│   ├── ingest/
│   └── seed/
├── supabase/
│   ├── migrations/
│   ├── policies/
│   └── seed/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── prompts/
└── types/
```

## Directory Responsibilities

- `app/`: routes, layouts, route handlers, and server entry points.
- `components/`: reusable UI. Domain components should be grouped by feature.
- `config/`: bundled defaults such as character cards, themes, and prompt templates. Third-party content should include source and redistribution metadata.
- `lib/`: domain and infrastructure logic. This should contain most non-UI behavior.
- `lib/llm/providers/`: vendor adapters, starting with DeepSeek.
- `lib/rag/`: ingestion, chunking, embedding, retrieval, and citation shaping.
- `lib/memory/`: conversation summaries, relationship facts, timeline events, and memory policies.
- `supabase/`: migrations, row-level security policies, seed data, and database docs.
- `tests/prompts/`: regression cases for character voice, refusal behavior, lore grounding, and memory.

## Naming Conventions

- Use feature-first folders for product domains.
- Keep provider-specific files under `lib/llm/providers`.
- Keep Supabase table access behind repositories or service functions.
- Treat prompts as versioned assets, not hidden inline strings.
- Store default content as data, not code, whenever practical.
