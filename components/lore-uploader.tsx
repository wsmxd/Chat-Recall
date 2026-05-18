"use client";

import { useState, useRef } from "react";

interface LoreUploaderProps {
  lorePackId: string;
  onIngested: () => void;
}

export function LoreUploader({ lorePackId, onIngested }: LoreUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !title.trim()) {
      setError("Title and file are required");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "lore");
      const uploadResponse = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.path) {
        throw new Error(uploadData.error ?? "Upload failed");
      }

      const text = await file.text();

      const ingestResponse = await fetch("/api/knowledge/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lorePackId,
          title: title.trim(),
          content: text,
          sourceType: file.type === "application/json" ? "json" : "markdown",
          metadata: { storagePath: uploadData.path }
        })
      });

      const ingestData = await ingestResponse.json();
      if (!ingestResponse.ok) {
        throw new Error(ingestData.error ?? "Ingestion failed");
      }

      setSuccess(true);
      setTitle("");
      if (fileRef.current) fileRef.current.value = "";
      onIngested();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: "16px" }}>
      <h3>Upload Document</h3>
      <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
        Upload a .txt, .md, .json, or .csv file to ingest into this lore pack.
        The file will be chunked, embedded, and stored for RAG retrieval.
      </p>

      <label className="editor-label">
        Title
        <input
          className="editor-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document title"
        />
      </label>
      <label className="editor-label">
        File
        <input
          ref={fileRef}
          className="editor-input"
          type="file"
          accept=".txt,.md,.json,.csv,text/plain,text/markdown,application/json,text/csv"
        />
      </label>

      {error && <div className="memory-error">{error}</div>}
      {success && <div className="auth-message">Document ingested successfully!</div>}

      <button
        className="button"
        onClick={handleUpload}
        disabled={uploading || !title.trim()}
        type="button"
        style={{ marginTop: "8px" }}
      >
        {uploading ? "Uploading & Ingesting..." : "Upload & Ingest"}
      </button>
    </div>
  );
}
