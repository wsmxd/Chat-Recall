import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSession } from "@/lib/auth/server";
import { CharacterEditor } from "@/components/character-editor";

export default async function NewCharacterPage() {
  const { user } = await getSession();
  if (!user) redirect("/auth/login");

  return (
    <AppShell>
      <main className="page">
        <header className="page-header">
          <h1>Create Character</h1>
          <p>Define a new character card. Fill in the persona, roleplay settings, and metadata.</p>
        </header>
        <CharacterEditor mode="create" />
      </main>
    </AppShell>
  );
}
