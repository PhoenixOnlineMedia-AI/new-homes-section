import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
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
  Users
} from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'

// Stats for the page
const stats = [
  { icon: Building2, value: '50+', label: 'Builders' },
  { icon: MapPin, value: '200+', label: 'Markets' },
  { icon: Users, value: '2,500+', label: 'Communities' },
  { icon: Star, value: '4.5', label: 'Avg. Rating' },
]

const communityTypeOptions = [
  { label: 'Single Family', value: 'single-family' },
  { label: 'Townhomes', value: 'townhomes' },
  { label: 'Condos', value: 'condos' },
  { label: '55+ Communities', value: '55-plus' },
  { label: 'Luxury', value: 'luxury' },
  { label: 'Active Adult', value: 'active-adult' },
]

const priceRangeOptions = [
  { label: 'Under $300k', min: 0, max: 300000 },
  { label: '$300k - $500k', min: 300000, max: 500000 },
  { label: '$500k - $750k', min: 500000, max: 750000 },
  { label: '$750k - $1M', min: 750000, max: 1000000 },
  { label: '$1M+', min: 1000000, max: null },
]

const builderSizeOptions = [
  { label: 'National (20+ states)', value: 'national' },
  { label: 'Regional (5-19 states)', value: 'regional' },
  { label: 'Local (1-4 states)', value: 'local' },
]

interface MarketBuildersPageProps {
  params: Promise<{ state: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: MarketBuildersPageProps): Promise<Metadata> {
  const { state } = await params
  const stateInfo = US_STATES.find(s => s.slug === state.toLowerCase())
  
  if (!stateInfo) return {}

  return {
    title: `Find New Home Builders in ${stateInfo.name} | ${APP_NAME}`,
    description: `Browse top-rated new home builders across ${stateInfo.name}. Discover communities and available home plans in ${stateInfo.name}.`,
    keywords: [
      `new home builders ${stateInfo.name}`,
      `home builders directory ${stateInfo.name}`,
      `${stateInfo.name} new construction builders`,
    ],
  }
}

function safeArray(arr: any): any[] {
  if (!arr) return []
  return Array.isArray(arr) ? arr : [arr]
}

export default async function MarketBuildersPage(props: MarketBuildersPageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  
  const stateSlug = params.state.toLowerCase()
  const stateInfo = US_STATES.find(s => s.slug === stateSlug)
  
  if (!stateInfo) {
    notFound()
  }

  const selectedTypes = typeof searchParams.type === 'string' ? searchParams.type.split(',') : []
  const selectedPrices = typeof searchParams.price === 'string' ? searchParams.price.split(',') : []
  const selectedSizes = typeof searchParams.size === 'string' ? searchParams.size.split(',') : []
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1

  const supabase = await createClient()
  const { data: builders } = await supabase
    .from('builders')
    .select('*, communities(*), builder_markets(*)')
    .order('name')

  const builderData: any[] = builders || []

  let displayBuilders = builderData.map(b => {
    const rawCommunities = safeArray(b.communities)
    const rawBuilderMarkets = safeArray(b.builder_markets)
    
    // Get unique state codes from communities + builder_markets
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

  // Pre-filter exactly to the current state code
  displayBuilders = displayBuilders.filter(b => b.activeMarkets.includes(stateInfo.code.toUpperCase()))

  // Apply other filters in-memory
  if (selectedTypes.length > 0) {
    displayBuilders = displayBuilders.filter(b =>
      b.specialties.some((s: string) => selectedTypes.includes(s.toLowerCase().replace(/\\s+/g, '-')))
    )
  }

  if (selectedPrices.length > 0) {
    displayBuilders = displayBuilders.filter(b => {
      return selectedPrices.some(priceKey => {
        const [minStr, maxStr] = priceKey.split('-')
        const filterMin = parseInt(minStr) || 0
        const filterMax = maxStr !== 'null' ? parseInt(maxStr) : Infinity
        return b.priceRange.min <= filterMax && b.priceRange.max >= filterMin
      })
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
        name: `New Home Builders in ${stateInfo.name}`,
        description: `Browse top-rated new home builders in ${stateInfo.name}.`,
        url: `https://newhomessection.com/markets/${stateInfo.slug}/builders`,
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
        {/* Navigation Breadcrumbs */}
        <div className="bg-slate-900 border-b border-white/10">
          <div className="container mx-auto px-4 py-3">
             <nav className="text-sm text-slate-400">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/builders" className="hover:text-white transition-colors">Builders</Link>
              <span className="mx-2">/</span>
              <span className="text-white">{stateInfo.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-slate-900 text-white py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4 bg-emerald-600 hover:bg-emerald-700">
                <MapPin className="h-3 w-3 mr-1" />
                {stateInfo.name} Market
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Top Builders in
                <span className="block text-emerald-400">{stateInfo.name}</span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Browse rated builders and start exploring communities specifically in {stateInfo.name}.
              </p>
            </div>
          </div>
        </section>

        {/* Search Bar Section */}
        <section className="py-6 -mt-4">
          <div className="container mx-auto px-4">
            <Card className="shadow-lg border-0">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search builders by name..."
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                      Search
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Filters Sidebar */}
              <aside className="lg:w-64 flex-shrink-0">
                <div className="sticky top-24 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 pb-4">
                  <BuildersFilter
                    title="Community Types"
                    options={communityTypeOptions.map(t => ({ label: t.label, value: t.value, checked: selectedTypes.includes(t.value) }))}
                    type="checkbox"
                    searchParamKey="type"
                  />
                  <BuildersFilter
                    title="Price Range"
                    options={priceRangeOptions.map(p => ({ label: p.label, value: `${p.min}-${p.max}`, checked: selectedPrices.includes(`${p.min}-${p.max}`) }))}
                    type="checkbox"
                    searchParamKey="price"
                  />
                  <BuildersFilter
                    title="Builder Size"
                    options={builderSizeOptions.map(s => ({ ...s, checked: selectedSizes.includes(s.value) }))}
                    type="radio"
                    searchParamKey="size"
                  />
                </div>
              </aside>

              {/* Results */}
              <div className="flex-1">
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {stateInfo.name} Builders
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
                  {paginatedBuilders.length > 0 ? (
                    paginatedBuilders.map((builder) => (
                      <BuilderCard
                        key={builder.id}
                        builder={builder}
                        isAdmin={isAdmin}
                      />
                    ))
                  ) : (
                    <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
                       <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                       <h3 className="text-lg font-medium text-slate-900">No builders found</h3>
                       <p className="text-slate-500 mt-1">Try adjusting your filters or check back later for new builders in {stateInfo.name}.</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
                      {page > 1 ? (
                        <Link scroll={false} href={`/markets/${stateInfo.slug}/builders?${buildQueryString({ page: String(page - 1) })}`}>Previous</Link>
                      ) : (
                        <span>Previous</span>
                      )}
                    </Button>

                    <span className="text-sm text-slate-500 px-4">
                      Page {page} of {totalPages}
                    </span>

                    <Button variant="outline" size="sm" disabled={page >= totalPages} asChild={page < totalPages}>
                      {page < totalPages ? (
                        <Link scroll={false} href={`/markets/${stateInfo.slug}/builders?${buildQueryString({ page: String(page + 1) })}`}>Next</Link>
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
      </div>
    </>
  )
}
