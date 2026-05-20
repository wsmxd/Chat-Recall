import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacterBySlug } from "@/lib/characters/queries";
import { getSession } from "@/lib/auth/server";
import { ChatRoom } from "@/components/chat-room";

type GroupChatPageProps = {
  params: Promise<{ slugs: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function GroupChatRoomPage({ params, searchParams }: GroupChatPageProps) {
  const { slugs } = await params;
  const sp = await searchParams;
  const { user } = await getSession();
  const slugList = slugs.split(",").filter(Boolean);

  if (slugList.length === 0) {
    notFound();
  }

  const characters = (await Promise.all(slugList.map((s) => getCharacterBySlug(s, user?.id))))
    .filter((c) => c !== null);

  if (characters.length !== slugList.length) {
    notFound();
  }

  const mode = (sp.mode === "scene" ? "scene" : "group") as "group" | "scene";
  if (mode === "group" && characters.length < 2) {
    notFound();
  }
  const sceneParams = mode === "scene" ? {
    location: sp.location,
    mood: sp.mood,
    time: sp.time,
    description: sp.description
  } : undefined;

  // Use the first character's greeting as a starting point
  const primaryCharacter = characters[0];
  const characterName = characters.map((c) => c!.name).join(", ");

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <Link className="brand" href="/">
          <span className="brand-mark">CR</span>
          <span>
            <strong>Chat Recall</strong>
            <small>Roleplay engine</small>
          </span>
        </Link>
        <nav className="nav-list">
          <Link href="/">Overview</Link>
          <Link href="/characters">Characters</Link>
          <Link href="/chat/group">Group Chat</Link>
          <Link href="/knowledge">Knowledge</Link>
          <Link href="/settings">Settings</Link>
        </nav>
      </aside>
      <div className="app-content">
        <ChatRoom
          character={primaryCharacter}
          groupCharacters={characters as NonNullable<typeof primaryCharacter>[]}
          mode={mode}
          sceneParams={sceneParams}
          characterName={characterName}
        />
      </div>
    </div>
  );
}
