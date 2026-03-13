'use client'

import { SearchBar } from './SearchBar'
import { POPULAR_STATES } from '@/lib/constants'
import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, Building2, MapPin, Home } from 'lucide-react'

export function HeroSearch() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-mansion.jpg"
          alt="Luxury Glass Mansion with Pool at Sunset"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Gradient Overlay for Text Contrast */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-re-blue-950/80 via-re-blue-900/60 to-re-blue-950/90" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-semibold mb-8 shadow-lg">
            <span className="flex h-2.5 w-2.5 rounded-full bg-re-green-400 animate-pulse shadow-[0_0_8px_rgba(166,196,56,0.8)]" />
            <TrendingUp className="h-4 w-4" />
            Over 10,000 New Homes Available
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
            Find Your Perfect
            <span className="block mt-2 text-re-green-400 drop-shadow-md">
              New Home
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/95 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-medium">
            Search new construction homes, communities, and builders across the US.
            Compare prices, floor plans, and find your dream home today.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 drop-shadow-xl">
            <SearchBar
              variant="hero"
              placeholder="Enter city, state, or ZIP code..."
            />
          </div>

          {/* Quick Builder Browse */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <span className="text-sm text-white/90 font-medium drop-shadow-sm">or</span>
            <Link
              href="/builders"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-re-green-500 text-white rounded-full transition-all border border-white/30 hover:border-re-green-400 backdrop-blur-sm shadow-lg hover:shadow-xl"
            >
              <Building2 className="h-4 w-4" />
              <span className="font-medium">Browse All Builders</span>
            </Link>
          </div>

          {/* Quick Stats - Premium Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="glass-panel rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors">
              <Home className="h-6 w-6 text-re-green-400 mx-auto mb-2 drop-shadow-sm" />
              <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">10K+</p>
              <p className="text-sm text-white/90 font-medium">New Homes</p>
            </div>
            <div className="glass-panel rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors">
              <MapPin className="h-6 w-6 text-re-green-400 mx-auto mb-2 drop-shadow-sm" />
              <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">500+</p>
              <p className="text-sm text-white/90 font-medium">Communities</p>
            </div>
            <div className="glass-panel rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors">
              <Building2 className="h-6 w-6 text-re-green-400 mx-auto mb-2 drop-shadow-sm" />
              <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">200+</p>
              <p className="text-sm text-white/90 font-medium">Builders</p>
            </div>
            <div className="glass-panel rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors">
              <TrendingUp className="h-6 w-6 text-re-green-400 mx-auto mb-2 drop-shadow-sm" />
              <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">50+</p>
              <p className="text-sm text-white/90 font-medium">States</p>
            </div>
          </div>

          {/* Popular States */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-white/90 font-medium mr-2 drop-shadow-sm">Popular:</span>
            {POPULAR_STATES.slice(0, 6).map((state) => (
              <Link
                key={state.code}
                href={`/${state.slug}`}
                className="px-4 py-1.5 text-sm bg-white/15 hover:bg-re-green-500 text-white rounded-full transition-all border border-white/20 hover:border-re-green-400 hover:shadow-lg backdrop-blur-sm"
              >
                {state.name}
              </Link>
            ))}
            <Link
              href="#states"
              className="px-4 py-1.5 text-sm text-white hover:text-re-green-300 transition-colors font-medium drop-shadow-sm"
            >
              View all →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}
