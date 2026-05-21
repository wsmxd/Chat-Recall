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
    const colorMap: Record<string, string> = {
      background: "--background",
      surface: "--surface",
      surfaceAlt: "--surface-raised",
      text: "--text",
      muted: "--muted",
      accent: "--accent",
      border: "--border"
    };
    for (const [key, value] of Object.entries(tokens.color)) {
      const varName = colorMap[key] ?? `--theme-color-${key}`;
      if (value) vars[varName] = value;
    }
  }

  if (tokens.radius) {
    for (const [key, value] of Object.entries(tokens.radius)) {
      if (value) vars[`--radius-${key}`] = value;
    }
  }

  if (tokens.typography) {
    for (const [key, value] of Object.entries(tokens.typography)) {
      if (value) vars[`--font-${key}`] = value;
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
