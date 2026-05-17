import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { getConversation, getConversationMessages } from "@/lib/chat/conversations";
import { getPublicCharacterBySlug } from "@/lib/characters/queries";
import { ChatRoom } from "@/components/chat-room";
import { AuthStatus } from "@/components/auth-status";

type ConversationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { user } = await getSession();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const conversation = await getConversation(id, user.id);
  if (!conversation) notFound();

  const character = conversation.characterSlug
    ? await getPublicCharacterBySlug(conversation.characterSlug)
    : null;

  if (!character) notFound();

  const messages = await getConversationMessages(id);

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
          <Link href="/knowledge">Knowledge</Link>
          <Link href="/settings">Settings</Link>
          <Link href="/conversations">Conversations</Link>
        </nav>
        <AuthStatus />
      </aside>
      <div className="app-content">
        <ChatRoom
          character={character}
          initialConversationId={id}
          initialMessages={messages}
        />
      </div>
    </div>
  );
}
