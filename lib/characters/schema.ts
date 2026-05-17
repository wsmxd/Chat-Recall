import { z } from "zod";

export const characterVisibilitySchema = z.enum(["private", "unlisted", "public", "official"]);

export const characterCardSchema = z.object({
  schemaVersion: z.string().min(1),
  name: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  persona: z.object({
    core: z.string().min(1),
    voice: z.string().min(1),
    values: z.array(z.string()).default([]),
    boundaries: z.array(z.string()).default([]),
    relationshipDefaults: z.string().optional()
  }),
  roleplay: z.object({
    greeting: z.string().min(1),
    scenario: z.string().optional(),
    style: z.array(z.string()).default([]),
    allowedModes: z.array(z.enum(["chat", "scene", "narration", "qa"])).default(["chat"])
  }),
  memory: z
    .object({
      strategy: z.string().default("none"),
      pinnedFacts: z.array(z.string()).default([]),
      forgettingPolicy: z.string().optional()
    })
    .default({ strategy: "none", pinnedFacts: [] }),
  knowledge: z
    .object({
      defaultLorePackIds: z.array(z.string()).default([]),
      canonPreference: z.string().default("canon_first"),
      spoilerLevel: z.string().default("user_selected")
    })
    .default({
      defaultLorePackIds: [],
      canonPreference: "canon_first",
      spoilerLevel: "user_selected"
    }),
  theme: z
    .object({
      defaultThemeId: z.string().optional(),
      moodVariants: z.array(z.string()).default([])
    })
    .default({ moodVariants: [] }),
  model: z
    .object({
      preferredProfile: z.string().default("roleplay-balanced"),
      temperature: z.number().min(0).max(2).default(0.8)
    })
    .default({ preferredProfile: "roleplay-balanced", temperature: 0.8 }),
  metadata: z.object({
    source: z.string().default("third_party_or_original"),
    sourceTitle: z.string().optional(),
    tags: z.array(z.string()).default([]),
    language: z.string().default("zh-CN"),
    license: z.string().default("unknown_or_declared_by_creator"),
    redistribution: z.string().default("instance_only"),
    attribution: z.string().optional()
  })
});

export type CharacterCard = z.infer<typeof characterCardSchema>;
export type CharacterVisibility = z.infer<typeof characterVisibilitySchema>;

export type CharacterSummary = {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  visibility: CharacterVisibility;
  card: CharacterCard;
};

export function parseCharacterCard(input: unknown): CharacterCard {
  return characterCardSchema.parse(input);
}

