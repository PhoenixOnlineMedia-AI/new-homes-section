import { BaseScraper } from './base'
import { CommunityScrapeData, BuilderScrapeData } from './types'
import { parsePriceRange, parseRange, createSlug, cleanText, extractAmenities } from './utils'
import * as cheerio from 'cheerio'

/**
 * NewHomesSource.com Scraper for Phoenix, AZ
 * Ethical scraping with delays and respectful rate limiting
 */
export class NewHomesSourceScraper extends BaseScraper {
  constructor() {
    super({
      name: 'NewHomesSource',
      baseUrl: 'https://www.newhomesource.com',
      delayMin: 2000,
      delayMax: 4000,
      maxRequestsPerMinute: 10,
      respectRobotsTxt: true,
    })
  }

  /**
   * Scrape communities in Phoenix, AZ
   * Target: ~20 communities for initial seed
   */
  async scrapePhoenixCommunities(limit: number = 20): Promise<CommunityScrapeData[]> {
    await this.init()
    this.log(`Starting Phoenix community scrape (limit: ${limit})`)

    const communities: CommunityScrapeData[] = []
    let page = 1
    let hasMore = true

    try {
      while (communities.length < limit && hasMore && page <= 3) {
        const pageCommunities = await this.scrapePage(page)
        
        if (pageCommunities.length === 0) {
          hasMore = false
        } else {
          communities.push(...pageCommunities)
          this.log(`Scraped page ${page}, got ${pageCommunities.length} communities (total: ${communities.length})`)
          page++
        }

        // Respectful delay between pages
        if (hasMore && communities.length < limit) {
          await this.wait(3000)
        }
      }
    } catch (error) {
      this.log('Error scraping communities:', error)
    }

    await this.cleanup()
    
    // Limit to requested amount
    const result = communities.slice(0, limit)
    this.log(`Completed: scraped ${result.length} Phoenix communities`)
    return result
  }

  /**
   * Scrape a single page of community results
   */
  private async scrapePage(pageNum: number): Promise<CommunityScrapeData[]> {
    const url = `/communityresults/phoenix-az?page=${pageNum}`
    const $ = await this.fetchCheerio(url)
    const communities: CommunityScrapeData[] = []

    // Each community card
    $('.community-card, [data-testid="community-card"], .result-card').each((_, el) => {
      try {
        const $card = $(el)
        
        // Extract basic info
        const name = $card.find('h2, .community-name, [data-testid="community-name"]').first().text().trim()
        if (!name) return

        const link = $card.find('a').first().attr('href') || ''
        const communityUrl = this.resolveUrl(link)
        
        // Builder name
        const builderName = $card.find('.builder-name, [data-testid="builder-name"]').text().trim()
        
        // Price range
        const priceText = $card.find('.price, [data-testid="price"]').text().trim()
        const priceRange = parsePriceRange(priceText)
        
        // Location
        const locationText = $card.find('.location, .address, [data-testid="location"]').text().trim()
        const cityMatch = locationText.match(/([^,]+),\s*AZ/i)
        const city = cityMatch ? cityMatch[1].trim() : 'Phoenix'
        
        // Specs
        const bedsText = $card.find('.beds, [data-testid="beds"]').text().trim()
        const beds = parseRange(bedsText)
        
        const bathsText = $card.find('.baths, [data-testid="baths"]').text().trim()
        const baths = parseRange(bathsText)
        
        const sqftText = $card.find('.sqft, [data-testid="sqft"]').text().trim()
        const sqft = parseRange(sqftText.replace(/[,\s]/g, ''))
        
        // Images
        const images: string[] = []
        $card.find('img').each((_, img) => {
          const src = $(img).attr('src') || $(img).attr('data-src')
          if (src) {
            const absoluteUrl = this.resolveUrl(src)
            if (absoluteUrl.match(/\.(jpg|jpeg|png|webp)(\?.*)?$/i)) {
              images.push(absoluteUrl)
            }
          }
        })
        
        // Status
        const statusText = $card.find('.status, .community-status').text().toLowerCase()
        let status: CommunityScrapeData['status'] = 'selling'
        if (statusText.includes('coming soon')) status = 'coming_soon'
        else if (statusText.includes('sold out')) status = 'sold_out'
        else if (statusText.includes('closeout')) status = 'closeout'
        
        // Description (from card teaser)
        const description = $card.find('.description, .teaser, [data-testid="description"]').text().trim()
        
        // Amenities
        const amenityText = $card.find('.amenities, .features').text()
        const amenities = extractAmenities(amenityText + ' ' + description)

        communities.push({
          name: cleanText(name),
          slug: createSlug(name),
          description: cleanText(description) || undefined,
          city: cleanText(city),
          state: 'Arizona',
          state_code: 'AZ',
          min_price: priceRange.min,
          max_price: priceRange.max,
          min_bedrooms: beds.min,
          max_bedrooms: beds.max,
          min_bathrooms: baths.min,
          max_bathrooms: baths.max,
          min_sqft: sqft.min,
          max_sqft: sqft.max,
          images: images.slice(0, 5), // Limit to 5 images
          home_count: 0, // Will be updated with detail scrape
          amenities,
          home_types: ['single_family'], // Default assumption
          status,
          source_url: communityUrl,
          source_site: 'newhomesource',
        })
      } catch (error) {
        this.log('Error parsing community card:', error)
      }
    })

    return communities
  }

  /**
   * Scrape detailed community page for more info
   */
  async scrapeCommunityDetail(url: string): Promise<Partial<CommunityScrapeData>> {
    const $ = await this.fetchCheerio(url)
    
    const details: Partial<CommunityScrapeData> = {}
    
    // Full description
    const description = $('.community-description, .description-full, [data-testid="description-full"]').text().trim()
    if (description) {
      details.description = cleanText(description)
    }
    
    // Home count
    const homeCountText = $('.home-count, .available-homes, [data-testid="home-count"]').text()
    const homeCountMatch = homeCountText.match(/(\d+)/)
    if (homeCountMatch) {
      details.home_count = parseInt(homeCountMatch[1], 10)
    }
    
    // Address
    const address = $('.address-full, [data-testid="address"]').text().trim()
    if (address) {
      details.address = cleanText(address)
    }
    
    // More amenities
    const amenityElements = $('.amenity-list li, .feature-list li, [data-testid="amenity"]')
    const amenities: string[] = []
    amenityElements.each((_, el) => {
      amenities.push($(el).text().trim())
    })
    if (amenities.length > 0) {
      details.amenities = amenities
    }
    
    // School district
    const schoolInfo = $('.school-district, [data-testid="school-district"]').text().trim()
    if (schoolInfo) {
      details.school_district = cleanText(schoolInfo)
    }
    
    return details
  }

  /**
   * Get builder info from community
   */
  extractBuilderFromCommunity(community: CommunityScrapeData, builderName: string): BuilderScrapeData {
    return {
      name: builderName,
      slug: createSlug(builderName),
      source_url: community.source_url,
      source_site: 'newhomesource',
    }
  }
}

// Export singleton instance
export const newHomesSourceScraper = new NewHomesSourceScraper()
