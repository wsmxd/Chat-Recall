insert into public.themes (
  id,
  visibility,
  name,
  slug,
  definition
)
values (
  '00000000-0000-0000-0000-000000000001',
  'official',
  'Moonlit Archive',
  'moonlit-archive',
  '{
    "schemaVersion": "0.1",
    "tokens": {
      "color": {
        "background": "#101014",
        "surface": "#181820",
        "text": "#F3F0E8",
        "muted": "#A5A0B5",
        "accent": "#D6B86A"
      }
    }
  }'::jsonb
)
on conflict (id) do nothing;

