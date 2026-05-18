import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listUserLorePacks, createLorePack } from "@/lib/rag/lore-packs";
import { safeError } from "@/lib/api/errors";

const createLorePackSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  sourceType: z.string().max(100).optional()
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

  const packs = await listUserLorePacks(userData.user.id);
  return NextResponse.json({ packs });
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

    if (request.headers.get("content-type")?.includes("application/json") !== true) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body = await request.json();
    const parsed = createLorePackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid lore pack", details: parsed.error.issues }, { status: 400 });
    }

    const id = await createLorePack({ userId: userData.user.id, ...parsed.data });
    if (!id) {
      return NextResponse.json({ error: "Failed to create lore pack" }, { status: 500 });
    }

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 });
  }
}
