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
import { APP_NAME, PRICE_RANGES, BEDROOM_OPTIONS, BATHROOM_OPTIONS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Search New Homes',
  description: `Search new construction homes, communities, and builders on ${APP_NAME}. Filter by price, bedrooms, location, and more.`,
  openGraph: {
    title: 'Search New Homes | New Homes Section',
    description: `Search new construction homes, communities, and builders on ${APP_NAME}.`,
  },
}

// Sample search results (will come from Supabase)
const sampleResults = [
  {
    id: '1',
    name: 'The Hamilton',
    community: 'Willow Creek Estates',
    address: '1234 Main St',
    city: 'Austin',
    state: 'TX',
    price: 425000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2450,
    image: '/placeholder-home.jpg',
    builder: 'Lennar',
    status: 'available',
  },
  {
    id: '2',
    name: 'The Windsor',
    community: 'Sunset Ridge',
    address: '5678 Oak Ave',
    city: 'Phoenix',
    state: 'AZ',
    price: 575000,
    bedrooms: 5,
    bathrooms: 4,
    sqft: 3200,
    image: '/placeholder-home.jpg',
    builder: 'Taylor Morrison',
    status: 'available',
  },
  {
    id: '3',
    name: 'The Charleston',
    community: 'Lakeview Preserve',
    address: '9012 Pine Rd',
    city: 'Orlando',
    state: 'FL',
    price: 385000,
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 2100,
    image: '/placeholder-home.jpg',
    builder: 'Pulte Homes',
    status: 'coming_soon',
  },
]

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q : ''

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
            
            {/* Filter Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                <SlidersHorizontal className="h-4 w-4 mr-1" /> Filters
              </Button>
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                Price
              </Button>
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                Beds & Baths
              </Button>
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                More
              </Button>
            </div>

            {/* View Toggle */}
            <div className="flex gap-1 border rounded-lg p-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <List className="h-4 w-4" />
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
            <div className="bg-white rounded-lg border p-4 sticky top-32">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-emerald-600">
                  Reset
                </Button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Price Range</h4>
                <div className="space-y-1">
                  {PRICE_RANGES.slice(0, 5).map((range) => (
                    <label key={range.label} className="flex items-center gap-2 text-sm cursor-pointer hover:text-emerald-600">
                      <input type="checkbox" className="rounded border-slate-300" />
                      {range.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Bedrooms</h4>
                <div className="flex flex-wrap gap-1">
                  {BEDROOM_OPTIONS.map((opt) => (
                    <Button key={opt.value} variant="outline" size="sm" className="text-xs h-7">
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Bathrooms</h4>
                <div className="flex flex-wrap gap-1">
                  {BATHROOM_OPTIONS.map((opt) => (
                    <Button key={opt.value} variant="outline" size="sm" className="text-xs h-7">
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="text-sm font-medium mb-2">Status</h4>
                <div className="space-y-1">
                  {['Available Now', 'Coming Soon', 'Under Contract'].map((status) => (
                    <label key={status} className="flex items-center gap-2 text-sm cursor-pointer hover:text-emerald-600">
                      <input type="checkbox" className="rounded border-slate-300" />
                      {status}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-600">
                <span className="font-semibold text-slate-900">1,234</span> homes found
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
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sampleResults.map((home) => (
                <Card key={home.id} className="group overflow-hidden hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="relative h-48 bg-slate-200 flex items-center justify-center">
                    <Building2 className="h-12 w-12 text-slate-400" />
                    <Badge 
                      className={`absolute top-3 left-3 ${
                        home.status === 'available' 
                          ? 'bg-emerald-600' 
                          : home.status === 'coming_soon'
                          ? 'bg-amber-500'
                          : 'bg-slate-500'
                      }`}
                    >
                      {home.status === 'available' ? 'Available' : home.status === 'coming_soon' ? 'Coming Soon' : 'Under Contract'}
                    </Badge>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-emerald-600 transition-colors">
                          ${home.price.toLocaleString()}
                        </h3>
                        <p className="text-sm text-slate-500">{home.community}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                      <span className="flex items-center gap-1">
                        <BedDouble className="h-4 w-4" /> {home.bedrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="h-4 w-4" /> {home.bathrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize className="h-4 w-4" /> {home.sqft.toLocaleString()} sqft
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 flex items-center gap-1 mb-3">
                      <MapPin className="h-3 w-3" />
                      {home.address}, {home.city}, {home.state}
                    </p>

                    <p className="text-xs text-slate-400">By {home.builder}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                Load More Homes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
