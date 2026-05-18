import { NextResponse } from "next/server";
import { z } from "zod";
import { characterCardSchema } from "@/lib/characters/schema";
import { createCharacter, getCharacterById } from "@/lib/characters/mutations";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeError } from "@/lib/api/errors";

const importRequestSchema = z.object({
  card: characterCardSchema,
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  subtitle: z.string().optional(),
  visibility: z.enum(["private", "unlisted", "public", "official"]).default("private"),
  themeId: z.string().uuid().optional()
});

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

    if (request.headers.get("content-type")?.includes("application/json") !== true) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }
    const body = await request.json();
    const parsed = importRequestSchema.safeParse(body);

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
      visibility: parsed.data.visibility,
      themeId: parsed.data.themeId
    });

    if (!character) {
      return NextResponse.json(
        { error: "Failed to import character (slug may already exist)" },
        { status: 409 }
      );
    }

    return NextResponse.json({ character }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Character ID required" }, { status: 400 });
  }

  const character = await getCharacterById(id);
  if (!character) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  if (character.visibility === "private" && character.owner_id !== userData?.user?.id) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 });
  }

  return NextResponse.json({
    card: character.card,
    slug: character.slug,
    name: character.name,
    subtitle: character.subtitle
  });
}
