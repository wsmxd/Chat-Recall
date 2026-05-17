# Theme System

## Goal

Themes should make different characters and worlds feel distinct without coupling visual design to hard-coded components.

The theme system should support default app themes, character themes, world themes, and scene mood variants.

## Theme Pack Shape

```json
{
  "schemaVersion": "0.1",
  "name": "Moonlit Archive",
  "slug": "moonlit-archive",
  "tokens": {
    "color": {
      "background": "#101014",
      "surface": "#181820",
      "text": "#F3F0E8",
      "muted": "#A5A0B5",
      "accent": "#D6B86A"
    },
    "radius": {
      "sm": "6px",
      "md": "8px"
    },
    "typography": {
      "display": "serif",
      "body": "sans"
    }
  },
  "chat": {
    "bubbleStyle": "soft_panel",
    "avatarFrame": "ornament",
    "messageDensity": "comfortable"
  },
  "assets": {
    "background": null,
    "ambient": null
  },
  "variants": {
    "calm": {},
    "tense": {},
    "festival": {}
  }
}
```

## Theme Resolution

Theme selection should follow this order:

1. Conversation override
2. Scene mood variant
3. Character default theme
4. User selected app theme
5. System default

## Extensibility Rules

- Themes expose tokens, not component-specific CSS hacks.
- Character cards can recommend themes but should not require them.
- Theme packs can include assets, but must work without them.
- New chat modes should consume the same tokens.
- Public themes should include license metadata.

## Creative Theme Ideas

- Scene mood variants: calm, battle, confession, mystery, comedy, festival
- Relationship-aware themes: UI subtly changes as trust grows
- Lore-arc themes: visual style changes by chapter or timeline
- Character aura accents: avatar frame, cursor glow, input focus, typing indicator
- Accessibility variants: high contrast, reduced motion, dyslexia-friendly typography

