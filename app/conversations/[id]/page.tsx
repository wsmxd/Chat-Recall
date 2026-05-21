import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { getConversation, getConversationMessages } from "@/lib/chat/conversations";
import { getCharacterBySlug } from "@/lib/characters/queries";
import { ChatRoom } from "@/components/chat-room";
import { AuthStatus } from "@/components/auth-status";
import { ThemeStyle } from "@/components/theme-style";
import { resolveEffectiveTheme } from "@/lib/themes/resolve-effective";
import { ErrorBoundary } from "@/components/error-boundary";
import { defaultCharacters } from "@/config/default-characters";

type ConversationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { user } = await getSession();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const conversation = await getConversation(id, user.id);
  if (!conversation) notFound();

  const fallbackCharacter = defaultCharacters.find(
    (candidate) => candidate.name === conversation.characterName || candidate.name === conversation.title
  );
  const character = conversation.characterSlug
    ? await getCharacterBySlug(conversation.characterSlug, user.id)
    : fallbackCharacter ?? null;

  if (!character) notFound();

  const messages = await getConversationMessages(id);
  const groupCharacters = (
    await Promise.all(conversation.characterSlugs.map((slug) => getCharacterBySlug(slug, user.id)))
  ).filter((c): c is NonNullable<typeof c> => c !== null);

  const themeId = character.card.theme?.defaultThemeId;
  const variantName = character.card.theme?.moodVariants?.[0];

  const effectiveTheme = await resolveEffectiveTheme({
    conversationThemeId: conversation.activeThemeId,
    characterThemeId: themeId,
    characterVariant: variantName,
    userId: user.id
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
          <Link href="/themes">Themes</Link>
          <Link href="/knowledge">Knowledge</Link>
          <Link href="/settings">Settings</Link>
          <Link href="/conversations">Conversations</Link>
        </nav>
        <AuthStatus />
      </aside>
      <div className="app-content">
        <ErrorBoundary>
          <ChatRoom
            character={character}
            initialConversationId={id}
            initialMessages={messages}
            groupCharacters={groupCharacters.length > 0 ? groupCharacters : undefined}
            mode={conversation.mode}
            sceneParams={conversation.sceneParams}
            characterName={conversation.mode !== "single" ? conversation.characterNames.join(", ") : undefined}
            moodVariants={character.card.theme?.moodVariants}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}
