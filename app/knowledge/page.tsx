import { AppShell } from "@/components/app-shell";

export default function KnowledgePage() {
  return (
    <AppShell>
      <main className="page">
        <header className="page-header">
          <h1>Knowledge</h1>
          <p>
            The database vector layer is ready. The next RAG slice will add ingestion, chunking,
            embedding providers, retrieval testing, and citation storage.
          </p>
        </header>
      </main>
    </AppShell>
  );
}

