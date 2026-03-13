import { Metadata } from 'next'
import { SearchBar } from '@/components/search/SearchBar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Building2,
  BedDouble,
  Bath,
  Maximize,
  SlidersHorizontal,
  Grid3X3,
  List,
  ArrowUpDown
} from 'lucide-react'
import { APP_NAME, PRICE_RANGES, BEDROOM_OPTIONS, BATHROOM_OPTIONS, COMMUNITY_STATUS_LABELS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import { BuildersFilter } from '@/components/builders/BuildersFilter'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Search New Homes',
  description: `Search new construction homes, communities, and builders on ${APP_NAME}. Filter by price, bedrooms, location, and more.`,
  openGraph: {
    title: 'Search New Homes | New Homes Section',
    description: `Search new construction homes, communities, and builders on ${APP_NAME}.`,
  },
}



interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q : ''
  const selectedPrices = typeof params.price === 'string' ? params.price.split(',') : []
  const selectedBeds = typeof params.beds === 'string' ? params.beds.split(',') : []
  const selectedBaths = typeof params.baths === 'string' ? params.baths.split(',') : []
  const selectedStatus = typeof params.status === 'string' ? params.status.split(',') : []
  const view = typeof params.view === 'string' ? params.view : 'grid'
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1

  const supabase = await createClient()

  let queryBuilder = supabase
    .from('communities')
    .select('*, builders!inner(*)')

  if (query) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%,state_code.ilike.%${query}%,zip_code.ilike.%${query}%`)
  }

  const { data: rawCommunities } = await queryBuilder.limit(1000)
  let communities = (rawCommunities as any[]) || []

  // Apply filters in-memory (or we could do it in Supabase, but memory is fine for now given size)
  if (selectedPrices.length > 0) {
    communities = communities.filter(c => {
      return selectedPrices.some(priceKey => {
        const [minStr, maxStr] = priceKey.split('-')
        const filterMin = parseInt(minStr) || 0
        const filterMax = maxStr !== 'null' ? parseInt(maxStr) : Infinity
        return (c.max_price || 0) >= filterMin && (c.min_price || filterMax) <= filterMax
      })
    })
  }

  if (selectedBeds.length > 0) {
    communities = communities.filter(c => {
      const communityMaxBeds = Math.max(c.min_bedrooms || 0, c.max_bedrooms || 0)
      return selectedBeds.some(b => communityMaxBeds >= parseFloat(b))
    })
  }

  if (selectedBaths.length > 0) {
    communities = communities.filter(c => {
      const communityMaxBaths = Math.max(c.min_bathrooms || 0, c.max_bathrooms || 0)
      return selectedBaths.some(b => communityMaxBaths >= parseFloat(b))
    })
  }

  if (selectedStatus.length > 0) {
    communities = communities.filter(c => selectedStatus.includes(c.status || ''))
  }

  const ITEMS_PER_PAGE = 24
  const totalResults = communities.length
  const totalPages = Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE))
  const paginatedCommunities = communities.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const buildQueryString = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (typeof v === 'string') newParams.set(k, v)
      else if (Array.isArray(v)) newParams.set(k, v[0])
    })
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null) newParams.delete(k)
      else newParams.set(k, v)
    })
    return newParams.toString()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 w-full lg:max-w-xl">
              <SearchBar
                variant="compact"
                initialValue={query}
                placeholder="Search by city, state, zip, or community..."
              />
            </div>

            {/* View Toggle */}
            <div className="flex justify-end gap-1 border rounded-lg p-1 ml-auto shrink-0">
              <Button variant={view !== 'list' ? 'secondary' : 'ghost'} size="sm" className="h-8 w-8 p-0" asChild>
                <Link scroll={false} href={`/search?${buildQueryString({ view: 'grid' })}`}>
                  <Grid3X3 className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="sm" className="h-8 w-8 p-0" asChild>
                <Link scroll={false} href={`/search?${buildQueryString({ view: 'list' })}`}>
                  <List className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {query && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <span className="text-sm text-slate-500">Active filters:</span>
              <Badge variant="secondary" className="gap-1">
                {query}
                <button className="hover:text-red-500">×</button>
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border p-4 sticky top-32 max-h-[calc(100vh-140px)] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-emerald-600" asChild>
                  <Link href="/search">Reset</Link>
                </Button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <BuildersFilter
                  title="Price Range"
                  options={PRICE_RANGES.map(p => ({ label: p.label, value: `${p.min}-${p.max}`, checked: selectedPrices.includes(`${p.min}-${p.max}`) }))}
                  type="checkbox"
                  searchParamKey="price"
                />
              </div>

              {/* Bedrooms */}
              <div className="mb-6">
                <BuildersFilter
                  title="Bedrooms"
                  options={BEDROOM_OPTIONS.map(opt => ({ label: opt.label, value: String(opt.value), checked: selectedBeds.includes(String(opt.value)) }))}
                  type="checkbox"
                  searchParamKey="beds"
                />
              </div>

              {/* Bathrooms */}
              <div className="mb-6">
                <BuildersFilter
                  title="Bathrooms"
                  options={BATHROOM_OPTIONS.map(opt => ({ label: opt.label, value: String(opt.value), checked: selectedBaths.includes(String(opt.value)) }))}
                  type="checkbox"
                  searchParamKey="baths"
                />
              </div>

              {/* Status */}
              <div>
                <BuildersFilter
                  title="Status"
                  options={Object.entries(COMMUNITY_STATUS_LABELS).map(([val, label]) => ({ label, value: val, checked: selectedStatus.includes(val) }))}
                  type="checkbox"
                  searchParamKey="status"
                />
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-600">
                <span className="font-semibold text-slate-900">{communities.length}</span> communities found
                {query && <span> for &quot;{query}&quot;</span>}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Sort by:</span>
                <Button variant="outline" size="sm">
                  Recommended <ArrowUpDown className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>

            {/* Results Grid */}
            <div className={view === 'list' ? "space-y-4" : "grid md:grid-cols-2 xl:grid-cols-3 gap-4"}>
              {paginatedCommunities.map((community: any) => {
                const builder = community.builders
                const isList = view === 'list'
                return (
                  <Card key={community.id} className={`group overflow-hidden hover:shadow-md transition-shadow ${isList ? 'flex flex-col sm:flex-row' : ''}`}>
                    {/* Image */}
                    <div className={`relative bg-slate-200 flex items-center justify-center shrink-0 ${isList ? 'w-full sm:w-1/3 h-48 sm:h-auto' : 'h-48'}`}>
                      {community.images?.[0] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={community.images[0]} alt={community.name} className="w-full h-full object-cover sm:aspect-video" />
                      ) : (
                        <Building2 className="h-12 w-12 text-slate-400" />
                      )}
                      <Badge
                        className={`absolute top-3 left-3 ${community.status === 'selling'
                          ? 'bg-emerald-600'
                          : community.status === 'coming_soon'
                            ? 'bg-amber-500'
                            : 'bg-slate-500'
                          }`}
                      >
                        {COMMUNITY_STATUS_LABELS[community.status as keyof typeof COMMUNITY_STATUS_LABELS] || 'Available'}
                      </Badge>
                    </div>

                    <CardContent className={`p-4 flex flex-col justify-between ${isList ? 'w-full sm:w-2/3 h-auto' : 'h-[250px]'}`}>
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg group-hover:text-emerald-600 transition-colors">
                              {community.min_price || community.max_price
                                ? `$${(community.min_price || 0).toLocaleString()} ${community.max_price ? `- $${community.max_price.toLocaleString()}` : '+'}`
                                : 'Pricing Unavailable'}
                            </h3>
                            <p className="text-sm text-slate-500">{community.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                          <span className="flex items-center gap-1">
                            <BedDouble className="h-4 w-4" /> {community.min_bedrooms ? `${community.min_bedrooms}-${community.max_bedrooms || community.min_bedrooms}` : 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="h-4 w-4" /> {community.min_bathrooms ? `${community.min_bathrooms}-${community.max_bathrooms || community.min_bathrooms}` : 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Maximize className="h-4 w-4" /> {community.min_sqft ? `${community.min_sqft.toLocaleString()}+ sqft` : 'N/A'}
                          </span>
                        </div>

                        <p className="text-sm text-slate-500 flex items-center gap-1 mb-3">
                          <MapPin className="h-3 w-3" />
                          {community.city}, {community.state_code}
                        </p>

                        <p className="text-xs text-slate-400">By {builder?.name || 'Local Builder'}</p>
                      </div>

                      <Button className="w-full mt-4" variant="outline" asChild>
                        <a href={`/${(community.state_code || community.state || '').toLowerCase()}/${(community.city || '').toLowerCase().replace(/\\s+/g, '-')}/${builder?.slug || 'builder'}/${community.slug}`}>
                          View Community
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
                  {page > 1 ? (
                    <Link href={`/search?${buildQueryString({ page: String(page - 1) })}`}>Previous</Link>
                  ) : (
                    <span>Previous</span>
                  )}
                </Button>

                <span className="text-sm text-slate-500 px-4">
                  Page {page} of {totalPages}
                </span>

                <Button variant="outline" size="sm" disabled={page >= totalPages} asChild={page < totalPages}>
                  {page < totalPages ? (
                    <Link href={`/search?${buildQueryString({ page: String(page + 1) })}`}>Next</Link>
                  ) : (
                    <span>Next</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
