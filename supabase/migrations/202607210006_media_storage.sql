-- Frontier DevConsults public media buckets.
-- Writes are performed only by authenticated server routes using the service-role key.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('project-media', 'project-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']),
  ('app-media', 'app-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']),
  ('site-media', 'site-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public media can be read" ON storage.objects;
CREATE POLICY "Public media can be read"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('project-media', 'app-media', 'site-media'));

-- Do not add public INSERT, UPDATE, or DELETE policies. The server-only service-role client
-- bypasses RLS after the application has verified the administrator session.
