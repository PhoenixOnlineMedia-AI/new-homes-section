import { setTimeout } from 'timers/promises'

// Ethical scraping utilities

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
]

/**
 * Get a random user agent
 */
export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

/**
 * Random delay between min and max milliseconds
 */
export async function randomDelay(minMs: number, maxMs: number): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
  await setTimeout(delay)
}

/**
 * Convert string price to number
 * e.g., "$450,000" -> 450000
 */
export function parsePrice(priceStr: string): number | undefined {
  if (!priceStr) return undefined
  const cleaned = priceStr.replace(/[^0-9]/g, '')
  const num = parseInt(cleaned, 10)
  return isNaN(num) ? undefined : num
}

/**
 * Parse price range string
 * e.g., "$350K - $550K" -> { min: 350000, max: 550000 }
 */
export function parsePriceRange(rangeStr: string): { min?: number; max?: number } {
  if (!rangeStr) return {}
  
  // Handle "From $XXX" format
  if (rangeStr.toLowerCase().includes('from')) {
    const price = parsePrice(rangeStr)
    return { min: price }
  }
  
  // Handle range with dash
  const parts = rangeStr.split(/[-–]/)
  if (parts.length === 2) {
    return {
      min: parsePrice(parts[0]),
      max: parsePrice(parts[1]),
    }
  }
  
  // Single price
  const price = parsePrice(rangeStr)
  return price ? { min: price, max: price } : {}
}

/**
 * Create URL-friendly slug
 */
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Parse bedroom/bathroom range
 * e.g., "3-5" -> { min: 3, max: 5 }
 */
export function parseRange(rangeStr: string): { min?: number; max?: number } {
  if (!rangeStr) return {}
  
  const parts = rangeStr.split(/[-–]/)
  if (parts.length === 2) {
    const min = parseFloat(parts[0].trim())
    const max = parseFloat(parts[1].trim())
    return {
      min: isNaN(min) ? undefined : min,
      max: isNaN(max) ? undefined : max,
    }
  }
  
  const single = parseFloat(rangeStr.trim())
  return isNaN(single) ? {} : { min: single, max: single }
}

/**
 * Extract amenities from text
 */
export function extractAmenities(text: string): string[] {
  const commonAmenities = [
    'pool', 'gated', 'clubhouse', 'gym', 'fitness center', 'park', 'playground',
    'trails', 'walking trails', 'dog park', 'lake', 'tennis', 'basketball',
    'community garden', 'fire pit', 'picnic area', 'bbq', 'spa', 'hot tub',
    'business center', 'package locker', 'elevator', 'garage', 'covered parking',
  ]
  
  const textLower = text.toLowerCase()
  return commonAmenities.filter(amenity => textLower.includes(amenity))
}

/**
 * Clean HTML entities and extra whitespace
 */
export function cleanText(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Request queue for rate limiting
 */
export class RequestQueue {
  private lastRequestTime: number = 0
  private minDelay: number

  constructor(minDelayMs: number = 1500) {
    this.minDelay = minDelayMs
   }

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.minDelay) {
      await setTimeout(this.minDelay - timeSinceLastRequest)
    }
    
    this.lastRequestTime = Date.now()
    return fn()
  }
}

/**
 * Retry with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt)
        await setTimeout(delay)
      }
    }
  }
  
  throw lastError
}
