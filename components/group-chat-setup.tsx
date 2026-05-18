"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CharacterOption {
  slug: string;
  name: string;
  subtitle?: string;
}

interface GroupChatSetupProps {
  characters: CharacterOption[];
}

export function GroupChatSetup({ characters }: GroupChatSetupProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [mode, setMode] = useState<"group" | "scene">("group");
  const [sceneParams, setSceneParams] = useState({
    location: "",
    mood: "",
    time: "",
    description: ""
  });

  const toggleCharacter = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleStart = () => {
    if (selected.length === 0) return;
    const slugs = selected.join(",");
    const searchParams = new URLSearchParams();
    searchParams.set("mode", mode);
    if (mode === "scene") {
      if (sceneParams.location) searchParams.set("location", sceneParams.location);
      if (sceneParams.mood) searchParams.set("mood", sceneParams.mood);
      if (sceneParams.time) searchParams.set("time", sceneParams.time);
      if (sceneParams.description) searchParams.set("description", sceneParams.description);
    }
    router.push(`/chat/group/${slugs}?${searchParams.toString()}`);
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: "16px" }}>
        <h2>Mode</h2>
        <div className="button-row">
          <button
            className={`button ${mode === "group" ? "" : "secondary"}`}
            onClick={() => setMode("group")}
            type="button"
          >
            Group Chat
          </button>
          <button
            className={`button ${mode === "scene" ? "" : "secondary"}`}
            onClick={() => setMode("scene")}
            type="button"
          >
            Scene Director
          </button>
        </div>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "8px" }}>
          {mode === "group"
            ? "Chat with multiple characters at once. The AI narrates all characters."
            : "Set up a scene with location, mood, and time. The AI acts as narrator."}
        </p>
      </div>

      {mode === "scene" && (
        <div className="card" style={{ marginBottom: "16px" }}>
          <h2>Scene Settings</h2>
          <label className="editor-label">
            Location
            <input
              className="editor-input"
              value={sceneParams.location}
              onChange={(e) => setSceneParams((p) => ({ ...p, location: e.target.value }))}
              placeholder="A quiet archive room"
            />
          </label>
          <label className="editor-label">
            Mood
            <input
              className="editor-input"
              value={sceneParams.mood}
              onChange={(e) => setSceneParams((p) => ({ ...p, mood: e.target.value }))}
              placeholder="Mysterious and tense"
            />
          </label>
          <label className="editor-label">
            Time
            <input
              className="editor-input"
              value={sceneParams.time}
              onChange={(e) => setSceneParams((p) => ({ ...p, time: e.target.value }))}
              placeholder="Midnight, winter"
            />
          </label>
          <label className="editor-label">
            Description
            <textarea
              className="editor-textarea"
              value={sceneParams.description}
              onChange={(e) => setSceneParams((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe the scene setting..."
              rows={3}
            />
          </label>
        </div>
      )}

      <div className="card">
        <h2>Select Characters ({selected.length})</h2>
        <div className="grid" style={{ marginTop: "12px" }}>
          {characters.map((char) => (
            <div
              key={char.slug}
              className={`card ${selected.includes(char.slug) ? "pinned" : ""}`}
              onClick={() => toggleCharacter(char.slug)}
              style={{ cursor: "pointer", minHeight: "auto" }}
            >
              <h3>{char.name}</h3>
              {char.subtitle && <p>{char.subtitle}</p>}
              <div style={{ marginTop: "8px" }}>
                <span
                  className="tag"
                  style={{
                    borderColor: selected.includes(char.slug) ? "var(--accent)" : "var(--border)",
                    color: selected.includes(char.slug) ? "var(--accent)" : "var(--muted)"
                  }}
                >
                  {selected.includes(char.slug) ? "Selected" : "Click to select"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="button-row" style={{ marginTop: "24px" }}>
        <button
          className="button"
          onClick={handleStart}
          disabled={selected.length === 0}
          type="button"
        >
          Start {mode === "scene" ? "Scene" : "Group Chat"} ({selected.length} characters)
        </button>
        <button className="button secondary" onClick={() => router.push("/characters")} type="button">
          Back to Characters
        </button>
      </div>
    </div>
  );
}
