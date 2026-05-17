# Chat Recall

Chat Recall is a planned open-source roleplay chat project for niche games, anime, and character-driven communities.

The initial stack is:

- Next.js for the web application
- Supabase for auth, Postgres, storage, realtime, and vector search
- Vercel for deployment
- DeepSeek as the default LLM provider
- Provider adapters for future model expansion

This repository currently contains the initial Next.js scaffold, Supabase migrations, and planning documentation. Product implementation will proceed in thin vertical slices.

## Product Direction

Chat Recall is designed around immersive character conversations backed by structured character cards, theme packs, and retrieval-augmented knowledge bases. The product should make it easy to ship a few polished default characters while allowing users and contributors to create their own cards, lore packs, model providers, themes, and roleplay modes.

Core ideas:

- Character roleplay chat with long-running memory
- Built-in and user-created character cards
- Niche game/anime knowledge bases powered by Supabase vector storage
- Theme switching based on character, world, or scene
- DeepSeek-first model integration with extensible LLM provider adapters
- Open-source contribution flow for character packs, lore packs, prompts, and UI themes

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
- [Creative Ideas](./docs/CREATIVE_IDEAS.md)
- [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)
- [Environment and Deployment](./docs/ENVIRONMENT_AND_DEPLOYMENT.md)
- [Open Source Decisions](./docs/OPEN_SOURCE_DECISIONS.md)
- [Supabase GitHub Integration](./docs/SUPABASE_GITHUB_INTEGRATION.md)
- [Roadmap](./docs/ROADMAP.md)
- [Contributing](./CONTRIBUTING.md)

## Design Principles

- Extensible by default: providers, cards, themes, lore packs, and chat modes should be pluggable.
- Roleplay quality first: architecture decisions should protect character consistency, scene continuity, and world knowledge.
- User ownership: users should be able to create, remix, export, and share their own cards and knowledge packs.
- Open-source friendly: docs, schemas, examples, and contribution rules should make community additions safe and reviewable.
- Deployment simplicity: Vercel and Supabase should be enough for the default production path.
