export default function HomePage() {
  return (
    <main
      style={{
        display: "grid",
        minHeight: "100vh",
        placeItems: "center",
        padding: "24px"
      }}
    >
      <section style={{ maxWidth: "720px" }}>
        <p style={{ color: "var(--accent)", margin: "0 0 12px" }}>Chat Recall</p>
        <h1 style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", lineHeight: 1, margin: 0 }}>
          Character roleplay with memory and lore-aware RAG.
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.125rem", lineHeight: 1.7 }}>
          This is the initial Next.js project shell. Product modules, Supabase services,
          model providers, character cards, and theme packs will be added behind the documented
          extension points.
        </p>
      </section>
    </main>
  );
}

