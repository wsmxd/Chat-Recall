import { defaultTheme } from "@/config/default-themes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { parseThemePack, type ThemePack } from "@/lib/themes/schema";

export type ThemeSummary = {
  id: string;
  slug: string;
  name: string;
  visibility: string;
  pack: ThemePack;
};

async function listThemesFromSupabase(): Promise<ThemeSummary[] | null> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("themes")
      .select("*")
      .in("visibility", ["public", "official"])
      .order("created_at", { ascending: false });

    if (error || !data) return null;

    return data.map((row) => {
      const pack = parseThemePack(row.definition);
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        visibility: row.visibility,
        pack
      };
    });
  } catch {
    return null;
  }
}

export async function listPublicThemes(): Promise<ThemeSummary[]> {
  const fromSupabase = await listThemesFromSupabase();
  if (fromSupabase && fromSupabase.length > 0) return fromSupabase;
  return [{
    id: "local-moonlit-archive",
    slug: defaultTheme.slug,
    name: defaultTheme.name,
    visibility: "official",
    pack: defaultTheme
  }];
}

export async function getThemeBySlug(slug: string): Promise<ThemeSummary | null> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("themes")
      .select("*")
      .eq("slug", slug)
      .in("visibility", ["public", "official"])
      .maybeSingle();

    if (error || !data) return null;

    const pack = parseThemePack(data.definition);
    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      visibility: data.visibility,
      pack
    };
  } catch {
    return null;
  }
}

export async function seedDefaultTheme(): Promise<string | null> {
  try {
    const admin = createSupabaseAdminClient();

    const { data: existing } = await admin
      .from("themes")
      .select("id")
      .eq("slug", defaultTheme.slug)
      .maybeSingle();

    if (existing) return existing.id;

    const { data, error } = await admin
      .from("themes")
      .insert({
        slug: defaultTheme.slug,
        name: defaultTheme.name,
        visibility: "official",
        definition: defaultTheme
      })
      .select("id")
      .single();

    if (error) return null;
    return data.id;
  } catch {
    return null;
  }
}
