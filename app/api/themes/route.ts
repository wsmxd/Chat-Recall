import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { themePackSchema } from "@/lib/themes/schema";
import { createTheme, listUserThemes } from "@/lib/themes/mutations";
import { listPublicThemes } from "@/lib/themes/queries";
import { safeError } from "@/lib/api/errors";

const createThemeSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  definition: themePackSchema,
  visibility: z.enum(["private", "unlisted", "public", "official"]).default("private")
});

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ themes: await listPublicThemes() });
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.json({ themes: await listPublicThemes() });
  }

  const userThemes = await listUserThemes(userData.user.id);
  const publicThemes = await listPublicThemes();

  const seen = new Set(userThemes.map((t) => t.slug));
  const combined = [...userThemes, ...publicThemes.filter((t) => !seen.has(t.slug))];

  return NextResponse.json({ themes: combined });
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
    const parsed = createThemeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid theme", details: parsed.error.issues }, { status: 400 });
    }

    const theme = await createTheme({
      ownerId: userData.user.id,
      slug: parsed.data.slug,
      name: parsed.data.name,
      definition: parsed.data.definition,
      visibility: parsed.data.visibility
    });

    if (!theme) {
      return NextResponse.json({ error: "Failed to create theme" }, { status: 500 });
    }

    return NextResponse.json({ theme }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 });
  }
}