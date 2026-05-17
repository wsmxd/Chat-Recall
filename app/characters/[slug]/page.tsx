import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getPublicCharacterBySlug, listPublicCharacters } from "@/lib/characters/queries";

type CharacterPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const characters = await listPublicCharacters();

  return characters.map((character) => ({
    slug: character.slug
  }));
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { slug } = await params;
  const character = await getPublicCharacterBySlug(slug);

  if (!character) {
    notFound();
  }

  const card = character.card;

  return (
    <AppShell>
      <main className="page">
        <header className="page-header">
          <h1>{character.name}</h1>
          <p>{character.subtitle}</p>
        </header>
        <section className="grid">
          <article className="card">
            <h2>Persona</h2>
            <dl className="detail-list">
              <div>
                <dt>Core</dt>
                <dd>{card.persona.core}</dd>
              </div>
              <div>
                <dt>Voice</dt>
                <dd>{card.persona.voice}</dd>
              </div>
              <div>
                <dt>Relationship</dt>
                <dd>{card.persona.relationshipDefaults}</dd>
              </div>
            </dl>
          </article>
          <article className="card">
            <h2>Roleplay</h2>
            <dl className="detail-list">
              <div>
                <dt>Greeting</dt>
                <dd>{card.roleplay.greeting}</dd>
              </div>
              <div>
                <dt>Scenario</dt>
                <dd>{card.roleplay.scenario}</dd>
              </div>
              <div>
                <dt>Modes</dt>
                <dd>{card.roleplay.allowedModes.join(", ")}</dd>
              </div>
            </dl>
          </article>
          <article className="card">
            <h2>Metadata</h2>
            <dl className="detail-list">
              <div>
                <dt>Source</dt>
                <dd>{card.metadata.sourceTitle ?? card.metadata.source}</dd>
              </div>
              <div>
                <dt>License</dt>
                <dd>{card.metadata.license}</dd>
              </div>
              <div>
                <dt>Redistribution</dt>
                <dd>{card.metadata.redistribution}</dd>
              </div>
            </dl>
          </article>
        </section>
        <div className="button-row" style={{ marginTop: "24px" }}>
          <Link className="button secondary" href="/characters">
            Back to characters
          </Link>
          <Link className="button" href={`/chat/${character.slug}`}>
            Start chat
          </Link>
        </div>
      </main>
    </AppShell>
  );
}

