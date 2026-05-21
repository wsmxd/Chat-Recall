import { createSupabaseServerClient } from "@/lib/supabase/server";

interface ThemeResolutionParams {
  conversationThemeId?: string | null;
  characterThemeId?: string;
  characterVariant?: string;
  userId?: string;
}

interface ThemeResolutionResult {
  themeSlug?: string;
  variantName?: string;
}

export async function resolveEffectiveTheme(params: ThemeResolutionParams): Promise<ThemeResolutionResult> {
  // 1. Conversation-level override
  if (params.conversationThemeId) {
    return { themeSlug: params.conversationThemeId, variantName: params.characterVariant };
  }

  // 2. Scene mood variant — use character theme with variant
  if (params.characterThemeId) {
    return { themeSlug: params.characterThemeId, variantName: params.characterVariant };
  }

  // 3. User global default theme
  if (params.userId) {
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        const { data } = await supabase
          .from("profiles")
          .select("settings")
          .eq("id", params.userId)
          .maybeSingle();

        const settings = (data?.settings as Record<string, unknown>) ?? {};
        if (settings.defaultThemeId) {
          return { themeSlug: settings.defaultThemeId as string };
        }
      }
    } catch {
      // fall through
    }
  }

  // 4. System default — no theme, use globals.css :root values
  return {};
}