import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseCharacterCard, type CharacterCard, type CharacterVisibility } from "@/lib/characters/schema";

export interface CharacterRow {
  id: string;
  owner_id: string | null;
  visibility: string;
  slug: string;
  name: string;
  subtitle: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  card_version: number;
  schema_version: string;
  definition: Record<string, unknown>;
  theme_id: string | null;
  default_lore_pack_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CharacterWithCard extends Omit<CharacterRow, "definition"> {
  card: CharacterCard;
}

export async function createCharacter(params: {
  ownerId: string;
  slug: string;
  name: string;
  subtitle?: string;
  card: CharacterCard;
  visibility?: CharacterVisibility;
  themeId?: string;
}): Promise<CharacterWithCard | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("characters")
    .insert({
      owner_id: params.ownerId,
      slug: params.slug,
      name: params.name,
      subtitle: params.subtitle ?? null,
      visibility: params.visibility ?? "private",
      definition: params.card,
      theme_id: params.themeId ?? null
    })
    .select()
    .single();

  if (error || !data) return null;

  return {
    ...data,
    card: parseCharacterCard(data.definition),
    definition: undefined
  } as unknown as CharacterWithCard;
}

export async function updateCharacter(params: {
  id: string;
  ownerId: string;
  card?: Partial<CharacterCard>;
  slug?: string;
  name?: string;
  subtitle?: string;
  themeId?: string | null;
  defaultLorePackId?: string | null;
}): Promise<CharacterWithCard | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const updates: Record<string, unknown> = {};
  let cardChanged = false;
  if (params.card) {
    updates.definition = params.card as unknown;
    cardChanged = true;
  }
  if (params.slug !== undefined) updates.slug = params.slug;
  if (params.name !== undefined) updates.name = params.name;
  if (params.subtitle !== undefined) updates.subtitle = params.subtitle;
  if (params.themeId !== undefined) updates.theme_id = params.themeId;
  if (params.defaultLorePackId !== undefined) updates.default_lore_pack_id = params.defaultLorePackId;

  const { data, error } = await supabase
    .from("characters")
    .update(updates as never)
    .eq("id", params.id)
    .eq("owner_id", params.ownerId)
    .select()
    .single();

  if (error || !data) return null;

  if (cardChanged && data.card_version !== undefined) {
    await supabase.from("character_versions").insert({
      character_id: data.id,
      version: (data.card_version ?? 0) + 1,
      definition: data.definition
    });
  }

  return {
    ...data,
    card: parseCharacterCard(data.definition),
    definition: undefined
  } as unknown as CharacterWithCard;
}

export async function deleteCharacter(id: string, ownerId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("characters")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId);

  return !error;
}

export async function getCharacterById(id: string): Promise<CharacterWithCard | null> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      ...data,
      card: parseCharacterCard(data.definition),
      definition: undefined
    } as unknown as CharacterWithCard;
  } catch {
    return null;
  }
}

export async function listUserCharacters(userId: string): Promise<CharacterWithCard[]> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("owner_id", userId)
      .order("updated_at", { ascending: false });

    if (error || !data) return [];

    return data.map((row) => ({
      ...row,
      card: parseCharacterCard(row.definition),
      definition: undefined
    })) as unknown as CharacterWithCard[];
  } catch {
    return [];
  }
}
