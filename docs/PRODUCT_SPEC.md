# Product Spec

## Vision

Chat Recall is a character roleplay chat app for users who want conversations grounded in specific characters, worlds, scenes, and niche lore.

The product should feel closer to an expandable roleplay engine than a single chatbot. A user can choose a character, enter a themed chat room, attach a knowledge base, and build an ongoing relationship or story with memory.

## Target Users

- Fans of niche games, anime, visual novels, and worldbuilding communities
- Fans who want to roleplay with recognizable third-party characters from existing IP
- Roleplay writers who want character consistency and scene continuity
- Creators who want to publish character cards and lore packs
- Developers who want an open-source AI roleplay base they can extend

## Core User Flows

1. Choose a default character card.
2. Start a themed conversation.
3. The system retrieves relevant lore from Supabase vector search.
4. The default DeepSeek provider generates the reply.
5. The chat builds short-term context and long-term memories.
6. The user edits, forks, or imports a custom character card.
7. The user attaches a custom lore pack or personal knowledge base.

Anonymous users stop at the chat trial layer: they can talk to existing cards, but custom cards, uploads, persistent memory, and provider configuration require login.

## MVP Scope

- Account and anonymous session strategy, with anonymous users limited to chatting with existing cards
- Character gallery with default cards
- Chat interface with streaming responses
- DeepSeek provider as default
- Provider abstraction for future LLMs
- Supabase schema for users, characters, chats, messages, memories, documents, chunks, and embeddings
- RAG pipeline design for lore retrieval
- Theme system design tied to character cards
- Import/export format for character cards

## Later Scope

- Public character marketplace/gallery
- Collaborative lore pack editing
- Multi-character group chat
- Scene director mode
- Spoiler controls by lore arc, chapter, or episode
- Memory timeline and relationship state
- Community prompt benchmarks
- Moderation and reporting tools
- Creator profile pages

## Product Pillars

- Character fidelity: responses should preserve voice, boundaries, relationships, and canon preferences.
- Lore grounding: retrieval should be visible enough to debug but subtle enough to keep immersion.
- Fandom compatibility: the system should support third-party character cards while separating app code from redistributable content.
- Creative control: users can tune tone, pacing, scene rules, and memory behavior.
- Extensibility: new providers, themes, cards, and RAG sources should not require rewriting the app.
