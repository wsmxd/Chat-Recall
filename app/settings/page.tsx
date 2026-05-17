import { AppShell } from "@/components/app-shell";

export default function SettingsPage() {
  return (
    <AppShell>
      <main className="page">
        <header className="page-header">
          <h1>Settings</h1>
          <p>
            Provider configuration is managed through environment variables.
            See <a href="https://github.com/anomalyco/chat-recall/blob/main/docs/SELF_HOSTING.md" style={{ color: "var(--accent)" }}>the self-hosting guide</a> for details.
          </p>
        </header>
        <section className="grid">
          <article className="card">
            <h2>LLM Provider</h2>
            <p>DeepSeek is configured as the default chat provider.</p>
          </article>
          <article className="card">
            <h2>Embedding Provider</h2>
            <p>Tongyi/DashScope is configured for RAG embeddings (768 dimensions).</p>
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

