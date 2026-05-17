import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getSession() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { user: null };
  const { data } = await supabase.auth.getSession();
  return { user: data.session?.user ?? null };
}

export async function getProfile(userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

export async function ensureProfile(userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const existing = await getProfile(userId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("profiles")
    .insert({ id: userId })
    .select()
    .single();

  if (error) {
    // Profile might have been created by concurrent request
    return getProfile(userId);
  }

  return data;
}
