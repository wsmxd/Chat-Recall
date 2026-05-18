"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";

interface LorePack {
  id: string;
  name: string;
  description: string | null;
  sourceType: string | null;
  visibility: string;
  documentCount: number;
  createdAt: string;
}

export function LorePackList() {
  const { user } = useAuth();
  const [packs, setPacks] = useState<LorePack[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const refresh = async () => {
    if (!user) return;
    setLoading(true);
    const response = await fetch("/api/lore-packs");
    const data = await response.json();
    if (response.ok) setPacks(data.packs ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch("/api/lore-packs")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.packs) setPacks(data.packs);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    const response = await fetch("/api/lore-packs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined })
    });
    if (response.ok) {
      setName("");
      setDescription("");
      refresh();
    }
    setCreating(false);
  };

  if (!user) {
    return <p>Sign in to manage lore packs.</p>;
  }

  return (
    <div>
      <div className="editor-new card" style={{ marginBottom: "16px" }}>
        <h3>Create Lore Pack</h3>
        <label className="editor-label">
          Name
          <input
            className="editor-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My World Lore"
          />
        </label>
        <label className="editor-label">
          Description
          <input
            className="editor-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
        </label>
        <button className="button" onClick={handleCreate} disabled={creating} type="button" style={{ marginTop: "8px" }}>
          {creating ? "Creating..." : "Create"}
        </button>
      </div>

      {loading ? (
        <p className="memory-loading">Loading lore packs...</p>
      ) : packs.length === 0 ? (
        <p className="memory-empty">No lore packs yet. Create one to start ingesting knowledge documents.</p>
      ) : (
        <div className="memory-list">
          {packs.map((pack) => (
            <div key={pack.id} className="memory-item">
              <div className="memory-item-header">
                <span className="tag">{pack.visibility}</span>
                <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{pack.documentCount} documents</span>
              </div>
              <h3 style={{ margin: 0 }}>{pack.name}</h3>
              {pack.description && <p className="memory-content">{pack.description}</p>}
              <div className="memory-actions">
                <button
                  className="memory-action-btn"
                  onClick={() => navigator.clipboard.writeText(pack.id)}
                  type="button"
                >
                  Copy ID
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
