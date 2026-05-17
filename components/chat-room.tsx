"use client";

import { useRef, useState, useCallback, useEffect, startTransition } from "react";
import Link from "next/link";
import type { CharacterSummary } from "@/lib/characters/schema";
import { streamChat } from "@/lib/chat/client";
import { buildGreetingMessage, type ChatMessage } from "@/lib/chat/prompt-builder";
import { useAuth } from "@/components/auth-provider";

function createId() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

function loadMessages(slug: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(`chat-${slug}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveMessages(slug: string, messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`chat-${slug}`, JSON.stringify(messages.slice(-100)));
  } catch {
    // storage full or unavailable
  }
}

const GREETING_ID = "__greeting__";

function makeGreeting(character: CharacterSummary): ChatMessage {
  return {
    id: GREETING_ID,
    role: "assistant",
    content: buildGreetingMessage(character),
    createdAt: ""
  };
}

export function ChatRoom({
  character,
  initialConversationId,
  initialMessages
}: {
  character: CharacterSummary;
  initialConversationId?: string;
  initialMessages?: ChatMessage[];
}) {
  const { user } = useAuth();
  const loadedRef = useRef(false);
  const [hydrated, setHydrated] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => initialMessages ?? [makeGreeting(character)]
  );
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );

  useEffect(() => {
    if (initialMessages) {
      loadedRef.current = true;
      startTransition(() => setHydrated(true));
      return;
    }
    const saved = loadMessages(character.slug);
    loadedRef.current = true;
    startTransition(() => {
      setHydrated(true);
      if (saved.length > 0) {
        setMessages(saved);
      }
    });
  }, [character.slug, initialMessages]);

  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const assistantMsgRef = useRef<string>("");

  useEffect(() => {
    if (hydrated) {
      saveMessages(character.slug, messages);
    }
  }, [messages, character.slug, hydrated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || streaming) return;

      setError(null);
      setInput("");

      const userMsg: ChatMessage = {
        id: createId(),
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString()
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);

      setStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;
      assistantMsgRef.current = "";

      await streamChat({
        characterSlug: character.slug,
        messages: updatedMessages,
        conversationId,
        onToken: (token) => {
          assistantMsgRef.current += token;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && last.id === "streaming") {
              return [
                ...prev.slice(0, -1),
                { ...last, content: assistantMsgRef.current }
              ];
            }
            return [
              ...prev,
              {
                id: "streaming",
                role: "assistant",
                content: token,
                createdAt: new Date().toISOString()
              }
            ];
          });
        },
        onError: (err) => {
          setError(err);
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && last.id === "streaming") {
              return prev.slice(0, -1);
            }
            return prev;
          });
        },
        onDone: (result) => {
          if (result.conversationId) {
            setConversationId(result.conversationId);
          }
          setMessages((prev) =>
            prev.map((m) =>
              m.id === "streaming"
                ? { ...m, id: createId(), createdAt: new Date().toISOString() }
                : m
            )
          );
        },
        signal: controller.signal
      });

      abortRef.current = null;
      setStreaming(false);
      inputRef.current?.focus();
    },
    [input, messages, streaming, character.slug, conversationId]
  );

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant" && last.id === "streaming") {
        return prev.slice(0, -1);
      }
      return prev;
    });
  }, []);

  const handleClear = useCallback(() => {
    if (streaming) return;
    setConversationId(undefined);
    setMessages([
      {
        id: createId(),
        role: "assistant" as const,
        content: buildGreetingMessage(character),
        createdAt: new Date().toISOString()
      }
    ]);
    setError(null);
  }, [streaming, character]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  return (
    <div className="chat-room">
      <header className="chat-room-header">
        <h2>{character.name}</h2>
        {character.subtitle && <p>{character.subtitle}</p>}
        {user && conversationId && (
          <p className="chat-persisted">Saved — <Link href="/conversations">view all</Link></p>
        )}
      </header>

      <div className="chat-messages" role="log" aria-live="polite">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${msg.role}`}
            data-streaming={msg.id === "streaming" ? true : undefined}
          >
            <div className="chat-message-role">
              {msg.role === "user" ? "You" : character.name}
            </div>
            <div className="chat-message-content">{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="chat-error" role="alert">
          {error}
        </div>
      )}

      <form className="chat-input-bar" onSubmit={handleSubmit}>
        <div className="chat-input-row">
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder={`Message ${character.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={streaming}
          />
          {streaming ? (
            <button type="button" className="chat-btn cancel" onClick={handleCancel}>
              Stop
            </button>
          ) : (
            <button type="submit" className="chat-btn send" disabled={!input.trim()}>
              Send
            </button>
          )}
        </div>
        <div className="chat-input-actions">
          <button
            type="button"
            className="chat-btn-clear"
            onClick={handleClear}
            disabled={streaming}
          >
            Clear chat
          </button>
        </div>
      </form>
    </div>
  );
}
