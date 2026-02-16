'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Home, DollarSign } from 'lucide-react'

export interface InspirationCard {
  id: string
  title: string
  description: string
  imageUrl: string
  location: string
  priceRange: string
  features: string[]
}

// Phoenix-area inspiration cards with descriptive filenames
export const phoenixInspirations: InspirationCard[] = [
  {
    id: 'insp-1',
    title: 'Modern Desert Oasis',
    description: 'Contemporary single-story with infinity pool and mountain views',
    imageUrl: '/inspirations/phoenix-modern-desert-pool-mountain-views.jpg',
    location: 'Scottsdale, AZ',
    priceRange: '$650K - $950K',
    features: ['Pool', 'Single Story', 'Mountain Views', '3-4 Beds'],
  },
  {
    id: 'insp-2',
    title: 'Family Haven in Gilbert',
    description: 'Spacious two-story with community amenities and top-rated schools',
    imageUrl: '/inspirations/gilbert-family-two-story-community-pool.jpg',
    location: 'Gilbert, AZ',
    priceRange: '$450K - $650K',
    features: ['4+ Beds', 'Community Pool', 'A+ Schools', 'Gated'],
  },
  {
    id: 'insp-3',
    title: 'Luxury Estate Paradise Valley',
    description: 'Executive home with resort-style backyard and premium finishes',
    imageUrl: '/inspirations/paradise-valley-luxury-estate-resort-backyard.jpg',
    location: 'Paradise Valley, AZ',
    priceRange: '$1.2M - $2.5M',
    features: ['Luxury', 'Pool & Spa', '5+ Beds', 'Guest House'],
  },
  {
    id: 'insp-4',
    title: 'Chandler Townhome',
    description: 'Low-maintenance modern living near tech corridor',
    imageUrl: '/inspirations/chandler-modern-townhome-tech-corridor.jpg',
    location: 'Chandler, AZ',
    priceRange: '$350K - $500K',
    features: ['Townhome', 'Low Maintenance', 'Near Intel', '2-3 Beds'],
  },
  {
    id: 'insp-5',
    title: 'Peoria Lake Pleasant Views',
    description: 'New construction with lake access and outdoor living',
    imageUrl: '/inspirations/peoria-lake-pleasant-outdoor-living.jpg',
    location: 'Peoria, AZ',
    priceRange: '$400K - $600K',
    features: ['Lake Access', 'Outdoor Kitchen', 'Boating', '4 Beds'],
  },
  {
    id: 'insp-6',
    title: 'Arcadia Traditional Charm',
    description: 'Classic architecture with modern updates in established neighborhood',
    imageUrl: '/inspirations/phoenix-arcadia-traditional-modern-updates.jpg',
    location: 'Phoenix (Arcadia), AZ',
    priceRange: '$800K - $1.4M',
    features: ['Character Home', 'Remodeled', 'Large Lot', '3-4 Beds'],
  },
]

interface InspirationCardsProps {
  onSelect?: (inspiration: InspirationCard) => void
  className?: string
}

export function InspirationCards({ onSelect, className = '' }: InspirationCardsProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
      {phoenixInspirations.map((inspiration) => (
        <Card
          key={inspiration.id}
          className="group cursor-pointer overflow-hidden border-slate-200 hover:border-re-blue-400 hover:shadow-lg transition-all card-hover"
          onClick={() => onSelect?.(inspiration)}
        >
          {/* Image Placeholder - will be replaced with real images */}
          <div className="relative h-32 bg-gradient-to-br from-re-blue-100 to-re-emerald-100 flex items-center justify-center overflow-hidden">
            <Home className="h-10 w-10 text-re-blue-300 group-hover:scale-110 transition-transform" />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-re-blue-900/0 group-hover:bg-re-blue-900/10 transition-colors" />
            
            {/* Price badge */}
            <Badge className="absolute top-2 right-2 bg-re-blue-900/90 text-white text-xs">
              {inspiration.priceRange}
            </Badge>
          </div>
          
          <CardContent className="p-3">
            <h4 className="font-semibold text-sm text-slate-900 line-clamp-1 group-hover:text-re-blue-700 transition-colors">
              {inspiration.title}
            </h4>
            
            <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-2">
              {inspiration.description}
            </p>
            
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="h-3 w-3" />
              {inspiration.location}
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {inspiration.features.slice(0, 2).map((feature) => (
                <span
                  key={feature}
                  className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full"
                >
                  {feature}
                </span>
              ))}
              {inspiration.features.length > 2 && (
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                  +{inspiration.features.length - 2}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default InspirationCards
