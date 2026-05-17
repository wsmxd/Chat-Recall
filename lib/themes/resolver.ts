import { defaultTheme } from "@/config/default-themes";
import { getThemeBySlug, listPublicThemes } from "@/lib/themes/queries";
import { parseThemePackOrNull, type ThemePack, type ThemeTokens } from "@/lib/themes/schema";

export interface ResolvedTheme {
  pack: ThemePack;
  variant: ThemeTokens | null;
  cssVariables: Record<string, string>;
}

function tokensToCssVariables(tokens: ThemeTokens): Record<string, string> {
  const vars: Record<string, string> = {};

  if (tokens.color) {
    for (const [key, value] of Object.entries(tokens.color)) {
      if (value) vars[`--theme-color-${key}`] = value;
    }
  }

  if (tokens.radius) {
    for (const [key, value] of Object.entries(tokens.radius)) {
      if (value) vars[`--theme-radius-${key}`] = value;
    }
  }

  if (tokens.typography) {
    for (const [key, value] of Object.entries(tokens.typography)) {
      if (value) vars[`--theme-font-${key}`] = value;
    }
  }

  return vars;
}

export async function resolveTheme(params: {
  themeSlug?: string;
  variantName?: string;
}): Promise<ResolvedTheme> {
  let pack: ThemePack = defaultTheme;

  if (params.themeSlug) {
    const theme = await getThemeBySlug(params.themeSlug);
    if (theme) {
      pack = theme.pack;
    } else {
      const allThemes = await listPublicThemes();
      const found = allThemes.find((t) => t.slug === params.themeSlug);
      if (found) pack = found.pack;
    }
  }

  let variant: ThemeTokens | null = null;
  if (params.variantName && pack.variants[params.variantName]) {
    variant = parseThemePackOrNull({
      ...pack,
      tokens: pack.variants[params.variantName]
    })?.tokens ?? null;
  }

  const activeTokens = variant ?? pack.tokens;
  const cssVariables = tokensToCssVariables(activeTokens);

  return { pack, variant, cssVariables };
}
