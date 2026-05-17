import { archiveGuideCharacter } from "@/config/default-characters/archive-guide";
import { parseCharacterCard, type CharacterSummary } from "@/lib/characters/schema";

export const defaultCharacters = [archiveGuideCharacter].map((character) => ({
  ...character,
  card: parseCharacterCard(character.card)
})) satisfies CharacterSummary[];

