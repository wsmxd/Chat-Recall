# Supabase

This directory is compatible with the Supabase CLI layout and should be committed to Git.

## Local Setup

Install the Supabase CLI, then run:

```bash
supabase start
supabase db reset
```

The CLI is not currently installed in this workspace, so the directory was created manually from the planned schema.

## Remote Project Setup

After creating a Supabase project:

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

If the remote project already has schema changes, pull them first:

```bash
supabase db pull --db-url <db_connection_string>
```

## GitHub Integration

Supabase Branching reads the committed `supabase/` directory from the connected GitHub repository. If this directory remains at the repository root, set the Supabase GitHub Integration working directory to `.`.

Migrations under `supabase/migrations` are applied automatically for preview/production flows when the integration is enabled.

