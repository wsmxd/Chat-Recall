import { z } from "zod";

export const themeVisibilitySchema = z.enum(["private", "unlisted", "public", "official"]);

export const themeTokensSchema = z.object({
  color: z.object({
    background: z.string().optional(),
    surface: z.string().optional(),
    surfaceAlt: z.string().optional(),
    text: z.string().optional(),
    muted: z.string().optional(),
    accent: z.string().optional(),
    border: z.string().optional()
  }).default({}),
  radius: z.object({
    sm: z.string().optional(),
    md: z.string().optional(),
    lg: z.string().optional()
  }).default({}),
  typography: z.object({
    display: z.string().optional(),
    body: z.string().optional()
  }).default({})
});

export type ThemeTokensInput = z.input<typeof themeTokensSchema>;

export const themeChatSchema = z.object({
  bubbleStyle: z.string().default("soft_panel"),
  avatarFrame: z.string().optional(),
  messageDensity: z.enum(["compact", "comfortable", "spacious"]).default("comfortable")
});

export const themeAssetsSchema = z.object({
  background: z.string().optional().nullable().default(null),
  ambient: z.string().optional().nullable().default(null)
});

export const themePackSchema = z.object({
  schemaVersion: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  tokens: themeTokensSchema,
  chat: themeChatSchema,
  assets: themeAssetsSchema,
  variants: z.record(z.string(), z.object({
    color: z.object({
      background: z.string().optional(),
      surface: z.string().optional(),
      surfaceAlt: z.string().optional(),
      text: z.string().optional(),
      muted: z.string().optional(),
      accent: z.string().optional(),
      border: z.string().optional()
    }).default({}),
    radius: z.object({
      sm: z.string().optional(),
      md: z.string().optional(),
      lg: z.string().optional()
    }).default({}),
    typography: z.object({
      display: z.string().optional(),
      body: z.string().optional()
    }).default({})
  })).default({}),
  metadata: z.object({
    source: z.string().default("original"),
    license: z.string().default("unknown"),
    tags: z.array(z.string()).default([]),
    language: z.string().default("en")
  })
});

export type ThemePack = z.infer<typeof themePackSchema>;
export type ThemeVisibility = z.infer<typeof themeVisibilitySchema>;
export type ThemeTokens = z.infer<typeof themeTokensSchema>;
export type ThemeChat = z.infer<typeof themeChatSchema>;
export type ThemeAssets = z.infer<typeof themeAssetsSchema>;

export function parseThemePack(input: unknown): ThemePack {
  return themePackSchema.parse(input);
}

export function parseThemePackOrNull(input: unknown): ThemePack | null {
  const result = themePackSchema.safeParse(input);
  return result.success ? result.data : null;
}
