# Builder-Focused Site Restructuring Plan

## Executive Summary

Transform New Homes Section from a "home-first" search platform to a "builder-first" directory that helps home buyers discover and connect with quality builders, then explore their communities and home plans.

---

## Current vs. Proposed Information Architecture

### Current Flow
```
Homepage → Search/Filter → State → City → Builder → Community → Home
```

### Proposed Flow
```
Homepage → Builders Directory → Builder Profile → Markets → Communities → Home Plans
                        ↓
                   Search by Builder
                        ↓
              New Communities (Featured)
```

---

## Phase 1: Core Builder Infrastructure

### 1.1 New URL Structure

| Route | Purpose | Priority |
|-------|---------|----------|
| `/builders` | Main builder directory (NEW) | High |
| `/builders/[builderSlug]` | Builder profile page (REVAMP) | High |
| `/builders/[builderSlug]/markets` | Markets/regions served | High |
| `/builders/[builderSlug]/communities` | All communities | High |
| `/builders/[builderSlug]/communities/[communitySlug]` | Community detail | Medium |
| `/builders/[builderSlug]/home-plans` | All floor plans across communities | Medium |
| `/markets/[state]/[city]/builders` | Builders in specific market | High |
| `/new-communities` | Recently launched communities | Medium |

### 1.2 Enhanced Builder Profile Page

**New Sections:**
- **Hero Section**: Logo, tagline, years in business, rating, verification badge
- **About Builder**: Story, mission, building philosophy
- **Markets Served**: Interactive map of states/cities where they build
- **Community Types**: Single-family, townhomes, 55+, luxury
- **Featured Communities**: 3-6 highlighted communities with "View All"
- **Home Plan Gallery**: Popular floor plans across all communities
- **Why Choose [Builder]**: Unique selling propositions
- **Buyer Reviews**: Testimonials and ratings
- **Contact Builder**: Direct lead form (prominent)
- **Similar Builders**: Comparable builders in same markets

**Builder Data Model Additions:**
```typescript
interface Builder {
  // Existing fields...
  
  // New fields for builder focus
  tagline: string;
  buildingPhilosophy: string;
  yearsInBusiness: number;
  homesBuilt: number;
  communitiesActive: number;
  markets: Market[];
  specialties: ('single-family' | 'townhomes' | 'condos' | '55-plus' | 'luxury' | 'active-adult')[];
  priceRanges: {
    min: number;
    max: number;
    label: string;
  }[];
  uniqueFeatures: string[];
  warranty: {
    structural: string;
    workmanship: string;
    systems: string;
  };
  financingPartners: string[];
  customizationOptions: string;
  buildTimeEstimate: string;
  
  // Social proof
  awards: Award[];
  testimonials: Testimonial[];
  
  // Media
  videoUrl: string;
  virtualTourUrl: string;
  galleryImages: string[];
}
```

---

## Phase 2: Navigation & Homepage Redesign

### 2.1 New Main Navigation

```
[Logo]  Find Builders  [Dropdown]  New Communities  Markets  Home Plans  About
                ↓
        ┌─────────────────────────────────────────┐
        │ By Builder Name    By Market           │
        │ ─────────────────  ─────────────────   │
        │ • Lennar          • Texas             │
        │ • Taylor Morrison • Florida           │
        │ • DR Horton       • Arizona           │
        │ • Pulte Homes     • California        │
        │ • View All →      • View All Markets →│
        └─────────────────────────────────────────┘
```

### 2.2 Homepage Redesign

**New Hero Section:**
- Headline: "Discover America's Best Home Builders"
- Subheadline: "Browse top-rated builders, explore their communities, and find your dream home plan"
- Two search options:
  1. "Find a Builder" (primary)
  2. "Search Communities" (secondary)

**New Section: Featured Builders** (replaces Featured Communities)
- 6-8 builder cards with logo, rating, markets, home count
- "View All Builders" CTA

**New Section: New Communities** (just launched/coming soon)
- Recently added communities by featured builders
- "Coming Soon" badge for pre-construction

**Keep:** How It Works, Browse by State (renamed to "Browse Markets")

**New Section: Builder Spotlight**
- Rotating featured builder with:
  - Full-width image
  - Builder logo and tagline
  - Featured communities count
  - "Explore [Builder] Communities" CTA

---

## Phase 3: Builder Directory Experience

### 3.1 `/builders` - Main Directory

**Filters Sidebar:**
- Markets (multi-select states/cities)
- Community Type (check boxes)
- Price Range (slider)
- Builder Size (local, regional, national)
- Specialties (55+, luxury, green building, etc.)
- Rating (4.5+, 4.0+, etc.)
- Homes Ready Now toggle

**Builder Cards:**
- Builder logo
- Builder name + rating
- "Building in [X] markets" with state badges
- Featured community images (3 thumbnails)
- Price range indicator
- "[X] Communities • [Y] Home Plans Available"
- "View Profile" and "Contact" buttons

**Sort Options:**
- Featured (default)
- Highest Rated
- Most Communities
- Alphabetical
- Recently Added

### 3.2 Builder Comparison Tool (Future Enhancement)
- Compare up to 3 builders side-by-side
- Compare: prices, warranties, build times, customization options

---

## Phase 4: Community Presentation

### 4.1 Community Organization

**Within Builder Profile:**
```
[Builder Name] Communities

Filter: All | Selling Now | Coming Soon | Closeout
Sort: Newest | Price (Low-High) | Price (High-Low) | Name

┌─────────────────────────────────────────────┐
│ [Community Image]          Now Selling      │
│ Community Name                              │
│ [Location] • [School District]              │
│ From $XXX,XXX                               │
│ [3-5 bed] • [2-4 bath] • [1,800-3,200 sqft]│
│ [X] Homes Available                         │
│                                             │
│ [View Community] [Save]                     │
└─────────────────────────────────────────────┘
```

### 4.2 Community Detail Page

**URL:** `/builders/[builderSlug]/communities/[communitySlug]`

**Layout:**
- Image gallery (with community map)
- Community header with builder branding
- Quick specs (price, beds, baths, sqft)
- "Schedule a Tour" (prominent)
- "Contact Builder" form
- Community description
- Amenities grid
- School information
- Available home plans (tabs or cards)
- Location/map
- Nearby communities by same builder
- Nearby communities by other builders

---

## Phase 5: Home Plans Focus

### 5.1 Home Plans Gallery

**URL:** `/builders/[builderSlug]/home-plans`

- Grid of floor plans across all communities
- Filter by: beds, baths, stories, garage, sqft
- Sort by: price, sqft, beds
- Visual cards with:
  - Floor plan image
  - Plan name
  - Specs (bed/bath/sqft)
  - Starting price
  - Available in [X] communities

### 5.2 Home Plan Detail Page

**URL:** `/builders/[builderSlug]/home-plans/[planSlug]`

- Large floor plan image (zoomable)
- 3D tour embed (if available)
- Detailed specs table
- Included features list
- Available elevations/styles
- Communities where plan is available
- Starting price by community
- "Schedule Tour" of specific community

---

## Phase 6: Markets/Geographic Navigation

### 6.1 Market Pages

**URL:** `/markets/[state]/[city]/builders`

**Purpose:** Show all builders operating in a specific market

**Layout:**
- Market header (city, state, market stats)
- Map of builder locations
- Builder cards specific to this market
- Filter: All builders | National | Regional | Local
- Sort by: Featured | Most Communities | Rating

**Market Stats to Show:**
- Number of builders
- Number of active communities
- Price range in market
- Most popular builders

---

## Phase 7: SEO & Content Strategy

### 7.1 Priority Keywords

| Priority | Keyword Pattern | Example |
|----------|----------------|---------|
| High | [Builder] new homes | "Lennar new homes" |
| High | [Builder] [City] | "Lennar Austin" |
| High | [Builder] communities | "Taylor Morrison communities" |
| Medium | New home builders [City] | "New home builders Austin" |
| Medium | [Builder] floor plans | "DR Horton floor plans" |
| Medium | [Builder] reviews | "Pulte Homes reviews" |

### 7.2 Content Additions

**Builder Profile Pages Include:**
- Rich structured data (Organization, LocalBusiness)
- Open Graph optimized for social sharing
- Breadcrumb: Home > Builders > [Builder] > [Community]

**Meta Templates:**
```
Builders List: "Top New Home Builders | Browse [X] Builders | {APP_NAME}"
Builder Profile: "[Builder] New Homes | Communities in [Markets] | {APP_NAME}"
Builder Communities: "[Builder] Communities | [City], [State] | {APP_NAME}"
```

---

## Phase 8: Lead Generation & Builder Partnerships

### 8.1 Lead Forms

**Types:**
1. **General Contact** (existing)
2. **Contact Builder** (specific to builder)
3. **Schedule Tour** (specific to community)
4. **Request Info** (specific to floor plan)
5. **Builder Partnership Inquiry** (existing)

### 8.2 Builder Dashboard (Future)

Self-service portal for builder partners:
- Update community listings
- Upload new floor plans
- View lead analytics
- Manage photos and descriptions
- Respond to reviews

---

## Implementation Priority

### Sprint 1: Foundation (Week 1-2)
- [ ] Create `/builders` directory page
- [ ] Revamp builder profile page with new sections
- [ ] Update main navigation
- [ ] Update homepage hero and featured builders section

### Sprint 2: Community Integration (Week 3-4)
- [ ] Update community pages with builder branding
- [ ] Create builder community grid component
- [ ] Add market filtering to builders

### Sprint 3: Home Plans (Week 5-6)
- [ ] Create home plans gallery
- [ ] Create home plan detail page
- [ ] Link plans to communities

### Sprint 4: Markets (Week 7-8)
- [ ] Create market-specific builder pages
- [ ] Build market navigation
- [ ] Add market stats

### Sprint 5: Polish (Week 9-10)
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Analytics tracking

---

## Database Schema Updates

### New Tables

```sql
-- Builder markets (many-to-many)
CREATE TABLE builder_markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID REFERENCES builders(id),
    state_code TEXT NOT NULL,
    city TEXT NOT NULL,
    is_headquarters BOOLEAN DEFAULT false,
    communities_count INTEGER DEFAULT 0,
    UNIQUE(builder_id, state_code, city)
);

-- Builder testimonials
CREATE TABLE builder_testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID REFERENCES builders(id),
    author_name TEXT NOT NULL,
    author_location TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    testimonial TEXT NOT NULL,
    home_purchased TEXT,
    date DATE,
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false
);

-- Builder awards
CREATE TABLE builder_awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID REFERENCES builders(id),
    award_name TEXT NOT NULL,
    organization TEXT,
    year INTEGER,
    category TEXT,
    description TEXT
);

-- Floor plans (separate from homes)
CREATE TABLE floor_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID REFERENCES builders(id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    half_bathrooms DECIMAL(3,1),
    sqft INTEGER,
    stories INTEGER,
    garage_spaces INTEGER,
    garage_type TEXT,
    base_price INTEGER,
    images TEXT[],
    floor_plan_image TEXT,
    features TEXT[],
    is_featured BOOLEAN DEFAULT false,
    UNIQUE(builder_id, slug)
);

-- Community floor plans (many-to-many)
CREATE TABLE community_floor_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES communities(id),
    floor_plan_id UUID REFERENCES floor_plans(id),
    base_price INTEGER,
    lot_premium INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    available_homes_count INTEGER DEFAULT 0,
    UNIQUE(community_id, floor_plan_id)
);
```

---

## Success Metrics

| Metric | Baseline | Target (6 months) |
|--------|----------|-------------------|
| Builder profile page views | 0 | 5,000/month |
| Builders directory visits | 0 | 10,000/month |
| Builder contact form submissions | 0 | 200/month |
| Time on builder pages | N/A | 3+ minutes |
| Return visitor rate | N/A | 25% |
| Builder partnership inquiries | 5/month | 30/month |

---

## Next Steps

1. **Review this plan** - Get feedback and prioritize
2. **Update wireframes** - Design new builder-focused pages
3. **Database migration** - Add new tables and fields
4. **Begin Sprint 1** - Start with builders directory
5. **Builder outreach** - Contact top builders for partnership discussions

---

*This plan establishes New Homes Section as the premier directory for discovering and researching new home builders, while maintaining strong SEO value for community and home plan searches.*
