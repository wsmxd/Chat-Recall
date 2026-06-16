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
          <p>Define the character identity, voice, and opening scene. Advanced settings can be adjusted later.</p>
        </header>
        <CharacterEditor mode="create" />
      </main>
    </AppShell>
  );
}
