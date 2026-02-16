// ============================================
// Core Types for New Homes Section
// ============================================

export interface Location {
  id: string;
  city: string;
  state: string;
  stateCode: string;
  county: string;
  zipCodes: string[];
  slug: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface Builder {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  yearFounded: number | null;
  headquarters: string | null;
  rating: number | null;
  reviewCount: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  builderId: string;
  builder: Builder;
  description: string | null;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  zipCode: string;
  county: string;
  latitude: number;
  longitude: number;
  minPrice: number | null;
  maxPrice: number | null;
  minSqft: number | null;
  maxSqft: number | null;
  minBedrooms: number | null;
  maxBedrooms: number | null;
  minBathrooms: number | null;
  maxBathrooms: number | null;
  homeCount: number;
  amenities: string[];
  images: string[];
  status: 'coming_soon' | 'selling' | 'sold_out' | 'closeout';
  schoolDistrict: string | null;
  hoaFees: number | null;
  propertyTaxRate: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Home {
  id: string;
  communityId: string;
  community: Community;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  halfBathrooms: number | null;
  sqft: number;
  lotSize: number | null;
  stories: number | null;
  garageSpaces: number | null;
  yearBuilt: number | null;
  description: string | null;
  features: string[];
  images: string[];
  floorPlanUrl: string | null;
  virtualTourUrl: string | null;
  status: 'available' | 'under_contract' | 'sold' | 'coming_soon';
  mlsNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  location?: string;
  state?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minSqft?: number;
  maxSqft?: number;
  builder?: string;
  status?: Community['status'];
}

export interface SearchResult {
  communities: Community[];
  homes: Home[];
  builders: Builder[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// SEO Types
export interface JsonLdSchema {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}
