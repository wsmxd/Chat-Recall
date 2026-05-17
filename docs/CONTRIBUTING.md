# Content Contribution Guidelines

Chat Recall is an open-source roleplay chat engine. Community contributions of character cards, theme packs, and lore packs are welcome.

## What to contribute

- **Character cards**: Persona definitions, roleplay settings, and metadata
- **Theme packs**: Color palettes, typography tokens, chat UI styling
- **Lore packs**: Structured world knowledge for RAG retrieval
- **Prompt improvements**: Context injection strategies, system prompt tuning

## Requirements for all content

### Source and attribution

Every content file must include source metadata:

```json
{
  "metadata": {
    "source": "original | third_party_or_original | forked",
    "sourceTitle": "Name of the original work",
    "attribution": "Creator name or credit",
    "license": "CC-BY | CC0 | MIT | unknown",
    "redistribution": "public_allowed | repository_allowed | instance_only"
  }
}
```

### No unlicensed copyrighted material

Do not contribute:
- Character names, descriptions, or lore from copyrighted works unless you own the rights or have explicit permission
- Copy-pasted text from novels, movies, games, or other copyrighted sources
- Images, sounds, or other assets you do not own or have rights to redistribute

Use original characters or characters from permissively licensed works. Public domain content is welcome.

### Language

Content should default to `zh-CN` or `en`. Include a `language` field in metadata.

### Quality

Cards should include:
- A distinct core persona and voice
- Roleplay boundaries
- A usable greeting that starts a scene
- Style tags appropriate for the character

The character card schema is defined in `lib/characters/schema.ts`.

## How to contribute

1. Fork the repository
2. Create a branch for your contribution
3. Add your content in `config/default-characters/`, `config/default-themes/`, or as a new lore fixture
4. Validate with the schema: imports from `lib/characters/schema` or `lib/themes/schema`
5. Run `npm run typecheck && npm run lint`
6. Submit a pull request

## Review process

Content PRs will be reviewed for:
- Schema compliance
- Attribution metadata completeness
- No unlicensed copyrighted material
- Functional value for roleplay scenarios
- Consistency with project tone and scope

## Licensing

By contributing content, you agree to license it under the same terms as the project (MIT), unless you specify a different permissive license in the content metadata.

Content marked `instance_only` will not be accepted into the public repository. Use `repository_allowed` or `public_allowed` for contributed content.
