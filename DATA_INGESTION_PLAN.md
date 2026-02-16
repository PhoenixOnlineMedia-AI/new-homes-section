# Data Ingestion & Aggregation Plan
## Builders, Communities & Home Plans by Market

---

## Executive Summary

To populate New Homes Section with comprehensive builder, community, and home plan data organized by market, we need a multi-source data ingestion system. This plan outlines the technical architecture, data sources, and implementation strategy.

---

## 1. Data Sources Strategy

### Tier 1: Direct Builder Partnerships (Primary)
**Best quality, most accurate, freshest data**

| Source | Data Format | Update Frequency | Priority |
|--------|-------------|------------------|----------|
| **Builder APIs** | REST/GraphQL | Real-time | Highest |
| **FTP/Data Feeds** | CSV, XML, JSON | Daily | High |
| **Manual Admin Portal** | Web UI | As needed | Medium |

**Target Builders (Priority Order):**
1. LGI Homes (featured partner)
2. Terrata Homes (featured partner)
3. Taylor Morrison
4. Lennar
5. DR Horton
6. Pulte Homes
7. Toll Brothers
8. KB Home
9. Regional builders (25-50 more)

### Tier 2: Real Estate Data Providers
**Aggregated data, good coverage**

| Provider | Coverage | Cost | Data Types |
|----------|----------|------|------------|
| **Zillow API** | National | Free tier | Communities, pricing |
| **Realtor.com API** | National | Paid | Builder listings |
| **NewHomeSource API** | New homes focus | Paid | Builders, communities |
| **Builders Digital Experience (BDX)** | Builder data | Paid | Comprehensive |

### Tier 3: Web Scraping (Gap Filler)
**For builders without feeds**

| Target | Method | Data Extracted | Legal Check |
|--------|--------|----------------|-------------|
| Builder websites | Structured scraping | Communities, plans, pricing | robots.txt review |
| Local MLS (RETS) | API access | Active listings | Agent partnerships |

---

## 2. Enhanced Data Model

### Core Entities

```typescript
// ============================================
// BUILDER (Enhanced)
// ============================================
interface Builder {
  id: string                    // UUID
  name: string
  slug: string                  // URL-friendly
  
  // Basic Info
  description: string
  tagline: string
  website: string
  yearFounded: number
  headquarters: {
    city: string
    state: string
    zipCode: string
  }
  
  // Contact
  phone: string
  email: string
  salesInquiryEmail: string
  partnershipContact: string
  
  // Status & Verification
  isVerified: boolean
  isPremium: boolean
  isActive: boolean
  alwaysFeatured: boolean       // LGI, Terrata, etc.
  verificationDate: Date
  
  // Ratings & Social Proof
  rating: number               // 1-5 aggregate
  reviewCount: number
  testimonials: Testimonial[]
  awards: Award[]
  
  // Markets (Many-to-Many)
  markets: BuilderMarket[]     // States/cities they build in
  
  // Business Details
  specialties: string[]        // ['affordable', 'luxury', '55+']
  buildTypes: string[]         // ['single-family', 'townhomes']
  priceRange: {
    min: number
    max: number
    currency: string
  }
  
  // Warranty & Services
  warranty: {
    structural: string         // "10 years"
    workmanship: string        // "2 years"
    systems: string            // "1 year"
  }
  customizationLevel: string   // "none", "limited", "full"
  buildTimeEstimate: string    // "6-8 months"
  
  // Media
  logoUrl: string
  heroImage: string
  galleryImages: string[]
  videoUrl: string
  virtualTourUrl: string
  
  // SEO
  metaTitle: string
  metaDescription: string
  
  // Data Source Tracking
  dataSource: string           // "api", "feed", "scraped", "manual"
  sourceUrl: string
  lastSyncedAt: Date
  syncStatus: "success" | "failed" | "pending"
  
  createdAt: Date
  updatedAt: Date
}

// ============================================
// MARKET (Geographic Hierarchy)
// ============================================
interface Market {
  id: string
  type: "state" | "msa" | "city" | "county" | "zip"
  
  // Location
  name: string
  slug: string
  stateCode: string
  stateName: string
  
  // Hierarchy
  parentId?: string           // e.g., city -> MSA
  
  // SEO/Display
  displayName: string         // "Austin-Round Rock MSA"
  shortName: string           // "Austin"
  
  // Statistics (computed)
  stats: {
    builderCount: number
    communityCount: number
    homeCount: number
    avgPrice: number
    priceRange: { min: number; max: number }
    avgSqft: number
  }
  
  // Geography
  boundaries?: GeoJSON
  centerLat: number
  centerLng: number
  
  // SEO
  description: string
  metaTitle: string
  metaDescription: string
  
  createdAt: Date
  updatedAt: Date
}

// Builder-Market Relationship
interface BuilderMarket {
  id: string
  builderId: string
  marketId: string
  
  // Market-specific info
  divisionName: string        // "LGI Homes - Texas Division"
  localPhone: string
  localAddress: string
  
  // Status
  isActive: boolean
  isHeadquarters: boolean
  
  // Stats
  communitiesCount: number
  homesDelivered: number
  
  // Sales Office
  salesOffice: {
    address: string
    phone: string
    hours: string
    isModelHome: boolean
  }
}

// ============================================
// COMMUNITY (Enhanced)
// ============================================
interface Community {
  id: string
  name: string
  slug: string
  
  // Relationships
  builderId: string
  builderMarketId: string     // Link to specific market presence
  
  // Location
  address: string
  city: string
  state: string
  stateCode: string
  zipCode: string
  county: string
  latitude: number
  longitude: number
  
  // Market Context
  marketId: string
  submarket?: string          // "North Austin", "West Phoenix"
  
  // Description
  description: string
  headline: string            // Marketing tagline
  
  // Status & Timeline
  status: "planning" | "preconstruction" | "selling" | "sold_out" | "closeout"
  salesOpenDate: Date
  estimatedCompletion: Date
  
  // Pricing
  priceRange: {
    min: number
    max: number
    label: string             // "$350K - $550K"
  }
  pricePerSqft: number
  
  // Home Types Available
  homeTypes: string[]         // ['single-family', 'townhomes']
  
  // Home Counts
  totalHomes: number
  homesAvailable: number
  homesSold: number
  
  // Specs Range
  specs: {
    bedrooms: { min: number; max: number }
    bathrooms: { min: number; max: number }
    sqft: { min: number; max: number }
    stories: number[]
    garageSpaces: number[]
  }
  
  // Amenities
  amenities: string[]         // ['pool', 'clubhouse', 'trails']
  amenitiesDescription: string
  
  // Schools
  schoolDistrict: string
  elementarySchool: string
  middleSchool: string
  highSchool: string
  schoolRatings: {
    elementary: number
    middle: number
    high: number
  }
  
  // HOA & Financial
  hoaFees: number
  hoaFrequency: "monthly" | "quarterly" | "annual"
  hoaAmenities: string[]
  propertyTaxRate: number
  melloRoos?: boolean         // CA-specific
  
  // Media
  images: {
    url: string
    caption: string
    type: "exterior" | "interior" | "amenity" | "aerial" | "site_plan"
    isPrimary: boolean
  }[]
  videos: {
    url: string
    type: "tour" | "drone" | "testimonial"
  }[]
  sitePlanUrl: string
  virtualTourUrl: string
  
  // AI Embeddings
  descriptionEmbedding: number[]    // OpenAI 1536-dim
  imageEmbeddings: number[][]       // CLIP 512-dim per image
  
  // Directions
  directions: string
  nearbyAmenities: {
    name: string
    type: string              // "shopping", "dining", "recreation"
    distance: number          // miles
    distanceText: string      // "2.5 miles"
  }[]
  
  // SEO
  metaTitle: string
  metaDescription: string
  
  // Data Source
  dataSource: string
  sourceUrl: string
  externalId: string          // Builder's internal ID
  lastSyncedAt: Date
  
  createdAt: Date
  updatedAt: Date
}

// ============================================
// FLOOR PLAN (Home Plans)
// ============================================
interface FloorPlan {
  id: string
  name: string
  slug: string
  
  // Relationships
  builderId: string
  
  // Description
  description: string
  tagline: string
  
  // Specs
  specs: {
    bedrooms: number
    bathrooms: number
    halfBathrooms: number
    sqft: number
    stories: number
    garageSpaces: number
    garageType: "attached" | "detached" | "carport"
  }
  
  // Dimensions
  dimensions: {
    width: number              // feet
    depth: number
    height?: number
  }
  
  // Pricing (varies by community)
  basePrice: number           // Starting at
  
  // Home Type
  type: "single-family" | "townhome" | "condo" | "duplex"
  
  // Features
  includedFeatures: string[]  // What's included in base price
  availableUpgrades: string[] // Optional upgrades
  
  // Layout
  roomCount: number
  hasStudy: boolean
  hasGameRoom: boolean
  hasMediaRoom: boolean
  hasBonusRoom: boolean
  hasCoveredPatio: boolean
  hasFireplace: boolean
  
  // Kitchen
  kitchenFeatures: string[]
  
  // Master Suite
  masterSuiteFeatures: string[]
  
  // Energy
  energyFeatures: string[]    // ['solar-ready', 'energy-star']
  hERSIndex?: number          // Energy efficiency score
  
  // Media
  images: {
    url: string
    caption: string
    type: "elevation" | "floor_plan" | "interior" | "exterior"
    isPrimary: boolean
  }[]
  floorPlanImage: string
  interactiveFloorPlanUrl: string
  virtualTourUrl: string
  videoUrl: string
  
  // AI Embeddings
  descriptionEmbedding: number[]
  
  // SEO
  metaTitle: string
  metaDescription: string
  
  // Data Source
  dataSource: string
  externalId: string
  lastSyncedAt: Date
  
  createdAt: Date
  updatedAt: Date
}

// Community-Floor Plan Relationship (with community-specific pricing)
interface CommunityFloorPlan {
  id: string
  communityId: string
  floorPlanId: string
  
  // Community-specific pricing
  basePrice: number
  lotPremium: number
  currentIncentives: string
  
  // Availability
  isAvailable: boolean
  availableHomesCount: number  // Quick move-in homes
  buildTimeEstimate: string    // "6-8 months"
  
  // Community-specific options
  elevationStyles: string[]    // ['Modern', 'Traditional', 'Craftsman']
  availableLots: number
}

// ============================================
// AVAILABLE HOME (Quick Move-In / Spec Homes)
// ============================================
interface AvailableHome {
  id: string
  
  // Relationships
  communityId: string
  floorPlanId: string
  communityFloorPlanId: string
  
  // Address
  address: string
  lotNumber: string
  
  // Status
  status: "available" | "under_contract" | "sold" | "reserved"
  
  // Pricing
  basePrice: number
  lotPremium: number
  optionsPrice: number
  totalPrice: number
  
  // Incentives
  currentIncentives: {
    description: string
    value: number
    expiresAt: Date
  }[]
  
  // Timeline
  completionDate: Date
  constructionStage: "foundation" | "framing" | "drywall" | "finishing" | "complete"
  
  // Features (specific to this home)
  elevation: string
  selectedOptions: string[]
  interiorFinishes: {
    cabinets: string
    countertops: string
    flooring: string
    paint: string
  }
  
  // Media
  photos: string[]
  
  // Data
  mlsNumber?: string
  externalId: string
  
  createdAt: Date
  updatedAt: Date
}


---

## 3. Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA INGESTION PIPELINE                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   SOURCES    │   │   INGESTION  │   │  PROCESSING  │   │   STORAGE    │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ 1. Builder APIs    │ 2. API Workers   │ 3. Data Transform │ 4. Supabase   │
│ 2. FTP Feeds       │ 3. Feed Workers  │ 4. Validation     │    (Primary)  │
│ 3. Scraped Data    │ 4. Queue System  │ 5. Enrichment     │               │
│ 4. Manual Entry    │                  │ 6. Deduplication  │ 5. Typesense  │
│                    │                  │                   │    (Search)   │
└────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              ADMIN & MONITORING                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Admin Portal│  │ Sync Status │  │ Data Quality│  │ Builder Dashboard   │ │
│  │             │  │ Dashboard   │  │ Reports     │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Primary DB** | Supabase PostgreSQL | Core data storage |
| **Search** | Typesense or Algolia | Fast search, filters, geo |
| **Queue** | Bull (Redis) or Inngest | Job processing |
| **API Workers** | Node.js/TypeScript | Data ingestion |
| **Admin UI** | Next.js + Shadcn | Data management |
| **Monitoring** | Vercel + Logflare | Logs, errors, metrics |

---

## 4. Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal: Database schema and basic ingestion infrastructure**

- [ ] Update Supabase schema with new tables
- [ ] Set up Bull queue for job processing
- [ ] Create base ingestion worker framework
- [ ] Build admin sync status dashboard
- [ ] Create API endpoint for manual sync triggers

**Tables to Create:**
```sql
-- Core tables (new)
- markets
- builder_markets
- floor_plans
- community_floor_plans
- available_homes

-- Sync tracking
- sync_jobs
- sync_logs
- data_sources
```

### Phase 2: Builder API Integrations (Week 3-4)
**Goal: Connect to first 2-3 builder APIs**

- [ ] Research and document LGI Homes API
- [ ] Research and document Terrata Homes data feed
- [ ] Build API adapter pattern (reusable)
- [ ] Implement LGI Homes ingestion
- [ ] Implement Terrata Homes ingestion
- [ ] Build error handling and retry logic

**Deliverable:** 2 builders with live data

### Phase 3: Data Feed Processing (Week 5-6)
**Goal: Support CSV/XML/JSON feeds**

- [ ] Build feed parser (CSV, XML, JSON)
- [ ] Create feed mapping configuration
- [ ] Implement field mapping UI
- [ ] Connect Lennar data feed
- [ ] Connect Taylor Morrison API
- [ ] Build feed validation and alerting

**Deliverable:** 4 builders with automated feeds

### Phase 4: Web Scraping (Week 7-8)
**Goal: Fill gaps for builders without feeds**

- [ ] Set up Puppeteer/Playwright infrastructure
- [ ] Build ethical scraping framework (respect robots.txt)
- [ ] Create scraper for DR Horton
- [ ] Create scraper for Pulte Homes
- [ ] Build change detection (only update changed data)
- [ ] Handle anti-bot measures responsibly

**Deliverable:** 6-8 builders with complete data

### Phase 5: Search & Discovery (Week 9-10)
**Goal: Make data discoverable by market**

- [ ] Set up Typesense search cluster
- [ ] Index builders by market
- [ ] Index communities with geo search
- [ ] Index floor plans
- [ ] Build market pages with live data
- [ ] Create builder market pages

**Deliverable:** Market-based search working

### Phase 6: Admin & Quality (Week 11-12)
**Goal: Data quality and builder self-service**

- [ ] Build admin dashboard for data review
- [ ] Create data quality scoring
- [ ] Implement duplicate detection
- [ ] Build builder portal (view only)
- [ ] Create data conflict resolution UI
- [ ] Set up automated sync monitoring

**Deliverable:** Production-ready system

---

## 5. What I Need From You

### Immediate Requirements

1. **Builder Contact Information**
   - Who should we contact at LGI Homes for API/data feed access?
   - Who should we contact at Terrata Homes?
   - Do you have existing relationships with any builders?

2. **Data Access**
   - Do you have any existing data feeds or APIs I should know about?
   - Are there any builder partnerships already in place?

3. **Priority Markets**
   - Which markets (cities/states) should we prioritize first?
   - Texas, Florida, Arizona? Others?

4. **Budget Considerations**
   - Are you open to paid data providers (BDX, etc.)?
   - What's the budget for data acquisition?

5. **Timeline**
   - What's your target launch date for the full system?
   - When do you need the first market live?

### Technical Decisions Needed

1. **Hosting Infrastructure**
   - Stay on Vercel + Supabase?
   - Need dedicated server for scraping workers?

2. **Search Provider**
   - Typesense (open source, self-hosted)
   - Algolia (paid, managed)
   - Meilisearch (alternative)

3. **Queue System**
   - Inngest (serverless, easy)
   - Bull + Redis (more control)
   - Supabase Queues (native)

4. **Admin Access**
   - Who needs access to the admin panel?
   - Do builders get their own login?

---

## 6. Quick Start Option

If you want to get started immediately while waiting for builder partnerships, I recommend:

### MVP Approach (2-3 weeks)

1. **Manual Data Entry System**
   - Admin UI to manually add builders
   - Bulk upload via CSV
   - Start with 5-10 top builders

2. **Scrape Public Data**
   - Ethically scrape builder websites
   - Focus on communities and pricing
   - 5-10 builders

3. **Launch with Limited Markets**
   - Austin, TX
   - Phoenix, AZ
   - Tampa, FL
   
This gives you a working product to show builders and investors while we build the automated pipeline.

---

## 7. Next Steps

1. **Review this plan** - Provide feedback on priorities
2. **Answer the questions** in "What I Need From You"
3. **Decide on MVP vs Full Implementation**
4. **I can start building the foundation immediately**

Which approach do you prefer?
- **Option A:** Full implementation (12 weeks)
- **Option B:** MVP first (2-3 weeks), then full system
- **Option C:** Start with specific builder (e.g., just LGI Homes)

What are your thoughts?
