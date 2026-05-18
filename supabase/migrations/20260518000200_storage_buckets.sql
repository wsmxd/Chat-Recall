-- Create storage buckets for the application
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, '{image/jpeg,image/png,image/webp,image/gif}'),
  ('covers', 'covers', true, 10485760, '{image/jpeg,image/png,image/webp}'),
  ('lore', 'lore', false, 52428800, '{text/plain,text/markdown,application/json,text/csv}')
ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatars (anyone can view, owners can upload)
CREATE POLICY "avatars are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "owners can update their avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND owner = auth.uid());

CREATE POLICY "owners can delete their avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND owner = auth.uid());

-- RLS policies for covers (anyone can view, owners can upload)
CREATE POLICY "covers are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

CREATE POLICY "authenticated users can upload covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

CREATE POLICY "owners can update their covers"
ON storage.objects FOR UPDATE
USING (bucket_id = 'covers' AND owner = auth.uid());

CREATE POLICY "owners can delete their covers"
ON storage.objects FOR DELETE
USING (bucket_id = 'covers' AND owner = auth.uid());

-- RLS policies for lore (only owner can read/upload/modify)
CREATE POLICY "owners can read their lore files"
ON storage.objects FOR SELECT
USING (bucket_id = 'lore' AND owner = auth.uid());

CREATE POLICY "authenticated users can upload lore"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lore' AND auth.role() = 'authenticated');

CREATE POLICY "owners can update their lore files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'lore' AND owner = auth.uid());

CREATE POLICY "owners can delete their lore files"
ON storage.objects FOR DELETE
USING (bucket_id = 'lore' AND owner = auth.uid());
