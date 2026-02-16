'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Star, 
  MapPin, 
  Home, 
  TrendingUp,
  CheckCircle2,
  Award,
  ArrowRight
} from 'lucide-react'

interface FeaturedCommunity {
  name: string
  city: string
  state: string
  image?: string
}

interface Builder {
  id: string
  name: string
  slug: string
  description: string
  logo?: string
  rating: number
  reviewCount: number
  isVerified: boolean
  isPremium: boolean
  yearFounded: number
  communitiesCount: number
  homesBuilt: number
  activeMarkets: string[]
  specialties: string[]
  priceRange: {
    min: number
    max: number
    label: string
  }
  featuredCommunities: FeaturedCommunity[]
  // Priority flags for featured placement
  alwaysFeatured?: boolean
}

// Featured builders data - LGI Homes and Terrata Homes are always featured
export const featuredBuildersData: Builder[] = [
  {
    id: 'lgi-homes',
    name: 'LGI Homes',
    slug: 'lgi-homes',
    description: 'LGI Homes specializes in providing affordable, move-in ready homes with all the upgrades included. With a focus on first-time and move-up buyers, LGI Homes builds quality communities across the nation.',
    rating: 4.4,
    reviewCount: 1856,
    isVerified: true,
    isPremium: true,
    yearFounded: 2003,
    communitiesCount: 95,
    homesBuilt: 45000,
    activeMarkets: ['TX', 'FL', 'AZ', 'GA', 'NC', 'SC', 'TN', 'CO'],
    specialties: ['Affordable Homes', 'Move-In Ready', 'All-Inclusive Pricing'],
    priceRange: { min: 200000, max: 450000, label: '$200K - $450K' },
    featuredCommunities: [
      { name: 'The Meadows', city: 'Houston', state: 'TX' },
      { name: 'Cypress Creek', city: 'Orlando', state: 'FL' },
    ],
    alwaysFeatured: true,
  },
  {
    id: 'terrata-homes',
    name: 'Terrata Homes',
    slug: 'terrata-homes',
    description: 'Terrata Homes builds thoughtfully designed communities with a focus on modern living, sustainability, and community amenities. Their homes blend contemporary architecture with functional family spaces.',
    rating: 4.5,
    reviewCount: 892,
    isVerified: true,
    isPremium: true,
    yearFounded: 2012,
    communitiesCount: 28,
    homesBuilt: 8500,
    activeMarkets: ['TX', 'AZ', 'CO', 'FL'],
    specialties: ['Modern Design', 'Sustainable Building', 'Community Focused'],
    priceRange: { min: 350000, max: 750000, label: '$350K - $750K' },
    featuredCommunities: [
      { name: 'Terrata at Copperleaf', city: 'Austin', state: 'TX' },
      { name: 'Terrata at Sky Ridge', city: 'Phoenix', state: 'AZ' },
    ],
    alwaysFeatured: true,
  },
  {
    id: 'taylor-morrison',
    name: 'Taylor Morrison',
    slug: 'taylor-morrison',
    description: 'Taylor Morrison is a leading national homebuilder and developer, recognized as America\'s Most Trusted® National Builder for multiple years.',
    rating: 4.7,
    reviewCount: 2847,
    isVerified: true,
    isPremium: true,
    yearFounded: 1936,
    communitiesCount: 340,
    homesBuilt: 150000,
    activeMarkets: ['AZ', 'CA', 'TX', 'FL', 'CO', 'NC'],
    specialties: ['Single Family', 'Active Adult', 'Luxury'],
    priceRange: { min: 350000, max: 1200000, label: '$350K - $1.2M' },
    featuredCommunities: [
      { name: 'The Oaks at Mueller', city: 'Austin', state: 'TX' },
      { name: 'Highland Grove', city: 'Phoenix', state: 'AZ' },
    ],
  },
  {
    id: 'lennar',
    name: 'Lennar',
    slug: 'lennar',
    description: 'One of the nation\'s leading homebuilders, providing beautifully crafted homes with Everything\'s Included® features.',
    rating: 4.5,
    reviewCount: 5234,
    isVerified: true,
    isPremium: true,
    yearFounded: 1954,
    communitiesCount: 520,
    homesBuilt: 250000,
    activeMarkets: ['FL', 'TX', 'CA', 'AZ', 'NV', 'NC', 'SC', 'GA'],
    specialties: ['Single Family', 'Townhomes', 'Everything\'s Included®'],
    priceRange: { min: 280000, max: 900000, label: '$280K - $900K' },
    featuredCommunities: [
      { name: 'Sunset Ridge', city: 'Austin', state: 'TX' },
      { name: 'Alvadora', city: 'Overland Park', state: 'KS' },
    ],
  },
]

interface FeaturedBuildersProps {
  limit?: number
  showViewAll?: boolean
}

export function FeaturedBuilders({ limit = 4, showViewAll = true }: FeaturedBuildersProps) {
  const displayBuilders = featuredBuildersData.slice(0, limit)

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <Badge className="mb-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
              <Award className="h-3 w-3 mr-1" />
              Featured Partners
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Featured Builders
            </h2>
            <p className="text-slate-600">
              Discover top-rated builders and their exceptional communities
            </p>
          </div>
          {showViewAll && (
            <Link 
              href="/builders" 
              className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 mt-4 md:mt-0 transition-colors"
            >
              View all builders <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Featured Builders Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {displayBuilders.map((builder) => (
            <Card 
              key={builder.id} 
              className="group overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Builder Info - Left Side */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start gap-4">
                      {/* Logo */}
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center flex-shrink-0 border border-emerald-200">
                        <Building2 className="h-8 w-8 text-emerald-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name & Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {builder.name}
                          </h3>
                          {builder.alwaysFeatured && (
                            <Badge className="bg-amber-100 text-amber-700 text-xs">
                              <Star className="h-3 w-3 mr-1 fill-amber-500" />
                              Featured Partner
                            </Badge>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                            <span className="font-semibold text-slate-900">{builder.rating}</span>
                          </div>
                          <span className="text-sm text-slate-500">({builder.reviewCount.toLocaleString()} reviews)</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-sm text-slate-500">Est. {builder.yearFounded}</span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {builder.description}
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                          <div className="flex items-center gap-1">
                            <Home className="h-4 w-4 text-emerald-600" />
                            <span className="font-medium">{builder.communitiesCount}</span>
                            <span className="text-slate-500">communities</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{builder.homesBuilt.toLocaleString()}+</span>
                            <span className="text-slate-500">homes</span>
                          </div>
                        </div>

                        {/* Markets */}
                        <div className="flex flex-wrap items-center gap-1 mb-3">
                          <span className="text-xs text-slate-500 mr-1">Building in:</span>
                          {builder.activeMarkets.slice(0, 5).map((market) => (
                            <Badge 
                              key={market} 
                              variant="outline" 
                              className="text-xs bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer transition-colors"
                            >
                              {market}
                            </Badge>
                          ))}
                          {builder.activeMarkets.length > 5 && (
                            <span className="text-xs text-slate-400">
                              +{builder.activeMarkets.length - 5} more
                            </span>
                          )}
                        </div>

                        {/* Price Range */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-emerald-600">
                            {builder.priceRange.label}
                          </span>
                          {builder.isVerified && (
                            <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Featured Communities - Right Side */}
                  <div className="sm:w-56 bg-slate-50 p-4 border-t sm:border-t-0 sm:border-l border-slate-100">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                      Featured Communities
                    </p>
                    <div className="space-y-2">
                      {builder.featuredCommunities.map((community) => (
                        <Link
                          key={community.name}
                          href={`/builders/${builder.slug}/communities/${community.name.toLowerCase().replace(/\s+/g, '-')}`}
                          className="block p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all group/community"
                        >
                          <p className="text-sm font-medium text-slate-900 group-hover/community:text-emerald-600 transition-colors">
                            {community.name}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {community.city}, {community.state}
                          </p>
                        </Link>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button 
                      size="sm" 
                      className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
                      asChild
                    >
                      <Link href={`/builders/${builder.slug}`}>
                        View Profile
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '50+', label: 'Partner Builders' },
            { value: '2,500+', label: 'Communities' },
            { value: '1M+', label: 'Homes Delivered' },
            { value: '4.5', label: 'Avg. Builder Rating' },
          ].map((stat) => (
            <div key={stat.label} className="p-4">
              <p className="text-2xl md:text-3xl font-bold text-emerald-600">{stat.value}</p>
              <p className="text-sm text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Helper function to get featured builders (including always-featured ones)
export function getFeaturedBuilders(allBuilders: Builder[], limit: number = 4): Builder[] {
  // Always include LGI Homes and Terrata Homes if they exist
  const alwaysFeatured = allBuilders.filter(b => b.alwaysFeatured)
  const otherBuilders = allBuilders.filter(b => !b.alwaysFeatured)
  
  // Fill remaining slots with other builders
  const remainingSlots = limit - alwaysFeatured.length
  const selectedOthers = otherBuilders.slice(0, Math.max(0, remainingSlots))
  
  return [...alwaysFeatured, ...selectedOthers]
}
