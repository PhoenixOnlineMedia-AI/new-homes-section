-- Migration 004: First-party media storage and assignment
-- Creates canonical media buckets plus a media_assets table for assigning
-- logos, market imagery, community galleries, and home photos.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('builder-logos', 'builder-logos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
    ('builder-market-media', 'builder-market-media', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
    ('community-photos', 'community-photos', true, 15728640, ARRAY['image/png', 'image/jpeg', 'image/webp']),
    ('home-photos', 'home-photos', true, 15728640, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

ALTER TABLE builder_markets ADD COLUMN IF NOT EXISTS image_url TEXT;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_entity_type') THEN
        CREATE TYPE media_entity_type AS ENUM ('builder', 'builder_market', 'community', 'home');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_asset_role') THEN
        CREATE TYPE media_asset_role AS ENUM ('logo', 'hero', 'gallery', 'floor_plan', 'market');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_asset_status') THEN
        CREATE TYPE media_asset_status AS ENUM ('pending', 'matched', 'approved', 'rejected');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type media_entity_type NOT NULL,
    entity_id UUID NOT NULL,
    bucket TEXT NOT NULL,
    path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    source_url TEXT,
    original_filename TEXT,
    title TEXT,
    alt_text TEXT,
    role media_asset_role NOT NULL DEFAULT 'gallery',
    sort_order INTEGER NOT NULL DEFAULT 0,
    status media_asset_status NOT NULL DEFAULT 'approved',
    content_type TEXT,
    size_bytes INTEGER,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bucket, path)
);

CREATE INDEX IF NOT EXISTS idx_media_assets_entity ON media_assets(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_role ON media_assets(role);
CREATE INDEX IF NOT EXISTS idx_media_assets_status ON media_assets(status);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read media_assets" ON media_assets;
CREATE POLICY "Public can read media_assets" ON media_assets
    FOR SELECT USING (status IN ('matched', 'approved'));

DROP POLICY IF EXISTS "Service role can write media_assets" ON media_assets;
CREATE POLICY "Service role can write media_assets" ON media_assets
    FOR ALL USING (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS update_media_assets_updated_at ON media_assets;
CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON media_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP POLICY IF EXISTS "Public can read first-party media" ON storage.objects;
CREATE POLICY "Public can read first-party media" ON storage.objects
    FOR SELECT USING (bucket_id IN ('builder-logos', 'builder-market-media', 'community-photos', 'home-photos'));

DROP POLICY IF EXISTS "Service role can manage first-party media" ON storage.objects;
CREATE POLICY "Service role can manage first-party media" ON storage.objects
    FOR ALL USING (
        auth.role() = 'service_role'
        AND bucket_id IN ('builder-logos', 'builder-market-media', 'community-photos', 'home-photos')
    )
    WITH CHECK (
        auth.role() = 'service_role'
        AND bucket_id IN ('builder-logos', 'builder-market-media', 'community-photos', 'home-photos')
    );
