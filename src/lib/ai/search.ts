// AI-Powered Search Functions
// Combines vector similarity with traditional filters

import { createClient } from '@/lib/supabase/server'
import { generateTextEmbedding, generateCommunityEmbedding } from './openai'
import { generateImageEmbeddingFromUrl, generateImageEmbeddingFromFile } from './clip'
import type { CommunitySearchResult, ImageSearchResult } from '@/lib/db/schema'

export interface SearchFilters {
  stateCode?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  maxBedrooms?: number
  status?: string
}

/**
 * Semantic search for communities using natural language
 * Uses OpenAI embeddings + pgvector cosine similarity
 */
export async function searchCommunitiesSemantic(
  query: string,
  filters: SearchFilters = {},
  options: {
    threshold?: number
    limit?: number
    useLargeModel?: boolean
  } = {}
): Promise<CommunitySearchResult[]> {
  const { threshold = 0.7, limit = 20, useLargeModel = false } = options

  try {
    // Generate embedding for query
    const embedding = useLargeModel
      ? await generateTextEmbedding(query)
      : await generateTextEmbedding(query)

    const supabase = await createClient()

    // Call the database function for semantic search
    const { data, error } = await (supabase.rpc as any)('search_communities', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit,
      p_state_code: filters.stateCode || null,
      p_city: filters.city || null,
      p_min_price: filters.minPrice || null,
      p_max_price: filters.maxPrice || null,
    })

    if (error) {
      console.error('Search error:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Semantic search failed:', error)
    throw error
  }
}

/**
 * Hybrid search combining vector similarity with text search
 */
export async function searchCommunitiesHybrid(
  query: string,
  options: {
    limit?: number
  } = {}
): Promise<CommunitySearchResult[]> {
  const { limit = 20 } = options

  try {
    const embedding = await generateTextEmbedding(query)
    const supabase = await createClient()

    const { data, error } = await (supabase.rpc as any)('search_communities_hybrid', {
      query_text: query,
      query_embedding: embedding,
      match_count: limit,
    })

    if (error) {
      console.error('Hybrid search error:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Hybrid search failed:', error)
    throw error
  }
}

/**
 * Image-based search using CLIP embeddings
 * Find communities with similar-looking homes
 */
export async function searchCommunitiesByImage(
  imageUrl: string | File,
  options: {
    limit?: number
    threshold?: number
  } = {}
): Promise<ImageSearchResult[]> {
  const { limit = 10, threshold = 0.75 } = options

  try {
    // Generate CLIP embedding from image
    let embedding: number[]
    if (typeof imageUrl === 'string') {
      embedding = await generateImageEmbeddingFromUrl(imageUrl)
    } else {
      embedding = await generateImageEmbeddingFromFile(imageUrl)
    }

    const supabase = await createClient()

    const { data, error } = await (supabase.rpc as any)('search_by_image', {
      query_embedding: embedding,
      match_count: limit,
      similarity_threshold: threshold,
    })

    if (error) {
      console.error('Image search error:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Image search failed:', error)
    throw error
  }
}

/**
 * Parse natural language query to extract filters
 * Uses simple keyword extraction (can be enhanced with OpenAI function calling)
 */
export function parseNaturalLanguageQuery(query: string): {
  cleanedQuery: string
  filters: SearchFilters
} {
  const filters: SearchFilters = {}
  let cleanedQuery = query

  // Extract price ranges
  const priceMatch = query.match(/(\$?\d+(?:k|K)?)\s*(?:-|to)\s*(\$?\d+(?:k|K)?)/)
  if (priceMatch) {
    const minPrice = parsePrice(priceMatch[1])
    const maxPrice = parsePrice(priceMatch[2])
    if (minPrice) filters.minPrice = minPrice
    if (maxPrice) filters.maxPrice = maxPrice
    cleanedQuery = cleanedQuery.replace(priceMatch[0], '')
  }

  // Extract single price (max budget)
  const budgetMatch = query.match(/(?:under|below|less than|max|\$)\s*(\d+(?:k|K)?)/i)
  if (budgetMatch && !filters.maxPrice) {
    const maxPrice = parsePrice(budgetMatch[1])
    if (maxPrice) filters.maxPrice = maxPrice
    cleanedQuery = cleanedQuery.replace(budgetMatch[0], '')
  }

  // Extract bedrooms
  const bedMatch = query.match(/(\d+)\s*(?:-|to)?\s*(\d*)\s*bed/i)
  if (bedMatch) {
    filters.minBedrooms = parseInt(bedMatch[1], 10)
    if (bedMatch[2]) {
      filters.maxBedrooms = parseInt(bedMatch[2], 10)
    }
    cleanedQuery = cleanedQuery.replace(bedMatch[0], '')
  }

  // Extract city/state (common patterns)
  const locationMatch = query.match(/in\s+([A-Za-z\s]+)(?:,\s*([A-Z]{2}))?/i)
  if (locationMatch) {
    const city = locationMatch[1].trim()
    const stateCode = locationMatch[2]
    if (city && city.length > 2) {
      filters.city = city
    }
    if (stateCode) {
      filters.stateCode = stateCode.toUpperCase()
    }
    cleanedQuery = cleanedQuery.replace(locationMatch[0], '')
  }

  return {
    cleanedQuery: cleanedQuery.trim() || query,
    filters,
  }
}

/**
 * Parse price string to number
 */
function parsePrice(priceStr: string): number | undefined {
  const cleaned = priceStr.replace(/[^0-9k]/gi, '')
  if (cleaned.toLowerCase().includes('k')) {
    return parseInt(cleaned.replace(/k/i, ''), 10) * 1000
  }
  const num = parseInt(cleaned, 10)
  return isNaN(num) ? undefined : num
}

/**
 * Smart search that chooses the best method based on query
 */
export async function smartSearch(
  query: string,
  options: {
    hasImage?: boolean
    imageUrl?: string
    limit?: number
  } = {}
): Promise<(CommunitySearchResult | ImageSearchResult)[]> {
  const { hasImage, imageUrl, limit = 20 } = options

  // If image provided, do image search
  if (hasImage && imageUrl) {
    return searchCommunitiesByImage(imageUrl, { limit })
  }

  // Parse query for filters
  const { cleanedQuery, filters } = parseNaturalLanguageQuery(query)

  // If filters detected, use semantic search with filters
  if (Object.keys(filters).length > 0) {
    return searchCommunitiesSemantic(cleanedQuery, filters, { limit })
  }

  // Otherwise use hybrid search for best results
  return searchCommunitiesHybrid(cleanedQuery, { limit })
}

/**
 * Log search query for analytics
 */
export async function logSearchQuery(
  query: string,
  queryType: 'text' | 'image' | 'hybrid',
  resultsCount: number,
  filters?: SearchFilters
): Promise<void> {
  try {
    const supabase = await createClient()
    
    // Generate embedding for the query (for future analysis)
    let embedding: number[] | null = null
    if (queryType === 'text' || queryType === 'hybrid') {
      try {
        embedding = await generateTextEmbedding(query)
      } catch {
        // Non-blocking
      }
    }

    await (supabase.from('search_queries') as any).insert({
      query_text: query,
      query_embedding: embedding,
      query_type: queryType,
      filters: filters || {},
      results_count: resultsCount,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
    })
  } catch (error) {
    // Non-blocking - don't fail search if logging fails
    console.error('Failed to log search:', error)
  }
}
