import { MetadataRoute } from 'next'
import { APP_URL, POPULAR_STATES } from '@/lib/constants'

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

export default function sitemap(): MetadataRoute.Sitemap {
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
  POPULAR_STATES.forEach((state) => {
    routes.push({
      url: `${APP_URL}/${state.slug}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    })
  })

  // Add city pages
  sampleCities.forEach(({ state, city }) => {
    routes.push({
      url: `${APP_URL}/${state}/${city}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    })
  })

  return routes
}
