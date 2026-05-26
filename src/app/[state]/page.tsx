import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { JsonLd } from '@/components/seo/JsonLd'
import { generateBreadcrumbSchema, generatePlaceSchema } from '@/components/seo/JsonLd'
import { BuilderCard } from '@/components/builders/BuilderCard'
import { US_STATES, APP_NAME, APP_URL } from '@/lib/constants'
import {
  BarChart3,
  Building2,
  ArrowRight,
  Users
} from 'lucide-react'

// Valid states for static generation
const validStates = US_STATES.map(s => s.slug)

interface StatePageProps {
  params: Promise<{ state: string }>
}

// Generate metadata for the page
export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const { state } = await params
  const stateInfo = US_STATES.find(s => s.slug === state.toLowerCase())

  if (!stateInfo) {
    return {}
  }

  const supabase = await createClient()
  const { data: statePageData } = await supabase
    .from('state_pages')
    .select('meta_title,meta_description,intro')
    .eq('state_code', stateInfo.code)
    .maybeSingle()

  const statePage = statePageData as {
    meta_title: string | null
    meta_description: string | null
    intro: string | null
  } | null

  const title = statePage?.meta_title || `Homebuilders in ${stateInfo.name} (${stateInfo.code}) | ${APP_NAME}`
  const description = statePage?.meta_description || statePage?.intro || `Find verified new construction builders in ${stateInfo.name}. Browse state and city builder directories.`

  return {
    title,
    description,
    keywords: [
      `new construction ${stateInfo.name}`,
      `${stateInfo.name} home builders`,
      `${stateInfo.name} builders directory`,
    ],
    openGraph: {
      title,
      description,
      url: `${APP_URL}/builders/${stateInfo.slug}`,
    },
    alternates: {
      canonical: `/builders/${stateInfo.slug}`,
    },
  }
}

// Generate static paths for popular states
export function generateStaticParams() {
  return validStates.map((state) => ({ state }))
}

import { createClient } from '@/lib/supabase/server'

interface CityCount {
  name: string
  slug: string
  communityCount: number
  builderCount: number
}

type StatePageContent = {
  state_code: string
  intro: string | null
  key_stats: string | null
  market_overview: string | null
  builder_landscape: string | null
  featured_cities: string | null
  faqs: string | null
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

function parseKeyStats(value: string | null | undefined) {
  if (!value) return []

  const tokens = value
    .split('|')
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !/^:?-{3,}:?$/.test(token))

  if (tokens[0]?.toLowerCase() === 'metric' && tokens[1]?.toLowerCase() === 'value') {
    tokens.splice(0, 2)
  }

  const stats: { metric: string; value: string }[] = []
  for (let index = 0; index < tokens.length; index += 2) {
    const metric = tokens[index]
    const statValue = tokens[index + 1]
    if (metric && statValue) stats.push({ metric, value: statValue })
  }

  return stats
}

function textParagraphs(value: string | null | undefined) {
  if (!value) return []
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

export default async function StatePage({ params }: StatePageProps) {
  const { state } = await params
  const stateSlug = state.toLowerCase()

  // Validate state
  const stateInfo = US_STATES.find(s => s.slug === stateSlug)
  if (!stateInfo) {
    notFound()
  }

  const supabase = await createClient()

  const { data: statePageData } = await supabase
    .from('state_pages')
    .select('state_code,intro,key_stats,market_overview,builder_landscape,featured_cities,faqs')
    .eq('state_code', stateInfo.code)
    .maybeSingle()

  const statePage = statePageData as StatePageContent | null
  const stateStats = parseKeyStats(statePage?.key_stats)

  // Fetch true communities for this state. We can use `state_code` or `state` (Name). Let's use either that matches the current page.
  const { data: communitiesData } = await supabase
    .from('communities')
    .select('*, builders(name)')
    // Checking both state name and state code just in case dataset specifies either
    .or(`state.ilike.${stateInfo.name},state_code.ilike.${stateInfo.code},state.ilike.${stateInfo.code}`)

  const communities: any[] = communitiesData || []

  // Fetch all builders exactly like the builder directory to find valid state matchers
  const { data: buildersData } = await supabase
    .from('builders')
    .select('*, communities(*), builder_markets(*)')

  const allBuilders: any[] = buildersData || []

  // Filter builders who are actually active in this state
  const stateBuilders = allBuilders.filter(b => {
    const rawCommunities = safeArray(b.communities)
    const rawBuilderMarkets = safeArray(b.builder_markets)
    
    const statesFromCommunities = rawCommunities.map((c: any) => (c.state_code || c.state || '').toUpperCase())
    const statesFromBuilderMarkets = rawBuilderMarkets.map((m: any) => (m.state_code || '').toUpperCase())
    
    const activeMarkets = Array.from(new Set([...statesFromCommunities, ...statesFromBuilderMarkets])).filter(Boolean)
    return activeMarkets.includes(stateInfo.code.toUpperCase())
  }).map(b => {
    // Check if this builder has a State-Wide override mapping (city is null / empty)
    const rawMarkets = safeArray(b.builder_markets)
    const stateMarket = rawMarkets.find((m: any) => 
      (m.state_code || '').toUpperCase() === stateInfo.code.toUpperCase() &&
      !(m.city || '').trim()
    )

    // Add a community count specifically for THIS state for sorting purposes
    const stateCommunityCount = safeArray(b.communities).filter((c: any) => 
      (c.state_code || '').toUpperCase() === stateInfo.code.toUpperCase() ||
      (c.state || '').toUpperCase() === stateInfo.code.toUpperCase() ||
      (c.state || '').toUpperCase() === stateInfo.name.toUpperCase()
    ).length

    return { 
      ...b, 
      stateCommunityCount,
      is_featured: stateMarket?.is_featured || false,
      sort_order: stateMarket?.sort_order ?? 9999
    }
  })

  // Sort by featured, then sort_order, then community count in this state
  stateBuilders.sort((a, b) => {
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
    return b.stateCommunityCount - a.stateCommunityCount
  })

  const topBuilders = stateBuilders.slice(0, 6).map(b => ({
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
    communitiesCount: b.stateCommunityCount,
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
        (c.state_code || '').toUpperCase() === stateInfo.code.toUpperCase() ||
        (c.state || '').toUpperCase() === stateInfo.name.toUpperCase()
      )
      .slice(0, 2)
      .map((c: any) => ({
        name: c.name,
        city: c.city,
        state: c.state_code || stateInfo.code,
        image: c.images?.[0] || ''
      }))
  }))

  const remainingBuilders = stateBuilders.slice(6).map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    description: b.description || 'Dedicated home builder crafting quality communities.',
    logo: b.logo_url,
    stateCommunityCount: b.stateCommunityCount || 0,
  }))

  const cityMap = new Map<string, { name: string; slug: string; communityCount: number; builders: Set<string> }>()
  const upsertCity = (rawCity: string | null | undefined, builderSlug?: string, addCommunityCount = false) => {
    const cityName = normalizeCityName(rawCity || '')
    if (!cityName) return
    const citySlug = toSlug(cityName)
    if (!citySlug) return

    const existing = cityMap.get(citySlug) || {
      name: cityName,
      slug: citySlug,
      communityCount: 0,
      builders: new Set<string>(),
    }

    if (addCommunityCount) {
      existing.communityCount += 1
    }
    if (builderSlug) {
      existing.builders.add(builderSlug)
    }
    cityMap.set(citySlug, existing)
  }

  communities.forEach((community: any) => {
    upsertCity(community.city, community.builders?.slug, true)
  })

  stateBuilders.forEach((builder: any) => {
    const builderSlug = builder.slug
    safeArray(builder.builder_markets).forEach((market: any) => {
      const marketState = (market.state_code || '').toUpperCase()
      if (marketState !== stateInfo.code.toUpperCase()) return
      upsertCity(market.city, builderSlug, false)
    })
  })

  const stateMarkets: CityCount[] = Array.from(cityMap.values())
    .map((item) => ({
      name: item.name,
      slug: item.slug,
      communityCount: item.communityCount,
      builderCount: item.builders.size,
    }))
    .sort((a, b) => {
      if (b.builderCount !== a.builderCount) return b.builderCount - a.builderCount
      if (b.communityCount !== a.communityCount) return b.communityCount - a.communityCount
      return a.name.localeCompare(b.name)
    })

  const pageUrl = `${APP_URL}/builders/${stateInfo.slug}`

  // Generate structured data
  const breadcrumbData = generateBreadcrumbSchema([
    { name: 'Home', item: APP_URL },
    { name: 'Builders', item: `${APP_URL}/builders` },
    { name: stateInfo.name, item: pageUrl },
  ])

  const placeData = generatePlaceSchema({
    name: `Homebuilders in ${stateInfo.name}`,
    description: `Find new construction builders in ${stateInfo.name}.`,
    address: stateInfo.name,
    city: '',
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
              <span className="text-white">{stateInfo.name}</span>
            </nav>

            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Homebuilders in {stateInfo.name}
              </h1>
              <p className="text-lg text-slate-300 mb-6">
                {statePage?.intro || `Browse verified builders serving ${stateInfo.name}. City-level builder directories are available where market data has been added.`}
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm"><strong>{stateBuilders.length > 0 ? stateBuilders.length : 'Top'}</strong> Builders</span>
                </div>
                {stateStats.slice(0, 3).map((stat) => (
                  <div key={stat.metric} className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm"><strong>{stat.value}</strong> {stat.metric}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {(statePage?.market_overview || statePage?.builder_landscape || statePage?.featured_cities || statePage?.faqs) && (
          <section className="border-b border-slate-200 bg-white py-10">
            <div className="container mx-auto px-4">
              <div className="grid gap-6 lg:grid-cols-2">
                {[
                  ['State Market Overview', statePage.market_overview],
                  ['Builder Landscape', statePage.builder_landscape],
                  ['Featured Cities', statePage.featured_cities],
                  ['FAQs', statePage.faqs],
                ].filter((section): section is [string, string] => Boolean(section[1])).map(([title, content]) => (
                  <article key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                    <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
                    <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                      {textParagraphs(content).map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Top Builders Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  Top Builders in {stateInfo.name}
                </h2>
                <p className="text-slate-600">
                  Discover top-rated builders serving this state
                </p>
              </div>
              <Button variant="outline" className="mt-4 md:mt-0" asChild>
                <Link href={`/builders/${stateInfo.slug}`}>View All Builders <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>

            <div className="flex flex-col gap-6">
              {topBuilders.map((builder: any) => (
                <BuilderCard key={builder.slug} builder={builder} isAdmin={false} />
              ))}
              {topBuilders.length === 0 && (
                <p className="text-slate-500 py-4 text-center">No builders found for this state yet.</p>
              )}
            </div>

            {remainingBuilders.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-slate-900">
                    More Builders in {stateInfo.name}
                  </h3>
                  <p className="text-sm text-slate-500">{remainingBuilders.length} additional builders</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {remainingBuilders.map((builder) => (
                    <Card key={builder.id} className="border-slate-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden p-2 flex-shrink-0">
                            {builder.logo ? (
                              <img src={builder.logo} alt={`${builder.name} logo`} className="w-full h-full object-contain" />
                            ) : (
                              <Building2 className="h-7 w-7 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link href={`/builders/${builder.slug}`} className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors line-clamp-2">
                              {builder.name}
                            </Link>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{builder.description}</p>
                            <p className="text-xs text-slate-600 mt-2">Active in {stateInfo.code}</p>
                          </div>
                        </div>
                        <Button className="w-full mt-3" size="sm" variant="outline" asChild>
                          <Link href={`/builders/${builder.slug}`}>View Builder</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Markets Section */}
        <section className="py-12 bg-white border-y border-slate-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Explore Markets in {stateInfo.name}
                </h2>
                <p className="text-slate-600">
                  Jump directly to city market pages to browse local builders.
                </p>
              </div>
              <Button variant="outline" asChild>
                  <Link href={`/builders/${stateInfo.slug}`}>
                  Browse State Builder Directory
                </Link>
              </Button>
            </div>

            {stateMarkets.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stateMarkets.map((market) => (
                  <Link key={market.slug} href={`/builders/${stateInfo.slug}/${market.slug}`}>
                    <Card className="h-full border-slate-200 hover:shadow-md transition-shadow hover:border-emerald-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-900">{market.name}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {market.builderCount} builders
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-400 mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No city markets are available yet for this state.</p>
            )}
          </div>
        </section>

      </div>
    </>
  )
}
