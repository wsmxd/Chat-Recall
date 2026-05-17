import { defaultCharacters } from "@/config/default-characters";

export async function listPublicCharacters() {
  return defaultCharacters;
}

export async function getPublicCharacterBySlug(slug: string) {
  return defaultCharacters.find((character) => character.slug === slug) ?? null;
}

