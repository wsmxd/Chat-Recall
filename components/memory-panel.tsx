"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import type { MemoryEntry, MemoryType } from "@/lib/memories/queries";

interface MemoryPanelProps {
  conversationId?: string;
  characterName?: string;
}

export function MemoryPanel({ conversationId, characterName }: MemoryPanelProps) {
  const { user } = useAuth();
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<MemoryType | "all">("all");
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<MemoryType>("fact");

  const fetchMemories = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (conversationId) params.set("conversationId", conversationId);
      if (filter !== "all") params.append("type", filter);

      const response = await fetch(`/api/memories?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setMemories(data.memories ?? []);
      } else {
        setError(data.error ?? "Failed to fetch memories");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (conversationId) params.set("conversationId", conversationId);
        if (filter !== "all") params.append("type", filter);

        const response = await fetch(`/api/memories?${params.toString()}`, {
          signal: controller.signal
        });
        const data = await response.json();

        if (!cancelled) {
          if (response.ok) {
            setMemories(data.memories ?? []);
          } else {
            setError(data.error ?? "Failed to fetch memories");
          }
        }
      } catch (err) {
        if (!cancelled && !(err instanceof DOMException && err.name === "AbortError")) {
          setError("Network error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; controller.abort(); };
  }, [user, conversationId, filter]);

  const handleCreate = async () => {
    if (!newContent.trim() || !user) return;

    const response = await fetch("/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        type: newType,
        content: newContent.trim(),
        confidence: 0.8,
        pinned: false
      })
    });

    if (response.ok) {
      setNewContent("");
      setNewType("fact");
      setShowNew(false);
      fetchMemories();
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editContent.trim()) return;

    const response = await fetch("/api/memories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, content: editContent.trim() })
    });

    if (response.ok) {
      setEditing(null);
      fetchMemories();
    }
  };

  const handlePin = async (id: string, pinned: boolean) => {
    const response = await fetch("/api/memories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, pinned })
    });

    if (response.ok) fetchMemories();
  };

  const handleApproveAll = async () => {
    const pending = memories.filter((m) => !m.pinned);
    for (const m of pending) {
      await fetch("/api/memories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: m.id, pinned: true })
      });
    }
    fetchMemories();
  };

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/memories?id=${id}`, { method: "DELETE" });
    if (response.ok) fetchMemories();
  };

  const typeColors: Record<MemoryType, string> = {
    fact: "#7eb8da",
    relationship: "#d6b86a",
    preference: "#9b7fd4",
    timeline: "#7ec9a8",
    summary: "#d68a6a"
  };

  if (!user) {
    return (
      <div className="card">
        <p>Sign in to manage memories.</p>
      </div>
    );
  }

  return (
    <div className="memory-panel">
      <header className="memory-header">
        <h2>Memories{characterName ? ` - ${characterName}` : ""}</h2>
        <div className="button-row">
          <select
            className="editor-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value as MemoryType | "all")}
          >
            <option value="all">All types</option>
            <option value="fact">Facts</option>
            <option value="relationship">Relationships</option>
            <option value="preference">Preferences</option>
            <option value="timeline">Timeline</option>
            <option value="summary">Summaries</option>
          </select>
          <button
            className="button"
            onClick={() => setShowNew(!showNew)}
            type="button"
          >
            + New Memory
          </button>
          <button className="button secondary" onClick={fetchMemories} type="button">
            Refresh
          </button>
          <button
            className="button secondary"
            onClick={() => {
              const json = JSON.stringify(memories.map((m) => ({ type: m.type, content: m.content, confidence: m.confidence, pinned: m.pinned })), null, 2);
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "memories.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
            type="button"
          >
            Export
          </button>
        </div>
      </header>

      {showNew && (
        <div className="memory-new card">
          <h3>Add Memory</h3>
          <label className="editor-label">
            Type
            <select
              className="editor-select"
              value={newType}
              onChange={(e) => setNewType(e.target.value as MemoryType)}
            >
              <option value="fact">Fact</option>
              <option value="relationship">Relationship</option>
              <option value="preference">Preference</option>
              <option value="timeline">Timeline</option>
              <option value="summary">Summary</option>
            </select>
          </label>
          <label className="editor-label">
            Content
            <textarea
              className="editor-textarea"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="What to remember..."
              rows={3}
            />
          </label>
          <div className="button-row">
            <button className="button" onClick={handleCreate} type="button">
              Save
            </button>
            <button className="button secondary" onClick={() => setShowNew(false)} type="button">
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <div className="memory-error">{error}</div>}

      {loading ? (
        <p className="memory-loading">Loading memories...</p>
      ) : memories.length === 0 ? (
        <p className="memory-empty">
          No memories yet. They will be extracted from conversations automatically, or you can add them manually.
        </p>
      ) : (
        <>
          {(() => {
            const pending = memories.filter((m) => !m.pinned);
            const approved = memories.filter((m) => m.pinned);

            return (
              <>
                {pending.length > 0 && (
                  <div>
                    <div className="memory-section-header">
                      <h3>Needs Review ({pending.length})</h3>
                      {pending.length > 1 && (
                        <button className="button secondary" onClick={handleApproveAll} type="button">
                          Approve All
                        </button>
                      )}
                    </div>
                    <div className="memory-list">
                      {pending.map((memory) => (
                        <div key={memory.id} className="memory-item">
                          <div className="memory-item-header">
                            <span
                              className="memory-type-badge"
                              style={{ borderColor: typeColors[memory.type], color: typeColors[memory.type] }}
                            >
                              {memory.type}
                            </span>
                            <span className={`memory-confidence ${memory.confidence < 0.7 ? "low" : ""}`}>
                              {Math.round(memory.confidence * 100)}%
                            </span>
                          </div>

                          {editing === memory.id ? (
                            <div className="memory-edit-form">
                              <textarea
                                className="editor-textarea"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={3}
                              />
                              <div className="button-row">
                                <button className="button" onClick={() => handleUpdate(memory.id)} type="button">
                                  Save
                                </button>
                                <button className="button secondary" onClick={() => setEditing(null)} type="button">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="memory-content">{memory.content}</p>
                          )}

                          <div className="memory-actions">
                            <button
                              className="memory-action-btn"
                              onClick={() => { setEditing(memory.id); setEditContent(memory.content); }}
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              className="memory-action-btn"
                              onClick={() => handlePin(memory.id, true)}
                              type="button"
                            >
                              Approve
                            </button>
                            <button
                              className="memory-action-btn delete"
                              onClick={() => handleDelete(memory.id)}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {approved.length > 0 && (
                  <div style={{ marginTop: pending.length > 0 ? "24px" : 0 }}>
                    <h3 className="memory-section-title">Approved ({approved.length})</h3>
                    <div className="memory-list">
                      {approved.map((memory) => (
                        <div key={memory.id} className="memory-item pinned">
                          <div className="memory-item-header">
                            <span
                              className="memory-type-badge"
                              style={{ borderColor: typeColors[memory.type], color: typeColors[memory.type] }}
                            >
                              {memory.type}
                            </span>
                            <span className="memory-confidence">
                              {Math.round(memory.confidence * 100)}%
                            </span>
                            <span className="memory-pinned-badge">Pinned</span>
                          </div>

                          {editing === memory.id ? (
                            <div className="memory-edit-form">
                              <textarea
                                className="editor-textarea"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={3}
                              />
                              <div className="button-row">
                                <button className="button" onClick={() => handleUpdate(memory.id)} type="button">
                                  Save
                                </button>
                                <button className="button secondary" onClick={() => setEditing(null)} type="button">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="memory-content">{memory.content}</p>
                          )}

                          <div className="memory-actions">
                            <button
                              className="memory-action-btn"
                              onClick={() => { setEditing(memory.id); setEditContent(memory.content); }}
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              className="memory-action-btn"
                              onClick={() => handlePin(memory.id, false)}
                              type="button"
                            >
                              Unpin
                            </button>
                            <button
                              className="memory-action-btn delete"
                              onClick={() => handleDelete(memory.id)}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}
