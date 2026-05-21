import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateTheme, deleteTheme } from "@/lib/themes/mutations";
import { getThemeById } from "@/lib/themes/queries";
import { themePackSchema } from "@/lib/themes/schema";
import { safeError } from "@/lib/api/errors";

const updateThemeSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  name: z.string().min(1).optional(),
  definition: themePackSchema.optional()
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const theme = await getThemeById(id);
  if (!theme) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }
  return NextResponse.json({ theme });
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

    if (request.headers.get("content-type")?.includes("application/json") !== true) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateThemeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid theme", details: parsed.error.issues }, { status: 400 });
    }

    const theme = await updateTheme({ id, ownerId: userData.user.id, ...parsed.data });
    if (!theme) {
      return NextResponse.json({ error: "Theme not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json({ theme });
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
    const ok = await deleteTheme(id, userData.user.id);
    if (!ok) {
      return NextResponse.json({ error: "Failed to delete theme" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 });
  }
}