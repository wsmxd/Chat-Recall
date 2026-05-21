import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth/server";
import { safeError } from "@/lib/api/errors";
import type { Json } from "@/types/database.types";

const updateSettingsSchema = z.object({
  defaultThemeId: z.string().optional().nullable()
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

  const { data } = await supabase
    .from("profiles")
    .select("settings")
    .eq("id", userData.user.id)
    .maybeSingle();

  const settings = (data?.settings as Record<string, unknown>) ?? {};

  return NextResponse.json({ settings });
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

    await ensureProfile(userData.user.id, supabase);

    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid settings", details: parsed.error.issues }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("profiles")
      .select("settings")
      .eq("id", userData.user.id)
      .maybeSingle();

    const currentSettings = (existing?.settings as Record<string, unknown>) ?? {};
    const newSettings: Record<string, unknown> = { ...currentSettings };

    if (parsed.data.defaultThemeId !== undefined) {
      newSettings.defaultThemeId = parsed.data.defaultThemeId;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ settings: newSettings as Json })
      .eq("id", userData.user.id);

    if (error) {
      return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }

    return NextResponse.json({ settings: newSettings });
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 });
  }
}