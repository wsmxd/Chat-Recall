# Self-Hosting Guide

Deploy Chat Recall on your own infrastructure with full control over data and models.

## Architecture

Chat Recall is a Next.js 16 application designed to run on Vercel (recommended) or any Node.js hosting platform. It requires:

- **Supabase**: PostgreSQL database with pgvector, Auth, and Storage
- **LLM API**: DeepSeek (default) or any OpenAI-compatible provider
- **Embedding API**: Tongyi/DashScope (default) for RAG

```
 ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
 │  Chat UI     │────▶│  Next.js     │────▶│  DeepSeek    │
 │  (Browser)   │◀────│  (Vercel)    │◀────│  API         │
 └─────────────┘     └──────┬──────┘     └─────────────┘
                            │
                     ┌──────▼──────┐     ┌─────────────┐
                     │  Supabase    │────▶│  Tongyi      │
                     │  (pgvector)  │◀────│  API         │
                     └─────────────┘     └─────────────┘
```

## Prerequisites

- Node.js 20+
- A Supabase account (free tier sufficient for testing)
- A DeepSeek API key
- A DashScope API key (for RAG embeddings)
- A Vercel account (recommended) or alternative hosting

## Step 1: Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Note the project URL and anon key from Settings > API
3. Get the service role key from Settings > API
4. Run the migrations:

```bash
# Using Supabase CLI
supabase link --project-ref <your-project-ref>
supabase db push
```

Or copy the SQL migrations from `supabase/migrations/` and run them in the Supabase SQL Editor.

## Step 2: Set up environment

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...

# LLM (DeepSeek)
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEFAULT_LLM_PROVIDER=deepseek
DEFAULT_LLM_MODEL=deepseek-chat

# Embedding (Tongyi)
DASHSCOPE_API_KEY=sk-...
EMBEDDING_PROVIDER=tongyi
EMBEDDING_MODEL=tongyi-embedding-vision-flash-2026-03-06
EMBEDDING_DIMENSIONS=768

# Application
APP_URL=https://your-domain.vercel.app
```

## Step 3: Seed initial data

Use the admin client to seed default themes and characters:

```typescript
import { seedDefaultTheme } from "@/lib/themes/queries";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const admin = createSupabaseAdminClient();
await seedDefaultTheme();
```

The default character ("Archive Guide") is served from local fixtures automatically. To create custom characters, use the `/characters/new` page after signing in.

## Step 4: Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

Alternatively, run locally:

```bash
npm install
npm run dev
```

## Database Migrations

All migrations are in `supabase/migrations/`. When deploying updates:

```bash
# Local development
supabase db push

# After schema changes, regenerate types
npm run supabase:types
```

Current migration history:
- `20260517000100`: Initial schema (tables, RLS, indexes, triggers)
- `20260517000200`: Vector search RPC (`match_document_chunks`)
- `20260517000300`: Embedding dimension 1536 → 768

## Changing the LLM Provider

The `LLMProvider` interface is in `lib/llm/types.ts`. Create a new provider adapter and pass it to `createProvider()` in the chat route.

## Changing the Embedding Provider

Implement the `EmbeddingProvider` interface from `lib/rag/embeddings/types.ts`. If the new provider uses different vector dimensions, add a migration to adjust `document_chunks.embedding` and the `match_document_chunks` RPC.

## Auth Configuration

- Auth is handled by Supabase Auth
- Email/password authentication enabled by default
- RLS policies enforce that users can only read/write their own data
- Anonymous users can browse public characters but not chat persistently

To configure additional auth providers (Google, GitHub, etc.), use the Supabase Dashboard > Authentication.

## Storage (future)

Supabase Storage is used for uploaded documents, character avatars, and backgrounds. Set up public/private buckets in the Supabase Dashboard.

## Monitoring

- Supabase Dashboard for database health
- Vercel Analytics for frontend performance
- The `/api/health` endpoint returns environment status

## Troubleshooting

| Issue | Check |
|-------|-------|
| Chat returns empty | `DEEPSEEK_API_KEY` is set and valid |
| RAG returns no results | `DASHSCOPE_API_KEY` is set, migrations applied |
| Can't sign in | Supabase Auth is enabled, URL is in allowed redirects |
| Database errors | Check RLS policies, run `supabase db push` |
