"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";

export default function LoginPage() {
  const { user, signIn, signUp, resetPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "reset") {
        const result = await resetPassword(email);
        if (result.error) {
          setError(result.error);
        } else {
          setMessage("Password reset link sent. Check your email.");
        }
      } else {
        const result = mode === "signin" ? await signIn(email, password) : await signUp(email, password);
        if (result.error) {
          setError(result.error);
        } else if (mode === "signup") {
          setMessage("Check your email for a confirmation link.");
        } else {
          router.push("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link className="brand" href="/">
          <span className="brand-mark">CR</span>
          <span>
            <strong>Chat Recall</strong>
          </span>
        </Link>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "signin" ? "active" : ""}`}
            onClick={() => { setMode("signin"); setError(null); setMessage(null); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => { setMode("signup"); setError(null); setMessage(null); }}
          >
            Sign Up
          </button>
          <button
            className={`auth-tab ${mode === "reset" ? "active" : ""}`}
            onClick={() => { setMode("reset"); setError(null); setMessage(null); }}
          >
            Reset
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              required
              autoComplete="email"
            />
          </label>
          {mode !== "reset" && (
            <label className="auth-label">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </label>
          )}

          {error && <div className="auth-error" role="alert">{error}</div>}
          {message && <div className="auth-message" role="status">{message}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Loading..." : mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
          </button>
        </form>

        {mode === "signin" && (
          <p className="auth-footer">
            <button
              type="button"
              onClick={() => { setMode("reset"); setError(null); setMessage(null); }}
              style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.85rem" }}
            >
              Forgot password?
            </button>
          </p>
        )}

        <p className="auth-footer">
          <Link href="/">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
