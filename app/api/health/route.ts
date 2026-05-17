import { NextResponse } from "next/server";
import { getEnvironmentStatus } from "@/lib/env";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "chat-recall",
    environment: getEnvironmentStatus()
  });
}

