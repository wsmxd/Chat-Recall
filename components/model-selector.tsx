"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";

const providerModels: Record<string, string[]> = {
  deepseek: ["deepseek-chat", "deepseek-reasoner"],
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4.1"],
  anthropic: ["claude-sonnet-4-20250514", "claude-3-5-haiku-20241022"],
  openrouter: ["openai/gpt-4o", "anthropic/claude-sonnet-4", "google/gemini-2.5-pro", "deepseek/deepseek-chat"]
};

const providerNames: Record<string, string> = {
  deepseek: "DeepSeek",
  openai: "OpenAI",
  anthropic: "Anthropic",
  openrouter: "OpenRouter"
};

export function ModelSelector() {
  const { user } = useAuth();
  const [provider, setProvider] = useState("deepseek");
  const [model, setModel] = useState("deepseek-chat");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/provider-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          setProvider(data.config.provider);
          setModel(data.config.model);
        }
      })
      .catch(() => {});
  }, [user]);

  const handleProviderChange = (p: string) => {
    setProvider(p);
    setModel(providerModels[p]?.[0] ?? "");
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setSaved(false);

    const response = await fetch("/api/provider-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, model })
    });

    if (response.ok) setSaved(true);
    setLoading(false);
  };

  return (
    <article className="card">
      <h2>Chat Model</h2>
      <p>Select the LLM provider and model. Requires the corresponding API key.</p>
      <label className="editor-label">
        Provider
        <select
          className="editor-select"
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value)}
        >
          {Object.entries(providerNames).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </label>
      <label className="editor-label">
        Model
        <select
          className="editor-select"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          {(providerModels[provider] ?? []).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </label>
      <div className="button-row" style={{ marginTop: "8px" }}>
        <button className="button" onClick={handleSave} disabled={loading} type="button">
          {loading ? "Saving..." : saved ? "Saved" : "Save"}
        </button>
      </div>
    </article>
  );
}
