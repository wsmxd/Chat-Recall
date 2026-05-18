create extension if not exists "pgcrypto";
create extension if not exists "vector";

create type public.content_visibility as enum ('private', 'unlisted', 'public', 'official');
create type public.conversation_mode as enum ('single_character', 'group_chat', 'scene', 'qa');
create type public.message_role as enum ('user', 'assistant', 'system', 'tool');
create type public.memory_type as enum ('fact', 'relationship', 'preference', 'timeline', 'summary');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.themes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  visibility public.content_visibility not null default 'private',
  name text not null,
  slug text not null,
  definition jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

create table public.lore_packs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  visibility public.content_visibility not null default 'private',
  name text not null,
  description text,
  source_type text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.characters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  visibility public.content_visibility not null default 'private',
  slug text not null,
  name text not null,
  subtitle text,
  avatar_url text,
  cover_url text,
  card_version integer not null default 1,
  schema_version text not null default '0.1',
  definition jsonb not null default '{}'::jsonb,
  theme_id uuid references public.themes(id) on delete set null,
  default_lore_pack_id uuid references public.lore_packs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

create table public.character_versions (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  version integer not null,
  definition jsonb not null,
  change_note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (character_id, version)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  mode public.conversation_mode not null default 'single_character',
  character_ids uuid[] not null default '{}'::uuid[],
  active_theme_id uuid references public.themes(id) on delete set null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role public.message_role not null,
  character_id uuid references public.characters(id) on delete set null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  token_count integer,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  lore_pack_id uuid not null references public.lore_packs(id) on delete cascade,
  title text not null,
  source_url text,
  storage_path text,
  content_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  lore_pack_id uuid not null references public.lore_packs(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  token_count integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.message_citations (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  document_chunk_id uuid not null references public.document_chunks(id) on delete cascade,
  score double precision,
  quote text,
  metadata jsonb not null default '{}'::jsonb
);

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  character_id uuid references public.characters(id) on delete cascade,
  type public.memory_type not null,
  content text not null,
  confidence double precision not null default 0.5,
  pinned boolean not null default false,
  source_message_ids uuid[] not null default '{}'::uuid[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.provider_configs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  provider text not null,
  model text not null,
  settings jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index characters_visibility_idx on public.characters (visibility);
create index lore_packs_visibility_idx on public.lore_packs (visibility);
create index themes_visibility_idx on public.themes (visibility);
create index conversations_owner_id_idx on public.conversations (owner_id);
create index messages_conversation_id_created_at_idx on public.messages (conversation_id, created_at);
create index memories_owner_id_idx on public.memories (owner_id);
create index document_chunks_lore_pack_id_idx on public.document_chunks (lore_pack_id);
create index document_chunks_embedding_idx on public.document_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger themes_set_updated_at before update on public.themes
for each row execute function public.set_updated_at();

create trigger lore_packs_set_updated_at before update on public.lore_packs
for each row execute function public.set_updated_at();

create trigger characters_set_updated_at before update on public.characters
for each row execute function public.set_updated_at();

create trigger conversations_set_updated_at before update on public.conversations
for each row execute function public.set_updated_at();

create trigger memories_set_updated_at before update on public.memories
for each row execute function public.set_updated_at();

create trigger provider_configs_set_updated_at before update on public.provider_configs
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.themes enable row level security;
alter table public.lore_packs enable row level security;
alter table public.characters enable row level security;
alter table public.character_versions enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.message_citations enable row level security;
alter table public.memories enable row level security;
alter table public.provider_configs enable row level security;

create policy "profiles are owner readable"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles are owner writable"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles are owner insertable"
on public.profiles for insert
with check (auth.uid() = id);

create policy "public themes are readable"
on public.themes for select
using (visibility in ('public', 'official') or auth.uid() = owner_id);

create policy "theme owners can insert"
on public.themes for insert
with check (auth.uid() = owner_id);

create policy "theme owners can update"
on public.themes for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "public lore packs are readable"
on public.lore_packs for select
using (visibility in ('public', 'official') or auth.uid() = owner_id);

create policy "lore pack owners can insert"
on public.lore_packs for insert
with check (auth.uid() = owner_id);

create policy "lore pack owners can update"
on public.lore_packs for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "public characters are readable"
on public.characters for select
using (visibility in ('public', 'official') or auth.uid() = owner_id);

create policy "character owners can insert"
on public.characters for insert
with check (auth.uid() = owner_id);

create policy "character owners can update"
on public.characters for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "character versions follow character visibility"
on public.character_versions for select
using (
  exists (
    select 1
    from public.characters c
    where c.id = character_id
      and (c.visibility in ('public', 'official') or c.owner_id = auth.uid())
  )
);

create policy "conversation owners can read"
on public.conversations for select
using (auth.uid() = owner_id);

create policy "conversation owners can insert"
on public.conversations for insert
with check (auth.uid() = owner_id);

create policy "conversation owners can update"
on public.conversations for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "messages follow conversation owner"
on public.messages for select
using (
  exists (
    select 1
    from public.conversations c
    where c.id = conversation_id
      and c.owner_id = auth.uid()
  )
);

create policy "conversation owners can insert messages"
on public.messages for insert
with check (
  exists (
    select 1
    from public.conversations c
    where c.id = conversation_id
      and c.owner_id = auth.uid()
  )
);

create policy "documents follow lore pack visibility"
on public.documents for select
using (
  exists (
    select 1
    from public.lore_packs lp
    where lp.id = lore_pack_id
      and (lp.visibility in ('public', 'official') or lp.owner_id = auth.uid())
  )
);

create policy "lore pack owners can insert documents"
on public.documents for insert
with check (
  exists (
    select 1
    from public.lore_packs lp
    where lp.id = lore_pack_id
      and lp.owner_id = auth.uid()
  )
);

create policy "document chunks follow lore pack visibility"
on public.document_chunks for select
using (
  exists (
    select 1
    from public.lore_packs lp
    where lp.id = lore_pack_id
      and (lp.visibility in ('public', 'official') or lp.owner_id = auth.uid())
  )
);

create policy "lore pack owners can insert document chunks"
on public.document_chunks for insert
with check (
  exists (
    select 1
    from public.lore_packs lp
    where lp.id = lore_pack_id
      and lp.owner_id = auth.uid()
  )
);

create policy "message citations follow message access"
on public.message_citations for select
using (
  exists (
    select 1
    from public.messages m
    join public.conversations c on c.id = m.conversation_id
    where m.id = message_id
      and c.owner_id = auth.uid()
  )
);

create policy "memories are owner readable"
on public.memories for select
using (auth.uid() = owner_id);

create policy "memories are owner writable"
on public.memories for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "provider configs are owner readable"
on public.provider_configs for select
using (auth.uid() = owner_id);

create policy "provider configs are owner writable"
on public.provider_configs for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);
