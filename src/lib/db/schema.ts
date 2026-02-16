import { z } from 'zod'

// ============================================
// Zod Schemas for Database Validation
// ============================================

export const BuilderSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  logo_url: z.string().url().nullable(),
  website: z.string().url().nullable(),
  phone: z.string().nullable(),
  email: z.string().email().nullable(),
  year_founded: z.number().int().nullable(),
  headquarters: z.string().nullable(),
  rating: z.number().min(0).max(5).nullable(),
  review_count: z.number().int().default(0),
  is_verified: z.boolean().default(false),
  is_premium: z.boolean().default(false),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  source_url: z.string().url().nullable(),
  source_site: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const CommunitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  builder_id: z.string().uuid(),
  description: z.string().nullable(),
  description_embedding: z.array(z.number()).nullable(),
  address: z.string().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  state_code: z.string().length(2),
  zip_code: z.string().nullable(),
  county: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  min_price: z.number().int().nullable(),
  max_price: z.number().int().nullable(),
  price_per_sqft: z.number().int().nullable(),
  min_bedrooms: z.number().int().nullable(),
  max_bedrooms: z.number().int().nullable(),
  min_bathrooms: z.number().nullable(),
  max_bathrooms: z.number().nullable(),
  min_sqft: z.number().int().nullable(),
  max_sqft: z.number().int().nullable(),
  images: z.array(z.string().url()).nullable(),
  image_embeddings: z.array(z.array(z.number())).nullable(),
  home_count: z.number().int().default(0),
  total_homes: z.number().int().nullable(),
  amenities: z.array(z.string()).nullable(),
  home_types: z.array(z.string()).nullable(),
  status: z.enum(['coming_soon', 'selling', 'sold_out', 'closeout']),
  year_established: z.number().int().nullable(),
  school_district: z.string().nullable(),
  elementary_school: z.string().nullable(),
  middle_school: z.string().nullable(),
  high_school: z.string().nullable(),
  hoa_fees: z.number().int().nullable(),
  hoa_frequency: z.string().nullable(),
  property_tax_rate: z.number().nullable(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  source_url: z.string().url().nullable(),
  source_site: z.string().nullable(),
  last_scraped: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const HomeSchema = z.object({
  id: z.string().uuid(),
  community_id: z.string().uuid(),
  name: z.string().nullable(),
  address: z.string().nullable(),
  base_price: z.number().int().nullable(),
  max_price: z.number().int().nullable(),
  bedrooms: z.number().int().nullable(),
  bathrooms: z.number().nullable(),
  half_bathrooms: z.number().nullable(),
  sqft: z.number().int().nullable(),
  stories: z.number().int().nullable(),
  garage_spaces: z.number().int().nullable(),
  garage_type: z.string().nullable(),
  description: z.string().nullable(),
  description_embedding: z.array(z.number()).nullable(),
  images: z.array(z.string().url()).nullable(),
  image_embeddings: z.array(z.array(z.number())).nullable(),
  floor_plan_url: z.string().url().nullable(),
  virtual_tour_url: z.string().url().nullable(),
  video_url: z.string().url().nullable(),
  features: z.array(z.string()).nullable(),
  included_upgrades: z.array(z.string()).nullable(),
  status: z.enum(['available', 'under_contract', 'sold', 'coming_soon', 'model']),
  availability_date: z.string().date().nullable(),
  source_url: z.string().url().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// Insert schemas (without auto-generated fields)
export const BuilderInsertSchema = BuilderSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const CommunityInsertSchema = CommunitySchema.omit({
  id: true,
  description_embedding: true,
  image_embeddings: true,
  created_at: true,
  updated_at: true,
})

export const HomeInsertSchema = HomeSchema.omit({
  id: true,
  description_embedding: true,
  image_embeddings: true,
  created_at: true,
  updated_at: true,
})

// Types inferred from schemas
export type Builder = z.infer<typeof BuilderSchema>
export type Community = z.infer<typeof CommunitySchema>
export type Home = z.infer<typeof HomeSchema>

export type BuilderInsert = z.infer<typeof BuilderInsertSchema>
export type CommunityInsert = z.infer<typeof CommunityInsertSchema>
export type HomeInsert = z.infer<typeof HomeInsertSchema>

// Search result types
export interface CommunitySearchResult {
  id: string
  name: string
  city: string
  state_code: string
  min_price: number | null
  max_price: number | null
  description: string | null
  images: string[] | null
  similarity: number
}

export interface ImageSearchResult {
  id: string
  name: string
  city: string
  state_code: string
  min_price: number | null
  max_price: number | null
  images: string[] | null
  similarity: number
}

// Scraper input types
export interface ScrapedCommunity {
  name: string
  slug: string
  description?: string
  address?: string
  city: string
  state: string
  state_code: string
  zip_code?: string
  min_price?: number
  max_price?: number
  min_bedrooms?: number
  max_bedrooms?: number
  min_bathrooms?: number
  max_bathrooms?: number
  min_sqft?: number
  max_sqft?: number
  images: string[]
  home_count?: number
  amenities: string[]
  status: 'coming_soon' | 'selling' | 'sold_out' | 'closeout'
  source_url: string
  source_site: string
}

export interface ScrapedBuilder {
  name: string
  slug: string
  description?: string
  website?: string
  phone?: string
  headquarters?: string
  source_url: string
  source_site: string
}
