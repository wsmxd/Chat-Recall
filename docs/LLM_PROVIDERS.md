# LLM Providers

## Default Provider

DeepSeek is the default provider for initial planning.

The app should not hard-code DeepSeek into chat orchestration. It should use a provider interface so future models can be added with small adapters.

Embedding providers are separate from chat providers. A conversation can use DeepSeek for chat while the knowledge base uses a different embedding provider.

## Provider Interface Goals

Each provider adapter should support:

- Chat completion
- Streaming output
- Model selection
- Provider-specific settings
- Token or usage reporting where available
- Structured errors
- Timeout and retry behavior

## Planned Provider Shape

```ts
type LLMProviderId = "deepseek" | "openai" | "anthropic" | "google" | "openrouter" | "local";

type LLMMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
};

type LLMGenerateOptions = {
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  metadata?: Record<string, unknown>;
};

interface LLMProvider {
  id: LLMProviderId;
  displayName: string;
  generate(options: LLMGenerateOptions): Promise<LLMResponse>;
  stream(options: LLMGenerateOptions): AsyncIterable<LLMStreamEvent>;
}
```

## Provider Routing

Provider selection should follow this order:

1. Conversation override
2. Character card recommendation
3. User default setting
4. Instance default
5. DeepSeek fallback

## Model Profiles

Instead of exposing every raw model option everywhere, define model profiles:

- `roleplay-balanced`
- `roleplay-fast`
- `lore-heavy`
- `creative-writing`
- `low-cost`
- `local-private`

Profiles can map to different provider/model/settings combinations.

## Embedding Providers

Embedding provider configuration belongs to the RAG layer, not the chat generation layer.

Planned embedding adapter responsibilities:

- Generate embeddings for documents, lore chunks, and memory material.
- Expose vector dimension and model metadata.
- Support batch embedding for ingestion.
- Support re-embedding when the provider or model changes.
- Keep embedding API keys server-side.

The retrieval output should be provider-neutral so any chat model can consume it.

## Safety and Reliability

- API keys must stay server-side.
- Provider errors should be normalized.
- Streaming cancellation should be supported.
- Usage should be logged for debugging and cost visibility.
- Provider-specific prompt quirks should live in adapter config, not domain logic.
