"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/characters", label: "Characters" },
  { href: "/chat/group", label: "Group Chat" },
  { href: "/knowledge", label: "Knowledge" },
  { href: "/settings", label: "Settings" }
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <Link className="brand" href="/">
          <span className="brand-mark">CR</span>
          <span>
            <strong>Chat Recall</strong>
            <small>Roleplay engine</small>
          </span>
        </Link>
        <nav className="nav-list">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          {user && (
            <Link href="/conversations">
              Conversations
            </Link>
          )}
        </nav>
        <div className="nav-footer">
          {user ? (
            <>
              <span className="nav-user">{user.email}</span>
              <button className="nav-signout" onClick={signOut}>
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="nav-signin">
              Sign In
            </Link>
          )}
        </div>
      </aside>
      <div className="app-content">{children}</div>
    </div>
  );
}

