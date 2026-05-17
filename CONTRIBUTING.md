# Contributing

Chat Recall is planned as an open-source roleplay chat project. Contributions should preserve extensibility, privacy, and character quality.

## Good First Contribution Areas

- Character card examples
- Theme pack proposals
- Lore pack schema improvements
- Prompt test cases
- Provider adapter documentation
- RAG ingestion and retrieval experiments
- UX sketches for roleplay flows

## Contribution Standards

- Keep character, theme, provider, and RAG logic modular.
- Avoid hard-coding one fandom, model provider, or prompt style into shared foundations.
- Document new extension points before relying on them.
- Include sample data for new schemas when helpful.
- Respect copyright, platform rules, and community norms when proposing role/lore packs.

## Content Policy Direction

The project is intended to support third-party characters from games, anime, novels, and other fandoms. The open-source repository should distinguish between the app's code, user-created local content, community metadata, and any content that the project is legally allowed to redistribute.

In practice:

- The app may support well-known third-party characters as user-created or instance-provided cards.
- Repository fixtures should avoid redistributing copyrighted text, images, or lore dumps unless the license is clear.
- Character cards should record source, attribution, and redistribution notes where possible.
- Lore packs should prefer user-provided/private ingestion or clearly licensed sources.

## Suggested Pull Request Checklist

- The change fits an existing extension point or documents a new one.
- New schemas include examples.
- User-generated content boundaries are clear.
- Secrets are not committed.
- Supabase policies and privacy implications are considered when data access changes.
