-- State-level editorial content for /builders/{state} and /{state}
-- City-level content remains in market_pages.

CREATE TABLE IF NOT EXISTS state_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_code TEXT NOT NULL UNIQUE,
    intro TEXT,
    key_stats TEXT,
    market_overview TEXT,
    builder_landscape TEXT,
    featured_cities TEXT,
    faqs TEXT,
    hero_image_url TEXT,
    hero_image_alt TEXT,
    meta_title TEXT,
    meta_description TEXT,
    source_site TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

GRANT SELECT ON state_pages TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON state_pages TO service_role;

CREATE UNIQUE INDEX IF NOT EXISTS state_pages_upper_state_code_idx
    ON state_pages (UPPER(state_code));

ALTER TABLE state_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read state_pages" ON state_pages;
CREATE POLICY "Public can read state_pages" ON state_pages
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can write state_pages" ON state_pages;
CREATE POLICY "Service role can write state_pages" ON state_pages
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS update_state_pages_updated_at ON state_pages;
CREATE TRIGGER update_state_pages_updated_at BEFORE UPDATE ON state_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
