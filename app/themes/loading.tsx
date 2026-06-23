export default function Loading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        color: "var(--muted, #a5a0b5)"
      }}
    >
      <p>Loading...</p>
    </div>
  );
}