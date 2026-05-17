import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type MemoryType = Database["public"]["Enums"]["memory_type"];

export interface MemoryEntry {
  id: string;
  ownerId: string;
  conversationId: string | null;
  characterId: string | null;
  type: MemoryType;
  content: string;
  confidence: number;
  pinned: boolean;
  sourceMessageIds: string[];
  createdAt: string;
  updatedAt: string;
}

function toMemoryEntry(row: Database["public"]["Tables"]["memories"]["Row"]): MemoryEntry {
  return {
    id: row.id,
    ownerId: row.owner_id,
    conversationId: row.conversation_id,
    characterId: row.character_id,
    type: row.type,
    content: row.content,
    confidence: row.confidence,
    pinned: row.pinned,
    sourceMessageIds: row.source_message_ids,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listMemories(params: {
  userId: string;
  conversationId?: string;
  characterId?: string;
  types?: MemoryType[];
}): Promise<MemoryEntry[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("memories")
    .select("*")
    .eq("owner_id", params.userId)
    .order("created_at", { ascending: false });

  if (params.conversationId) {
    query = query.eq("conversation_id", params.conversationId);
  }
  if (params.characterId) {
    query = query.eq("character_id", params.characterId);
  }
  if (params.types && params.types.length > 0) {
    query = query.in("type", params.types);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(toMemoryEntry);
}

export async function createMemory(params: {
  userId: string;
  conversationId?: string;
  characterId?: string;
  type: MemoryType;
  content: string;
  confidence?: number;
  pinned?: boolean;
  sourceMessageIds?: string[];
}): Promise<MemoryEntry | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("memories")
    .insert({
      owner_id: params.userId,
      conversation_id: params.conversationId ?? null,
      character_id: params.characterId ?? null,
      type: params.type,
      content: params.content,
      confidence: params.confidence ?? 0.5,
      pinned: params.pinned ?? false,
      source_message_ids: params.sourceMessageIds ?? []
    })
    .select()
    .single();

  if (error || !data) return null;
  return toMemoryEntry(data);
}

export async function updateMemory(params: {
  id: string;
  userId: string;
  content?: string;
  confidence?: number;
  pinned?: boolean;
  type?: MemoryType;
}): Promise<MemoryEntry | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const updates: Record<string, unknown> = {};
  if (params.content !== undefined) updates.content = params.content;
  if (params.confidence !== undefined) updates.confidence = params.confidence;
  if (params.pinned !== undefined) updates.pinned = params.pinned;
  if (params.type !== undefined) updates.type = params.type;

  const { data, error } = await supabase
    .from("memories")
    .update(updates as never)
    .eq("id", params.id)
    .eq("owner_id", params.userId)
    .select()
    .single();

  if (error || !data) return null;
  return toMemoryEntry(data);
}

export async function deleteMemory(id: string, userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("memories")
    .delete()
    .eq("id", id)
    .eq("owner_id", userId);

  return !error;
}

export async function getPinnedFacts(params: {
  userId: string;
  characterId?: string;
}): Promise<MemoryEntry[]> {
  return listMemories({
    userId: params.userId,
    characterId: params.characterId,
    types: ["fact", "relationship", "preference"]
  }).then((memories) => memories.filter((m) => m.pinned));
}
