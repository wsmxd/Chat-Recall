import { AppShell } from "@/components/app-shell";
import { ModelSelector } from "@/components/model-selector";
import { UserThemeSelector } from "@/components/user-theme-selector";

export default function SettingsPage() {
  return (
    <AppShell>
      <main className="page">
        <header className="page-header">
          <h1>Settings</h1>
          <p>
            Configure your chat model, default theme, and view provider information.
          </p>
        </header>
        <section className="grid">
          <ModelSelector />
          <UserThemeSelector />
          <article className="card">
            <h2>Embedding Provider</h2>
            <p>Tongyi/DashScope is configured for RAG embeddings (1024 dimensions).</p>
          </article>
          <article className="card">
            <h2>Auth</h2>
            <p>Supabase Auth handles email/password authentication with RLS policies.</p>
          </article>
          <article className="card">
            <h2>Database</h2>
            <p>Supabase Postgres with pgvector extension for vector search.</p>
          </article>
        </section>
      </main>
    </AppShell>
  );
}

