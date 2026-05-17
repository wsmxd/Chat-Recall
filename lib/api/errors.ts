export function safeError(error: unknown): string {
  if (process.env.NODE_ENV === "development") {
    return error instanceof Error ? error.message : "Unknown error";
  }
  return "Internal server error";
}

export function errorResponse(error: unknown, status = 500): Response {
  return new Response(
    JSON.stringify({ error: safeError(error) }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}
