import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JsonLd } from '@/components/seo/JsonLd'
import { generateBreadcrumbSchema } from '@/components/seo/JsonLd'
import { POPULAR_STATES, APP_NAME, APP_URL } from '@/lib/constants'
import { 
  MapPin, 
  Building2, 
  Home, 
  Phone, 
  Mail, 
  Globe,
  Star,
  CheckCircle2,
  BedDouble,
  Bath,
  Maximize,
  Calendar
} from 'lucide-react'

interface BuilderPageProps {
  params: Promise<{ state: string; city: string; builderSlug: string }>
}

// Generate metadata for the page
export async function generateMetadata({ params }: BuilderPageProps): Promise<Metadata> {
  const { state, city, builderSlug } = await params
  const stateInfo = POPULAR_STATES.find(s => s.slug === state.toLowerCase())
  
  if (!stateInfo) {
    return {}
  }

  const cityName = city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const builderName = builderSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  
  const title = `${builderName} New Homes in ${cityName}, ${stateInfo.code} | ${APP_NAME}`
  const description = `View ${builderName} new construction homes and communities in ${cityName}, ${stateInfo.name}. Browse floor plans, pricing, and schedule a tour.`

  return {
    title,
    description,
    keywords: [
      `${builderName} ${cityName}`,
      `${builderName} new homes`,
      `${builderName} ${stateInfo.code}`,
      `new construction ${cityName}`,
      `${builderName} floor plans`,
    ],
    openGraph: {
      title,
      description,
      url: `${APP_URL}/${state}/${city}/${builderSlug}`,
    },
    alternates: {
      canonical: `/${state}/${city}/${builderSlug}`,
    },
  }
}

// Sample builder data (will come from Supabase)
const builderData = {
  name: 'Lennar',
  slug: 'lennar',
  description: 'Lennar is one of the nation\'s leading homebuilders, providing quality new homes for families across the country. With innovative floor plans and the Everything\'s Included® program, Lennar makes home buying simple and transparent.',
  founded: 1954,
  headquarters: 'Miami, FL',
  rating: 4.5,
  reviewCount: 2847,
  website: 'https://www.lennar.com',
  phone: '(555) 123-4567',
  email: 'info@lennar.com',
  isVerified: true,
  specialties: ['Single Family', 'Townhomes', 'Active Adult'],
  features: [
    'Everything\'s Included® - upgrades included at no extra cost',
    'Wi-Fi CERTIFIED™ home design',
    'Energy-efficient construction',
    'Smart home technology included',
    'Home warranty included',
  ],
}

// Sample communities (will come from Supabase)
const communities = [
  {
    id: '1',
    name: 'Willow Creek Estates',
    address: '1234 Willow Creek Blvd',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    priceRange: '$350K - $550K',
    minPrice: 350000,
    maxPrice: 550000,
    beds: '3-5',
    baths: '2-4',
    sqft: '1,800 - 3,200',
    homesAvailable: 12,
    image: '/placeholder-community.jpg',
    status: 'selling',
    amenities: ['Pool', 'Gated Entry', 'Playground', 'Walking Trails'],
    schoolDistrict: 'Austin ISD',
  },
  {
    id: '2',
    name: 'Highland Grove',
    address: '5678 Highland Ave',
    city: 'Austin',
    state: 'TX',
    zipCode: '78702',
    priceRange: '$425K - $625K',
    minPrice: 425000,
    maxPrice: 625000,
    beds: '4-6',
    baths: '3-5',
    sqft: '2,400 - 4,000',
    homesAvailable: 8,
    image: '/placeholder-community.jpg',
    status: 'selling',
    amenities: ['Clubhouse', 'Fitness Center', 'Dog Park', 'Lake Access'],
    schoolDistrict: 'Lake Travis ISD',
  },
  {
    id: '3',
    name: 'Meadowbrook Crossing',
    address: '9012 Meadowbrook Ln',
    city: 'Austin',
    state: 'TX',
    zipCode: '78703',
    priceRange: '$295K - $425K',
    minPrice: 295000,
    maxPrice: 425000,
    beds: '3-4',
    baths: '2-3',
    sqft: '1,500 - 2,400',
    homesAvailable: 15,
    image: '/placeholder-community.jpg',
    status: 'coming_soon',
    amenities: ['Park', 'Community Garden'],
    schoolDistrict: 'Round Rock ISD',
  },
]

// Sample floor plans (will come from Supabase)
const floorPlans = [
  {
    id: '1',
    name: 'The Hamilton',
    beds: 4,
    baths: 3,
    sqft: 2450,
    stories: 2,
    garage: 2,
    basePrice: 425000,
    image: '/placeholder-floorplan.jpg',
  },
  {
    id: '2',
    name: 'The Windsor',
    beds: 5,
    baths: 4,
    sqft: 3200,
    stories: 2,
    garage: 3,
    basePrice: 575000,
    image: '/placeholder-floorplan.jpg',
  },
  {
    id: '3',
    name: 'The Charleston',
    beds: 3,
    baths: 2.5,
    sqft: 2100,
    stories: 1,
    garage: 2,
    basePrice: 385000,
    image: '/placeholder-floorplan.jpg',
  },
]

export default async function BuilderPage({ params }: BuilderPageProps) {
  const { state, city, builderSlug } = await params
  const stateSlug = state.toLowerCase()
  const citySlug = city.toLowerCase()
  
  // Validate state
  const stateInfo = POPULAR_STATES.find(s => s.slug === stateSlug)
  if (!stateInfo) {
    notFound()
  }

  const cityName = citySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const builderName = builderSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const pageUrl = `${APP_URL}/${stateInfo.slug}/${citySlug}/${builderSlug}`

  // Generate structured data
  const breadcrumbData = generateBreadcrumbSchema([
    { name: 'Home', item: APP_URL },
    { name: stateInfo.name, item: `${APP_URL}/${stateInfo.slug}` },
    { name: cityName, item: `${APP_URL}/${stateInfo.slug}/${citySlug}` },
    { name: builderName, item: pageUrl },
  ])

  return (
    <>
      <JsonLd data={breadcrumbData} />
      
      <div className="min-h-screen bg-slate-50">
        {/* Builder Header */}
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="text-sm text-slate-500 mb-4">
              <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <Link href={`/${stateInfo.slug}`} className="hover:text-slate-900 transition-colors">
                {stateInfo.name}
              </Link>
              <span className="mx-2">/</span>
              <Link href={`/${stateInfo.slug}/${citySlug}`} className="hover:text-slate-900 transition-colors">
                {cityName}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-slate-900">{builderName}</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Builder Logo */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-12 w-12 md:h-16 md:w-16 text-slate-400" />
              </div>

              {/* Builder Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                    {builderName}
                  </h1>
                  {builderData.isVerified && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Verified Builder
                    </Badge>
                  )}
                </div>
                
                <p className="text-slate-600 mb-4 max-w-2xl">
                  {builderData.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="font-medium">{builderData.rating}</span>
                    <span className="text-slate-500">({builderData.reviewCount.toLocaleString()} reviews)</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600">Est. {builderData.founded}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600">{builderData.headquarters}</span>
                </div>
              </div>

              {/* Contact CTA */}
              <div className="flex flex-col gap-2 md:text-right">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Phone className="h-4 w-4 mr-2" /> Call Builder
                </Button>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" /> Email
                </Button>
                <a 
                  href={builderData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-600 hover:text-emerald-700 inline-flex items-center justify-center md:justify-end"
                >
                  Visit Website <Globe className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="communities" className="w-full">
              <TabsList className="w-full justify-start mb-8">
                <TabsTrigger value="communities">Communities ({communities.length})</TabsTrigger>
                <TabsTrigger value="floorplans">Floor Plans ({floorPlans.length})</TabsTrigger>
                <TabsTrigger value="about">About {builderName}</TabsTrigger>
              </TabsList>

              {/* Communities Tab */}
              <TabsContent value="communities" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {communities.map((community) => (
                    <Card key={community.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48 bg-slate-200 flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-slate-400" />
                        <Badge 
                          className={`absolute top-3 left-3 ${
                            community.status === 'selling' ? 'bg-emerald-600' : 'bg-amber-500'
                          }`}
                        >
                          {community.status === 'selling' ? 'Now Selling' : 'Coming Soon'}
                        </Badge>
                      </div>
                      
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{community.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {community.address}, {community.city}, {community.state} {community.zipCode}
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

                        <div className="text-sm text-slate-500">
                          <span className="font-medium">{community.homesAvailable}</span> homes available
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {community.amenities.slice(0, 3).map((amenity) => (
                            <Badge key={amenity} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {community.amenities.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{community.amenities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter>
                        <Button className="w-full" variant="outline">
                          View Community
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Floor Plans Tab */}
              <TabsContent value="floorplans" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {floorPlans.map((plan) => (
                    <Card key={plan.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48 bg-slate-200 flex items-center justify-center">
                        <Home className="h-12 w-12 text-slate-400" />
                      </div>
                      
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <CardDescription>Starting at ${plan.basePrice.toLocaleString()}</CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <BedDouble className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                            <p className="text-sm font-medium">{plan.beds} Beds</p>
                          </div>
                          <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <Bath className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                            <p className="text-sm font-medium">{plan.baths} Baths</p>
                          </div>
                          <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <Maximize className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                            <p className="text-sm font-medium">{plan.sqft.toLocaleString()} sqft</p>
                          </div>
                          <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <Home className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                            <p className="text-sm font-medium">{plan.stories} Story</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <span>{plan.garage} Car Garage</span>
                        </div>
                      </CardContent>

                      <CardFooter>
                        <Button className="w-full" variant="outline">
                          View Floor Plan
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">About {builderName}</h3>
                    <p className="text-slate-600 mb-4">
                      {builderData.description}
                    </p>
                    <p className="text-slate-600">
                      Founded in {builderData.founded}, {builderName} has been dedicated to building 
                      quality homes and strong communities. With a commitment to innovation and 
                      customer satisfaction, they continue to be a leader in the homebuilding industry.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Why Choose {builderName}</h3>
                    <ul className="space-y-3">
                      {builderData.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Builder Information</h3>
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Founded</p>
                      <p className="font-medium">{builderData.founded}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Headquarters</p>
                      <p className="font-medium">{builderData.headquarters}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Specialties</p>
                      <p className="font-medium">{builderData.specialties.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="font-medium">{builderData.rating}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-emerald-600">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Build with {builderName}?
              </h2>
              <p className="text-emerald-100 mb-6">
                Schedule a tour of their communities in {cityName} and find your dream home today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-slate-100">
                  <Calendar className="h-4 w-4 mr-2" /> Schedule a Tour
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-emerald-700">
                  <Phone className="h-4 w-4 mr-2" /> Call Now
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
