import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { listPublicCharacters } from "@/lib/characters/queries";
import { getSession } from "@/lib/auth/server";
import { listUserCharacters } from "@/lib/characters/mutations";
import { CharacterActions } from "@/components/character-actions";

export default async function CharactersPage() {
  const { user } = await getSession();
  const characters = await listPublicCharacters();
  const userCharacters = user ? await listUserCharacters(user.id) : [];

  return (
    <AppShell>
      <main className="page">
        <header className="page-header">
          <h1>Characters</h1>
          <p>
            Public and official cards are visible to anonymous users. Sign in to create, edit, or
            fork your own characters.
          </p>
        </header>

        {user && (
          <div className="button-row" style={{ marginBottom: "16px" }}>
            <Link className="button" href="/characters/new">
              Create Character
            </Link>
          </div>
        )}

        {userCharacters.length > 0 && (
          <section className="grid">
            <h2>Your Characters</h2>
            {userCharacters.map((character) => (
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
                  <Link className="button secondary" href={`/characters/${character.slug}/edit`}>
                    Edit
                  </Link>
                  <Link className="button" href={`/chat/${character.slug}`}>
                    Start chat
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="grid">
          <h2>Public Characters</h2>
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
                {user ? (
                  <span className="button secondary" data-action="fork" data-slug={character.slug}>
                    Fork
                  </span>
                ) : (
                  <span className="button secondary" aria-disabled="true">
                    Sign in to fork
                  </span>
                )}
              </div>
            </article>
          ))}
        </section>
      </main>
      <CharacterActions />
    </AppShell>
  );
}

