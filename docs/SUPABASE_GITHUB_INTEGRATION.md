# Supabase GitHub Integration

Source consulted: [Supabase GitHub integration guide](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/deployment/branching/github-integration.mdx).

## Repository Layout

The `supabase/` directory lives at the repository root.

Supabase GitHub Integration working directory:

```text
.
```

Supabase's guide says this field should point to the directory that contains the `supabase/` folder. For a root-level `supabase/` directory, use `.`.

## Dashboard Setup

In the Supabase Dashboard:

1. Open Project Settings.
2. Go to Integrations.
3. Under GitHub Integration, authorize GitHub.
4. Choose this repository.
5. Set Working directory to `.`.
6. Enable Automatic branching if preview branches should mirror GitHub branches.
7. Enable Deploy to production when production branch merges should apply migrations.

## Git Preparation

The Supabase guide expects the `supabase/` directory to be committed and pushed.

For an existing remote Supabase project:

```bash
supabase db pull --db-url <db_connection_string>
```

Then commit the generated migrations:

```bash
git add supabase
git commit -m "Initial Supabase setup"
git push
```

## Preview Branches

When Automatic branching is enabled:

- New GitHub branches can create matching Supabase branches.
- Pull requests receive Supabase preview status comments.
- Migrations in `supabase/migrations` are run for preview branches.
- `supabase/seed.sql` can seed preview data.
- Production data is not copied into preview branches.

## Production Deployment

When Deploy to production is enabled, pushes or merges to the production branch can deploy:

- New migrations
- Edge Functions declared in `supabase/config.toml`
- Storage buckets declared in `supabase/config.toml`

Other configuration such as API, Auth, and seed files is ignored by default according to the guide.

## Recommended GitHub Protection

Require the Supabase preview check before merging PRs that touch `supabase/**`. This prevents broken migrations from reaching production.

