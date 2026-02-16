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
    }
    Views: {
      [_ in never]: never
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
