import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JsonLd } from '@/components/seo/JsonLd'
import { generateBreadcrumbSchema, generatePlaceSchema } from '@/components/seo/JsonLd'
import { BuilderCard } from '@/components/builders/BuilderCard'
import { US_STATES, APP_NAME, APP_URL } from '@/lib/constants'
import {
  MapPin,
  Building2,
  Home,
  ArrowRight,
  BedDouble,
  Bath,
  Maximize,
  School
} from 'lucide-react'

interface CityPageProps {
  params: Promise<{ state: string; city: string }>
}

// Generate metadata for the page
export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { state, city } = await params
  const stateInfo = US_STATES.find(s => s.slug === state.toLowerCase())

  if (!stateInfo) {
    return {}
  }

  const cityName = city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  const title = `New Homes in ${cityName}, ${stateInfo.code} | ${APP_NAME}`
  const description = `Find new construction homes in ${cityName}, ${stateInfo.name}. Browse communities, compare builders, view floor plans and pricing.`

  return {
    title,
    description,
    keywords: [
      `new homes ${cityName}`,
      `new construction ${cityName}`,
      `${cityName} home builders`,
      `${cityName} real estate`,
      `buy new home ${cityName} ${stateInfo.code}`,
    ],
    openGraph: {
      title,
      description,
      url: `${APP_URL}/${state}/${city}`,
    },
    alternates: {
      canonical: `/${state}/${city}`,
    },
  }
}

import { createClient } from '@/lib/supabase/server'

interface BuilderCount {
  builder_id: string
  builder_name: string
  builder_slug: string
  logo_url: string | null
  community_count: number
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function normalizeCityName(raw: string) {
  return toTitleCase(raw.replace(/\s+/g, ' ').trim())
}

function safeArray(arr: any): any[] {
  if (!arr) return []
  return Array.isArray(arr) ? arr : [arr]
}

export default async function CityPage({ params }: CityPageProps) {
  const { state, city } = await params
  const stateSlug = state.toLowerCase()
  const citySlug = city.toLowerCase()

  // Validate state
  const stateInfo = US_STATES.find(s => s.slug === stateSlug)
  if (!stateInfo) {
    notFound()
  }

  const cityName = citySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  const supabase = await createClient()

  const { data: communitiesData } = await supabase
    .from('communities')
    .select('*, builders(name, slug)')
    .or(`state.ilike.${stateInfo.name},state_code.ilike.${stateInfo.code},state.ilike.${stateInfo.code}`)
    .ilike('city', cityName)

  const communities: any[] = communitiesData || []

  // Fetch all builders exactly like the builder directory to find valid city matchers
  const { data: buildersData } = await supabase
    .from('builders')
    .select('*, communities(*), builder_markets(*)')

  const allBuilders: any[] = buildersData || []

  // Filter builders who are actually active in this city
  const cityBuilders = allBuilders.filter(b => {
    const rawCommunities = safeArray(b.communities)
    const rawBuilderMarkets = safeArray(b.builder_markets)
    
    // Check if any community matches this city & state
    const hasCommunity = rawCommunities.some((c: any) => 
      (c.city || '').toLowerCase() === cityName.toLowerCase() &&
      ((c.state_code || '').toUpperCase() === stateInfo.code.toUpperCase() || 
       (c.state || '').toUpperCase() === stateInfo.code.toUpperCase() ||
       (c.state || '').toUpperCase() === stateInfo.name.toUpperCase())
    )
    
    // Check if any builder_market matches this city & state
    const hasMarketOverride = rawBuilderMarkets.some((m: any) => 
      (m.city || '').toLowerCase() === cityName.toLowerCase() &&
      (m.state_code || '').toUpperCase() === stateInfo.code.toUpperCase()
    )
    
    return hasCommunity || hasMarketOverride
  }).map(b => {
    const rawBuilderMarkets = safeArray(b.builder_markets)
    // Check if there is an explicit override for this city
    const cityMarket = rawBuilderMarkets.find((m: any) => 
      (m.city || '').toLowerCase() === cityName.toLowerCase() &&
      (m.state_code || '').toUpperCase() === stateInfo.code.toUpperCase()
    )

    // Add a community count specifically for THIS city for sorting purposes
    const cityCommunityCount = safeArray(b.communities).filter((c: any) => 
      (c.city || '').toLowerCase() === cityName.toLowerCase() &&
      ((c.state_code || '').toUpperCase() === stateInfo.code.toUpperCase() ||
       (c.state || '').toUpperCase() === stateInfo.code.toUpperCase() ||
       (c.state || '').toUpperCase() === stateInfo.name.toUpperCase())
    ).length
    
    return { 
      ...b,
      cityCommunityCount,
      is_featured: cityMarket?.is_featured || false,
      sort_order: cityMarket?.sort_order ?? 9999
    }
  })

  // Sort by featured, then sort_order, then community count in this city
  cityBuilders.sort((a, b) => {
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
    return b.cityCommunityCount - a.cityCommunityCount
  })
  
  const databaseBuilders = cityBuilders.slice(0, 6).map(b => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    description: b.description || 'Dedicated home builder crafting quality communities.',
    logo: b.logo_url,
    rating: b.rating || 0,
    reviewCount: b.review_count || 0,
    isVerified: b.is_verified || false,
    isPremium: b.is_premium || false,
    headquarters: b.headquarters || 'USA',
    yearFounded: b.year_founded || new Date().getFullYear(),
    homesBuilt: 0,
    communitiesCount: b.cityCommunityCount,
    activeMarkets: Array.from(new Set([
      ...safeArray(b.communities).map((c: any) => c.state_code || c.state),
      ...safeArray(b.builder_markets).map((m: any) => m.state_code)
    ])).filter(Boolean) as string[],
    specialties: [],
    priceRange: { 
      min: 0, 
      max: 0, 
      label: 'Contact for Pricing' 
    },
    featuredCommunities: safeArray(b.communities)
      .filter((c:any) => 
        (c.city || '').toLowerCase() === cityName.toLowerCase() &&
        ((c.state_code || '').toUpperCase() === stateInfo.code.toUpperCase() ||
         (c.state || '').toUpperCase() === stateInfo.name.toUpperCase())
      )
      .slice(0, 2)
      .map((c: any) => ({
        name: c.name,
        city: c.city,
        state: c.state_code || stateInfo.code,
        image: c.images?.[0] || ''
      }))
  }))

  const totalHomes = communities.reduce((sum, c) => sum + (c.total_homes || c.home_count || 0), 0)

  // Extract other active cities in this state
  const otherCities = new Set<string>()
  allBuilders.forEach(b => {
    safeArray(b.communities).forEach((c: any) => {
      const cCity = normalizeCityName(c.city || '')
      const cState = (c.state_code || c.state || '').toUpperCase()
      if (cCity && cCity.toLowerCase() !== cityName.toLowerCase() && 
         (cState === stateInfo.code.toUpperCase() || cState === stateInfo.name.toUpperCase())) {
        otherCities.add(cCity)
      }
    })
    safeArray(b.builder_markets).forEach((m: any) => {
      const mCity = normalizeCityName(m.city || '')
      const mState = (m.state_code || '').toUpperCase()
      if (mCity && mCity.toLowerCase() !== cityName.toLowerCase() && mState === stateInfo.code.toUpperCase()) {
        otherCities.add(mCity)
      }
    })
  })

  // Format array and grab up to 10 sorted cities
  const nearbyCities = Array.from(otherCities).sort().slice(0, 10)

  const pageUrl = `${APP_URL}/${stateInfo.slug}/${citySlug}`

  // Generate structured data
  const breadcrumbData = generateBreadcrumbSchema([
    { name: 'Home', item: APP_URL },
    { name: stateInfo.name, item: `${APP_URL}/${stateInfo.slug}` },
    { name: cityName, item: pageUrl },
  ])

  const placeData = generatePlaceSchema({
    name: `New Homes in ${cityName}, ${stateInfo.code}`,
    description: `Find new construction homes and communities in ${cityName}, ${stateInfo.name}.`,
    address: '',
    city: cityName,
    state: stateInfo.code,
    zipCode: '',
    latitude: 0,
    longitude: 0,
    images: [`${APP_URL}/og-image.jpg`],
    url: pageUrl,
  })

  return (
    <>
      <JsonLd data={[breadcrumbData, placeData]} />

      <div className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <section className="bg-slate-900 text-white py-12 md:py-16">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="text-sm text-slate-400 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <Link href={`/${stateInfo.slug}`} className="hover:text-white transition-colors">
                {stateInfo.name}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">{cityName}</span>
            </nav>

            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                New Homes in {cityName}, {stateInfo.code}
              </h1>
              <p className="text-lg text-slate-300 mb-6">
                Explore {communities.length} new construction homes and
                communities in {cityName}. Compare builders, prices, and amenities
                to find your perfect home.
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm"><strong>{totalHomes > 0 ? totalHomes + '+' : 'New'}</strong> Homes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm"><strong>{communities.length}</strong> Communities</span>
                </div>
                <div className="flex items-center gap-2">
                  <School className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm"><strong>4</strong> School Districts</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Builders Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  Top Builders in {cityName}
                </h2>
                <p className="text-slate-600">
                  Discover top-rated builders and their exceptional communities
                </p>
              </div>
              <Button variant="outline" className="mt-4 md:mt-0" asChild>
                <Link href={`/markets/${stateInfo.slug}/builders`}>View All Builders <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>

            <div className="flex flex-col gap-6">
              {databaseBuilders.map((builder) => (
                <BuilderCard key={builder.slug} builder={builder} isAdmin={false} />
              ))}
              {databaseBuilders.length === 0 && (
                <p className="text-slate-500 text-center py-4">No builders found here yet.</p>
              )}
            </div>
          </div>
        </section>

        {/* Communities Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Communities in {cityName}
              </h2>
              <Button variant="outline" asChild>
                <Link href={`/${stateInfo.slug}/${citySlug}/search`}>View All</Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community: any) => (
                <Card key={community.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Image */}
                  <div className="relative h-48 bg-slate-200 flex items-center justify-center">
                    {community.images?.[0] ? (
                      <img src={community.images[0]} alt={community.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="h-12 w-12 text-slate-400" />
                    )}
                    <Badge className="absolute top-3 left-3 bg-emerald-600">
                      {community.home_count || 0} Homes
                    </Badge>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{community.name}</CardTitle>
                    <CardDescription>
                      By{' '}
                      {community.builders?.slug ? (
                        <Link
                          href={`/${stateInfo.slug}/${citySlug}/${community.builders.slug}`}
                          className="text-emerald-600 hover:underline"
                        >
                          {community.builders.name}
                        </Link>
                      ) : (
                        <span>{community.builders?.name || 'Unknown Builder'}</span>
                      )}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-xl font-semibold text-slate-900">
                      {community.min_price || community.max_price
                        ? `$${(community.min_price || 0).toLocaleString()} ${community.max_price ? `- $${community.max_price.toLocaleString()}` : '+'}`
                        : 'Pricing Unavailable'}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <BedDouble className="h-4 w-4" /> {community.min_bedrooms ? `${community.min_bedrooms}-${community.max_bedrooms || community.min_bedrooms}` : 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="h-4 w-4" /> {community.min_bathrooms ? `${community.min_bathrooms}-${community.max_bathrooms || community.min_bathrooms}` : 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize className="h-4 w-4" /> {community.min_sqft ? `${community.min_sqft.toLocaleString()}+ sqft` : 'N/A sqft'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {(community.amenities || []).slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button className="w-full mt-2" variant="outline" asChild>
                      <Link href={`/${stateInfo.slug}/${citySlug}/${community.builders?.slug || 'unknown'}/${community.slug}`}>
                        View Community
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {communities.length === 0 && (
                <p className="text-slate-500 col-span-3 text-center py-4">More communities coming soon.</p>
              )}
            </div>
          </div>
        </section>

        {/* Nearby Cities */}
        {nearbyCities.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Nearby Cities in {stateInfo.code}
              </h2>
  
              <div className="flex flex-wrap gap-3">
                {nearbyCities.map((nearbyCity) => (
                  <Link
                    key={nearbyCity}
                    href={`/${stateInfo.slug}/${toSlug(nearbyCity)}`}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-full hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                  >
                    {nearbyCity}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  )
}
