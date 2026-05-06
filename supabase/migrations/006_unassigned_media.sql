-- Migration 006: Unassigned media library uploads
-- Allows admins to upload media into the library before attaching it to a
-- builder, market, community, or home.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('media-library', 'media-library', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumtypid = 'media_entity_type'::regtype
        AND enumlabel = 'unassigned'
    ) THEN
        ALTER TYPE media_entity_type ADD VALUE 'unassigned';
    END IF;
END $$;

ALTER TABLE media_assets ALTER COLUMN entity_id DROP NOT NULL;

DROP POLICY IF EXISTS "Public can read media library media" ON storage.objects;
CREATE POLICY "Public can read media library media" ON storage.objects
    FOR SELECT USING (bucket_id = 'media-library');

DROP POLICY IF EXISTS "Service role can manage media library media" ON storage.objects;
CREATE POLICY "Service role can manage media library media" ON storage.objects
    FOR ALL USING (
        auth.role() = 'service_role'
        AND bucket_id = 'media-library'
    )
    WITH CHECK (
        auth.role() = 'service_role'
        AND bucket_id = 'media-library'
    );
