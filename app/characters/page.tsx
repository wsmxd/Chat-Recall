import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { listPublicCharacters } from "@/lib/characters/queries";

export default async function CharactersPage() {
  const characters = await listPublicCharacters();

  return (
    <AppShell>
      <main className="page">
        <header className="page-header">
          <h1>Characters</h1>
          <p>
            Public and official cards are visible to anonymous users. Creator actions will stay
            locked until authentication and ownership flows are implemented.
          </p>
        </header>
        <section className="grid">
          {characters.map((character) => (
            <article className="card" key={character.id}>
              <div>
                <h2>{character.name}</h2>
                <p>{character.subtitle}</p>
              </div>
              <div className="tag-list">
                <span className="tag">{character.visibility}</span>
                {character.card.metadata.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <p>{character.card.description}</p>
              <div className="button-row">
                <Link className="button" href={`/characters/${character.slug}`}>
                  Open card
                </Link>
                <span className="button secondary" aria-disabled="true">
                  Sign in to fork
                </span>
              </div>
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}

