import { defaultCharacters } from "@/config/default-characters";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseCharacterCard, type CharacterSummary } from "@/lib/characters/schema";

async function listCharactersFromSupabase(): Promise<CharacterSummary[] | null> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .in("visibility", ["public", "official"])
      .order("created_at", { ascending: false });

    if (error || !data) return null;

    return data.map((row) => {
      const card = parseCharacterCard(row.definition);
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        subtitle: row.subtitle ?? undefined,
        visibility: row.visibility as CharacterSummary["visibility"],
        card
      };
    });
  } catch {
    return null;
  }
}

async function getCharacterFromSupabase(slug: string): Promise<CharacterSummary | null> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("slug", slug)
      .in("visibility", ["public", "official"])
      .maybeSingle();

    if (error || !data) return null;

    const card = parseCharacterCard(data.definition);
    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      subtitle: data.subtitle ?? undefined,
      visibility: data.visibility as CharacterSummary["visibility"],
      card
    };
  } catch {
    return null;
  }
}

export async function listPublicCharacters() {
  const fromSupabase = await listCharactersFromSupabase();
  if (fromSupabase && fromSupabase.length > 0) return fromSupabase;
  return defaultCharacters;
}

export async function getPublicCharacterBySlug(slug: string) {
  const fromSupabase = await getCharacterFromSupabase(slug);
  if (fromSupabase) return fromSupabase;
  return defaultCharacters.find((character) => character.slug === slug) ?? null;
}

