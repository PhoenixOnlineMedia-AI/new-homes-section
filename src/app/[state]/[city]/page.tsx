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
import { LAUNCH_HIDE_INVENTORY } from '@/lib/launch'
import {
  Building2,
  ArrowRight,
  BedDouble,
  Bath,
  Maximize,
  School,
  BarChart3,
  BriefcaseBusiness,
  GraduationCap,
  HelpCircle,
  Map,
  Sparkles,
  Users,
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

  const title = `Homebuilders in ${cityName}, ${stateInfo.code} | ${APP_NAME}`
  const description = `Find new construction builders in ${cityName}, ${stateInfo.name}. Browse verified builder profiles and local market information.`

  return {
    title,
    description,
    keywords: [
      `new construction ${cityName}`,
      `${cityName} home builders`,
      `${cityName} real estate`,
      `buy new home ${cityName} ${stateInfo.code}`,
    ],
    openGraph: {
      title,
      description,
    url: `${APP_URL}/builders/${state}/${city}`,
    },
    alternates: {
      canonical: `/builders/${state}/${city}`,
    },
  }
}

import { createClient } from '@/lib/supabase/server'

type MarketPageContent = {
  id: string
  city: string
  state_code: string
  city_overview: string | null
  key_stats: string | null
  neighborhood_breakdown: string | null
  economy_job_market: string | null
  schools_education: string | null
  lifestyle_amenities: string | null
  faqs: string | null
}

const marketInfoSections = [
  {
    key: 'neighborhood_breakdown',
    title: 'Neighborhoods',
    icon: Map,
  },
  {
    key: 'economy_job_market',
    title: 'Economy & Jobs',
    icon: BriefcaseBusiness,
  },
  {
    key: 'schools_education',
    title: 'Schools & Education',
    icon: GraduationCap,
  },
  {
    key: 'lifestyle_amenities',
    title: 'Lifestyle & Amenities',
    icon: Sparkles,
  },
] as const

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
    if (metric && statValue) {
      stats.push({ metric, value: statValue })
    }
  }

  return stats
}

function parseFaqs(value: string | null | undefined) {
  if (!value) return []

  return value
    .split(/\bQ:\s*/i)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [question, ...answerParts] = entry.split(/\bA:\s*/i)
      return {
        question: question?.trim().replace(/\s+/g, ' ') || '',
        answer: answerParts.join('A: ').trim(),
      }
    })
    .filter((faq) => faq.question && faq.answer)
}

function textParagraphs(value: string | null | undefined) {
  if (!value) return []
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function truncateText(value: string | null | undefined, maxLength = 210) {
  const normalized = (value || '').replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength).replace(/\s+\S*$/, '')}...`
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

  const { data: marketPageData } = await supabase
    .from('market_pages')
    .select('id,city,state_code,city_overview,key_stats,neighborhood_breakdown,economy_job_market,schools_education,lifestyle_amenities,faqs')
    .eq('state_code', stateInfo.code)
    .ilike('city', cityName)
    .maybeSingle()

  const marketPage = marketPageData as unknown as MarketPageContent | null

  // Fetch all builders exactly like the builder directory to find valid city matchers
  const { data: buildersData } = await supabase
    .from('builders')
    .select('id,name,slug,description,logo_url,rating,review_count,is_verified,is_premium,headquarters,year_founded,communities(name,slug,city,state,state_code,images),builder_markets(city,state_code,local_description,is_featured,sort_order)')

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
      sort_order: cityMarket?.sort_order ?? 9999,
      local_description: cityMarket?.local_description || null,
    }
  })

  // Sort by featured, then sort_order, then community count in this city
  cityBuilders.sort((a, b) => {
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
    return b.cityCommunityCount - a.cityCommunityCount
  })
  
  if (communities.length === 0 && cityBuilders.length === 0 && !marketPage) {
    notFound()
  }

  const topBuilders = cityBuilders.slice(0, 6).map(b => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    description: truncateText(b.local_description || b.description || 'Dedicated home builder crafting quality communities.'),
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

  const remainingBuilders = cityBuilders.slice(6).map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    description: truncateText(b.local_description || b.description || 'Dedicated home builder crafting quality communities.', 150),
    logo: b.logo_url,
    isVerified: b.is_verified || false,
    isPremium: b.is_premium || false,
    communitiesCount: b.cityCommunityCount,
  }))

  const keyStats = parseKeyStats(marketPage?.key_stats)
  const faqs = parseFaqs(marketPage?.faqs)
  const cityOverviewParagraphs = textParagraphs(marketPage?.city_overview)

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
    name: `Homebuilders in ${cityName}, ${stateInfo.code}`,
    description: `Find new construction builders in ${cityName}, ${stateInfo.name}.`,
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
        <section className="bg-slate-900 text-white py-10 md:py-14">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="text-sm text-slate-400 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <Link href={`/builders/${stateInfo.slug}`} className="hover:text-white transition-colors">
                {stateInfo.name}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">{cityName}</span>
            </nav>

            <div className="max-w-4xl">
              <h1 className="max-w-3xl text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                Homebuilders in {cityName}, {stateInfo.code}
              </h1>
              {!marketPage?.city_overview && (
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                  Explore verified builders and new construction opportunities in {cityName}.
                  Community and home inventory is coming soon.
                </p>
              )}

              {/* Quick Stats */}
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-200">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  <span><strong className="text-white">{cityBuilders.length}</strong> Builders</span>
                </div>
                {keyStats.length > 0 && (
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-emerald-400" />
                    <span><strong className="text-white">{keyStats.length}</strong> Market Stats</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {cityOverviewParagraphs.length > 0 && (
          <section className="border-b border-slate-200 bg-white py-7">
            <div className="container mx-auto px-4">
              <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
                <div>
                  <p className="text-sm font-semibold text-emerald-700">City overview</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    About {cityName}
                  </h2>
                </div>
                <div className="max-w-4xl space-y-3 text-sm leading-7 text-slate-700 md:text-base">
                  {cityOverviewParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {keyStats.length > 0 && (
          <section className="border-b border-slate-200 bg-slate-50 py-6">
            <div className="container mx-auto px-4">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">{cityName} Market Snapshot</h2>
              </div>
              <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                {keyStats.slice(0, 12).map((stat) => (
                  <div key={stat.metric} className="flex min-w-0 gap-3 border-t border-slate-200 pt-3">
                    <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.metric}</p>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-950">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Builders Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  Top Builders in {cityName}
                </h2>
                <p className="text-slate-600">
                  Discover top-rated builders active in this market
                </p>
              </div>
              <Button variant="outline" className="mt-4 md:mt-0" asChild>
                <Link href={`/builders/${stateInfo.slug}`}>View All Builders <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>

            <div className="flex flex-col gap-6">
              {topBuilders.map((builder) => (
                <BuilderCard key={builder.slug} builder={builder} isAdmin={false} />
              ))}
              {topBuilders.length === 0 && (
                <p className="text-slate-500 text-center py-4">No builders found here yet.</p>
              )}
            </div>

            {remainingBuilders.length > 0 && (
              <div className="mt-12">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      More Builders in {cityName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Additional builders active in this market
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    {remainingBuilders.length} more
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {remainingBuilders.map((builder) => (
                    <Link
                      key={builder.id}
                      href={`/builders/${builder.slug}`}
                      className="group flex min-h-32 gap-4 rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-md"
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2">
                        {builder.logo ? (
                          <img src={builder.logo} alt={`${builder.name} logo`} loading="lazy" decoding="async" className="h-full w-full object-contain" />
                        ) : (
                          <Building2 className="h-7 w-7 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate font-semibold text-slate-950 group-hover:text-emerald-700">{builder.name}</h4>
                          {builder.isVerified && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Verified</Badge>}
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{builder.description}</p>
                        <p className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-500">
                          <Users className="h-3.5 w-3.5" />
                          Active builder profile
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {!LAUNCH_HIDE_INVENTORY && (
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
                          href={`/builders/${community.builders.slug}`}
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
        )}

        {(marketInfoSections.some((section) => marketPage?.[section.key]) || faqs.length > 0) && (
          <section className="bg-slate-50 py-12">
            <div className="container mx-auto px-4">
              <div className="mb-8 flex items-end justify-between gap-6">
                <div>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">
                    Local Market Guide
                  </p>
                  <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                    Living in {cityName}, {stateInfo.code}
                  </h2>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {marketInfoSections.map((section) => {
                  const content = marketPage?.[section.key]
                  if (!content) return null
                  const Icon = section.icon

                  return (
                    <article key={section.key} className="rounded-lg border border-slate-200 bg-white p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-950">{section.title}</h3>
                      </div>
                      <div className="space-y-4 text-sm leading-7 text-slate-700">
                        {textParagraphs(content).map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </article>
                  )
                })}
              </div>

              {faqs.length > 0 && (
                <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <HelpCircle className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-950">FAQs About New Homes in {cityName}</h3>
                  </div>

                  <div className="divide-y divide-slate-200">
                    {faqs.map((faq) => (
                      <details key={faq.question} className="group py-4">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-950">
                          <span>{faq.question}</span>
                          <span className="text-emerald-700 transition-transform group-open:rotate-45">+</span>
                        </summary>
                        <p className="mt-3 text-sm leading-7 text-slate-700">{faq.answer}</p>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

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
                    href={`/builders/${stateInfo.slug}/${toSlug(nearbyCity)}`}
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
