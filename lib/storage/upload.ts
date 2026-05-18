import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type StorageBucket = "avatars" | "covers" | "lore";

const MAX_FILE_SIZE: Record<StorageBucket, number> = {
  avatars: 5 * 1024 * 1024,   // 5MB
  covers: 10 * 1024 * 1024,   // 10MB
  lore: 50 * 1024 * 1024      // 50MB
};

const ALLOWED_TYPES: Record<StorageBucket, string[]> = {
  avatars: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  covers: ["image/jpeg", "image/png", "image/webp"],
  lore: ["text/plain", "text/markdown", "application/json", "text/csv"]
};

export function validateFile(file: File, bucket: StorageBucket): string | null {
  const max = MAX_FILE_SIZE[bucket];
  if (file.size > max) {
    return `File too large. Maximum size is ${max / 1024 / 1024}MB.`;
  }

  const allowed = ALLOWED_TYPES[bucket];
  if (!allowed.includes(file.type)) {
    return `Unsupported file type: ${file.type}. Allowed: ${allowed.join(", ")}`;
  }

  return null;
}

export async function uploadToStorage(
  bucket: StorageBucket,
  file: File,
  ownerId: string
): Promise<string | null> {
  const validationError = validateFile(file, bucket);
  if (validationError) throw new Error(validationError);

  const admin = createSupabaseAdminClient();
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${ownerId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { error, data } = await admin.storage
    .from(bucket)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = admin.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function readTextFromStorage(
  bucket: StorageBucket,
  path: string
): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from(bucket).download(path);

  if (error || !data) return null;
  return data.text();
}
