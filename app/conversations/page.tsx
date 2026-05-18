import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSession } from "@/lib/auth/server";
import { listConversations } from "@/lib/chat/conversations";
import { DeleteConversationButton } from "@/components/delete-conversation-button";

export default async function ConversationsPage() {
  const { user } = await getSession();
  if (!user) redirect("/auth/login");

  const conversations = await listConversations(user.id);

  return (
    <AppShell>
      <main className="page">
        <header className="page-header">
          <h1>Conversations</h1>
          <p>Your saved chat sessions. Each conversation is tied to a character.</p>
        </header>
        {conversations.length === 0 ? (
          <div className="card">
            <p>No conversations yet. Browse <Link href="/characters">characters</Link> to start chatting.</p>
          </div>
        ) : (
          <section className="grid">
            {conversations.map((conv) => (
              <div key={conv.id} className="card conv-card">
                <Link href={`/conversations/${conv.id}`}>
                  <div>
                    <h2>{conv.characterName || conv.title || "Untitled"}</h2>
                    {conv.characterSlug && (
                      <p>Character: {conv.characterSlug}</p>
                    )}
                  </div>
                  <div className="conv-meta">
                    <span>{conv.messageCount} messages</span>
                    <span>{new Date(conv.lastMessageAt).toLocaleDateString()}</span>
                  </div>
                </Link>
                <div style={{ marginTop: "8px" }}>
                  <DeleteConversationButton id={conv.id} />
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </AppShell>
  );
}
