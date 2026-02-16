import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import * as cheerio from 'cheerio'
import { ScraperConfig, ScrapeResult, ScrapeError } from './types'
import { getRandomUserAgent, randomDelay, withRetry, RequestQueue } from './utils'

/**
 * Base scraper class with ethical scraping practices
 */
export abstract class BaseScraper {
  protected config: ScraperConfig
  protected client: AxiosInstance
  protected requestQueue: RequestQueue
  protected requestCount: number = 0
  protected startTime: number = 0
  protected errors: ScrapeError[] = []

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = {
      name: config.name || 'BaseScraper',
      baseUrl: config.baseUrl || '',
      delayMin: config.delayMin || 1500,
      delayMax: config.delayMax || 3500,
      maxRequestsPerMinute: config.maxRequestsPerMinute || 15,
      respectRobotsTxt: config.respectRobotsTxt !== false,
      userAgent: config.userAgent || getRandomUserAgent(),
    }

    this.requestQueue = new RequestQueue(
      (60 / this.config.maxRequestsPerMinute) * 1000
    )

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000,
      headers: {
        'User-Agent': this.config.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      },
    })

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        this.requestCount++
        return response
      },
      (error) => {
        this.requestCount++
        return Promise.reject(error)
      }
    )
  }

  /**
   * Initialize scraper
   */
  protected async init(): Promise<void> {
    this.startTime = Date.now()
    this.requestCount = 0
    this.errors = []
    
    // Respectful delay before starting
    await randomDelay(1000, 2000)
  }

  /**
   * Make HTTP request with rate limiting and retries
   */
  protected async fetch(url: string, config?: AxiosRequestConfig): Promise<string> {
    return this.requestQueue.enqueue(async () => {
      // Random delay before request
      await randomDelay(this.config.delayMin, this.config.delayMax)
      
      try {
        const response = await withRetry(
          () => this.client.get(url, config),
          3,
          2000
        )
        return response.data
      } catch (error) {
        this.errors.push({
          url,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
        })
        throw error
      }
    })
  }

  /**
   * Load HTML into cheerio
   */
  protected async fetchCheerio(url: string, config?: AxiosRequestConfig): Promise<cheerio.CheerioAPI> {
    const html = await this.fetch(url, config)
    return cheerio.load(html)
  }

  /**
   * Log scraping progress
   */
  protected log(message: string, ...args: unknown[]): void {
    console.log(`[${this.config.name}] ${message}`, ...args)
  }

  /**
   * Get scrape metadata
   */
  protected getMeta() {
    return {
      duration: Date.now() - this.startTime,
      requestsMade: this.requestCount,
      rateLimited: this.requestCount >= this.config.maxRequestsPerMinute,
    }
  }

  /**
   * Build result object
   */
  protected buildResult<T>(data: T[]): ScrapeResult<T> {
    return {
      data,
      errors: this.errors,
      meta: this.getMeta(),
    }
  }

  /**
   * Clean up resources
   */
  protected async cleanup(): Promise<void> {
    // Add any cleanup logic here
  }

  /**
   * Check if URL is valid
   */
  protected isValidUrl(url: string): boolean {
    try {
      new URL(url, this.config.baseUrl)
      return true
    } catch {
      return false
    }
  }

  /**
   * Resolve relative URL to absolute
   */
  protected resolveUrl(url: string): string {
    try {
      return new URL(url, this.config.baseUrl).href
    } catch {
      return url
    }
  }

  /**
   * Extract image URLs from page
   */
  protected extractImages($: cheerio.CheerioAPI, selector: string): string[] {
    const images: string[] = []
    $(selector).each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src')
      if (src) {
        images.push(this.resolveUrl(src))
      }
    })
    return [...new Set(images)].filter(url => 
      url.match(/\.(jpg|jpeg|png|webp)(\?.*)?$/i)
    )
  }

  /**
   * Wait for specified duration
   */
  protected async wait(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms))
  }
}
