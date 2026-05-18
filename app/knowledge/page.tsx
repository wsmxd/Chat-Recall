import { AppShell } from "@/components/app-shell";
import { LorePackList } from "@/components/lore-pack-list";

export default function KnowledgePage() {
  return (
    <AppShell>
      <main className="page">
        <header className="page-header">
          <h1>Knowledge</h1>
          <p>
            Manage lore packs and ingest documents for RAG retrieval.
            Each lore pack can contain multiple documents that are chunked and embedded.
          </p>
        </header>
        <LorePackList />
      </main>
    </AppShell>
  );
}

