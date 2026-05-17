# Chat Recall

Chat Recall is an open-source roleplay chat engine for niche games, anime, and character-driven communities. It combines structured character cards, retrieval-augmented knowledge bases, and long-running memory to create immersive roleplay experiences.

## Stack

- **Next.js 16** — web application
- **Supabase** — auth, Postgres, pgvector, storage
- **Vercel** — deployment (recommended)
- **DeepSeek** — default LLM provider (streaming chat)
- **Tongyi/DashScope** — default embedding provider (RAG)
- **Zod** — schema validation for cards, themes, and API requests

## Quickstart

```bash
# Clone and install
git clone <repo-url>
cd chat-recall
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase and API keys

# Apply database migrations
supabase db push

# Start development server
npm run dev
```

See the [Self-Hosting Guide](./docs/SELF_HOSTING.md) for detailed deployment instructions.

## Features

- Character gallery with browse and detail pages
- Real-time streaming chat with character-aware prompt construction
- RAG knowledge base: ingest lore documents, vector search, citation tracking
- Memory system: auto-extract facts after conversations, pin important ones
- Character card editor: create, edit, import/export JSON, fork from public cards
- Theme system: per-character themes with mood variants
- Auth: email/password with Supabase Auth, anonymous browsing
- Conversation persistence: save and resume authenticated chat sessions

## Documentation

- [Product Spec](./docs/PRODUCT_SPEC.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Project Structure](./docs/PROJECT_STRUCTURE.md)
- [Data Model](./docs/DATA_MODEL.md)
- [Auth and Permissions](./docs/AUTH_AND_PERMISSIONS.md)
- [RAG Knowledge Base](./docs/RAG_KNOWLEDGE_BASE.md)
- [LLM Providers](./docs/LLM_PROVIDERS.md)
- [Character Cards](./docs/CHARACTER_CARDS.md)
- [Theme System](./docs/THEME_SYSTEM.md)
- [Content Contribution Guidelines](./docs/CONTRIBUTING.md)
- [Self-Hosting Guide](./docs/SELF_HOSTING.md)
- [Moderation Design](./docs/MODERATION.md)
- [Creative Ideas](./docs/CREATIVE_IDEAS.md)
- [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)
- [Environment and Deployment](./docs/ENVIRONMENT_AND_DEPLOYMENT.md)
- [Open Source Decisions](./docs/OPEN_SOURCE_DECISIONS.md)
- [Supabase GitHub Integration](./docs/SUPABASE_GITHUB_INTEGRATION.md)
- [Roadmap](./docs/ROADMAP.md)

## Design Principles

- Extensible by default: providers, cards, themes, lore packs, and chat modes should be pluggable.
- Roleplay quality first: architecture decisions should protect character consistency, scene continuity, and world knowledge.
- User ownership: users should be able to create, remix, export, and share their own cards and knowledge packs.
- Open-source friendly: docs, schemas, examples, and contribution rules should make community additions safe and reviewable.
- Deployment simplicity: Vercel and Supabase should be enough for the default production path.
