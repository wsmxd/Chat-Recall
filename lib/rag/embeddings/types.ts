export type EmbeddingProviderId = "tongyi" | "openai" | "local";

export interface EmbeddingOptions {
  model: string;
  input: string[];
  dimensions?: number;
}

export interface EmbeddingResult {
  embeddings: number[][];
  model: string;
  provider: EmbeddingProviderId;
  dimensions: number;
  usage?: {
    promptTokens?: number;
    totalTokens?: number;
  };
}

export interface EmbeddingProvider {
  id: EmbeddingProviderId;
  displayName: string;
  dimensions: number;
  model: string;
  embed(options: EmbeddingOptions): Promise<EmbeddingResult>;
}
