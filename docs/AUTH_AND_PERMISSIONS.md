# Auth and Permissions

## User Modes

Chat Recall should support both anonymous users and authenticated users.

## Anonymous Users

Anonymous users are allowed to try the core chat experience with existing cards. This keeps the app low-friction while protecting creator and knowledge-base features.

Anonymous users can:

- Browse public or official character cards.
- Start temporary chats with existing cards.
- Use themes and lore packs already attached to those cards.
- Regenerate or continue messages within the current temporary session.

Anonymous users cannot:

- Create, edit, fork, import, export, or publish character cards.
- Upload documents.
- Create, edit, or publish lore packs.
- Create custom themes.
- Save long-term memory.
- Configure model providers or API keys.
- Access creator tools.
- Publish public conversations or content.

## Authenticated Users

Authenticated users can:

- Create private character cards.
- Fork public cards into private copies.
- Import and export cards.
- Create private lore packs.
- Upload documents for ingestion.
- Save conversations and long-term memories.
- Configure user-level preferences.
- Publish content if the instance enables community features.

## Permission Matrix

| Capability | Anonymous | Authenticated |
| --- | --- | --- |
| Chat with existing cards | Yes | Yes |
| Save persistent conversations | No | Yes |
| Long-term memory | No | Yes |
| Create cards | No | Yes |
| Import/export cards | No | Yes |
| Upload lore documents | No | Yes |
| Create lore packs | No | Yes |
| Create themes | No | Yes |
| Configure providers | No | Yes |
| Publish community content | No | Optional |

## Implementation Notes

- Anonymous chats can be stored client-side or as short-lived server sessions.
- If anonymous messages are stored server-side, retention should be short and documented.
- Supabase RLS should treat anonymous and authenticated access differently.
- Public character cards and their attached public lore packs need read policies.
- All custom user content should require an authenticated owner.

