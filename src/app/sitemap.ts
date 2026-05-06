import { MetadataRoute } from 'next'
import { APP_URL, US_STATES } from '@/lib/constants'
import { createAdminClient } from '@/lib/supabase/admin'

// Sample cities for sitemap (will come from Supabase in production)
const sampleCities = [
  { state: 'texas', city: 'austin' },
  { state: 'texas', city: 'houston' },
  { state: 'texas', city: 'dallas' },
  { state: 'florida', city: 'orlando' },
  { state: 'florida', city: 'tampa' },
  { state: 'california', city: 'los-angeles' },
  { state: 'arizona', city: 'phoenix' },
]

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    // Homepage
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // Builders directory (HIGH PRIORITY - builder focus)
    {
      url: `${APP_URL}/builders`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    // Search page
    {
      url: `${APP_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // Markets directory
    {
      url: `${APP_URL}/markets`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // Static pages
    {
      url: `${APP_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${APP_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${APP_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${APP_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Add state pages
  US_STATES.forEach((state) => {
    routes.push({
      url: `${APP_URL}/${state.slug}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    })
  })

  const cityRoutes = new Map(sampleCities.map(({ state, city }) => [`${state}/${city}`, { state, city }]))

  try {
    const supabase = createAdminClient()
    const [{ data: marketPagesData }, { data: communitiesData }] = await Promise.all([
      supabase.from('market_pages').select('city,state_code'),
      supabase.from('communities').select('city,state_code,state'),
    ])
    const marketPages = (marketPagesData || []) as unknown as { city: string | null; state_code: string | null }[]
    const communities = (communitiesData || []) as unknown as { city: string | null; state_code: string | null; state: string | null }[]

    for (const market of marketPages) {
      const stateInfo = US_STATES.find((state) => state.code.toUpperCase() === String(market.state_code || '').toUpperCase())
      const citySlug = toSlug(String(market.city || ''))
      if (stateInfo && citySlug) {
        cityRoutes.set(`${stateInfo.slug}/${citySlug}`, { state: stateInfo.slug, city: citySlug })
      }
    }

    for (const community of communities) {
      const stateInfo = US_STATES.find((state) => (
        state.code.toUpperCase() === String(community.state_code || community.state || '').toUpperCase() ||
        state.name.toUpperCase() === String(community.state || '').toUpperCase()
      ))
      const citySlug = toSlug(String(community.city || ''))
      if (stateInfo && citySlug) {
        cityRoutes.set(`${stateInfo.slug}/${citySlug}`, { state: stateInfo.slug, city: citySlug })
      }
    }
  } catch {
    // Keep the static fallback if the database is unavailable during sitemap generation.
  }

  // Add city pages
  cityRoutes.forEach(({ state, city }) => {
    routes.push({
      url: `${APP_URL}/${state}/${city}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    })
  })

  return routes
}
