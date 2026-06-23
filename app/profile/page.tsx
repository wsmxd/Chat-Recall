import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSession, getProfile } from "@/lib/auth/server";
import { listUserCharacters } from "@/lib/characters/mutations";
import { listUserThemes } from "@/lib/themes/mutations";
import { listUserLorePacks } from "@/lib/rag/lore-packs";

export default async function ProfilePage() {
  const { user } = await getSession();
  if (!user) redirect("/auth/login");

  const profile = await getProfile(user.id);
  const [characters, themes, lorePacks] = await Promise.all([
    listUserCharacters(user.id),
    listUserThemes(user.id),
    listUserLorePacks(user.id)
  ]);

  const settings = (profile as Record<string, unknown> | null)?.settings as Record<string, unknown> | undefined;
  const defaultThemeId = settings?.defaultThemeId as string | undefined;

  return (
    <AppShell>
      <main className="page">
        <header className="page-header">
          <h1>Profile</h1>
          <p>{user.email}</p>
        </header>

        <section className="grid">
          <article className="card">
            <h2>Account</h2>
            <dl className="detail-list">
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Default Theme</dt>
                <dd>{defaultThemeId || "System default"}</dd>
              </div>
            </dl>
          </article>

          <article className="card">
            <h2>Your Characters ({characters.length})</h2>
            {characters.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>No characters yet. <Link href="/characters/new">Create one</Link>.</p>
            ) : (
              <div className="tag-list">
                {characters.map((c) => (
                  <Link key={c.id} className="tag" href={`/characters/${c.slug}`}>{c.name}</Link>
                ))}
              </div>
            )}
          </article>

          <article className="card">
            <h2>Your Themes ({themes.length})</h2>
            {themes.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>No custom themes yet. Browse <Link href="/themes">themes</Link>.</p>
            ) : (
              <div className="tag-list">
                {themes.map((t) => (
                  <span key={t.id} className="tag">{t.name}</span>
                ))}
              </div>
            )}
          </article>

          <article className="card">
            <h2>Your Lore Packs ({lorePacks.length})</h2>
            {lorePacks.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>No lore packs yet. <Link href="/knowledge">Create one</Link>.</p>
            ) : (
              <div className="tag-list">
                {lorePacks.map((p) => (
                  <span key={p.id} className="tag">{p.name}</span>
                ))}
              </div>
            )}
          </article>
        </section>
      </main>
    </AppShell>
  );
}