-- ============================================
-- NEW HOMES SECTION - INITIAL SCHEMA
-- With pgvector for AI-powered semantic search
-- ============================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- Builders Table
-- ============================================
CREATE TABLE builders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website TEXT,
    phone TEXT,
    email TEXT,
    year_founded INTEGER,
    headquarters TEXT,
    rating DECIMAL(3,2),
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    
    -- Source tracking
    source_url TEXT,
    source_site TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Communities Table (with embeddings)
-- ============================================
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    builder_id UUID REFERENCES builders(id) ON DELETE CASCADE,
    
    -- Description with AI embedding (OpenAI text-embedding-3-small = 1536 dims)
    description TEXT,
    description_embedding VECTOR(1536),
    
    -- Location
    address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    state_code TEXT NOT NULL,
    zip_code TEXT,
    county TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Pricing
    min_price INTEGER,
    max_price INTEGER,
    price_per_sqft INTEGER,
    
    -- Specs
    min_bedrooms INTEGER,
    max_bedrooms INTEGER,
    min_bathrooms DECIMAL(3,1),
    max_bathrooms DECIMAL(3,1),
    min_sqft INTEGER,
    max_sqft INTEGER,
    
    -- Media with CLIP embeddings for each image (512 dims)
    images TEXT[],
    image_embeddings VECTOR(512)[],
    
    -- Details
    home_count INTEGER DEFAULT 0,
    total_homes INTEGER,
    amenities TEXT[],
    home_types TEXT[],
    status TEXT CHECK (status IN ('coming_soon', 'selling', 'sold_out', 'closeout')),
    year_established INTEGER,
    
    -- Schools
    school_district TEXT,
    elementary_school TEXT,
    middle_school TEXT,
    high_school TEXT,
    
    -- Financial
    hoa_fees INTEGER,
    hoa_frequency TEXT,
    property_tax_rate DECIMAL(5,3),
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    
    -- Source
    source_url TEXT,
    source_site TEXT,
    last_scraped TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(city, state_code, slug)
);

-- ============================================
-- Homes/Floor Plans Table
-- ============================================
CREATE TABLE homes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    
    -- Basic info
    name TEXT,
    address TEXT,
    
    -- Pricing
    base_price INTEGER,
    max_price INTEGER,
    
    -- Specs
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    half_bathrooms DECIMAL(3,1),
    sqft INTEGER,
    stories INTEGER,
    garage_spaces INTEGER,
    garage_type TEXT,
    
    -- Description with embedding
    description TEXT,
    description_embedding VECTOR(1536),
    
    -- Media
    images TEXT[],
    image_embeddings VECTOR(512)[],
    floor_plan_url TEXT,
    virtual_tour_url TEXT,
    video_url TEXT,
    
    -- Features
    features TEXT[],
    included_upgrades TEXT[],
    
    -- Status
    status TEXT CHECK (status IN ('available', 'under_contract', 'sold', 'coming_soon', 'model')),
    availability_date DATE,
    
    -- Source
    source_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Search Queries Log (for analytics)
-- ============================================
CREATE TABLE search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    query_embedding VECTOR(1536),
    query_type TEXT CHECK (query_type IN ('text', 'image', 'hybrid')),
    filters JSONB,
    results_count INTEGER,
    user_agent TEXT,
    ip_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Vector similarity indexes (IVFFlat for approximate nearest neighbor)
CREATE INDEX ON communities USING ivfflat (description_embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON homes USING ivfflat (description_embedding vector_cosine_ops) WITH (lists = 100);

-- Location indexes
CREATE INDEX idx_communities_location ON communities(state_code, city);
CREATE INDEX idx_communities_state ON communities(state_code);

-- Price indexes
CREATE INDEX idx_communities_price ON communities(min_price, max_price);
CREATE INDEX idx_communities_status ON communities(status);
CREATE INDEX idx_communities_builder ON communities(builder_id);

-- Builder indexes
CREATE INDEX idx_builders_slug ON builders(slug);
CREATE INDEX idx_builders_verified ON builders(is_verified);

-- Full-text search (for hybrid search)
ALTER TABLE communities ADD COLUMN search_vector tsvector;

CREATE INDEX idx_communities_search ON communities USING GIN(search_vector);

CREATE OR REPLACE FUNCTION communities_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.amenities, ' '), '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER communities_search_vector_trigger
BEFORE INSERT OR UPDATE ON communities
FOR EACH ROW EXECUTE FUNCTION communities_search_vector_update();

-- ============================================
-- Updated At Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_builders_updated_at BEFORE UPDATE ON builders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_homes_updated_at BEFORE UPDATE ON homes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Vector Search Functions
-- ============================================

-- Semantic search for communities with filters
CREATE OR REPLACE FUNCTION search_communities(
    query_embedding VECTOR(1536),
    match_threshold FLOAT,
    match_count INT,
    p_state_code TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_min_price INT DEFAULT NULL,
    p_max_price INT DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    name TEXT,
    city TEXT,
    state_code TEXT,
    min_price INTEGER,
    max_price INTEGER,
    description TEXT,
    images TEXT[],
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.city,
        c.state_code,
        c.min_price,
        c.max_price,
        c.description,
        c.images,
        1 - (c.description_embedding <=> query_embedding) AS similarity
    FROM communities c
    WHERE 
        (p_state_code IS NULL OR c.state_code = p_state_code)
        AND (p_city IS NULL OR LOWER(c.city) = LOWER(p_city))
        AND (p_min_price IS NULL OR c.max_price >= p_min_price)
        AND (p_max_price IS NULL OR c.min_price <= p_max_price)
        AND 1 - (c.description_embedding <=> query_embedding) > match_threshold
    ORDER BY c.description_embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Hybrid search (combining vector similarity with text search)
CREATE OR REPLACE FUNCTION search_communities_hybrid(
    query_text TEXT,
    query_embedding VECTOR(1536),
    match_count INT DEFAULT 20
)
RETURNS TABLE(
    id UUID,
    name TEXT,
    city TEXT,
    state_code TEXT,
    min_price INTEGER,
    max_price INTEGER,
    description TEXT,
    images TEXT[],
    similarity FLOAT,
    text_rank FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.city,
        c.state_code,
        c.min_price,
        c.max_price,
        c.description,
        c.images,
        1 - (c.description_embedding <=> query_embedding) AS similarity,
        ts_rank(c.search_vector, plainto_tsquery('english', query_text)) AS text_rank
    FROM communities c
    WHERE 
        c.search_vector @@ plainto_tsquery('english', query_text)
        OR 1 - (c.description_embedding <=> query_embedding) > 0.7
    ORDER BY 
        (0.7 * (1 - (c.description_embedding <=> query_embedding))) + 
        (0.3 * ts_rank(c.search_vector, plainto_tsquery('english', query_text))) DESC
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Image similarity search using CLIP embeddings
CREATE OR REPLACE FUNCTION search_by_image(
    query_embedding VECTOR(512),
    match_count INT DEFAULT 10,
    similarity_threshold FLOAT DEFAULT 0.75
)
RETURNS TABLE(
    id UUID,
    name TEXT,
    city TEXT,
    state_code TEXT,
    min_price INTEGER,
    max_price INTEGER,
    images TEXT[],
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (c.id)
        c.id,
        c.name,
        c.city,
        c.state_code,
        c.min_price,
        c.max_price,
        c.images,
        1 - (ce.embedding <=> query_embedding) AS similarity
    FROM communities c,
    LATERAL unnest(c.image_embeddings) WITH ORDINALITY AS ce(embedding, idx)
    WHERE 1 - (ce.embedding <=> query_embedding) > similarity_threshold
    ORDER BY c.id, ce.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

ALTER TABLE builders ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE homes ENABLE ROW LEVEL SECURITY;

-- Public can read all
CREATE POLICY "Public can read builders" ON builders FOR SELECT USING (true);
CREATE POLICY "Public can read communities" ON communities FOR SELECT USING (true);
CREATE POLICY "Public can read homes" ON homes FOR SELECT USING (true);

-- Only authenticated service role can write
CREATE POLICY "Service role can write builders" ON builders 
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can write communities" ON communities 
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can write homes" ON homes 
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON TABLE builders IS 'Home builders with verified information and ratings';
COMMENT ON TABLE communities IS 'New home communities with AI embeddings for semantic search';
COMMENT ON TABLE homes IS 'Individual homes and floor plans within communities';
COMMENT ON COLUMN communities.description_embedding IS 'OpenAI text-embedding-3-small vector (1536 dimensions)';
COMMENT ON COLUMN communities.image_embeddings IS 'CLIP image embeddings array (512 dimensions each)';
