# NewHomeSource Data Acquisition Strategy

## Executive Summary

After researching NewHomeSource and its parent company BDX (Builders Digital Experience), here are the viable options for obtaining builder, community, and home plan data organized by market.

---

## 🚫 What Won't Work

### Direct Scraping of NewHomeSource
- **robots.txt** explicitly blocks scraping of:
  - `/builder/*` pages (AhrefsBot is blocked entirely from builders)
  - Search result pages with filters
  - Community data endpoints
  - AJAX/API endpoints that populate their site

- **Legal Risk**: BDX is a major data provider; unauthorized scraping could result in:
  - IP blocking
  - Legal action (Cease & Desist)
  - Damage to future partnership potential

---

## ✅ Viable Options (Ranked by Viability)

### Option 1: BDX API Partnership (RECOMMENDED)

**NewHomeSource is powered by BDX (Builders Digital Experience)**

| Aspect | Details |
|--------|---------|
| **API Available?** | Yes - `api.newhomesource.com` |
| **Data Format** | XML (NHlist schema), JSON |
| **Access Method** | Partnership/Contract required |
| **Cost** | $$ - $$$$ (Estimated $500-2000+/mo) |
| **Data Quality** | ⭐⭐⭐⭐⭐ Excellent |
| **Coverage** | National, all major builders |

**How to Get Access:**

1. **Contact BDX Sales**
   - Website: https://www.thebdx.com/
   - Email: info@thebdx.com
   - Phone: (512) 456-0505 (Austin HQ)

2. **What to Ask For:**
   - "Consumer Optix" API access
   - New home listing data feed
   - Builder directory data
   - Community & floor plan data

3. **Typical Requirements:**
   - Business verification
   - Data usage agreement
   - Monthly/annual contract
   - Per-builder or per-market pricing

**What You Get:**
- Complete builder profiles
- All active communities
- Floor plans & specifications
- Pricing & availability
- Photos & virtual tours
- Regular data updates (daily/weekly)

---

### Option 2: Manual CSV Upload System (MVP)

Build a system for manual data entry and bulk uploads while pursuing API access.

| Aspect | Details |
|--------|---------|
| **Setup Time** | 1-2 weeks |
| **Cost** | Free (your time) |
| **Data Quality** | Depends on source |
| **Coverage** | Limited to what you collect |

**Implementation:**

1. **Build Admin Interface**
   - CSV bulk upload for builders
   - CSV bulk upload for communities
   - CSV bulk upload for floor plans
   - Data validation & review

2. **Data Collection Sources**
   - Download from builder websites manually
   - Request data sheets from builder sales teams
   - Public MLS data (where available)
   - City permit data (new construction)

3. **CSV Template Structure**
```csv
builders.csv:
- name, slug, description, website, headquarters, year_founded, rating, markets

communities.csv:
- name, slug, builder_slug, address, city, state, zip, price_min, price_max, status

floor_plans.csv:
- name, slug, builder_slug, bedrooms, bathrooms, sqft, stories, base_price
```

---

### Option 3: Ethical Scraping (Limited Scope)

Scrape builder websites directly (not NewHomeSource), respecting robots.txt.

| Aspect | Details |
|--------|---------|
| **Setup Time** | 2-3 weeks |
| **Cost** | Server costs (~$50-100/mo) |
| **Data Quality** | ⭐⭐⭐ Good |
| **Coverage** | Limited to scraped builders |
| **Maintenance** | High (sites change) |

**Target Builders for Scraping:**
1. LGI Homes (lgi-homes.com)
2. Terrata Homes (terratahomes.com)
3. DR Horton (drhorton.com)
4. Lennar (lennar.com)
5. Taylor Morrison (taylormorrison.com)

**Challenges:**
- Each site has different structure
- Anti-bot protection
- Rate limiting
- Maintenance when sites redesign

**Recommended Approach:**
- Use Puppeteer/Playwright with stealth
- Rotate IP addresses
- Respect rate limits (1 request/second)
- Cache aggressively
- Monitor for changes

---

### Option 4: Alternative Data Providers

| Provider | Cost | Coverage | Notes |
|----------|------|----------|-------|
| **Zillow API** | Free tier | General real estate | Not new-home focused |
| **Realtor.com API** | Paid | General listings | Limited new construction |
| **Local MLS** | Varies by market | Regional | Need agent partnership |
| **BuildZoom** | Unknown | Contractors & permits | Good for new construction discovery |
| **SmartZip** | $$ | Predictive analytics | Investor-focused |

---

## 🎯 Recommended Strategy

### Phase 1: Foundation (Week 1-2)
Build the infrastructure while pursuing partnerships.

1. **Create CSV upload system**
   - Admin interface for bulk data entry
   - Templates for builders, communities, plans
   - Data validation

2. **Contact BDX for API access**
   - Start partnership discussions
   - Get pricing and terms

3. **Manual data collection**
   - Start with 3-5 priority builders
   - Focus on 1-2 markets (Austin, Phoenix)
   - Download public data from builder websites

### Phase 2: Data Population (Week 3-4)

1. **Populate initial data**
   - LGI Homes (priority partner)
   - Terrata Homes (priority partner)
   - 3-5 additional builders
   - 10-15 communities
   - 20-30 floor plans

2. **Build scrapers for top builders**
   - Focus on national builders with good websites
   - Extract community and plan data
   - Respect robots.txt and rate limits

### Phase 3: Automation (Week 5-8)

1. **Integrate BDX API** (if partnership secured)
   - Full data sync
   - Automated updates

2. **OR scale scraping**
   - Expand to more builders
   - Implement monitoring
   - Handle edge cases

---

## 📋 What I Need From You

### Immediate Actions Needed:

1. **BDX Contact** (Option 1 - RECOMMENDED)
   - [ ] Contact BDX sales: info@thebdx.com or (512) 456-0505
   - [ ] Ask about Consumer Optix API pricing
   - [ ] Request data sample

2. **Prioritize Markets**
   - Which 2-3 markets should we focus on first?
   - Suggestions: Austin TX, Phoenix AZ, Tampa FL

3. **Builder Priority List**
   - Beyond LGI and Terrata, which builders are most important?
   - Should we focus on national or regional builders?

4. **Budget Decision**
   - Are you willing to pay for BDX API access?
   - Estimated: $500-2000/month depending on coverage

### What I Can Build Now (Regardless):

1. ✅ CSV upload system for admin
2. ✅ Database schema for all entities
3. ✅ Admin dashboard for data management
4. ✅ Basic scraper framework
5. ✅ Manual data entry forms

---

## 🏗️ Technical Implementation

### Database Schema Ready

The schema I designed supports:
- Builders with markets
- Communities with geo-location
- Floor plans with specs
- Available homes (quick move-in)
- Data source tracking
- Sync status monitoring

### Scraping Framework

I can build:
- Puppeteer-based scraper with stealth
- Proxy rotation
- Rate limiting
- Change detection
- Error handling & retries

---

## 💡 Alternative Idea: Builder Partnership Program

While building the data ingestion, simultaneously:

1. **Create a "Partner With Us" page**
2. **Reach out to builder marketing teams**
3. **Offer free listing in exchange for data feed**
4. **Position as marketing channel**

Many builders will provide data if it generates leads.

---

## Summary

| Option | Best For | Timeline | Cost |
|--------|----------|----------|------|
| **BDX API** | Long-term, scalable solution | 2-4 weeks to access | $$$ |
| **CSV Upload** | MVP, immediate launch | 1 week | Free |
| **Scraping** | Bridge solution | 2-3 weeks | $$ |
| **Hybrid** | Most realistic | 2-4 weeks | $$ |

**My Recommendation:** 
1. Start with CSV upload system (immediate)
2. Contact BDX for API access (parallel)
3. Build limited scrapers for priority builders
4. Launch MVP with 5-10 builders
5. Scale with API when available

What would you like to proceed with?
