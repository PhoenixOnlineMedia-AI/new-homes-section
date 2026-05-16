import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BuilderCard } from '@/components/builders/BuilderCard'
import { BuildersFilter } from '@/components/builders/BuildersFilter'
import { US_STATES, APP_NAME } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import {
  Building2,
  MapPin,
  Star,
  Search,
  Award,
  Users,
} from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Find New Home Builders',
  description: `Browse verified new home builders across the US. Discover ${APP_NAME}'s directory of national, regional, and local builders by market.`,
  keywords: [
    'new home builders',
    'home builders directory',
    'national home builders',
    'custom home builders',
    'new construction builders',
    'home builder reviews',
  ],
  openGraph: {
    title: `Find New Home Builders | ${APP_NAME}`,
    description: 'Browse verified new home builders and their markets across the US.',
  },
}

// We will fetch builders from Supabase in the component

// Stats for the page
const builderSizeOptions = [
  { label: 'National (20+ states)', value: 'national' },
  { label: 'Regional (5-19 states)', value: 'regional' },
  { label: 'Local (1-4 states)', value: 'local' },
]

function safeArray(arr: any): any[] {
  if (!arr) return []
  return Array.isArray(arr) ? arr : [arr]
}

export default async function BuildersDirectoryPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const query = typeof searchParams.q === 'string' ? searchParams.q.trim().toLowerCase() : ''
  const selectedMarkets = typeof searchParams.market === 'string' ? searchParams.market.split(',') : []
  const selectedSizes = typeof searchParams.size === 'string' ? searchParams.size.split(',') : []
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1

  const supabase = await createClient()
  const { data: builders } = await supabase
    .from('builders')
    .select('*, communities(*), builder_markets(*)')
    .order('name')

  const builderData: any[] = builders || []

  const marketCounts = new Map<string, number>()
  builderData.forEach(b => {
    const rawCommunities = safeArray(b.communities)
    const rawBuilderMarkets = safeArray(b.builder_markets)
    
    // Get unique state codes from communities + builder_markets
    const statesFromCommunities = rawCommunities.map((c: any) => (c.state_code || c.state || '').toUpperCase())
    const statesFromBuilderMarkets = rawBuilderMarkets.map((m: any) => (m.state_code || '').toUpperCase())
    
    const activeMarkets = Array.from(new Set([...statesFromCommunities, ...statesFromBuilderMarkets])).filter(Boolean) as string[]
    
    activeMarkets.forEach((m: string) => {
      marketCounts.set(m, (marketCounts.get(m) || 0) + 1)
    })
  })

  // Then construct dynamicMarketOptions dynamically based on US_STATES
  const dynamicMarketOptions = US_STATES
    .filter(state => marketCounts.has(state.code.toUpperCase()))
    .map(state => ({
      label: state.name,
      value: state.code.toUpperCase(),
      slug: state.slug,
      count: marketCounts.get(state.code.toUpperCase()) || 0
    }))
    .sort((a, b) => b.count - a.count)

  let displayBuilders = builderData.map(b => {
    const rawCommunities = safeArray(b.communities)
    const rawBuilderMarkets = safeArray(b.builder_markets)
    
    const statesFromCommunities = rawCommunities.map((c: any) => (c.state_code || c.state || '').toUpperCase())
    const statesFromBuilderMarkets = rawBuilderMarkets.map((m: any) => (m.state_code || '').toUpperCase())
    
    const activeMarkets = Array.from(new Set([...statesFromCommunities, ...statesFromBuilderMarkets])).filter(Boolean).sort()

    let minPrice = Infinity
    let maxPrice = 0
    rawCommunities.forEach((c: any) => {
      if (c.min_price && c.min_price < minPrice) minPrice = c.min_price
      if (c.max_price && c.max_price > maxPrice) maxPrice = c.max_price
    })

    const validPrices = minPrice !== Infinity
    const priceRangeLabel = validPrices
      ? `$${(minPrice / 1000).toFixed(0)}k - $${(maxPrice / 1000).toFixed(0)}k`
      : 'Pricing TBD'

    const communitiesCount = rawCommunities.length
    const homesBuilt = rawCommunities.reduce((sum: number, c: any) => sum + (c.total_homes || c.home_count || 0), 0)
    const specialties = Array.from(new Set(rawCommunities.flatMap((c: any) => c.home_types || []))).slice(0, 3)

    return {
      ...b,
      reviewCount: b.review_count,
      isVerified: b.is_verified,
      isPremium: b.is_premium,
      yearFounded: b.year_founded,
      homesBuilt,
      communitiesCount,
      activeMarkets,
      specialties,
      priceRange: {
        min: validPrices ? minPrice : 0,
        max: validPrices ? maxPrice : 0,
        label: priceRangeLabel
      },
      featuredCommunities: [], // Add real communities here later if needed
      logo: b.logo_url || '/placeholder-builder.svg',
    }
  })

  if (query) {
    displayBuilders = displayBuilders.filter((builder) => {
      const haystack = [
        builder.name,
        builder.description,
        builder.headquarters,
        ...builder.activeMarkets,
        ...safeArray(builder.builder_markets).map((market: any) => market.city),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }

  // Apply filters in-memory
  if (selectedMarkets.length > 0) {
    displayBuilders = displayBuilders.filter(b =>
      b.activeMarkets.some((m: string) => selectedMarkets.includes(m))
    )
  }

  if (selectedSizes.length > 0) {
    displayBuilders = displayBuilders.filter((builder) => {
      const stateCount = builder.activeMarkets.length
      const size = stateCount >= 20 ? 'national' : stateCount >= 5 ? 'regional' : 'local'
      return selectedSizes.includes(size)
    })
  }

  const ITEMS_PER_PAGE = 12
  const totalResults = displayBuilders.length
  const totalPages = Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE))
  const paginatedBuilders = displayBuilders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const buildQueryString = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams()
    Object.entries(searchParams).forEach(([k, v]) => {
      if (typeof v === 'string') newParams.set(k, v)
      else if (Array.isArray(v)) newParams.set(k, v[0])
    })
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null) newParams.delete(k)
      else newParams.set(k, v)
    })
    return newParams.toString()
  }

  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = !!user

  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'New Home Builders Directory',
        description: 'Browse top-rated new home builders across the United States.',
        url: 'https://newhomessection.com/builders',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: displayBuilders.map((builder, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Organization',
              name: builder.name,
              description: builder.description,
              url: `https://newhomessection.com/builders/${builder.slug}`,
            }
          }))
        }
      }} />

      <div className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <section className="bg-slate-900 text-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4 bg-emerald-600 hover:bg-emerald-700">
                <Building2 className="h-3 w-3 mr-1" />
                Directory
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Discover America&apos;s Best
                <span className="block text-emerald-400">Home Builders</span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Browse verified builders by name, state, and city. Community and home
                inventory is coming soon as the directory expands.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {[
                  { icon: Building2, value: `${Math.max(builderData.length, 200)}+`, label: 'Builders' },
                  { icon: MapPin, value: `${Math.max(dynamicMarketOptions.length, 50)}+`, label: 'Markets' },
                  { icon: Users, value: `${dynamicMarketOptions.length || 'Active'}`, label: 'States' },
                  { icon: Star, value: 'Verified', label: 'Profiles' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <stat.icon className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Search Bar Section */}
        <section className="py-6 -mt-4">
          <div className="container mx-auto px-4">
            <Card className="shadow-lg border-0">
              <CardContent className="p-4">
                <form className="flex flex-col md:flex-row gap-4" action="/builders">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search builders by name..."
                      name="q"
                      defaultValue={typeof searchParams.q === 'string' ? searchParams.q : ''}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700">
                      Search Builders
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Filters Sidebar */}
              <aside className="hidden lg:block lg:w-64 flex-shrink-0">
                <div className="sticky top-24 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 pb-4">
                  <BuildersFilter
                    title="Markets"
                    options={dynamicMarketOptions.map(m => ({ ...m, checked: selectedMarkets.includes(m.value) }))}
                    type="checkbox"
                    searchParamKey="market"
                  />
                  <BuildersFilter
                    title="Builder Size"
                    options={builderSizeOptions.map(s => ({ ...s, checked: selectedSizes.includes(s.value) }))}
                    type="radio"
                    searchParamKey="size"
                  />

                  <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-0">
                    <CardContent className="p-4">
                      <Award className="h-8 w-8 mb-2 text-emerald-200" />
                      <h3 className="font-semibold mb-1">Are You a Builder?</h3>
                      <p className="text-sm text-emerald-100 mb-3">
                        Join our directory and reach thousands of qualified buyers.
                      </p>
                      <Button size="sm" variant="secondary" className="w-full bg-white text-emerald-700 hover:bg-slate-100" asChild>
                        <Link href="/contact">Partner With Us</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </aside>

              {/* Results */}
              <div className="flex-1">
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      All Builders
                    </h2>
                    <p className="text-sm text-slate-500">
                      Showing {displayBuilders.length} builders
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Sort by:</span>
                    <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option>Featured</option>
                      <option>Highest Rated</option>
                      <option>Most Communities</option>
                      <option>Alphabetical</option>
                    </select>
                  </div>
                </div>

                {/* Builder Cards Grid */}
                <div className="space-y-4">
                  {paginatedBuilders.map((builder) => (
                    <BuilderCard
                      key={builder.id}
                      builder={builder}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
                      {page > 1 ? (
                        <Link scroll={false} href={`/builders?${buildQueryString({ page: String(page - 1) })}`}>Previous</Link>
                      ) : (
                        <span>Previous</span>
                      )}
                    </Button>

                    <span className="text-sm text-slate-500 px-4">
                      Page {page} of {totalPages}
                    </span>

                    <Button variant="outline" size="sm" disabled={page >= totalPages} asChild={page < totalPages}>
                      {page < totalPages ? (
                        <Link scroll={false} href={`/builders?${buildQueryString({ page: String(page + 1) })}`}>Next</Link>
                      ) : (
                        <span>Next</span>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Markets Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
                <MapPin className="h-3 w-3 mr-1" />
                Markets
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                Browse Builders by Market
              </h2>
              <p className="text-slate-600">
                Find top builders in your desired location and follow clean state
                builder directories.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {dynamicMarketOptions.slice(0, 10).map((market) => (
                <Link
                  key={market.value}
                  href={`/builders/${market.slug}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                >
                  <span className="font-medium text-slate-700 group-hover:text-emerald-700">
                    {market.label}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {market.count}
                  </Badge>
                </Link>
              ))}
            </div>


          </div>
        </section>

        {/* Why Choose Our Builders */}
        <section className="py-16 bg-slate-900 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Why Choose Our Builders?
              </h2>
              <p className="text-slate-400">
                Every builder in our directory is vetted for quality, reliability,
                and customer satisfaction.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Star,
                  title: 'Verified & Rated',
                  description: 'Builder profiles are organized for clear ownership, market coverage, and direct online research.',
                },
                {
                  icon: MapPin,
                  title: 'Market Leaders',
                  description: 'Browse national and regional builders with established market footprints.',
                },
                {
                  icon: Award,
                  title: 'Warranty Protected',
                  description: 'Profiles link you directly to builder websites so you can verify warranties, availability, and local teams.',
                },
              ].map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-emerald-600">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Find Your Builder?
              </h2>
              <p className="text-emerald-100 mb-8 text-lg">
                Start exploring verified builders by market today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100 shadow-lg" asChild>
                  <Link href="/builders">Browse Builders</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-emerald-700" asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
