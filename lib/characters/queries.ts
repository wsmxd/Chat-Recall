import { defaultCharacters } from "@/config/default-characters";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseCharacterCard, type CharacterSummary, type CharacterVisibility } from "@/lib/characters/schema";

async function listCharactersFromSupabase(visibilityFilter?: CharacterVisibility[], ownerId?: string): Promise<CharacterSummary[] | null> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    let query = supabase
      .from("characters")
      .select("*")
      .order("created_at", { ascending: false });

    if (visibilityFilter) {
      query = query.in("visibility", visibilityFilter);
    }
    if (ownerId) {
      query = query.eq("owner_id", ownerId);
    }

    const { data, error } = await query;
    if (error || !data) return null;

    return data.map((row) => {
      const card = parseCharacterCard(row.definition);
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        subtitle: row.subtitle ?? undefined,
        visibility: row.visibility as CharacterVisibility,
        card,
        avatarUrl: row.avatar_url ?? null,
        coverUrl: row.cover_url ?? null
      };
    });
  } catch {
    return null;
  }
}

async function getCharacterFromSupabase(slug: string, visibilityFilter?: CharacterVisibility[]): Promise<CharacterSummary | null> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    let query = supabase
      .from("characters")
      .select("*")
      .eq("slug", slug);

    if (visibilityFilter) {
      query = query.in("visibility", visibilityFilter);
    }

    const { data, error } = await query.maybeSingle();
    if (error || !data) return null;

    const card = parseCharacterCard(data.definition);
    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      subtitle: data.subtitle ?? undefined,
      visibility: data.visibility as CharacterVisibility,
      card,
      avatarUrl: data.avatar_url ?? null,
      coverUrl: data.cover_url ?? null
    };
  } catch {
    return null;
  }
}

export async function listPublicCharacters() {
  const fromSupabase = await listCharactersFromSupabase(["public", "official"]);
  if (fromSupabase && fromSupabase.length > 0) return fromSupabase;
  return defaultCharacters;
}

export async function getPublicCharacterBySlug(slug: string) {
  const fromSupabase = await getCharacterFromSupabase(slug, ["public", "official"]);
  if (fromSupabase) return fromSupabase;
  return defaultCharacters.find((character) => character.slug === slug) ?? null;
}

export async function getCharacterBySlug(slug: string, userId?: string) {
  if (userId) {
    const fromSupabase = await getCharacterFromSupabase(slug);
    if (fromSupabase) {
      return fromSupabase;
    }
  }
  return getPublicCharacterBySlug(slug);
}

export async function getSupabaseCharacterIdBySlug(slug: string): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const { data } = await supabase
      .from("characters")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    return data?.id ?? null;
  } catch {
    return null;
  }
}

