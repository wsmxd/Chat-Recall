# Environment and Deployment

## Deployment Target

The default deployment path is Vercel for the Next.js application and Supabase for persistent services.

## Planned Environment Variables

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=
DEFAULT_LLM_PROVIDER=deepseek
DEFAULT_LLM_MODEL=

EMBEDDING_PROVIDER=
EMBEDDING_MODEL=
EMBEDDING_API_KEY=

APP_URL=
```

## Secret Boundaries

- Public Supabase URL and anon key can be exposed to the browser.
- Service role keys must only be used server-side.
- Model provider API keys must only be used server-side.
- Embedding provider API keys are separate from chat model keys and must only be used server-side.
- User-provided provider keys need encryption or a managed secret strategy before support is added.

## Supabase Services

Planned usage:

- Auth for user identity
- Postgres for relational data
- pgvector for document chunk embeddings
- Storage for character avatars, covers, uploaded lore files, and theme assets
- Realtime later for streaming collaboration or shared rooms

## Vercel Considerations

- Chat streaming should run through server routes with cancellation support.
- Long ingestion jobs may need a background worker later instead of request-bound execution.
- Provider timeouts should be shorter than platform limits.
- Preview deployments should use separate Supabase projects or clearly isolated schemas.

## Self-Hosting Direction

The project should eventually document:

- Local development setup
- Supabase local stack
- Production Supabase setup
- Vercel deployment
- Alternative deployment targets
- Bring-your-own-key model configuration

## Embedding Provider Role

The embedding provider is part of the knowledge infrastructure, not a feature of DeepSeek specifically. It converts source documents, lore notes, and memory material into vectors stored in Supabase pgvector. Any chat provider can then use retrieval results from that shared knowledge layer.

This separation lets the app use:

- DeepSeek for chat with a different embedding provider.
- Another chat provider with the same stored embeddings.
- A future local chat model with cloud or local embeddings.
- Re-embedding jobs when the embedding model changes.
