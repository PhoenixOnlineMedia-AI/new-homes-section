import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JsonLd } from '@/components/seo/JsonLd'
import { generateBreadcrumbSchema, generatePlaceSchema } from '@/components/seo/JsonLd'
import { POPULAR_STATES, APP_NAME, APP_URL } from '@/lib/constants'
import { 
  MapPin, 
  Building2, 
  Home, 
  ArrowRight,
  TrendingUp,
  DollarSign,
  Users
} from 'lucide-react'

// Valid states for static generation
const validStates = POPULAR_STATES.map(s => s.slug)

interface StatePageProps {
  params: Promise<{ state: string }>
}

// Generate metadata for the page
export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const { state } = await params
  const stateInfo = POPULAR_STATES.find(s => s.slug === state.toLowerCase())
  
  if (!stateInfo) {
    return {}
  }

  const title = `New Homes in ${stateInfo.name} (${stateInfo.code}) | ${APP_NAME}`
  const description = `Find new construction homes and communities in ${stateInfo.name}. Browse ${stateInfo.name} builders, view floor plans, pricing, and availability.`

  return {
    title,
    description,
    keywords: [
      `new homes ${stateInfo.name}`,
      `new construction ${stateInfo.name}`,
      `${stateInfo.name} home builders`,
      `${stateInfo.name} new communities`,
      `buy new home ${stateInfo.name}`,
    ],
    openGraph: {
      title,
      description,
      url: `${APP_URL}/${stateInfo.slug}`,
    },
    alternates: {
      canonical: `/${stateInfo.slug}`,
    },
  }
}

// Generate static paths for popular states
export function generateStaticParams() {
  return validStates.map((state) => ({ state }))
}

// Sample cities for the state (will come from Supabase)
const sampleCities = [
  { name: 'Austin', slug: 'austin', count: 45 },
  { name: 'Houston', slug: 'houston', count: 62 },
  { name: 'Dallas', slug: 'dallas', count: 38 },
  { name: 'San Antonio', slug: 'san-antonio', count: 29 },
  { name: 'Fort Worth', slug: 'fort-worth', count: 33 },
  { name: 'Plano', slug: 'plano', count: 18 },
]

// Sample communities (will come from Supabase)
const sampleCommunities = [
  {
    id: '1',
    name: 'Willow Creek Estates',
    city: 'Austin',
    builder: 'Lennar',
    priceRange: '$350K - $550K',
    homeCount: 12,
    tags: ['Pool', 'Gated'],
  },
  {
    id: '2',
    name: 'Sunset Ridge',
    city: 'Houston',
    builder: 'Taylor Morrison',
    priceRange: '$400K - $650K',
    homeCount: 8,
    tags: ['Clubhouse', 'Trails'],
  },
]

export default async function StatePage({ params }: StatePageProps) {
  const { state } = await params
  const stateSlug = state.toLowerCase()
  
  // Validate state
  const stateInfo = POPULAR_STATES.find(s => s.slug === stateSlug)
  if (!stateInfo) {
    notFound()
  }

  const pageUrl = `${APP_URL}/${stateInfo.slug}`

  // Generate structured data
  const breadcrumbData = generateBreadcrumbSchema([
    { name: 'Home', item: APP_URL },
    { name: stateInfo.name, item: pageUrl },
  ])

  const placeData = generatePlaceSchema({
    name: `New Homes in ${stateInfo.name}`,
    description: `Find new construction homes and communities in ${stateInfo.name}.`,
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
                New Homes in {stateInfo.name}
              </h1>
              <p className="text-lg text-slate-300 mb-6">
                Discover {sampleCommunities.length * 10}+ new construction homes and communities 
                across {stateInfo.name}. Browse top builders, compare prices, and find your 
                dream home.
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm"><strong>500+</strong> New Homes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm"><strong>50+</strong> Communities</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm"><strong>25+</strong> Builders</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cities Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              New Homes by City in {stateInfo.name}
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/${stateInfo.slug}/${city.slug}`}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        {city.name}
                      </h3>
                      <p className="text-sm text-slate-500">{city.count} communities</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Communities */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Featured Communities in {stateInfo.name}
              </h2>
              <Button variant="outline" asChild>
                <Link href={`/${stateInfo.slug}/search`}>View All</Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {sampleCommunities.map((community) => (
                <Card key={community.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-slate-200 flex items-center justify-center">
                    <Building2 className="h-12 w-12 text-slate-400" />
                    <Badge className="absolute top-3 left-3 bg-emerald-600">
                      {community.homeCount} Homes
                    </Badge>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{community.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {community.city}, {stateInfo.code} • By {community.builder}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-lg font-semibold text-slate-900 mb-3">
                      {community.priceRange}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {community.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Market Insights */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {stateInfo.name} New Home Market
            </h2>
            
            <div className="grid sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Median Price</p>
                      <p className="text-2xl font-bold text-slate-900">$425K</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Price Trend</p>
                      <p className="text-2xl font-bold text-emerald-600">+5.2%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Home className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Avg. Square Feet</p>
                      <p className="text-2xl font-bold text-slate-900">2,450</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
