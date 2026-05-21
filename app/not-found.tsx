import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--background, #101014)",
        color: "var(--text, #f3f0e8)",
        textAlign: "center",
        padding: "24px"
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "8px" }}>404</h1>
      <p style={{ color: "var(--muted, #a5a0b5)", marginBottom: "24px" }}>
        This page doesn&apos;t exist or has been removed.
      </p>
      <Link
        className="button"
        href="/"
        style={{
          border: "1px solid var(--accent, #d6b86a)",
          borderRadius: "8px",
          color: "var(--accent, #d6b86a)",
          padding: "9px 12px",
          textDecoration: "none"
        }}
      >
        Back to Home
      </Link>
    </div>
  );
}