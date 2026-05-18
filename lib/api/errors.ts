export function safeError(error: unknown): string {
  if (process.env.NODE_ENV === "development") {
    return error instanceof Error ? error.message : "Unknown error";
  }
  return "Internal server error";
}
