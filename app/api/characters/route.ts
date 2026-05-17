import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { characterCardSchema, type CharacterVisibility } from "@/lib/characters/schema";
import { createCharacter, listUserCharacters } from "@/lib/characters/mutations";

const createCharacterSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  subtitle: z.string().optional(),
  card: characterCardSchema,
  visibility: z.enum(["private", "unlisted", "public"]).default("private"),
  themeId: z.string().uuid().optional()
});

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const characters = await listUserCharacters(userData.user.id);
  return NextResponse.json({ characters });
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createCharacterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid character card", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const character = await createCharacter({
      ownerId: userData.user.id,
      slug: parsed.data.slug,
      name: parsed.data.name,
      subtitle: parsed.data.subtitle,
      card: parsed.data.card,
      visibility: parsed.data.visibility as CharacterVisibility,
      themeId: parsed.data.themeId
    });

    if (!character) {
      return NextResponse.json(
        { error: "Failed to create character (slug may already exist)" },
        { status: 409 }
      );
    }

    return NextResponse.json({ character }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
