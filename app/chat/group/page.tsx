import { AppShell } from "@/components/app-shell";
import { listPublicCharacters } from "@/lib/characters/queries";
import { GroupChatSetup } from "@/components/group-chat-setup";

export default async function GroupChatPage() {
  const characters = await listPublicCharacters();

  const options = characters.map((c) => ({
    slug: c.slug,
    name: c.name,
    subtitle: c.subtitle
  }));

  return (
    <AppShell>
      <main className="page">
        <header className="page-header">
          <h1>Group Chat</h1>
          <p>
            Select multiple characters for a group conversation, or set up a scene
            with scene director mode for immersive narration.
          </p>
        </header>
        <GroupChatSetup characters={options} />
      </main>
    </AppShell>
  );
}
