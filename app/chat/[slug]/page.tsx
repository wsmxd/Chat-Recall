import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicCharacterBySlug } from "@/lib/characters/queries";
import { ChatRoom } from "@/components/chat-room";
import { ThemeStyle } from "@/components/theme-style";

type ChatPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ChatPage({ params }: ChatPageProps) {
  const { slug } = await params;
  const character = await getPublicCharacterBySlug(slug);

  if (!character) {
    notFound();
  }

  const themeId = character.card.theme?.defaultThemeId;

  return (
    <div className="app-shell">
      {themeId && <ThemeStyle themeSlug={themeId} />}
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
          <Link href="/knowledge">Knowledge</Link>
          <Link href="/settings">Settings</Link>
        </nav>
      </aside>
      <div className="app-content">
        <ChatRoom character={character} />
      </div>
    </div>
  );
}
