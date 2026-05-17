import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSession } from "@/lib/auth/server";
import { CharacterEditor } from "@/components/character-editor";
import { getPublicCharacterBySlug } from "@/lib/characters/queries";
import { listUserCharacters } from "@/lib/characters/mutations";

type EditCharacterPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditCharacterPage({ params }: EditCharacterPageProps) {
  const { slug } = await params;
  const { user } = await getSession();
  if (!user) redirect("/auth/login");

  const userCharacters = await listUserCharacters(user.id);
  const character = userCharacters.find((c) => c.slug === slug);

  if (!character) {
    const publicCharacter = await getPublicCharacterBySlug(slug);
    if (publicCharacter) {
      redirect(`/characters/${slug}`);
    }
    notFound();
  }

  return (
    <AppShell>
      <main className="page">
        <header className="page-header">
          <h1>Edit Character</h1>
          <p>Modify the character card for {character.name}.</p>
        </header>
        <CharacterEditor
          mode="edit"
          initialData={{
            id: character.id,
            slug: character.slug,
            name: character.name,
            subtitle: character.subtitle ?? undefined,
            card: character.card
          }}
        />
      </main>
    </AppShell>
  );
}
