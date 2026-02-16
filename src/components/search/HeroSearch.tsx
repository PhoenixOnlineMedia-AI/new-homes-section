'use client'

import { SearchBar } from './SearchBar'
import { POPULAR_STATES } from '@/lib/constants'
import Link from 'next/link'
import { TrendingUp, Building2, MapPin, Home } from 'lucide-react'

export function HeroSearch() {
  return (
    <section className="relative overflow-hidden gradient-hero-light py-16 md:py-24 lg:py-32">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-re-blue-900/10" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-re-emerald-300 text-sm font-semibold mb-8 shadow-lg">
            <span className="flex h-2.5 w-2.5 rounded-full bg-re-emerald-400 animate-pulse" />
            <TrendingUp className="h-4 w-4" />
            Over 10,000 New Homes Available
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Find Your Perfect
            <span className="block mt-2 bg-gradient-to-r from-re-emerald-300 to-re-emerald-400 bg-clip-text text-transparent">
              New Home
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Search new construction homes, communities, and builders across the US. 
            Compare prices, floor plans, and find your dream home today.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar 
              variant="hero" 
              placeholder="Enter city, state, or ZIP code..."
            />
          </div>

          {/* Quick Builder Browse */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <span className="text-sm text-blue-200">or</span>
            <Link 
              href="/builders"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-emerald-500 text-white rounded-full transition-all border border-white/20 hover:border-emerald-400"
            >
              <Building2 className="h-4 w-4" />
              <span className="font-medium">Browse All Builders</span>
            </Link>
          </div>

          {/* Quick Stats - Premium Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <Home className="h-6 w-6 text-re-emerald-400 mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-white">10K+</p>
              <p className="text-sm text-blue-200">New Homes</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <MapPin className="h-6 w-6 text-re-emerald-400 mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-white">500+</p>
              <p className="text-sm text-blue-200">Communities</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <Building2 className="h-6 w-6 text-re-emerald-400 mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-white">200+</p>
              <p className="text-sm text-blue-200">Builders</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <TrendingUp className="h-6 w-6 text-re-emerald-400 mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-white">50+</p>
              <p className="text-sm text-blue-200">States</p>
            </div>
          </div>

          {/* Popular States */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-blue-200 mr-2">Popular:</span>
            {POPULAR_STATES.slice(0, 6).map((state) => (
              <Link
                key={state.code}
                href={`/${state.slug}`}
                className="px-4 py-1.5 text-sm bg-white/10 hover:bg-re-emerald-500 text-white rounded-full transition-all border border-white/10 hover:border-re-emerald-400 hover:shadow-lg"
              >
                {state.name}
              </Link>
            ))}
            <Link
              href="#states"
              className="px-4 py-1.5 text-sm text-re-emerald-300 hover:text-re-emerald-200 transition-colors hover:underline"
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
