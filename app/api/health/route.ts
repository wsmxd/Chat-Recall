import { NextResponse } from "next/server";
import { getPublicEnvOrNull } from "@/lib/env";

export function GET() {
  try {
    const env = getPublicEnvOrNull();
    return NextResponse.json({
      ok: true,
      service: "chat-recall",
      supabase: !!env
    });
  } catch {
    return NextResponse.json({
      ok: false,
      service: "chat-recall",
      error: "Environment not configured"
    }, { status: 503 });
  }
}

