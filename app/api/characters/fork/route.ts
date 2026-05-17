import { NextResponse } from "next/server";
import { z } from "zod";
import { createCharacter } from "@/lib/characters/mutations";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicCharacterBySlug } from "@/lib/characters/queries";
import { safeError } from "@/lib/api/errors";

const forkRequestSchema = z.object({
  sourceSlug: z.string().min(1),
  newSlug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  newName: z.string().min(1).optional()
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
    const parsed = forkRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid fork request", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const source = await getPublicCharacterBySlug(parsed.data.sourceSlug);
    if (!source) {
      return NextResponse.json({ error: "Source character not found" }, { status: 404 });
    }

    const forkedCard = {
      ...source.card,
      metadata: {
        ...source.card.metadata,
        source: "forked",
        sourceTitle: source.card.name,
        attribution: source.card.metadata.attribution ?? `Forked from ${source.name}`
      }
    };

    const character = await createCharacter({
      ownerId: userData.user.id,
      slug: parsed.data.newSlug,
      name: parsed.data.newName ?? `${source.name} (fork)`,
      subtitle: source.subtitle,
      card: forkedCard,
      visibility: "private",
      themeId: source.card.theme?.defaultThemeId
    });

    if (!character) {
      return NextResponse.json(
        { error: "Failed to fork character (slug may already exist)" },
        { status: 409 }
      );
    }

    return NextResponse.json({ character }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 });
  }
}
