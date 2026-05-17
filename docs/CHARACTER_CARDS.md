# Character Cards

## Purpose

Character cards define how a roleplay character behaves, speaks, remembers, appears, and connects to lore and themes.

Cards should be easy to import, export, fork, diff, and review.

## Card Categories

- Official default cards
- Community public cards
- Private user cards
- Forked cards
- Temporary scene-only cards
- Third-party fandom cards with source and attribution metadata

## Proposed Card Schema

```json
{
  "schemaVersion": "0.1",
  "name": "Example Character",
  "subtitle": "A concise identity line",
  "description": "Public-facing description.",
  "persona": {
    "core": "Stable character identity.",
    "voice": "Speech style and verbal habits.",
    "values": ["value one", "value two"],
    "boundaries": ["things the character avoids"],
    "relationshipDefaults": "How they treat a new user."
  },
  "roleplay": {
    "greeting": "Opening message.",
    "scenario": "Default scene setup.",
    "style": ["immersive", "concise", "in-character"],
    "allowedModes": ["chat", "scene", "narration"]
  },
  "memory": {
    "strategy": "relationship_timeline",
    "pinnedFacts": [],
    "forgettingPolicy": "summarize_low_importance"
  },
  "knowledge": {
    "defaultLorePackIds": [],
    "canonPreference": "canon_first",
    "spoilerLevel": "user_selected"
  },
  "theme": {
    "defaultThemeId": "example-theme",
    "moodVariants": ["calm", "battle", "night"]
  },
  "model": {
    "preferredProfile": "roleplay-balanced",
    "temperature": 0.8
  },
  "metadata": {
    "source": "third_party_or_original",
    "sourceTitle": "Example Source",
    "tags": ["roleplay"],
    "language": "zh-CN",
    "license": "unknown_or_declared_by_creator",
    "redistribution": "instance_only"
  }
}
```

## Character Quality Checklist

- The voice is specific enough to recognize.
- The card includes roleplay boundaries.
- The greeting creates a usable starting scene.
- Lore links are explicit, not hidden in prompt text.
- Theme choices are optional and replaceable.
- Model preferences are suggestions, not requirements.
- The card can be shared without exposing private user data.
- Third-party cards include source and redistribution metadata.

## Import and Export

The project should support JSON import/export first. Later it can support compatibility with popular character card formats through converters.

Imports should validate:

- Schema version
- Required fields
- Unsafe prompt injection patterns
- Unknown external URLs
- License metadata
