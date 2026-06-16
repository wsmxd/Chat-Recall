"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { providerModels, providerNames, getDefaultModelForProvider } from "@/lib/llm/catalog";

export function ModelSelector() {
  const { user, loading: authLoading } = useAuth();
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      return;
    }
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
  }, [user, authLoading]);

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

      const text = await response.text();

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

  if (authLoading || loading) {
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
          value={model ?? getDefaultModelForProvider(provider ?? "deepseek")}
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
