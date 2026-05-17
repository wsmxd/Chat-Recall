import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function sanitizeRedirect(origin: string, next: string | null): string {
  const target = next ?? "/";
  if (target.startsWith("/")) return `${origin}${target}`;
  const parsed = new URL(target);
  if (parsed.origin === origin) return target;
  return `${origin}/`;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.redirect(`${origin}/auth/login?error=Configuration error`);
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(sanitizeRedirect(origin, next));
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed`);
}
