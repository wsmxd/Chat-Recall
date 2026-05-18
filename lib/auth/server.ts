import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

async function getClient(supabase?: SupabaseClient<Database>) {
  if (supabase) return supabase;
  return createSupabaseServerClient();
}

export async function getSession() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { user: null };
  const { data } = await supabase.auth.getUser();
  return { user: data.user ?? null };
}

export async function getProfile(userId: string, supabase?: SupabaseClient<Database>) {
  const client = await getClient(supabase);
  if (!client) return null;
  const { data } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

export async function ensureProfile(userId: string, supabase?: SupabaseClient<Database>) {
  const client = await getClient(supabase);
  if (!client) return null;

  const existing = await getProfile(userId, client);
  if (existing) return existing;

  const { data, error } = await client
    .from("profiles")
    .insert({ id: userId })
    .select()
    .single();

  if (error) {
    return getProfile(userId, client);
  }

  return data;
}
