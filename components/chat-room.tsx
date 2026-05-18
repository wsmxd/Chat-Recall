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

function loadMessages(key: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(`chat-${key}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveMessages(key: string, messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`chat-${key}`, JSON.stringify(messages.slice(-100)));
  } catch {
    // storage full or unavailable
  }
}

function loadConversationId(key: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(`chat-conversation-${key}`) ?? undefined;
}

function saveConversationId(key: string, conversationId: string | undefined) {
  if (typeof window === "undefined") return;
  if (conversationId) {
    localStorage.setItem(`chat-conversation-${key}`, conversationId);
  } else {
    localStorage.removeItem(`chat-conversation-${key}`);
  }
}

const GREETING_ID = "__greeting__";

function buildConversationKey(params: {
  character: CharacterSummary;
  groupCharacters?: CharacterSummary[];
  mode: "single" | "group" | "scene";
  sceneParams?: { location?: string; mood?: string; time?: string; description?: string };
}) {
  const slugs = params.mode === "single"
    ? [params.character.slug]
    : (params.groupCharacters?.map((c) => c.slug) ?? [params.character.slug]);
  const sceneKey = params.mode === "scene" ? JSON.stringify(params.sceneParams ?? {}) : "";
  return [params.mode, ...slugs, sceneKey].filter(Boolean).join(":");
}

function makeGreeting(
  character: CharacterSummary,
  mode: "single" | "group" | "scene",
  groupCharacters?: CharacterSummary[],
  sceneParams?: { location?: string; mood?: string; time?: string; description?: string }
): ChatMessage {
  const names = groupCharacters?.map((c) => c.name).join(", ");
  const sceneDetails = [sceneParams?.location, sceneParams?.time, sceneParams?.mood].filter(Boolean).join(" - ");
  return {
    id: GREETING_ID,
    role: "assistant",
    content: mode === "single"
      ? buildGreetingMessage(character)
      : mode === "scene"
        ? `Scene ready${sceneDetails ? `: ${sceneDetails}` : ""}. Characters present: ${names || character.name}.`
        : `Group chat started with ${names || character.name}.`,
    createdAt: ""
  };
}

export function ChatRoom({
  character,
  initialConversationId,
  initialMessages,
  groupCharacters,
  mode = "single",
  sceneParams,
  characterName
}: {
  character: CharacterSummary;
  initialConversationId?: string;
  initialMessages?: ChatMessage[];
  groupCharacters?: CharacterSummary[];
  mode?: "single" | "group" | "scene";
  sceneParams?: { location?: string; mood?: string; time?: string; description?: string };
  characterName?: string;
}) {
  const { user } = useAuth();
  const conversationKey = buildConversationKey({ character, groupCharacters, mode, sceneParams });
  const loadedRef = useRef(false);
  const [hydrated, setHydrated] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => initialMessages ?? [makeGreeting(character, mode, groupCharacters, sceneParams)]
  );
  const [conversationId, setConversationId] = useState<string | undefined>(
    () => initialConversationId ?? loadConversationId(conversationKey)
  );

  useEffect(() => {
    if (initialMessages) {
      loadedRef.current = true;
      startTransition(() => setHydrated(true));
      return;
    }
    const saved = loadMessages(conversationKey);
    loadedRef.current = true;
    startTransition(() => {
      setHydrated(true);
      if (saved.length > 0) {
        setMessages(saved);
      }
    });
  }, [conversationKey, initialMessages]);

  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const assistantMsgRef = useRef<string>("");
  const reasoningRef = useRef<string>("");
  const [reasoningMsgs, setReasoningMsgs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (hydrated) {
      saveMessages(conversationKey, messages);
    }
  }, [messages, conversationKey, hydrated]);

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
      reasoningRef.current = "";
      const streamMsgId = "streaming";

      await streamChat({
        characterSlug: character.slug,
        messages: updatedMessages,
        conversationId,
        mode,
        characterSlugs: groupCharacters?.map((c) => c.slug),
        sceneParams,
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
        onReasoning: (token) => {
          reasoningRef.current += token;
          setReasoningMsgs((prev) => ({ ...prev, [streamMsgId]: reasoningRef.current }));
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
            saveConversationId(conversationKey, result.conversationId);
          }
          const finalMessageId = createId();
          setReasoningMsgs((prev) => ({ ...prev, [streamMsgId]: reasoningRef.current }));
          reasoningRef.current = "";
          setReasoningMsgs((prev) => {
            const next = { ...prev };
            if (next[streamMsgId]) {
              next[finalMessageId] = next[streamMsgId];
              delete next[streamMsgId];
            }
            return next;
          });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === "streaming"
                ? { ...m, id: finalMessageId, createdAt: new Date().toISOString() }
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
    [input, messages, streaming, character.slug, conversationId, groupCharacters, mode, sceneParams, conversationKey]
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
    saveConversationId(conversationKey, undefined);
    setMessages([
      { ...makeGreeting(character, mode, groupCharacters, sceneParams), id: createId(), createdAt: new Date().toISOString() }
    ]);
    setError(null);
  }, [streaming, character, mode, groupCharacters, sceneParams, conversationKey]);

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
        <h2>{characterName || character.name}</h2>
        {mode !== "single" && (
          <p>
            <span className="tag">{mode === "scene" ? "Scene Director" : "Group Chat"}</span>
          </p>
        )}
        {!characterName && character.subtitle && <p>{character.subtitle}</p>}
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
              {msg.role === "user" ? "You" : mode === "scene" ? "Scene Director" : mode === "group" ? "Narrator" : character.name}
            </div>
            {reasoningMsgs[msg.id] && (
              <details className="chat-reasoning">
                <summary>Thinking</summary>
                <div className="chat-reasoning-content">{reasoningMsgs[msg.id]}</div>
              </details>
            )}
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
            placeholder={mode === "scene" ? "Describe your action..." : mode === "group" ? "Message the group..." : `Message ${character.name}...`}
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
