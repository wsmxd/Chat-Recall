"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";

export default function ResetPasswordPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login");
    }
  }, [user, router]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = (await import("@supabase/ssr")).createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        setDone(true);
        setTimeout(() => router.push("/"), 2000);
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

        {done ? (
          <div className="auth-message" role="status">
            Password updated. Redirecting...
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-label">
              New Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>

            {error && <div className="auth-error" role="alert">{error}</div>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}