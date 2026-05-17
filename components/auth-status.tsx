"use client";

import { useAuth } from "@/components/auth-provider";
import Link from "next/link";

export function AuthStatus() {
  const { user, signOut, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return (
      <div className="nav-footer">
        <span className="nav-user">{user.email}</span>
        <button className="nav-signout" onClick={signOut}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="nav-footer">
      <Link href="/auth/login" className="nav-signin">
        Sign In
      </Link>
    </div>
  );
}
