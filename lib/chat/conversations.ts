import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ChatMessage } from "@/lib/chat/prompt-builder";
import type { Json } from "@/types/database.types";

export interface ConversationSummary {
  id: string;
  title: string | null;
  characterName: string;
  characterSlug: string;
  mode: string;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
}

export async function createConversation(params: {
  userId: string;
  characterId?: string;
  title?: string;
}): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      owner_id: params.userId,
      title: params.title ?? null,
      character_ids: params.characterId ? [params.characterId] : [],
      mode: "single_character"
    })
    .select("id")
    .single();

  if (error) return null;
  return data.id;
}

export async function saveMessage(params: {
  conversationId: string;
  role: string;
  characterId?: string | null;
  content: string;
  metadata?: Json;
}): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: params.conversationId,
      role: params.role as "user" | "assistant" | "system",
      character_id: params.characterId ?? null,
      content: params.content,
      metadata: (params.metadata ?? {}) as Json
    })
    .select("id")
    .single();

  if (error) return null;
  return data.id;
}

export async function getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((m) => ({
    id: m.id,
    role: m.role as ChatMessage["role"],
    content: m.content,
    createdAt: m.created_at
  }));
}

export async function listConversations(userId: string): Promise<ConversationSummary[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  const result: ConversationSummary[] = [];

  for (const conv of data) {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conv.id);

    let characterName = "";
    let characterSlug = "";

    if (conv.character_ids.length > 0) {
      const { data: char } = await supabase
        .from("characters")
        .select("name, slug")
        .eq("id", conv.character_ids[0])
        .maybeSingle();
      if (char) {
        characterName = char.name;
        characterSlug = char.slug;
      }
    }

    result.push({
      id: conv.id,
      title: conv.title,
      characterName,
      characterSlug,
      mode: conv.mode,
      messageCount: count ?? 0,
      lastMessageAt: conv.updated_at,
      createdAt: conv.created_at
    });
  }

  return result;
}

export async function getConversation(conversationId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  let characterName = "";
  let characterSlug = "";

  if (data.character_ids.length > 0) {
    const { data: char } = await supabase
      .from("characters")
      .select("name, slug")
      .eq("id", data.character_ids[0])
      .maybeSingle();
    if (char) {
      characterName = char.name;
      characterSlug = char.slug;
    }
  }

  return {
    id: data.id,
    title: data.title,
    characterName,
    characterSlug,
    characterId: data.character_ids[0] ?? null,
    mode: data.mode,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}
