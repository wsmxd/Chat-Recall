"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";

interface ThemeOption {
  slug: string;
  name: string;
}

export function UserThemeSelector() {
  const { user, loading: authLoading } = useAuth();
  const [themes, setThemes] = useState<ThemeOption[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    Promise.all([
      fetch("/api/themes").then((r) => r.json()),
      fetch("/api/profile-settings").then((r) => r.json())
    ]).then(([themesData, settingsData]) => {
      const themeList: ThemeOption[] = themesData.themes ?? [];
      themeList.unshift({ slug: "", name: "None (system default)" });
      setThemes(themeList);
      if (settingsData.settings?.defaultThemeId) {
        setSelected(settingsData.settings.defaultThemeId);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user, authLoading]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    const response = await fetch("/api/profile-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultThemeId: selected || null })
    });
    if (response.ok) setSaved(true);
    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <article className="card">
        <h2>Default Theme</h2>
        <p>Loading themes...</p>
      </article>
    );
  }

  return (
    <article className="card">
      <h2>Default Theme</h2>
      <p>
        Choose a theme applied to all conversations. Character-specific themes
        and conversation overrides take priority.
      </p>
      <label className="editor-label">
        Theme
        <select
          className="editor-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {themes.map((t) => (
            <option key={t.slug || "__none"} value={t.slug || ""}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <div className="button-row" style={{ marginTop: "8px" }}>
        <button className="button" onClick={handleSave} disabled={saving} type="button">
          {saving ? "Saving..." : saved ? "Saved" : "Save"}
        </button>
      </div>
    </article>
  );
}