import type {
  EmbeddingProvider,
  EmbeddingOptions,
  EmbeddingResult
} from "@/lib/rag/embeddings/types";
import { getServerEnvOrNull } from "@/lib/env";

const BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const DEFAULT_MODEL = "text-embedding-v4";
const DEFAULT_DIMENSIONS = 1024;

export function createTongyiEmbeddingProvider(): EmbeddingProvider {
  const env = getServerEnvOrNull();
  const apiKey = env?.DASHSCOPE_API_KEY;
  const model = env?.EMBEDDING_MODEL || DEFAULT_MODEL;
  const dimensions = parseInt(env?.EMBEDDING_DIMENSIONS || String(DEFAULT_DIMENSIONS), 10);

  return {
    id: "tongyi",
    displayName: "Tongyi Embedding",
    dimensions,
    model,

    async embed(options: EmbeddingOptions): Promise<EmbeddingResult> {
      if (!apiKey) {
        throw new Error("DASHSCOPE_API_KEY is not configured.");
      }

      const batchSize = 100;
      const allEmbeddings: number[][] = [];

      for (let i = 0; i < options.input.length; i += batchSize) {
        const batch = options.input.slice(i, i + batchSize);

        const response = await fetch(`${BASE_URL}/embeddings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: options.model || model,
            input: batch
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("DashScope embedding error:", response.status, errorText);
          throw new Error(`DashScope embedding error ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (data.data) {
          allEmbeddings.push(...data.data.map((d: { embedding: number[] }) => d.embedding));
        }
      }

      return {
        embeddings: allEmbeddings,
        model: options.model || model,
        provider: "tongyi",
        dimensions: options.dimensions || dimensions
      };
    }
  };
}
