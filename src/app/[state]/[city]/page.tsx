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
  const stateInfo = POPULAR_STATES.find(s => s.slug === state.toLowerCase())
  
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

// Sample builders (will come from Supabase)
const sampleBuilders = [
  { name: 'Lennar', slug: 'lennar', count: 8, logo: null },
  { name: 'Taylor Morrison', slug: 'taylor-morrison', count: 6, logo: null },
  { name: 'Pulte Homes', slug: 'pulte-homes', count: 5, logo: null },
  { name: 'DR Horton', slug: 'dr-horton', count: 4, logo: null },
]

// Sample communities (will come from Supabase)
const sampleCommunities = [
  {
    id: '1',
    name: 'Willow Creek Estates',
    builder: 'Lennar',
    builderSlug: 'lennar',
    priceRange: '$350K - $550K',
    minPrice: 350000,
    maxPrice: 550000,
    beds: '3-5',
    baths: '2-4',
    sqft: '1,800 - 3,200',
    homes: 12,
    image: '/placeholder-community.jpg',
    tags: ['Pool', 'Gated', 'Playground'],
  },
  {
    id: '2',
    name: 'Highland Park',
    builder: 'Taylor Morrison',
    builderSlug: 'taylor-morrison',
    priceRange: '$425K - $675K',
    minPrice: 425000,
    maxPrice: 675000,
    beds: '4-6',
    baths: '3-5',
    sqft: '2,400 - 4,100',
    homes: 8,
    image: '/placeholder-community.jpg',
    tags: ['Clubhouse', 'Trails', 'Lake'],
  },
  {
    id: '3',
    name: 'Meadowbrook Gardens',
    builder: 'Pulte Homes',
    builderSlug: 'pulte-homes',
    priceRange: '$285K - $425K',
    minPrice: 285000,
    maxPrice: 425000,
    beds: '3-4',
    baths: '2-3',
    sqft: '1,500 - 2,600',
    homes: 15,
    image: '/placeholder-community.jpg',
    tags: ['Park', 'Pet Friendly'],
  },
]

export default async function CityPage({ params }: CityPageProps) {
  const { state, city } = await params
  const stateSlug = state.toLowerCase()
  const citySlug = city.toLowerCase()
  
  // Validate state
  const stateInfo = POPULAR_STATES.find(s => s.slug === stateSlug)
  if (!stateInfo) {
    notFound()
  }

  const cityName = citySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
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
                Explore {sampleCommunities.length * 5}+ new construction homes and 
                communities in {cityName}. Compare builders, prices, and amenities 
                to find your perfect home.
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm"><strong>150+</strong> New Homes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm"><strong>18</strong> Communities</span>
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
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Top Builders in {cityName}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sampleBuilders.map((builder) => (
                <Link
                  key={builder.slug}
                  href={`/${stateInfo.slug}/${citySlug}/${builder.slug}`}
                  className="flex flex-col items-center p-4 bg-white rounded-lg border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <Building2 className="h-8 w-8 text-slate-400 group-hover:text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-center group-hover:text-emerald-600">
                    {builder.name}
                  </h3>
                  <p className="text-sm text-slate-500">{builder.count} communities</p>
                </Link>
              ))}
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
              {sampleCommunities.map((community) => (
                <Card key={community.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Image */}
                  <div className="relative h-48 bg-slate-200 flex items-center justify-center">
                    <Building2 className="h-12 w-12 text-slate-400" />
                    <Badge className="absolute top-3 left-3 bg-emerald-600">
                      {community.homes} Homes
                    </Badge>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{community.name}</CardTitle>
                    <CardDescription>
                      By{' '}
                      <Link 
                        href={`/${stateInfo.slug}/${citySlug}/${community.builderSlug}`}
                        className="text-emerald-600 hover:underline"
                      >
                        {community.builder}
                      </Link>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-xl font-semibold text-slate-900">
                      {community.priceRange}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <BedDouble className="h-4 w-4" /> {community.beds}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="h-4 w-4" /> {community.baths}
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize className="h-4 w-4" /> {community.sqft}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {community.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button className="w-full mt-2" variant="outline">
                      View Community
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Nearby Cities */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Nearby Cities
            </h2>
            
            <div className="flex flex-wrap gap-3">
              {['Round Rock', 'Cedar Park', 'Georgetown', 'Pflugerville', 'Leander'].map((nearbyCity) => (
                <Link
                  key={nearbyCity}
                  href={`/${stateInfo.slug}/${nearbyCity.toLowerCase().replace(' ', '-')}`}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-full hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                >
                  {nearbyCity}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
