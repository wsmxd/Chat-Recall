import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/characters", label: "Characters" },
  { href: "/knowledge", label: "Knowledge" },
  { href: "/settings", label: "Settings" }
];

export function AppShell({ children }: { children: ReactNode }) {
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
        </nav>
      </aside>
      <div className="app-content">{children}</div>
    </div>
  );
}

