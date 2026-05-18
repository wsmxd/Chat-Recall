import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserDefaultProvider, setDefaultProvider } from "@/lib/chat/provider-config";
import { ensureProfile } from "@/lib/auth/server";
const setProviderSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  settings: z.record(z.string(), z.unknown()).optional()
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

  const config = await getUserDefaultProvider(supabase, userData.user.id);
  return NextResponse.json({ config });
}

export async function PUT(request: Request) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = setProviderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid config", details: parsed.error.issues }, { status: 400 });
  }

  await ensureProfile(userData.user.id, supabase);

  const config = await setDefaultProvider(
    supabase,
    userData.user.id,
    parsed.data.provider,
    parsed.data.model,
    parsed.data.settings
  );

  if (!config) {
    return NextResponse.json({ error: "Failed to save provider config" }, { status: 500 });
  }

  return NextResponse.json({ config });
}
