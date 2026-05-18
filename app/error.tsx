"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="brand">
          <span className="brand-mark">CR</span>
          <span>
            <strong>Chat Recall</strong>
          </span>
        </div>
        <h2 style={{ margin: 0 }}>Something went wrong</h2>
        <p style={{ color: "var(--muted)", margin: 0 }}>
          {error.message || "An unexpected error occurred"}
        </p>
        <button className="button" onClick={reset} type="button">
          Try again
        </button>
      </div>
    </div>
  );
}
