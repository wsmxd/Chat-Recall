import { AppShell } from "@/components/app-shell";
import { listPublicCharacters } from "@/lib/characters/queries";
import { getSession } from "@/lib/auth/server";
import { listUserCharacters } from "@/lib/characters/mutations";
import { GroupChatSetup } from "@/components/group-chat-setup";

export default async function GroupChatPage() {
  const { user } = await getSession();
  const publicChars = await listPublicCharacters();
  const userChars = user ? await listUserCharacters(user.id) : [];

  const combined = new Map<string, { slug: string; name: string; subtitle?: string }>();
  for (const c of publicChars) combined.set(c.slug, c);
  for (const c of userChars) {
    if (!combined.has(c.slug)) {
      combined.set(c.slug, { slug: c.slug, name: c.name, subtitle: c.subtitle ?? undefined });
    }
  }

  const options = Array.from(combined.values());

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
