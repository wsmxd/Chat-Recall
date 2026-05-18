import { createClient } from "@supabase/supabase-js";
import { defaultTheme } from "@/config/default-themes/moonlit-archive";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const { error } = await supabase.from("themes").upsert(
    {
      id: "11111111-1111-1111-1111-111111111111",
      slug: defaultTheme.slug,
      name: defaultTheme.name,
      visibility: "official",
      definition: defaultTheme
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("Failed to seed theme:", error);
    process.exit(1);
  }

  console.log("Seeded theme:", defaultTheme.name);
}

main();
