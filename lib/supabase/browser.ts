"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnvOrNull } from "@/lib/env";
import type { Database } from "@/types/database.types";

export function createSupabaseBrowserClient() {
  const env = getPublicEnvOrNull();
  if (!env) return null;

  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

