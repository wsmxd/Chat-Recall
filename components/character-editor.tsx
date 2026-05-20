"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { characterCardSchema, type CharacterCard } from "@/lib/characters/schema";

type FormData = {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  persona: {
    core: string;
    voice: string;
    values: string[];
    boundaries: string[];
    relationshipDefaults: string;
  };
  roleplay: {
    greeting: string;
    scenario: string;
    style: string[];
    allowedModes: ("chat" | "scene" | "narration" | "qa")[];
  };
  memory: {
    strategy: string;
    pinnedFacts: string[];
    forgettingPolicy: string;
  };
  knowledge: {
    defaultLorePackIds: string[];
    canonPreference: string;
    spoilerLevel: string;
  };
  theme: {
    defaultThemeId: string;
    moodVariants: string[];
  };
  model: {
    preferredProfile: string;
    temperature: number;
  };
  metadata: {
    source: string;
    sourceTitle: string;
    tags: string[];
    language: string;
    license: string;
    redistribution: string;
    attribution: string;
  };
  visibility: "private" | "unlisted" | "public" | "official";
};

const defaultFormData: FormData = {
  slug: "",
  name: "",
  subtitle: "",
  description: "",
  persona: {
    core: "",
    voice: "",
    values: [],
    boundaries: [],
    relationshipDefaults: ""
  },
  roleplay: {
    greeting: "",
    scenario: "",
    style: [],
    allowedModes: ["chat"]
  },
  memory: {
    strategy: "none",
    pinnedFacts: [],
    forgettingPolicy: ""
  },
  knowledge: {
    defaultLorePackIds: [],
    canonPreference: "canon_first",
    spoilerLevel: "user_selected"
  },
  theme: {
    defaultThemeId: "",
    moodVariants: []
  },
  model: {
    preferredProfile: "roleplay-balanced",
    temperature: 0.8
  },
  metadata: {
    source: "original",
    sourceTitle: "",
    tags: [],
    language: "zh-CN",
    license: "unknown",
    redistribution: "instance_only",
    attribution: ""
  },
  visibility: "private"
};

function toFormData(character: { slug: string; name: string; subtitle?: string; card: CharacterCard }): FormData {
  return {
    slug: character.slug,
    name: character.name,
    subtitle: character.subtitle ?? "",
    description: character.card.description ?? "",
    persona: {
      core: character.card.persona.core,
      voice: character.card.persona.voice,
      values: character.card.persona.values,
      boundaries: character.card.persona.boundaries,
      relationshipDefaults: character.card.persona.relationshipDefaults ?? ""
    },
    roleplay: {
      greeting: character.card.roleplay.greeting,
      scenario: character.card.roleplay.scenario ?? "",
      style: character.card.roleplay.style,
      allowedModes: character.card.roleplay.allowedModes
    },
    memory: {
      strategy: character.card.memory.strategy,
      pinnedFacts: character.card.memory.pinnedFacts,
      forgettingPolicy: character.card.memory.forgettingPolicy ?? ""
    },
    knowledge: {
      defaultLorePackIds: character.card.knowledge.defaultLorePackIds,
      canonPreference: character.card.knowledge.canonPreference,
      spoilerLevel: character.card.knowledge.spoilerLevel
    },
    theme: {
      defaultThemeId: character.card.theme.defaultThemeId ?? "",
      moodVariants: character.card.theme.moodVariants
    },
    model: {
      preferredProfile: character.card.model.preferredProfile,
      temperature: character.card.model.temperature
    },
    metadata: {
      source: character.card.metadata.source,
      sourceTitle: character.card.metadata.sourceTitle ?? "",
      tags: character.card.metadata.tags,
      language: character.card.metadata.language,
      license: character.card.metadata.license,
      redistribution: character.card.metadata.redistribution,
      attribution: character.card.metadata.attribution ?? ""
    },
    visibility: "private"
  };
}

function toCard(data: FormData): CharacterCard {
  return {
    schemaVersion: "0.1",
    name: data.name,
    subtitle: data.subtitle || undefined,
    description: data.description || undefined,
    persona: {
      core: data.persona.core,
      voice: data.persona.voice,
      values: data.persona.values,
      boundaries: data.persona.boundaries,
      relationshipDefaults: data.persona.relationshipDefaults || undefined
    },
    roleplay: {
      greeting: data.roleplay.greeting,
      scenario: data.roleplay.scenario || undefined,
      style: data.roleplay.style,
      allowedModes: data.roleplay.allowedModes
    },
    memory: {
      strategy: data.memory.strategy,
      pinnedFacts: data.memory.pinnedFacts,
      forgettingPolicy: data.memory.forgettingPolicy || undefined
    },
    knowledge: {
      defaultLorePackIds: data.knowledge.defaultLorePackIds,
      canonPreference: data.knowledge.canonPreference,
      spoilerLevel: data.knowledge.spoilerLevel
    },
    theme: {
      defaultThemeId: data.theme.defaultThemeId || undefined,
      moodVariants: data.theme.moodVariants
    },
    model: {
      preferredProfile: data.model.preferredProfile,
      temperature: data.model.temperature
    },
    metadata: {
      source: data.metadata.source,
      sourceTitle: data.metadata.sourceTitle || undefined,
      tags: data.metadata.tags,
      language: data.metadata.language,
      license: data.metadata.license,
      redistribution: data.metadata.redistribution,
      attribution: data.metadata.attribution || undefined
    }
  };
}

interface CharacterEditorProps {
  mode: "create" | "edit";
  initialData?: { slug: string; name: string; subtitle?: string; card: CharacterCard; id?: string; avatarUrl?: string; coverUrl?: string };
}

export function CharacterEditor({ mode, initialData }: CharacterEditorProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>(() =>
    initialData ? toFormData(initialData) : defaultFormData
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [importJson, setImportJson] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl ?? "");
  const [coverUrl, setCoverUrl] = useState(initialData?.coverUrl ?? "");
  const [uploading, setUploading] = useState<"avatars" | "covers" | null>(null);

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const updateNestedField = useCallback(<P extends keyof FormData, K extends keyof FormData[P]>(
    parent: P,
    key: K,
    value: FormData[P][K]
  ) => {
    setFormData((prev) => {
      const parentValue = prev[parent] as Record<string, unknown>;
      return {
        ...prev,
        [parent]: { ...parentValue, [key as string]: value }
      };
    });
  }, []);

  const handleTagInput = useCallback((field: "values" | "boundaries" | "style" | "tags" | "moodVariants", value: string) => {
    const items = value.split(",").map((s) => s.trim()).filter(Boolean);
    if (field === "values" || field === "boundaries") {
      updateNestedField("persona", field, items);
    } else if (field === "style") {
      updateNestedField("roleplay", field, items);
    } else if (field === "tags") {
      updateNestedField("metadata", field, items);
    } else if (field === "moodVariants") {
      updateNestedField("theme", field, items);
    }
  }, [updateNestedField]);

  const validate = useCallback((): boolean => {
    const card = toCard(formData);
    const validation = characterCardSchema.safeParse(card);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return false;
    }

    if (!formData.slug) {
      setErrors({ slug: "Slug is required" });
      return false;
    }

    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      setErrors({ slug: "Slug must be lowercase alphanumeric with hyphens" });
      return false;
    }

    setErrors({});
    return true;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validate() || !user) return;

    setSubmitting(true);
    setApiError(null);

    try {
      const card = toCard(formData);

      if (mode === "create") {
        const response = await fetch("/api/characters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: formData.slug,
            name: formData.name,
            subtitle: formData.subtitle || undefined,
            card,
            visibility: formData.visibility
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error ?? "Failed to create character");
        }

        const data = await response.json();
        router.push(`/characters/${data.character.slug}`);
      } else if (initialData?.id) {
        const response = await fetch(`/api/characters/${initialData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: formData.slug,
            name: formData.name,
            subtitle: formData.subtitle || undefined,
            card
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error ?? "Failed to update character");
        }

        router.push(`/characters/${formData.slug}`);
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }, [formData, validate, user, mode, initialData, router]);

  const handleExport = useCallback(() => {
    const card = toCard(formData);
    const exportData = {
      card,
      slug: formData.slug,
      name: formData.name,
      subtitle: formData.subtitle || undefined
    };
    return JSON.stringify(exportData, null, 2);
  }, [formData]);

  const handleImport = useCallback(() => {
    try {
      const parsed = JSON.parse(importJson);
      const imported = parsed.card ? parsed : { card: parsed, slug: "", name: "" };
      const importedData = {
        slug: imported.slug || "",
        name: imported.name || imported.card?.name || "",
        subtitle: imported.subtitle,
        card: imported.card
      };
      setFormData({
        ...defaultFormData,
        ...toFormData(importedData)
      });
      setShowImport(false);
      setImportJson("");
    } catch {
      setErrors({ import: "Invalid JSON format" });
    }
  }, [importJson]);

  const handleFileUpload = useCallback(async (bucket: "avatars" | "covers", file: File) => {
    setUploading(bucket);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (response.ok && data.url) {
        if (bucket === "avatars") setAvatarUrl(data.url);
        else setCoverUrl(data.url);
      }
    } catch {
      // upload failure is non-blocking
    } finally {
      setUploading(null);
    }
  }, []);

  if (!user) {
    return (
      <div className="card">
        <p>Please sign in to create or edit characters.</p>
      </div>
    );
  }

  return (
    <div className="editor">
      {apiError && <div className="editor-error">{apiError}</div>}

      <div className="editor-toolbar">
        <button className="button secondary" onClick={() => setShowImport(!showImport)} type="button">
          Import JSON
        </button>
        <button className="button secondary" onClick={() => setShowExport(!showExport)} type="button">
          Export JSON
        </button>
      </div>

      {showImport && (
        <div className="editor-import card">
          <h3>Import Character JSON</h3>
          <textarea
            className="editor-textarea"
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder='{"card": {...}, "slug": "...", "name": "..."}'
            rows={8}
          />
          {errors.import && <div className="editor-field-error">{errors.import}</div>}
          <div className="button-row">
            <button className="button" onClick={handleImport} type="button">
              Apply Import
            </button>
            <button className="button secondary" onClick={() => { setShowImport(false); setImportJson(""); }} type="button">
              Cancel
            </button>
          </div>
        </div>
      )}

      {showExport && (
        <div className="editor-export card">
          <h3>Export Character JSON</h3>
          <textarea
            className="editor-textarea"
            readOnly
            value={handleExport()}
            rows={12}
          />
          <div className="button-row">
            <button
              className="button"
              onClick={() => navigator.clipboard.writeText(handleExport())}
              type="button"
            >
              Copy to Clipboard
            </button>
            <button className="button secondary" onClick={() => setShowExport(false)} type="button">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="editor-section card">
        <h2>Basic Info</h2>
        <label className="editor-label">
          Slug *
          <input
            className="editor-input"
            value={formData.slug}
            onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            placeholder="my-character"
            disabled={mode === "edit"}
          />
          {errors.slug && <span className="editor-field-error">{errors.slug}</span>}
        </label>
        <label className="editor-label">
          Name *
          <input
            className="editor-input"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Character Name"
          />
          {errors["name"] && <span className="editor-field-error">{errors["name"]}</span>}
        </label>
        <label className="editor-label">
          Subtitle
          <input
            className="editor-input"
            value={formData.subtitle}
            onChange={(e) => updateField("subtitle", e.target.value)}
            placeholder="A concise identity line"
          />
        </label>
        <label className="editor-label">
          Description
          <textarea
            className="editor-textarea"
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Public-facing description of the character"
            rows={3}
          />
        </label>
        <label className="editor-label">
          Visibility
          <select
            className="editor-select"
            value={formData.visibility}
            onChange={(e) => updateField("visibility", e.target.value as FormData["visibility"])}
          >
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
            <option value="public">Public</option>
            <option value="official">Official</option>
          </select>
        </label>
        <label className="editor-label">
          Avatar
          <input
            className="editor-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload("avatars", f); }}
            disabled={uploading === "avatars"}
          />
          {avatarUrl && <p style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{avatarUrl.slice(0, 60)}...</p>}
        </label>
        <label className="editor-label">
          Cover
          <input
            className="editor-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload("covers", f); }}
            disabled={uploading === "covers"}
          />
          {coverUrl && <p style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{coverUrl.slice(0, 60)}...</p>}
        </label>
      </div>

      <div className="editor-section card">
        <h2>Persona</h2>
        <label className="editor-label">
          Core Identity *
          <textarea
            className="editor-textarea"
            value={formData.persona.core}
            onChange={(e) => updateNestedField("persona", "core", e.target.value)}
            placeholder="Stable character identity"
            rows={3}
          />
          {errors["persona.core"] && <span className="editor-field-error">{errors["persona.core"]}</span>}
        </label>
        <label className="editor-label">
          Voice *
          <textarea
            className="editor-textarea"
            value={formData.persona.voice}
            onChange={(e) => updateNestedField("persona", "voice", e.target.value)}
            placeholder="Speech style and verbal habits"
            rows={2}
          />
          {errors["persona.voice"] && <span className="editor-field-error">{errors["persona.voice"]}</span>}
        </label>
        <label className="editor-label">
          Values (comma-separated)
          <input
            className="editor-input"
            value={formData.persona.values.join(", ")}
            onChange={(e) => handleTagInput("values", e.target.value)}
            placeholder="honesty, courage, loyalty"
          />
        </label>
        <label className="editor-label">
          Boundaries (comma-separated)
          <input
            className="editor-input"
            value={formData.persona.boundaries.join(", ")}
            onChange={(e) => handleTagInput("boundaries", e.target.value)}
            placeholder="does not break character, avoids explicit content"
          />
        </label>
        <label className="editor-label">
          Relationship Defaults
          <textarea
            className="editor-textarea"
            value={formData.persona.relationshipDefaults}
            onChange={(e) => updateNestedField("persona", "relationshipDefaults", e.target.value)}
            placeholder="How they treat a new user"
            rows={2}
          />
        </label>
      </div>

      <div className="editor-section card">
        <h2>Roleplay</h2>
        <label className="editor-label">
          Greeting *
          <textarea
            className="editor-textarea"
            value={formData.roleplay.greeting}
            onChange={(e) => updateNestedField("roleplay", "greeting", e.target.value)}
            placeholder="Opening message for the character"
            rows={4}
          />
          {errors["roleplay.greeting"] && <span className="editor-field-error">{errors["roleplay.greeting"]}</span>}
        </label>
        <label className="editor-label">
          Scenario
          <textarea
            className="editor-textarea"
            value={formData.roleplay.scenario}
            onChange={(e) => updateNestedField("roleplay", "scenario", e.target.value)}
            placeholder="Default scene setup"
            rows={2}
          />
        </label>
        <label className="editor-label">
          Style (comma-separated)
          <input
            className="editor-input"
            value={formData.roleplay.style.join(", ")}
            onChange={(e) => handleTagInput("style", e.target.value)}
            placeholder="immersive, concise, in-character"
          />
        </label>
        <label className="editor-label">
          Allowed Modes
          <div className="editor-checkbox-group">
            {(["chat", "scene", "narration", "qa"] as const).map((mode) => (
              <label key={mode} className="editor-checkbox">
                <input
                  type="checkbox"
                  checked={formData.roleplay.allowedModes.includes(mode)}
                  onChange={(e) => {
                    const modes = e.target.checked
                      ? [...formData.roleplay.allowedModes, mode]
                      : formData.roleplay.allowedModes.filter((m) => m !== mode);
                    updateNestedField("roleplay", "allowedModes", modes);
                  }}
                />
                {mode}
              </label>
            ))}
          </div>
        </label>
      </div>

      <div className="editor-section card">
        <h2>Knowledge</h2>
        <label className="editor-label">
          Default Lore Pack IDs (comma-separated UUIDs)
          <input
            className="editor-input"
            value={formData.knowledge.defaultLorePackIds.join(", ")}
            onChange={(e) => {
              const ids = e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0);
              updateNestedField("knowledge", "defaultLorePackIds", ids);
            }}
            placeholder="00000000-0000-0000-0000-000000000001"
          />
        </label>
        <label className="editor-label">
          Canon Preference
          <select
            className="editor-select"
            value={formData.knowledge.canonPreference}
            onChange={(e) => updateNestedField("knowledge", "canonPreference", e.target.value)}
          >
            <option value="canon_first">Canon First</option>
            <option value="fanon_first">Fanon First</option>
            <option value="ignore_canon">Ignore Canon</option>
          </select>
        </label>
        <label className="editor-label">
          Spoiler Level
          <select
            className="editor-select"
            value={formData.knowledge.spoilerLevel}
            onChange={(e) => updateNestedField("knowledge", "spoilerLevel", e.target.value)}
          >
            <option value="none">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="user_selected">User Selected</option>
          </select>
        </label>
      </div>

      <div className="editor-section card">
        <h2>Model</h2>
        <label className="editor-label">
          Preferred Profile
          <select
            className="editor-select"
            value={formData.model.preferredProfile}
            onChange={(e) => updateNestedField("model", "preferredProfile", e.target.value)}
          >
            <option value="roleplay-balanced">Roleplay Balanced</option>
            <option value="roleplay-creative">Roleplay Creative</option>
            <option value="roleplay-precise">Roleplay Precise</option>
          </select>
        </label>
        <label className="editor-label">
          Temperature ({formData.model.temperature.toFixed(1)})
          <input
            className="editor-range"
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={formData.model.temperature}
            onChange={(e) => updateNestedField("model", "temperature", parseFloat(e.target.value))}
          />
        </label>
      </div>

      <div className="editor-section card">
        <h2>Metadata</h2>
        <label className="editor-label">
          Source
          <select
            className="editor-select"
            value={formData.metadata.source}
            onChange={(e) => updateNestedField("metadata", "source", e.target.value)}
          >
            <option value="original">Original</option>
            <option value="third_party_or_original">Third Party or Original</option>
            <option value="forked">Forked</option>
          </select>
        </label>
        <label className="editor-label">
          Source Title
          <input
            className="editor-input"
            value={formData.metadata.sourceTitle}
            onChange={(e) => updateNestedField("metadata", "sourceTitle", e.target.value)}
            placeholder="Original source title"
          />
        </label>
        <label className="editor-label">
          Tags (comma-separated)
          <input
            className="editor-input"
            value={formData.metadata.tags.join(", ")}
            onChange={(e) => handleTagInput("tags", e.target.value)}
            placeholder="roleplay, fantasy, adventure"
          />
        </label>
        <label className="editor-label">
          Language
          <select
            className="editor-select"
            value={formData.metadata.language}
            onChange={(e) => updateNestedField("metadata", "language", e.target.value)}
          >
            <option value="zh-CN">Chinese</option>
            <option value="en">English</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
          </select>
        </label>
        <label className="editor-label">
          License
          <input
            className="editor-input"
            value={formData.metadata.license}
            onChange={(e) => updateNestedField("metadata", "license", e.target.value)}
            placeholder="MIT, CC-BY, unknown"
          />
        </label>
        <label className="editor-label">
          Redistribution
          <select
            className="editor-select"
            value={formData.metadata.redistribution}
            onChange={(e) => updateNestedField("metadata", "redistribution", e.target.value)}
          >
            <option value="instance_only">Instance Only</option>
            <option value="repository_allowed">Repository Allowed</option>
            <option value="public_allowed">Public Allowed</option>
          </select>
        </label>
        <label className="editor-label">
          Attribution
          <input
            className="editor-input"
            value={formData.metadata.attribution}
            onChange={(e) => updateNestedField("metadata", "attribution", e.target.value)}
            placeholder="Creator name or credit"
          />
        </label>
      </div>

      <div className="editor-section card">
        <h2>Theme</h2>
        <label className="editor-label">
          Default Theme ID
          <input
            className="editor-input"
            value={formData.theme.defaultThemeId}
            onChange={(e) => updateNestedField("theme", "defaultThemeId", e.target.value)}
            placeholder="moonlit-archive"
          />
        </label>
        <label className="editor-label">
          Mood Variants (comma-separated)
          <input
            className="editor-input"
            value={formData.theme.moodVariants.join(", ")}
            onChange={(e) => handleTagInput("moodVariants", e.target.value)}
            placeholder="calm, mystery, night"
          />
        </label>
      </div>

      <div className="editor-actions">
        <button
          className="button"
          onClick={handleSubmit}
          disabled={submitting}
          type="button"
        >
          {submitting ? "Saving..." : mode === "create" ? "Create Character" : "Save Changes"}
        </button>
        <button
          className="button secondary"
          onClick={() => router.back()}
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
