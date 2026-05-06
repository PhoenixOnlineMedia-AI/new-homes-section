-- Migration 005: City-level market page content
-- Adds editorial/stat/FAQ content that renders on the existing /{state}/{city}
-- market URL without touching builder, builder-market, or community data.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('market-page-media', 'market-page-media', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
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
        AND enumlabel = 'market_page'
    ) THEN
        ALTER TYPE media_entity_type ADD VALUE 'market_page';
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS market_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city TEXT NOT NULL,
    state_code TEXT NOT NULL,
    city_overview TEXT,
    key_stats TEXT,
    neighborhood_breakdown TEXT,
    economy_job_market TEXT,
    schools_education TEXT,
    lifestyle_amenities TEXT,
    faqs TEXT,
    hero_image_url TEXT,
    hero_image_alt TEXT,
    source_site TEXT DEFAULT 'market_info_csv',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(city, state_code)
);

CREATE UNIQUE INDEX IF NOT EXISTS market_pages_lower_city_state_code_idx ON market_pages (LOWER(city), state_code);

ALTER TABLE market_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read market_pages" ON market_pages;
CREATE POLICY "Public can read market_pages" ON market_pages
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can write market_pages" ON market_pages;
CREATE POLICY "Service role can write market_pages" ON market_pages
    FOR ALL USING (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS update_market_pages_updated_at ON market_pages;
CREATE TRIGGER update_market_pages_updated_at BEFORE UPDATE ON market_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP POLICY IF EXISTS "Public can read market page media" ON storage.objects;
CREATE POLICY "Public can read market page media" ON storage.objects
    FOR SELECT USING (bucket_id = 'market-page-media');

DROP POLICY IF EXISTS "Service role can manage market page media" ON storage.objects;
CREATE POLICY "Service role can manage market page media" ON storage.objects
    FOR ALL USING (
        auth.role() = 'service_role'
        AND bucket_id = 'market-page-media'
    )
    WITH CHECK (
        auth.role() = 'service_role'
        AND bucket_id = 'market-page-media'
    );
