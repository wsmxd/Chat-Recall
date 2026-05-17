# Moderation and Reporting Design

## Scope

This document describes the design for moderating public content (character cards, themes, lore packs) in a community deployment of Chat Recall. The initial implementation focuses on instance-level controls; community-wide moderation is a future concern.

Content in Chat Recall is always self-hosted per instance. There is no centralized content moderation authority.

## Content Types Subject to Moderation

- **Character cards**: persona, roleplay settings, metadata
- **Theme packs**: visual tokens, assets
- **Lore packs**: world knowledge, canon data

## Instance-Level Controls

### Visibility enforcement

Operators can set a maximum visibility for user-created content. This prevents unmoderated public content:

```typescript
// env.ts
MAX_USER_CONTENT_VISIBILITY = "unlisted"; // Prevents user-made public cards
```

### Content review queue

A future admin dashboard will allow instance operators to:

1. Review content marked `public` before it appears in the gallery
2. Approve, reject, or mark as `unlisted`
3. Add moderation notes

### Reporting API (future)

Authenticated users can report content for guideline violations:

```
POST /api/reports
{
  "contentType": "character",
  "contentId": "uuid",
  "reason": "copyright | harassment | inappropriate",
  "details": "Optional explanation"
}
```

Reports are stored in a `reports` table (not yet created) and visible only to instance operators.

## Metadata-Based Filtering

Content that does not include proper source/attribution metadata should be automatically flagged:

- Missing `source` → prevent `public` visibility
- Missing `license` → mark as "unreviewed"
- Missing `attribution` → warn creator
- `redistribution: instance_only` → never show in public listings

## Current Status

- Content is self-hosted per instance
- No community-wide moderation network exists
- Instance operators are responsible for their own content policy
- Automated metadata checks are planned for future implementation

## License Verification

The `characterCardSchema` enforces:
- `metadata.source` (required)
- `metadata.license` (required)
- `metadata.redistribution` (required)

These fields enable basic content license enforcement without centralized moderation.
