import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseThemePack, type ThemePack, type ThemeVisibility } from "@/lib/themes/schema";
import type { Json } from "@/types/database.types";

export interface ThemeRow {
  id: string;
  name: string;
  slug: string;
  visibility: string;
  pack: ThemePack;
  createdAt: string;
}

export async function createTheme(params: {
  ownerId: string;
  slug: string;
  name: string;
  definition: ThemePack;
  visibility?: ThemeVisibility;
}): Promise<ThemeRow | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("themes")
    .insert({
      owner_id: params.ownerId,
      slug: params.slug,
      name: params.name,
      definition: params.definition as Json,
      visibility: params.visibility ?? "private"
    })
    .select()
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    visibility: data.visibility,
    pack: parseThemePack(data.definition),
    createdAt: data.created_at
  };
}

export async function updateTheme(params: {
  id: string;
  ownerId: string;
  slug?: string;
  name?: string;
  definition?: ThemePack;
}): Promise<ThemeRow | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const updates: Record<string, unknown> = {};
  if (params.slug !== undefined) updates.slug = params.slug;
  if (params.name !== undefined) updates.name = params.name;
  if (params.definition !== undefined) updates.definition = params.definition as Json;

  const { data, error } = await supabase
    .from("themes")
    .update(updates as never)
    .eq("id", params.id)
    .eq("owner_id", params.ownerId)
    .select()
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    visibility: data.visibility,
    pack: parseThemePack(data.definition),
    createdAt: data.created_at
  };
}

export async function deleteTheme(id: string, ownerId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("themes")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId);

  return !error;
}

export async function listUserThemes(userId: string): Promise<ThemeRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("themes")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    visibility: row.visibility,
    pack: parseThemePack(row.definition),
    createdAt: row.created_at
  }));
}