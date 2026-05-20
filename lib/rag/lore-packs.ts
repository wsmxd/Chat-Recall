import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface LorePackSummary {
  id: string;
  name: string;
  description: string | null;
  sourceType: string | null;
  visibility: string;
  documentCount: number;
  createdAt: string;
}

export async function listUserLorePacks(userId: string): Promise<LorePackSummary[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("lore_packs")
    .select("id, name, description, source_type, visibility, created_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const result: LorePackSummary[] = [];
  for (const pack of data) {
    const { count } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("lore_pack_id", pack.id);

    result.push({
      id: pack.id,
      name: pack.name,
      description: pack.description,
      sourceType: pack.source_type,
      visibility: pack.visibility,
      documentCount: count ?? 0,
      createdAt: pack.created_at
    });
  }

  return result;
}

export async function createLorePack(params: {
  userId: string;
  name: string;
  description?: string;
  sourceType?: string;
}): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("lore_packs")
    .insert({
      owner_id: params.userId,
      name: params.name,
      description: params.description ?? null,
      source_type: params.sourceType ?? null,
      visibility: "private"
    })
    .select("id")
    .single();

  if (error || !data) return null;
  return data.id;
}

export async function deleteLorePack(id: string, ownerId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("lore_packs")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId);

  if (error) return false;

  try {
    const admin = createSupabaseAdminClient();
    const { data: files } = await admin.storage.from("lore").list(ownerId);
    if (files?.length) {
      await admin.storage.from("lore").remove(files.map((f) => `${ownerId}/${f.name}`));
    }
  } catch {
    // storage cleanup is best-effort
  }

  return true;
}
