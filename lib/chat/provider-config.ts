import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export interface ProviderConfig {
  id: string;
  ownerId: string | null;
  provider: string;
  model: string;
  settings: Record<string, unknown>;
  isDefault: boolean;
}

export async function getUserDefaultProvider(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ProviderConfig | null> {
  const { data, error } = await supabase
    .from("provider_configs")
    .select("*")
    .eq("owner_id", userId)
    .eq("is_default", true)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getUserDefaultProvider error:", error);
    return null;
  }

  return {
    id: data.id,
    ownerId: data.owner_id,
    provider: data.provider,
    model: data.model,
    settings: data.settings as Record<string, unknown>,
    isDefault: data.is_default
  };
}

export async function setDefaultProvider(
  supabase: SupabaseClient<Database>,
  userId: string,
  provider: string,
  model: string,
  settings?: Record<string, unknown>
): Promise<ProviderConfig | null> {
  await supabase
    .from("provider_configs")
    .update({ is_default: false })
    .eq("owner_id", userId)
    .eq("is_default", true);

  const { data, error } = await supabase
    .from("provider_configs")
    .insert({
      owner_id: userId,
      provider,
      model,
      settings: (settings ?? {}) as never,
      is_default: true
    })
    .select()
    .single();

  if (error || !data) {
    console.error("setDefaultProvider insert error:", error);
    return null;
  }

  return {
    id: data.id,
    ownerId: data.owner_id,
    provider: data.provider,
    model: data.model,
    settings: data.settings as Record<string, unknown>,
    isDefault: data.is_default
  };
}
