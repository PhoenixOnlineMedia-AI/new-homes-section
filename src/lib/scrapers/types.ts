// Scraper type definitions

export interface ScraperConfig {
  name: string
  baseUrl: string
  delayMin: number
  delayMax: number
  maxRequestsPerMinute: number
  respectRobotsTxt: boolean
  userAgent: string
}

export interface ScrapeResult<T> {
  data: T[]
  errors: ScrapeError[]
  meta: {
    duration: number
    requestsMade: number
    rateLimited: boolean
  }
}

export interface ScrapeError {
  url: string
  error: string
  timestamp: Date
}

export interface BuilderScrapeData {
  name: string
  slug: string
  description?: string
  website?: string
  phone?: string
  email?: string
  headquarters?: string
  logo_url?: string
  source_url: string
  source_site: string
}

export interface CommunityScrapeData {
  name: string
  slug: string
  description?: string
  address?: string
  city: string
  state: string
  state_code: string
  zip_code?: string
  county?: string
  latitude?: number
  longitude?: number
  min_price?: number
  max_price?: number
  price_per_sqft?: number
  min_bedrooms?: number
  max_bedrooms?: number
  min_bathrooms?: number
  max_bathrooms?: number
  min_sqft?: number
  max_sqft?: number
  images: string[]
  home_count: number
  total_homes?: number
  amenities: string[]
  home_types: string[]
  status: 'coming_soon' | 'selling' | 'sold_out' | 'closeout'
  school_district?: string
  hoa_fees?: number
  source_url: string
  source_site: string
}
