'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto text-center">
          {/* 404 Icon */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-200 flex items-center justify-center">
            <span className="text-4xl font-bold text-slate-400">404</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-slate-600 mb-8 text-lg">
            Sorry, we couldn&apos;t find the page you were looking for. 
            The home you&apos;re searching for may have been sold or the page has moved.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Homepage
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/search">
                <Search className="h-4 w-4 mr-2" />
                Search Homes
              </Link>
            </Button>
          </div>

          {/* Additional Links */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-4">Popular destinations:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: 'New Homes in Texas', href: '/texas' },
                { label: 'New Homes in Florida', href: '/florida' },
                { label: 'New Homes in Arizona', href: '/arizona' },
                { label: 'Search All', href: '/search' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-full hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Go Back */}
          <button 
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="mt-6 text-sm text-slate-500 hover:text-slate-700 inline-flex items-center"
          >
            ← Go back to previous page
          </button>
        </div>
      </div>
    </div>
  )
}
