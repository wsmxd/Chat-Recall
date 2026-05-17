import { AppShell } from "@/components/app-shell";
import { getEnvironmentStatus } from "@/lib/env";

export default function SettingsPage() {
  const status = getEnvironmentStatus();

  return (
    <AppShell>
      <main className="page">
        <header className="page-header">
          <h1>Settings</h1>
          <p>
            Provider configuration is not editable yet. This page exposes local environment
            readiness for the first implementation slice.
          </p>
        </header>
        <section className="grid">
          {Object.entries(status).map(([key, value]) => (
            <article className="card" key={key}>
              <h2>{key}</h2>
              <p>{value ? "Configured" : "Missing"}</p>
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}

