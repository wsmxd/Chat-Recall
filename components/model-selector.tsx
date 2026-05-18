"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";

const providerModels: Record<string, string[]> = {
  deepseek: ["deepseek-v4-flash", "deepseek-v4-pro", "deepseek-chat", "deepseek-reasoner"],
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4.1"],
  anthropic: ["claude-sonnet-4-20250514", "claude-3-5-haiku-20241022"],
  openrouter: ["openai/gpt-4o", "anthropic/claude-sonnet-4", "google/gemini-2.5-pro", "deepseek/deepseek-chat"],
  kimi: ["moonshot-v1-128k", "moonshot-v1-32k", "kimi-latest"],
  qwen: ["qwen-max", "qwen-plus", "qwen-turbo"],
  glm: ["glm-4-plus", "glm-4-flash", "glm-4-air"]
};

const providerNames: Record<string, string> = {
  deepseek: "DeepSeek",
  openai: "OpenAI",
  anthropic: "Anthropic",
  openrouter: "OpenRouter",
  kimi: "Kimi (Moonshot)",
  qwen: "Qwen (Tongyi)",
  glm: "GLM (Zhipu)"
};

export function ModelSelector() {
  const { user } = useAuth();
  const [provider, setProvider] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch("/api/provider-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          setProvider(data.config.provider);
          setModel(data.config.model);
        } else {
          setProvider("deepseek");
          setModel("deepseek-chat");
        }
      })
      .catch(() => {
        setProvider("deepseek");
        setModel("deepseek-chat");
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleProviderChange = (p: string) => {
    setProvider(p);
    setModel(providerModels[p]?.[0] ?? "");
  };

  const handleSave = async () => {
    if (!user || !provider || !model) return;
    setSaving(true);
    setSaved(false);
    const response = await fetch("/api/provider-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, model })
    });

    if (response.ok) {
      setSaved(true);
      localStorage.setItem("defaultProvider", JSON.stringify({ provider, model }));
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <article className="card">
        <h2>Chat Model</h2>
        <p>Loading configuration...</p>
      </article>
    );
  }

  return (
    <article className="card">
      <h2>Chat Model</h2>
      <p>Select the LLM provider and model. Requires the corresponding API key.</p>
      <label className="editor-label">
        Provider
        <select
          className="editor-select"
          value={provider ?? "deepseek"}
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
          value={model ?? "deepseek-chat"}
          onChange={(e) => setModel(e.target.value)}
        >
          {(providerModels[provider ?? "deepseek"] ?? []).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </label>
      <div className="button-row" style={{ marginTop: "8px" }}>
        <button className="button" onClick={handleSave} disabled={saving} type="button">
          {saving ? "Saving..." : saved ? "Saved" : "Save"}
        </button>
      </div>
    </article>
  );
}
