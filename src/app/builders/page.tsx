import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BuilderCard } from '@/components/builders/BuilderCard'
import { BuildersFilter } from '@/components/builders/BuildersFilter'
import { POPULAR_STATES, APP_NAME, APP_DESCRIPTION } from '@/lib/constants'
import { 
  Building2, 
  MapPin, 
  Star, 
  TrendingUp,
  Search,
  Award,
  Users,
  ArrowRight
} from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Find New Home Builders',
  description: `Browse top-rated new home builders across the US. Discover ${APP_NAME}'s comprehensive directory of national and regional builders, their communities, and available home plans.`,
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
    description: 'Browse top-rated new home builders and their communities across the US.',
  },
}

// Sample builder data (will come from Supabase)
// LGI Homes and Terrata Homes are always featured builders
const sampleBuilders = [
  {
    id: 'lgi-homes',
    name: 'LGI Homes',
    slug: 'lgi-homes',
    description: 'LGI Homes specializes in providing affordable, move-in ready homes with all the upgrades included. With a focus on first-time and move-up buyers, LGI Homes builds quality communities across the nation.',
    logo: '/placeholder-builder.svg',
    rating: 4.4,
    reviewCount: 1856,
    isVerified: true,
    isPremium: true,
    headquarters: 'The Woodlands, TX',
    yearFounded: 2003,
    homesBuilt: 45000,
    communitiesCount: 95,
    activeMarkets: ['TX', 'FL', 'AZ', 'GA', 'NC', 'SC', 'TN', 'CO', 'NV'],
    specialties: ['Affordable Homes', 'Move-In Ready', 'All-Inclusive Pricing'],
    priceRange: { min: 200000, max: 450000, label: '$200K - $450K' },
    featuredCommunities: [
      { name: 'The Meadows', city: 'Houston', state: 'TX', image: '/placeholder-community.jpg' },
      { name: 'Cypress Creek', city: 'Orlando', state: 'FL', image: '/placeholder-community.jpg' },
    ],
    alwaysFeatured: true,
  },
  {
    id: 'terrata-homes',
    name: 'Terrata Homes',
    slug: 'terrata-homes',
    description: 'Terrata Homes builds thoughtfully designed communities with a focus on modern living, sustainability, and community amenities. Their homes blend contemporary architecture with functional family spaces.',
    logo: '/placeholder-builder.svg',
    rating: 4.5,
    reviewCount: 892,
    isVerified: true,
    isPremium: true,
    headquarters: 'Austin, TX',
    yearFounded: 2012,
    homesBuilt: 8500,
    communitiesCount: 28,
    activeMarkets: ['TX', 'AZ', 'CO', 'FL'],
    specialties: ['Modern Design', 'Sustainable Building', 'Community Focused'],
    priceRange: { min: 350000, max: 750000, label: '$350K - $750K' },
    featuredCommunities: [
      { name: 'Terrata at Copperleaf', city: 'Austin', state: 'TX', image: '/placeholder-community.jpg' },
      { name: 'Terrata at Sky Ridge', city: 'Phoenix', state: 'AZ', image: '/placeholder-community.jpg' },
    ],
    alwaysFeatured: true,
  },
  {
    id: 'taylor-morrison',
    name: 'Taylor Morrison',
    slug: 'taylor-morrison',
    description: 'Taylor Morrison is a leading national homebuilder and developer, recognized as America\'s Most Trusted® National Builder.',
    logo: '/placeholder-builder.svg',
    rating: 4.7,
    reviewCount: 2847,
    isVerified: true,
    isPremium: true,
    headquarters: 'Scottsdale, AZ',
    yearFounded: 1936,
    homesBuilt: 150000,
    communitiesCount: 340,
    activeMarkets: ['AZ', 'CA', 'TX', 'FL', 'CO', 'NC'],
    specialties: ['Single Family', 'Active Adult', 'Luxury'],
    priceRange: { min: 350000, max: 1200000, label: '$350K - $1.2M' },
    featuredCommunities: [
      { name: 'The Oaks at Mueller', city: 'Austin', state: 'TX', image: '/placeholder-community.jpg' },
      { name: 'Highland Grove', city: 'Phoenix', state: 'AZ', image: '/placeholder-community.jpg' },
    ],
  },
  {
    id: 'lennar',
    name: 'Lennar',
    slug: 'lennar',
    description: 'One of the nation\'s leading homebuilders, providing beautifully crafted homes with Everything\'s Included® features.',
    logo: '/placeholder-builder.svg',
    rating: 4.5,
    reviewCount: 5234,
    isVerified: true,
    isPremium: true,
    headquarters: 'Miami, FL',
    yearFounded: 1954,
    homesBuilt: 250000,
    communitiesCount: 520,
    activeMarkets: ['FL', 'TX', 'CA', 'AZ', 'NV', 'NC', 'SC', 'GA'],
    specialties: ['Single Family', 'Townhomes', 'Everything\'s Included®'],
    priceRange: { min: 280000, max: 900000, label: '$280K - $900K' },
    featuredCommunities: [
      { name: 'Sunset Ridge', city: 'Austin', state: 'TX', image: '/placeholder-community.jpg' },
      { name: 'Alvadora', city: 'Overland Park', state: 'KS', image: '/placeholder-community.jpg' },
    ],
  },
  {
    id: 'dr-horton',
    name: 'DR Horton',
    slug: 'dr-horton',
    description: 'America\'s largest homebuilder by volume, offering quality homes at affordable prices across 33 states.',
    logo: '/placeholder-builder.svg',
    rating: 4.3,
    reviewCount: 3892,
    isVerified: true,
    isPremium: false,
    headquarters: 'Arlington, TX',
    yearFounded: 1978,
    homesBuilt: 800000,
    communitiesCount: 890,
    activeMarkets: ['TX', 'FL', 'AZ', 'NC', 'SC', 'TN', 'CO'],
    specialties: ['Single Family', 'Express Homes', 'Affordable'],
    priceRange: { min: 220000, max: 650000, label: '$220K - $650K' },
    featuredCommunities: [
      { name: 'Bridgeland', city: 'Cypress', state: 'TX', image: '/placeholder-community.jpg' },
    ],
  },
  {
    id: 'pulte-homes',
    name: 'Pulte Homes',
    slug: 'pulte-homes',
    description: 'Builds quality new homes with innovative designs and energy-efficient features for every stage of life.',
    logo: '/placeholder-builder.svg',
    rating: 4.6,
    reviewCount: 2156,
    isVerified: true,
    isPremium: true,
    headquarters: 'Atlanta, GA',
    yearFounded: 1950,
    homesBuilt: 600000,
    communitiesCount: 280,
    activeMarkets: ['FL', 'TX', 'AZ', 'GA', 'NC', 'SC', 'TN'],
    specialties: ['Single Family', 'Del Webb 55+', 'Life Tested®'],
    priceRange: { min: 300000, max: 850000, label: '$300K - $850K' },
    featuredCommunities: [
      { name: 'Village Farms', city: 'Frisco', state: 'TX', image: '/placeholder-community.jpg' },
    ],
  },
  {
    id: 'toll-brothers',
    name: 'Toll Brothers',
    slug: 'toll-brothers',
    description: 'America\'s Luxury Home Builder, creating communities with distinctive architecture and exceptional quality.',
    logo: '/placeholder-builder.svg',
    rating: 4.8,
    reviewCount: 1823,
    isVerified: true,
    isPremium: true,
    headquarters: 'Horsham, PA',
    yearFounded: 1967,
    homesBuilt: 120000,
    communitiesCount: 145,
    activeMarkets: ['CA', 'TX', 'FL', 'AZ', 'CO', 'NC', 'NV'],
    specialties: ['Luxury', 'Single Family', 'Active Adult'],
    priceRange: { min: 600000, max: 2500000, label: '$600K - $2.5M' },
    featuredCommunities: [
      { name: 'The Enclave', city: 'Scottsdale', state: 'AZ', image: '/placeholder-community.jpg' },
    ],
  },
  {
    id: 'kb-home',
    name: 'KB Home',
    slug: 'kb-home',
    description: 'Builds personalized new homes with a focus on energy efficiency and customer choice.',
    logo: '/placeholder-builder.svg',
    rating: 4.2,
    reviewCount: 1654,
    isVerified: true,
    isPremium: false,
    headquarters: 'Los Angeles, CA',
    yearFounded: 1957,
    homesBuilt: 650000,
    communitiesCount: 210,
    activeMarkets: ['CA', 'TX', 'AZ', 'NV', 'FL', 'NC'],
    specialties: ['Personalized Homes', 'Energy Efficient', 'First-Time Buyer'],
    priceRange: { min: 250000, max: 750000, label: '$250K - $750K' },
    featuredCommunities: [
      { name: 'Desert Ridge', city: 'Phoenix', state: 'AZ', image: '/placeholder-community.jpg' },
    ],
  },
]

// Stats for the page
const stats = [
  { icon: Building2, value: '50+', label: 'Builders' },
  { icon: MapPin, value: '200+', label: 'Markets' },
  { icon: Users, value: '2,500+', label: 'Communities' },
  { icon: Star, value: '4.5', label: 'Avg. Rating' },
]

// Filter options
const marketOptions = [
  { label: 'Arizona', value: 'AZ', count: 12 },
  { label: 'California', value: 'CA', count: 15 },
  { label: 'Colorado', value: 'CO', count: 8 },
  { label: 'Florida', value: 'FL', count: 18 },
  { label: 'Georgia', value: 'GA', count: 9 },
  { label: 'North Carolina', value: 'NC', count: 11 },
  { label: 'Nevada', value: 'NV', count: 6 },
  { label: 'South Carolina', value: 'SC', count: 7 },
  { label: 'Tennessee', value: 'TN', count: 5 },
  { label: 'Texas', value: 'TX', count: 22 },
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

export default function BuildersDirectoryPage() {
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
          itemListElement: sampleBuilders.map((builder, index) => ({
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
                Browse top-rated builders, explore their communities, and find the perfect 
                partner for your new home journey. From national names to local experts.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {stats.map((stat) => (
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
                    <Button variant="outline" className="h-12 px-6">
                      <MapPin className="h-4 w-4 mr-2" />
                      Filter by Location
                    </Button>
                    <Button className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700">
                      Search Builders
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
                <div className="sticky top-24 space-y-4">
                  <BuildersFilter 
                    title="Markets"
                    options={marketOptions.map(m => ({ ...m, checked: false }))}
                    type="checkbox"
                  />
                  <BuildersFilter 
                    title="Community Types"
                    options={communityTypeOptions.map(t => ({ label: t.label, value: t.value, checked: false }))}
                    type="checkbox"
                  />
                  <BuildersFilter 
                    title="Price Range"
                    options={priceRangeOptions.map(p => ({ label: p.label, value: `${p.min}-${p.max}`, checked: false }))}
                    type="checkbox"
                  />
                  <BuildersFilter 
                    title="Builder Size"
                    options={builderSizeOptions.map(s => ({ ...s, checked: false }))}
                    type="radio"
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
                      Showing {sampleBuilders.length} builders
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
                  {sampleBuilders.map((builder) => (
                    <BuilderCard key={builder.id} builder={builder} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <span className="text-slate-400">...</span>
                  <Button variant="outline" size="sm">
                    8
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
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
                Find top builders in your desired location. Explore communities 
                across the country&apos;s hottest new home markets.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {marketOptions.slice(0, 10).map((market) => (
                <Link
                  key={market.value}
                  href={`/markets/${market.value.toLowerCase()}/builders`}
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

            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link href="#">
                  View All Markets <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
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
                  description: 'All builders are verified and rated by actual home buyers. Read real reviews before you choose.',
                },
                {
                  icon: TrendingUp,
                  title: 'Market Leaders',
                  description: 'We partner with top national and regional builders who have proven track records of quality.',
                },
                {
                  icon: Award,
                  title: 'Warranty Protected',
                  description: 'Our builders offer comprehensive warranties for peace of mind in your new home investment.',
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
                Start exploring communities from top-rated builders in your area today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100 shadow-lg" asChild>
                  <Link href="/search">Search Communities</Link>
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
