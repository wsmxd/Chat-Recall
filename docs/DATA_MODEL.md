# Data Model

This is a planning model for Supabase Postgres. Exact migrations should be created during implementation.

## Core Tables

### `profiles`

User profile attached to Supabase Auth.

- `id`
- `display_name`
- `avatar_url`
- `settings`
- `created_at`
- `updated_at`

### `characters`

Stores default, user-created, imported, and forked character cards.

- `id`
- `owner_id`
- `visibility`: `private`, `unlisted`, `public`, `official`
- `slug`
- `name`
- `subtitle`
- `avatar_url`
- `cover_url`
- `card_version`
- `schema_version`
- `definition`
- `theme_id`
- `default_lore_pack_id`
- `created_at`
- `updated_at`

### `character_versions`

Version history for cards.

- `id`
- `character_id`
- `version`
- `definition`
- `change_note`
- `created_by`
- `created_at`

### `conversations`

One chat session between a user and one or more characters.

- `id`
- `owner_id`
- `title`
- `mode`: `single_character`, `group_chat`, `scene`, `qa`
- `character_ids`
- `active_theme_id`
- `settings`
- `created_at`
- `updated_at`

### `messages`

Chat messages and model output.

- `id`
- `conversation_id`
- `role`: `user`, `assistant`, `system`, `tool`
- `character_id`
- `content`
- `metadata`
- `token_count`
- `created_at`

### `message_citations`

Links assistant messages to retrieved knowledge chunks.

- `id`
- `message_id`
- `document_chunk_id`
- `score`
- `quote`
- `metadata`

### `memories`

Long-term facts, relationship state, and story continuity.

- `id`
- `owner_id`
- `conversation_id`
- `character_id`
- `type`: `fact`, `relationship`, `preference`, `timeline`, `summary`
- `content`
- `confidence`
- `pinned`
- `source_message_ids`
- `created_at`
- `updated_at`

### `lore_packs`

Knowledge bases attached to characters, worlds, or users.

- `id`
- `owner_id`
- `visibility`
- `name`
- `description`
- `source_type`
- `metadata`
- `created_at`
- `updated_at`

### `documents`

Raw source documents.

- `id`
- `lore_pack_id`
- `title`
- `source_url`
- `storage_path`
- `content_hash`
- `metadata`
- `created_at`

### `document_chunks`

Chunked content for retrieval.

- `id`
- `document_id`
- `lore_pack_id`
- `content`
- `embedding`
- `embedding_provider`
- `embedding_model`
- `embedding_dimension`
- `embedding_content_hash`
- `token_count`
- `metadata`
- `created_at`

### `themes`

Visual and interaction theme packs.

- `id`
- `owner_id`
- `visibility`
- `name`
- `slug`
- `definition`
- `created_at`
- `updated_at`

### `provider_configs`

Per-user or instance-level provider settings.

- `id`
- `owner_id`
- `provider`
- `model`
- `settings`
- `is_default`
- `created_at`
- `updated_at`

## Access Model

- Official content is readable by everyone.
- Public content is readable by anonymous and authenticated users.
- Private user content is readable only by its owner.
- Public cards and lore packs are readable by everyone but editable only by owners or maintainers.
- Conversations, messages, memories, and private provider settings are owner-only.
- Anonymous conversations are temporary and cannot own cards, lore packs, themes, memories, or provider settings.
- Row-level security should be enabled on all user data tables.
