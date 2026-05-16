'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Star,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Award,
  Edit
} from 'lucide-react'
import { LAUNCH_HIDE_INVENTORY } from '@/lib/launch'

interface Community {
  name: string
  city: string
  state: string
  image: string
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
  headquarters: string
  yearFounded: number
  homesBuilt: number
  communitiesCount: number
  activeMarkets: string[]
  specialties: string[]
  priceRange: {
    min: number
    max: number
    label: string
  }
  featuredCommunities: Community[]
}

interface BuilderCardProps {
  builder: Builder
  isAdmin?: boolean
}

export function BuilderCard({ builder, isAdmin }: BuilderCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Left Section - Builder Info */}
          <div className="flex-1 p-6">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden p-2">
                {builder.logo ? (
                  <img src={builder.logo} alt={`${builder.name} Logo`} className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="h-10 w-10 text-slate-400" />
                )}
              </div>

              {/* Builder Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {builder.name}
                  </h3>
                  {builder.isVerified && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {builder.isPremium && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-slate-900">{builder.rating}</span>
                    <span className="text-sm text-slate-500">({builder.reviewCount.toLocaleString()} reviews)</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm text-slate-500">Est. {builder.yearFounded}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {builder.headquarters}
                  </span>
                </div>

                {/* Description */}
                <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                  {builder.description}
                </p>

                {!LAUNCH_HIDE_INVENTORY && (
                  <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-900">{builder.communitiesCount}</span>
                      <span className="text-slate-500">communities</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-900">{builder.homesBuilt.toLocaleString()}+</span>
                      <span className="text-slate-500">homes built</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900">{builder.priceRange.label}</span>
                    </div>
                  </div>
                )}

                {/* Active Markets */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="text-xs text-slate-500 mr-1">Building in:</span>
                  {builder.activeMarkets.map((market) => (
                    <Badge
                      key={market}
                      variant="outline"
                      className="text-xs bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 cursor-pointer transition-colors"
                    >
                      {market}
                    </Badge>
                  ))}
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1.5">
                  {builder.specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="secondary"
                      className="text-xs bg-slate-100 text-slate-600"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-64 bg-slate-50 p-4 border-t lg:border-t-0 lg:border-l border-slate-100">
            <div className="space-y-2">
              <Button
                size="sm"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                asChild
              >
                <Link href={`/builders/${builder.slug}`}>
                  View Profile
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              {!LAUNCH_HIDE_INVENTORY && (
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link href={`/builders/${builder.slug}/communities`}>
                    View Communities
                  </Link>
                </Button>
              )}
              {isAdmin && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700"
                  asChild
                >
                  <Link href={`/admin/builders/${builder.id}/edit`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Builder
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
