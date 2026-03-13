-- ============================================
-- Migration 002: Builder Markets & Stats View
-- Adds market-specific builder descriptions and community counts
-- ============================================

-- 1. Create the content override table
CREATE TABLE builder_markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID REFERENCES builders(id) ON DELETE CASCADE,
    city TEXT NOT NULL,
    state_code TEXT NOT NULL,
    local_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(builder_id, city, state_code)
);

-- Enable RLS for builder_markets
ALTER TABLE builder_markets ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Public can read builder_markets" ON builder_markets FOR SELECT USING (true);

-- Only service role can write
CREATE POLICY "Service role can write builder_markets" ON builder_markets 
    FOR ALL USING (auth.role() = 'service_role');

-- Trigger to auto-update updated_at
CREATE TRIGGER update_builder_markets_updated_at BEFORE UPDATE ON builder_markets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Create the Real-Time View for the Frontend Market Pages
CREATE OR REPLACE VIEW market_builder_stats AS
SELECT 
    b.id as builder_id,
    b.name as builder_name,
    b.slug as builder_slug,
    b.logo_url,
    b.is_premium,
    c.city,
    c.state_code,
    COUNT(c.id) as community_count,
    COALESCE(bm.local_description, b.description) as display_description
FROM builders b
JOIN communities c ON c.builder_id = b.id
LEFT JOIN builder_markets bm ON 
    bm.builder_id = b.id AND 
    LOWER(bm.city) = LOWER(c.city) AND 
    LOWER(bm.state_code) = LOWER(c.state_code)
WHERE c.status IN ('selling', 'coming_soon', 'closeout')
GROUP BY 
    b.id, b.name, b.slug, b.logo_url, b.is_premium, b.description, 
    c.city, c.state_code, bm.local_description;

-- Grant access to the view
GRANT SELECT ON market_builder_stats TO anon, authenticated, service_role;
