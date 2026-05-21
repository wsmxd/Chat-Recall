import { AppShell } from "@/components/app-shell";
import { listPublicThemes } from "@/lib/themes/queries";
import { getSession } from "@/lib/auth/server";
import { listUserThemes } from "@/lib/themes/mutations";

export default async function ThemesPage() {
  const { user } = await getSession();
  const publicThemes = await listPublicThemes();
  const userThemes = user ? await listUserThemes(user.id) : [];

  const seen = new Set(userThemes.map((t) => t.slug));
  const dedupedPublic = publicThemes.filter((t) => !seen.has(t.slug));

  return (
    <AppShell>
      <main className="page">
        <header className="page-header">
          <h1>Themes</h1>
          <p>
            Browse theme packs that define colors, typography, and visual style for your
            roleplay experience.
          </p>
        </header>

        {userThemes.length > 0 && (
          <>
            <h2>Your Themes</h2>
            <section className="grid">
              {userThemes.map((theme) => (
                <article className="card" key={theme.id}>
                  <h3>{theme.name}</h3>
                  <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{theme.slug}</p>
                  <div className="tag-list">
                    <span className="tag">{theme.visibility}</span>
                  </div>
                  <div className="theme-preview" style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
                    {theme.pack.tokens.color.background && (
                      <span
                        style={{
                          width: 24, height: 24, borderRadius: 4,
                          background: theme.pack.tokens.color.background,
                          border: "1px solid var(--border)"
                        }}
                        title={`background: ${theme.pack.tokens.color.background}`}
                      />
                    )}
                    {theme.pack.tokens.color.accent && (
                      <span
                        style={{
                          width: 24, height: 24, borderRadius: 4,
                          background: theme.pack.tokens.color.accent
                        }}
                        title={`accent: ${theme.pack.tokens.color.accent}`}
                      />
                    )}
                    {theme.pack.tokens.color.text && (
                      <span
                        style={{
                          width: 24, height: 24, borderRadius: 4,
                          background: theme.pack.tokens.color.text,
                          border: "1px solid var(--border)"
                        }}
                        title={`text: ${theme.pack.tokens.color.text}`}
                      />
                    )}
                    {theme.pack.tokens.color.surface && (
                      <span
                        style={{
                          width: 24, height: 24, borderRadius: 4,
                          background: theme.pack.tokens.color.surface,
                          border: "1px solid var(--border)"
                        }}
                        title={`surface: ${theme.pack.tokens.color.surface}`}
                      />
                    )}
                  </div>
                  {Object.keys(theme.pack.variants).length > 0 && (
                    <p style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                      Variants: {Object.keys(theme.pack.variants).join(", ")}
                    </p>
                  )}
                </article>
              ))}
            </section>
          </>
        )}

        <h2>Public Themes</h2>
        <section className="grid">
          {dedupedPublic.map((theme) => (
            <article className="card" key={theme.id}>
              <h3>{theme.name}</h3>
              <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{theme.slug}</p>
              <div className="tag-list">
                <span className="tag">{theme.visibility}</span>
              </div>
              <div className="theme-preview" style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
                {theme.pack.tokens.color.background && (
                  <span
                    style={{
                      width: 24, height: 24, borderRadius: 4,
                      background: theme.pack.tokens.color.background,
                      border: "1px solid var(--border)"
                    }}
                    title={`background: ${theme.pack.tokens.color.background}`}
                  />
                )}
                {theme.pack.tokens.color.accent && (
                  <span
                    style={{
                      width: 24, height: 24, borderRadius: 4,
                      background: theme.pack.tokens.color.accent
                    }}
                    title={`accent: ${theme.pack.tokens.color.accent}`}
                  />
                )}
                {theme.pack.tokens.color.text && (
                  <span
                    style={{
                      width: 24, height: 24, borderRadius: 4,
                      background: theme.pack.tokens.color.text,
                      border: "1px solid var(--border)"
                    }}
                    title={`text: ${theme.pack.tokens.color.text}`}
                  />
                )}
                {theme.pack.tokens.color.surface && (
                  <span
                    style={{
                      width: 24, height: 24, borderRadius: 4,
                      background: theme.pack.tokens.color.surface,
                      border: "1px solid var(--border)"
                    }}
                    title={`surface: ${theme.pack.tokens.color.surface}`}
                  />
                )}
              </div>
              {Object.keys(theme.pack.variants).length > 0 && (
                <p style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                  Variants: {Object.keys(theme.pack.variants).join(", ")}
                </p>
              )}
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}