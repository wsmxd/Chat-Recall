import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { archiveGuideCharacter } from "@/config/default-characters/archive-guide";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const character = archiveGuideCharacter;

  const { error } = await supabase.from("characters").upsert(
    {
      id: "00000000-0000-0000-0000-000000000010",
      slug: character.slug,
      name: character.name,
      subtitle: character.subtitle,
      visibility: "official",
      card_version: 1,
      schema_version: character.card.schemaVersion,
      definition: character.card
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("Failed to seed character:", error);
    process.exit(1);
  }

  console.log("Seeded character:", character.name, `(${character.slug})`);
}

main();
