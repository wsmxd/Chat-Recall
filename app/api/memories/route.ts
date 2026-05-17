import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listMemories, createMemory, updateMemory, deleteMemory, getPinnedFacts } from "@/lib/memories/queries";
import type { MemoryType } from "@/lib/memories/queries";
import { safeError } from "@/lib/api/errors";

const createMemorySchema = z.object({
  conversationId: z.string().uuid().optional(),
  characterId: z.string().uuid().optional(),
  type: z.enum(["fact", "relationship", "preference", "timeline", "summary"]),
  content: z.string().min(1).max(500),
  confidence: z.number().min(0).max(1).default(0.5),
  pinned: z.boolean().default(false),
  sourceMessageIds: z.array(z.string().uuid()).default([])
});

const patchMemorySchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(500).optional(),
  confidence: z.number().min(0).max(1).optional(),
  pinned: z.boolean().optional(),
  type: z.enum(["fact", "relationship", "preference", "timeline", "summary"]).optional()
});

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const conversationId = url.searchParams.get("conversationId") || undefined;
  const characterId = url.searchParams.get("characterId") || undefined;
  const types = url.searchParams.getAll("type") as MemoryType[];
  const pinnedOnly = url.searchParams.get("pinned") === "true";

  let memories;
  if (pinnedOnly && characterId) {
    memories = await getPinnedFacts({
      userId: userData.user.id,
      characterId
    });
  } else {
    memories = await listMemories({
      userId: userData.user.id,
      conversationId,
      characterId,
      types: types.length > 0 ? types : undefined
    });
  }

  return NextResponse.json({ memories });
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

    if (Array.isArray(body)) {
      const results = [];
      for (const item of body) {
        const parsed = createMemorySchema.safeParse(item);
        if (!parsed.success) continue;
        const memory = await createMemory({ userId: userData.user.id, ...parsed.data });
        if (memory) results.push(memory);
      }
      return NextResponse.json({ memories: results }, { status: 201 });
    }

    const parsed = createMemorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid memory", details: parsed.error.issues }, { status: 400 });
    }

    const memory = await createMemory({ userId: userData.user.id, ...parsed.data });
    if (!memory) {
      return NextResponse.json({ error: "Failed to create memory" }, { status: 500 });
    }

    return NextResponse.json({ memory }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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
    const parsed = patchMemorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update", details: parsed.error.issues }, { status: 400 });
    }

    const { id, ...updates } = parsed.data;
    const memory = await updateMemory({ id, userId: userData.user.id, ...updates });
    if (!memory) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    return NextResponse.json({ memory });
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Memory ID required" }, { status: 400 });
    }

    const success = await deleteMemory(id, userData.user.id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete memory" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 });
  }
}
