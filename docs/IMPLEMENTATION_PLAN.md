# Implementation Plan

This plan turns the current scaffold into a working open-source roleplay chat application.

## Current Baseline

Already completed:

- Next.js project scaffold
- Git repository initialization
- Supabase project `chat-recall`
- Initial database schema
- pgvector extension and document chunk vector column
- `match_document_chunks` retrieval RPC
- Seeded default theme
- Planning docs for product, architecture, data model, permissions, providers, RAG, themes, and GitHub integration
- Supabase TypeScript database types generated from the linked project
- Environment validation helpers
- Supabase browser, server, and admin client factories
- CI workflow for typecheck, lint, and build
- Read-only app shell with character gallery and character detail page
- Character card schema validation and first structured local fixture
- Health route exposing service and environment readiness

## Implementation Strategy

Build in thin vertical slices. Each slice should produce something usable, tested, and deployable before moving to the next layer.

Recommended order:

1. Environment and infrastructure correctness
2. Supabase client/auth foundation
3. Character card read path
4. Anonymous chat path
5. DeepSeek streaming provider
6. Persisted authenticated chat
7. RAG ingestion and retrieval
8. Character/theme customization
9. Memory and advanced roleplay features

## Phase 1: Foundation Hardening

Goal: make the skeleton dependable for development and deployment.

Tasks:

- Add `.env.local` setup instructions without committing secrets.
- Add Supabase browser/server/admin clients.
- Add typed environment validation.
- Generate Supabase TypeScript database types.
- Add a minimal health/status route.
- Add CI workflow for typecheck, lint, and build.
- Connect GitHub repository to Vercel.
- Connect GitHub repository to Supabase Branching.

Acceptance criteria:

- `npm run typecheck`, `npm run lint`, and `npm run build` pass.
- Vercel preview deployment builds successfully.
- Supabase migrations are tracked in Git and visible in the Supabase Dashboard.
- Environment validation fails clearly when required server secrets are missing.

## Phase 2: Read-Only Product Shell

Goal: show real app structure without model calls yet.

Tasks:

- Build app navigation for chat, characters, knowledge, and settings.
- Add character gallery page.
- Add official/public character card query.
- Add card detail page.
- Add theme token resolver.
- Add basic anonymous permission behavior in UI.
- Add placeholder chat room using seeded/local character card data.

Acceptance criteria:

- Anonymous users can browse existing cards.
- Anonymous users see disabled creator actions with sign-in prompts.
- Character pages render from structured data rather than hard-coded JSX.
- Theme selection can alter app tokens.

## Phase 3: DeepSeek Chat MVP

Goal: make single-character chat work.

Tasks:

- Implement `LLMProvider` interface.
- Add DeepSeek provider adapter.
- Add server route for chat streaming.
- Add prompt builder for character card + conversation history.
- Add chat UI with streaming response.
- Add error handling for provider failures.
- Add request cancellation.
- Add basic usage metadata capture.

Acceptance criteria:

- A user can send a message and receive a streamed DeepSeek response.
- Provider secrets stay server-side.
- The UI handles loading, cancellation, empty responses, and provider errors.
- The provider adapter can be replaced without changing chat UI code.

## Phase 4: Authenticated Persistence

Goal: authenticated users can keep conversations.

Tasks:

- Add Supabase Auth UI path.
- Add profile creation trigger or server-side profile creation flow.
- Add conversation creation.
- Persist user and assistant messages.
- Add conversation list.
- Add conversation resume.
- Enforce authenticated-only persistent memory.

Acceptance criteria:

- Anonymous chats remain temporary.
- Authenticated users can save and resume conversations.
- RLS prevents users from reading other users' conversations.
- Messages retain ordering and role metadata.

## Phase 5: RAG Knowledge Base MVP

Goal: attach lore knowledge to chat.

Tasks:

- Add embedding provider interface.
- Choose initial embedding provider and vector dimension.
- Add ingestion script for markdown/text files.
- Add chunking strategy.
- Store documents and chunks in Supabase.
- Call `match_document_chunks` during chat.
- Add citation metadata to assistant messages.
- Add retrieval debug view for developers.

Acceptance criteria:

- A lore file can be ingested into a lore pack.
- Chat requests retrieve relevant chunks before prompt assembly.
- Retrieval filters by lore pack, character, spoiler level, and canon level.
- Citations are stored and inspectable.

## Phase 6: Character Cards and Themes

Goal: make the project extensible for creators.

Tasks:

- Implement character card schema validation with Zod.
- Add JSON import/export.
- Add private card creation for authenticated users.
- Add fork flow from public cards.
- Add theme pack schema validation.
- Add character-to-theme binding.
- Add theme variant support for scene mood.

Acceptance criteria:

- Users can create private cards.
- Cards include source, attribution, and redistribution metadata.
- Invalid card imports fail with actionable errors.
- Character-linked themes apply consistently in chat.

## Phase 7: Memory

Goal: add continuity without making the system feel opaque.

Tasks:

- Add memory extraction candidates after assistant responses.
- Add user approval/edit path for important memories.
- Add pinned facts.
- Add relationship timeline entries.
- Add memory retrieval during prompt assembly.
- Add memory delete/export controls.

Acceptance criteria:

- Long-term memory is opt-in and authenticated-only.
- Users can inspect and delete memories.
- Memory affects future replies without overriding card boundaries.

## Phase 8: Community and Open Source

Goal: prepare public collaboration.

Tasks:

- Add issue templates.
- Add pull request template.
- Add content contribution guidelines.
- Add self-hosting guide.
- Add sample third-party character metadata without copied copyrighted assets.
- Add moderation/reporting design for public cards.

Acceptance criteria:

- Contributors can understand how to add cards/themes/lore safely.
- The project can be deployed from scratch with documented steps.
- Public content has license/source metadata.

## Immediate Next Sprint

The first foundation slice has been started. Remaining next-sprint work should focus on replacing local fixtures with Supabase-backed reads and preparing chat provider integration:

1. Add `.env.local` with Supabase public keys and server secrets locally.
2. Seed the default character into Supabase instead of only local fixtures.
3. Replace character gallery reads with Supabase public/official card queries.
4. Add profile creation flow for authenticated users.
5. Add DeepSeek provider adapter skeleton.
6. Add prompt builder skeleton for a single character.
7. Add non-persistent anonymous chat route and UI shell.

This creates the first visible, data-shaped product surface without touching model calls yet.

## Implementation Notes

- Keep anonymous behavior read-only and temporary.
- Keep DeepSeek as the default chat provider, but code against provider interfaces.
- Keep embedding provider independent from chat provider.
- Treat prompts, character cards, themes, and lore packs as versioned data.
- Do not commit secrets, third-party copyrighted images, or copied lore dumps.
- Prefer small migrations over large mixed-purpose migrations.
