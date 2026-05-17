import { NextResponse } from "next/server";
import { z } from "zod";
import { characterCardSchema } from "@/lib/characters/schema";
import { getCharacterById, updateCharacter, deleteCharacter } from "@/lib/characters/mutations";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeError } from "@/lib/api/errors";

const updateCharacterSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  name: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  card: characterCardSchema.partial().optional(),
  themeId: z.string().uuid().nullable().optional(),
  defaultLorePackId: z.string().uuid().nullable().optional()
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  return NextResponse.json({ character });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getCharacterById(id);

    if (!existing) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    if (existing.owner_id !== userData.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (request.headers.get("content-type")?.includes("application/json") !== true) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }
    const body = await request.json();
    const parsed = updateCharacterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid update", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = await updateCharacter({
      id,
      ownerId: userData.user.id,
      ...parsed.data
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update character" },
        { status: 500 }
      );
    }

    return NextResponse.json({ character: updated });
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getCharacterById(id);

    if (!existing) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    if (existing.owner_id !== userData.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const success = await deleteCharacter(id, userData.user.id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete character" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 });
  }
}
