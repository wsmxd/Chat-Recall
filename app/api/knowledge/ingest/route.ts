import { NextResponse } from "next/server";
import { ingestDocument } from "@/lib/rag/ingestion/pipeline";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeError } from "@/lib/api/errors";
import { z } from "zod";

const ingestRequestSchema = z.object({
  lorePackId: z.string().uuid(),
  title: z.string().min(1),
  content: z.string().min(1),
  sourceType: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export async function POST(request: Request) {
  try {
    if (request.headers.get("content-type")?.includes("application/json") !== true) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body = await request.json();
    const parsed = ingestRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { lorePackId } = parsed.data;
    const { data: lorePack } = await supabase
      .from("lore_packs")
      .select("id, owner_id")
      .eq("id", lorePackId)
      .maybeSingle();

    if (!lorePack) {
      return NextResponse.json({ error: "Lore pack not found" }, { status: 404 });
    }

    if (lorePack.owner_id !== userData.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const result = await ingestDocument(parsed.data);

    return NextResponse.json({
      ok: true,
      documentId: result.documentId,
      chunksStored: result.chunksStored,
      embeddingDimensions: result.embeddingDimensions
    });
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 });
  }
}
