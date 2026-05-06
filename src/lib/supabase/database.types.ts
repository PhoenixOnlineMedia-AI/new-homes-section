/**
 * Supabase Database Types
 * 
 * This file contains TypeScript type definitions for your Supabase database.
 * When you generate types from your actual Supabase schema, replace this file.
 * 
 * To generate types from your Supabase project:
 * npx supabase gen types typescript --project-id your-project-id --schema public > src/lib/supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type BuilderRow = {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  website: string | null
  phone: string | null
  email: string | null
  year_founded: number | null
  headquarters: string | null
  rating: number | null
  review_count: number
  is_verified: boolean
  is_premium: boolean
  meta_title: string | null
  meta_description: string | null
  source_url: string | null
  source_site: string | null
  created_at: string
  updated_at: string
}

export type BuilderInsert = {
  id?: string
  name: string
  slug: string
  description?: string | null
  logo_url?: string | null
  website?: string | null
  phone?: string | null
  email?: string | null
  year_founded?: number | null
  headquarters?: string | null
  rating?: number | null
  review_count?: number
  is_verified?: boolean
  is_premium?: boolean
  meta_title?: string | null
  meta_description?: string | null
  source_url?: string | null
  source_site?: string | null
  created_at?: string
  updated_at?: string
}

export type BuilderUpdate = {
  id?: string
  name?: string
  slug?: string
  description?: string | null
  logo_url?: string | null
  website?: string | null
  phone?: string | null
  email?: string | null
  year_founded?: number | null
  headquarters?: string | null
  rating?: number | null
  review_count?: number
  is_verified?: boolean
  is_premium?: boolean
  meta_title?: string | null
  meta_description?: string | null
  source_url?: string | null
  source_site?: string | null
  created_at?: string
  updated_at?: string
}

export type CommunityRow = {
  id: string
  name: string
  slug: string
  builder_id: string
  description: string | null
  address: string | null
  city: string
  state: string
  state_code: string
  zip_code: string | null
  county: string | null
  latitude: number | null
  longitude: number | null
  min_price: number | null
  max_price: number | null
  price_per_sqft: number | null
  min_bedrooms: number | null
  max_bedrooms: number | null
  min_bathrooms: number | null
  max_bathrooms: number | null
  min_sqft: number | null
  max_sqft: number | null
  images: string[] | null
  home_count: number
  total_homes: number | null
  amenities: string[] | null
  home_types: string[] | null
  status: 'coming_soon' | 'selling' | 'sold_out' | 'closeout'
  year_established: number | null
  school_district: string | null
  elementary_school: string | null
  middle_school: string | null
  high_school: string | null
  hoa_fees: number | null
  hoa_frequency: string | null
  property_tax_rate: number | null
  meta_title: string | null
  meta_description: string | null
  source_url: string | null
  source_site: string | null
  last_scraped: string | null
  created_at: string
  updated_at: string
}

export type CommunityInsert = {
  id?: string
  name: string
  slug: string
  builder_id: string
  description?: string | null
  address?: string | null
  city: string
  state: string
  state_code: string
  zip_code?: string | null
  county?: string | null
  latitude?: number | null
  longitude?: number | null
  min_price?: number | null
  max_price?: number | null
  price_per_sqft?: number | null
  min_bedrooms?: number | null
  max_bedrooms?: number | null
  min_bathrooms?: number | null
  max_bathrooms?: number | null
  min_sqft?: number | null
  max_sqft?: number | null
  images?: string[] | null
  home_count?: number
  total_homes?: number | null
  amenities?: string[] | null
  home_types?: string[] | null
  status: 'coming_soon' | 'selling' | 'sold_out' | 'closeout'
  year_established?: number | null
  school_district?: string | null
  elementary_school?: string | null
  middle_school?: string | null
  high_school?: string | null
  hoa_fees?: number | null
  hoa_frequency?: string | null
  property_tax_rate?: number | null
  meta_title?: string | null
  meta_description?: string | null
  source_url?: string | null
  source_site?: string | null
  last_scraped?: string | null
  created_at?: string
  updated_at?: string
}

export type CommunityUpdate = {
  id?: string
  name?: string
  slug?: string
  builder_id?: string
  description?: string | null
  address?: string | null
  city?: string
  state?: string
  state_code?: string
  zip_code?: string | null
  county?: string | null
  latitude?: number | null
  longitude?: number | null
  min_price?: number | null
  max_price?: number | null
  price_per_sqft?: number | null
  min_bedrooms?: number | null
  max_bedrooms?: number | null
  min_bathrooms?: number | null
  max_bathrooms?: number | null
  min_sqft?: number | null
  max_sqft?: number | null
  images?: string[] | null
  home_count?: number
  total_homes?: number | null
  amenities?: string[] | null
  home_types?: string[] | null
  status?: 'coming_soon' | 'selling' | 'sold_out' | 'closeout'
  year_established?: number | null
  school_district?: string | null
  elementary_school?: string | null
  middle_school?: string | null
  high_school?: string | null
  hoa_fees?: number | null
  hoa_frequency?: string | null
  property_tax_rate?: number | null
  meta_title?: string | null
  meta_description?: string | null
  source_url?: string | null
  source_site?: string | null
  last_scraped?: string | null
  created_at?: string
  updated_at?: string
}

export type HomeRow = {
  id: string
  community_id: string
  name: string | null
  address: string | null
  base_price: number | null
  max_price: number | null
  bedrooms: number | null
  bathrooms: number | null
  half_bathrooms: number | null
  sqft: number | null
  stories: number | null
  garage_spaces: number | null
  garage_type: string | null
  description: string | null
  features: string[] | null
  included_upgrades: string[] | null
  images: string[] | null
  floor_plan_url: string | null
  virtual_tour_url: string | null
  video_url: string | null
  status: 'available' | 'under_contract' | 'sold' | 'coming_soon' | 'model'
  availability_date: string | null
  source_url: string | null
  created_at: string
  updated_at: string
}

export type HomeInsert = {
  id?: string
  community_id: string
  name?: string | null
  address?: string | null
  base_price?: number | null
  max_price?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  half_bathrooms?: number | null
  sqft?: number | null
  stories?: number | null
  garage_spaces?: number | null
  garage_type?: string | null
  description?: string | null
  features?: string[] | null
  included_upgrades?: string[] | null
  images?: string[] | null
  floor_plan_url?: string | null
  virtual_tour_url?: string | null
  video_url?: string | null
  status?: 'available' | 'under_contract' | 'sold' | 'coming_soon' | 'model'
  availability_date?: string | null
  source_url?: string | null
  created_at?: string
  updated_at?: string
}

export type HomeUpdate = {
  id?: string
  community_id?: string
  name?: string | null
  address?: string | null
  base_price?: number | null
  max_price?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  half_bathrooms?: number | null
  sqft?: number | null
  stories?: number | null
  garage_spaces?: number | null
  garage_type?: string | null
  description?: string | null
  features?: string[] | null
  included_upgrades?: string[] | null
  images?: string[] | null
  floor_plan_url?: string | null
  virtual_tour_url?: string | null
  video_url?: string | null
  status?: 'available' | 'under_contract' | 'sold' | 'coming_soon' | 'model'
  availability_date?: string | null
  source_url?: string | null
  created_at?: string
  updated_at?: string
}

export type BuilderMarketRow = {
  id: string
  builder_id: string
  city: string | null
  state_code: string
  local_description: string | null
  image_url: string | null
  is_featured: boolean | null
  sort_order: number | null
  created_at: string
  updated_at: string
}

export type BuilderMarketInsert = {
  id?: string
  builder_id: string
  city?: string | null
  state_code: string
  local_description?: string | null
  image_url?: string | null
  is_featured?: boolean | null
  sort_order?: number | null
  created_at?: string
  updated_at?: string
}

export type BuilderMarketUpdate = {
  id?: string
  builder_id?: string
  city?: string | null
  state_code?: string
  local_description?: string | null
  image_url?: string | null
  is_featured?: boolean | null
  sort_order?: number | null
  created_at?: string
  updated_at?: string
}

export type MarketPageRow = {
  id: string
  city: string
  state_code: string
  city_overview: string | null
  key_stats: string | null
  neighborhood_breakdown: string | null
  economy_job_market: string | null
  schools_education: string | null
  lifestyle_amenities: string | null
  faqs: string | null
  hero_image_url: string | null
  hero_image_alt: string | null
  source_site: string | null
  created_at: string
  updated_at: string
}

export type MarketPageInsert = {
  id?: string
  city: string
  state_code: string
  city_overview?: string | null
  key_stats?: string | null
  neighborhood_breakdown?: string | null
  economy_job_market?: string | null
  schools_education?: string | null
  lifestyle_amenities?: string | null
  faqs?: string | null
  hero_image_url?: string | null
  hero_image_alt?: string | null
  source_site?: string | null
  created_at?: string
  updated_at?: string
}

export type MarketPageUpdate = {
  id?: string
  city?: string
  state_code?: string
  city_overview?: string | null
  key_stats?: string | null
  neighborhood_breakdown?: string | null
  economy_job_market?: string | null
  schools_education?: string | null
  lifestyle_amenities?: string | null
  faqs?: string | null
  hero_image_url?: string | null
  hero_image_alt?: string | null
  source_site?: string | null
  created_at?: string
  updated_at?: string
}

export type MediaAssetRow = {
  id: string
  entity_type: 'builder' | 'builder_market' | 'market_page' | 'community' | 'home'
  entity_id: string
  bucket: string
  path: string
  public_url: string
  source_url: string | null
  original_filename: string | null
  title: string | null
  alt_text: string | null
  role: 'logo' | 'hero' | 'gallery' | 'floor_plan' | 'market'
  sort_order: number
  status: 'pending' | 'matched' | 'approved' | 'rejected'
  content_type: string | null
  size_bytes: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type MediaAssetInsert = {
  id?: string
  entity_type: 'builder' | 'builder_market' | 'market_page' | 'community' | 'home'
  entity_id: string
  bucket: string
  path: string
  public_url: string
  source_url?: string | null
  original_filename?: string | null
  title?: string | null
  alt_text?: string | null
  role?: 'logo' | 'hero' | 'gallery' | 'floor_plan' | 'market'
  sort_order?: number
  status?: 'pending' | 'matched' | 'approved' | 'rejected'
  content_type?: string | null
  size_bytes?: number | null
  created_by?: string | null
  created_at?: string
  updated_at?: string
}

export type MediaAssetUpdate = {
  id?: string
  entity_type?: 'builder' | 'builder_market' | 'market_page' | 'community' | 'home'
  entity_id?: string
  bucket?: string
  path?: string
  public_url?: string
  source_url?: string | null
  original_filename?: string | null
  title?: string | null
  alt_text?: string | null
  role?: 'logo' | 'hero' | 'gallery' | 'floor_plan' | 'market'
  sort_order?: number
  status?: 'pending' | 'matched' | 'approved' | 'rejected'
  content_type?: string | null
  size_bytes?: number | null
  created_by?: string | null
  created_at?: string
  updated_at?: string
}

// Supabase Database interface
export interface Database {
  public: {
    Tables: {
      builders: {
        Row: BuilderRow
        Insert: BuilderInsert
        Update: BuilderUpdate
      }
      communities: {
        Row: CommunityRow
        Insert: CommunityInsert
        Update: CommunityUpdate
      }
      homes: {
        Row: HomeRow
        Insert: HomeInsert
        Update: HomeUpdate
      }
      builder_markets: {
        Row: BuilderMarketRow
        Insert: BuilderMarketInsert
        Update: BuilderMarketUpdate
      }
      market_pages: {
        Row: MarketPageRow
        Insert: MarketPageInsert
        Update: MarketPageUpdate
      }
      media_assets: {
        Row: MediaAssetRow
        Insert: MediaAssetInsert
        Update: MediaAssetUpdate
      }
    }
    Views: {
      market_builder_stats: {
        Row: {
          builder_id: string
          builder_name: string
          builder_slug: string
          logo_url: string | null
          is_premium: boolean
          city: string
          state_code: string
          community_count: number
          display_description: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Export individual types for convenience
export type Builder = BuilderRow
export type Community = CommunityRow
export type Home = HomeRow
export type MarketPage = MarketPageRow
export type MediaAsset = MediaAssetRow
