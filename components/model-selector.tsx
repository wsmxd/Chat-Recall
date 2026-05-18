"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";

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
      <p>Select the LLM provider and model for your chats.</p>
      <label className="editor-label">
        Provider
        <select
          className="editor-select"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
          <option value="deepseek">DeepSeek</option>
        </select>
      </label>
      <label className="editor-label">
        Model
        <select
          className="editor-select"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="deepseek-chat">deepseek-chat</option>
          <option value="deepseek-reasoner">deepseek-reasoner (R1)</option>
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
