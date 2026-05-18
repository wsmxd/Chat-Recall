import { resolveTheme } from "@/lib/themes/resolver";
import type { ThemeTokens } from "@/lib/themes/schema";

interface ThemeStyleProps {
  themeSlug?: string;
  variantName?: string;
}

function tokensToCss(tokens: ThemeTokens): string {
  const lines: string[] = [];

  if (tokens.color) {
    for (const [key, value] of Object.entries(tokens.color)) {
      if (value) lines.push(`  --theme-color-${key}: ${value};`);
    }
  }
  if (tokens.radius) {
    for (const [key, value] of Object.entries(tokens.radius)) {
      if (value) lines.push(`  --theme-radius-${key}: ${value};`);
    }
  }
  if (tokens.typography) {
    for (const [key, value] of Object.entries(tokens.typography)) {
      if (value) lines.push(`  --theme-font-${key}: ${value};`);
    }
  }

  return lines.join("\n");
}

export async function ThemeStyle({ themeSlug, variantName }: ThemeStyleProps) {
  const { pack, variant } = await resolveTheme({ themeSlug, variantName });

  const activeTokens = variant ?? pack.tokens;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root {\n${tokensToCss(activeTokens)}\n}`
      }}
    />
  );
}
