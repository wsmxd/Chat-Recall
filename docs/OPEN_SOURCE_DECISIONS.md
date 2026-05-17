# Open Source Decisions

## Current Direction

- Project code license is currently MIT. Apache-2.0 remains a possible future switch before the first public release if patent-grant language becomes important.
- The product is designed to support third-party characters, including well-known game and anime characters.
- Anonymous users are supported for read-only chat with existing public or official character cards.
- Embeddings are a provider-independent knowledge layer. They support RAG regardless of which chat model is selected.

## Decisions to Make Before First Release

- Whether to keep MIT or switch to Apache-2.0 before the first public release.
- Default content license: code license and content license may need to differ.
- Whether public lore packs are allowed in the main repository.
- How to review community-submitted character cards.
- How to handle copyrighted fandom knowledge in examples and tests.
- Whether user-created public content belongs in app data, a separate registry, or both.

## Recommended Initial Position

- Support third-party roleplay as a core use case.
- Keep repository-distributed assets legally conservative: avoid copyrighted text dumps, copied images, or large lore extracts unless licensing is clear.
- Allow deployed instances to provide their own default third-party character cards.
- Treat cards, themes, and lore packs as content with separate metadata and license fields from the app code.
- Allow users to create private lore packs in their own deployment.
- Treat public community packs as metadata and user submissions, not core app code.
- Require license metadata on shared cards, themes, and lore packs.

## Anonymous User Policy

Anonymous users can:

- Browse existing public or official character cards.
- Start temporary conversations with existing cards.
- Use existing public themes and lore packs attached to those cards.

Anonymous users cannot:

- Create, edit, fork, import, export, or publish character cards.
- Upload documents or create lore packs.
- Save long-term memory across devices.
- Configure provider keys, model defaults, or private themes.
- Publish public content or access creator tools.

## Open Questions

- Should custom cards be local-only exports first, then cloud-synced later?
- Should the app ship with a local mock model provider for development?
- How much prompt text should be visible to users and card creators?
- Should theme packs support custom images in v1 or only tokens?
- Should memory be opt-in per conversation?

## Risk Register

- Copyright risk from bundled lore or character data.
- Trademark and platform policy risk from third-party character presentation.
- Prompt injection risk from imported cards and user-uploaded documents.
- Privacy risk from long-term memory.
- Cost risk from uncontrolled model usage and ingestion.
- Quality risk from low-effort public character cards.
- Spoiler risk from badly tagged lore chunks.
