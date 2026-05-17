import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default function HomePage() {
  return (
    <AppShell>
      <main className="page">
        <header className="page-header">
          <h1>Character roleplay with memory and lore-aware RAG.</h1>
          <p>
            Chat Recall is moving from scaffold to product foundation. The first slice wires
            environment validation, Supabase clients, typed character cards, and a read-only
            character gallery.
          </p>
        </header>
        <section className="grid" aria-label="Implementation areas">
          <article className="card">
            <h2>Characters</h2>
            <p>Browse structured character cards before chat and customization are enabled.</p>
            <div className="button-row">
              <Link className="button" href="/characters">
                View characters
              </Link>
            </div>
          </article>
          <article className="card">
            <h2>Knowledge</h2>
            <p>Supabase pgvector and the retrieval RPC are ready for the upcoming RAG pipeline.</p>
            <div className="button-row">
              <Link className="button secondary" href="/knowledge">
                Open knowledge
              </Link>
            </div>
          </article>
          <article className="card">
            <h2>Providers</h2>
            <p>DeepSeek will be the default chat provider while embeddings remain independent.</p>
            <div className="button-row">
              <Link className="button secondary" href="/settings">
                Review settings
              </Link>
            </div>
          </article>
        </section>
      </main>
    </AppShell>
  );
}

