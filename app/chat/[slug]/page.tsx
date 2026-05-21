import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacterBySlug } from "@/lib/characters/queries";
import { getSession } from "@/lib/auth/server";
import { resolveEffectiveTheme } from "@/lib/themes/resolve-effective";
import { ChatRoom } from "@/components/chat-room";
import { ThemeStyle } from "@/components/theme-style";
import { ErrorBoundary } from "@/components/error-boundary";

type ChatPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ChatPage({ params }: ChatPageProps) {
  const { slug } = await params;
  const { user } = await getSession();
  const character = await getCharacterBySlug(slug, user?.id);

  if (!character) {
    notFound();
  }

  const themeId = character.card.theme?.defaultThemeId;
  const variantName = character.card.theme?.moodVariants?.[0];

  const effectiveTheme = await resolveEffectiveTheme({
    characterThemeId: themeId,
    characterVariant: variantName,
    userId: user?.id
  });

  return (
    <div className="app-shell">
      {effectiveTheme.themeSlug && (
        <ThemeStyle themeSlug={effectiveTheme.themeSlug} variantName={effectiveTheme.variantName} />
      )}
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
          <Link href="/conversations">Conversations</Link>
          <Link href="/knowledge">Knowledge</Link>
          <Link href="/settings">Settings</Link>
        </nav>
      </aside>
      <div className="app-content">
        <ErrorBoundary>
          <ChatRoom character={character} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
