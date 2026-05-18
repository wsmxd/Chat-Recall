import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserDefaultProvider, setDefaultProvider } from "@/lib/chat/provider-config";
import { safeError } from "@/lib/api/errors";

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

  const config = await getUserDefaultProvider(userData.user.id);
  return NextResponse.json({ config });
}

export async function PUT(request: Request) {
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
    const parsed = setProviderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid config", details: parsed.error.issues }, { status: 400 });
    }

    const config = await setDefaultProvider(
      userData.user.id,
      parsed.data.provider,
      parsed.data.model,
      parsed.data.settings
    );

    return NextResponse.json({ config });
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 });
  }
}
