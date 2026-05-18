import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uploadToStorage, type StorageBucket } from "@/lib/storage/upload";
import { safeError } from "@/lib/api/errors";

const ALLOWED_BUCKETS: StorageBucket[] = ["avatars", "covers", "lore"];

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

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Content-Type must be multipart/form-data" }, { status: 415 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = formData.get("bucket") as StorageBucket | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!bucket || !ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: `Invalid bucket. Allowed: ${ALLOWED_BUCKETS.join(", ")}` }, { status: 400 });
    }

    const url = await uploadToStorage(bucket, file, userData.user.id);

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 });
  }
}
