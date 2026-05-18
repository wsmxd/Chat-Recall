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
  const [provider, setProvider] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const s = localStorage.getItem("defaultProvider");
    if (s) try { return JSON.parse(s).provider } catch { return null }
    return null;
  });
  const [model, setModel] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const s = localStorage.getItem("defaultProvider");
    if (s) try { return JSON.parse(s).model } catch { return null }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/provider-config")
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${r.status}`);
        }
        return r.json();
      })
      .then((data) => {
        if (data.config) {
          setProvider(data.config.provider);
          setModel(data.config.model);
          localStorage.setItem("defaultProvider", JSON.stringify({ provider: data.config.provider, model: data.config.model }));
        }
      })
      .catch((err) => {
        console.error("Failed to load provider config:", err);
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
    setError(null);

    try {
      const response = await fetch("/api/provider-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, model })
      });

      console.log("PUT response status:", response.status);
      const text = await response.text();
      console.log("PUT response body:", text);

      let data: Record<string, unknown> = {};
      try { data = JSON.parse(text); } catch {}

      if (response.ok && data.config) {
        setSaved(true);
        localStorage.setItem("defaultProvider", JSON.stringify({ provider, model }));
      } else {
        setError(typeof data.error === "string" ? data.error : "Save failed");
        console.error("Save provider config error:", data);
      }
    } catch (e) {
      setError("Network error");
      console.error("Save network error:", e);
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
      {error && <p style={{ color: "var(--color-error, #e53e3e)", marginTop: "8px" }}>{error}</p>}
    </article>
  );
}
