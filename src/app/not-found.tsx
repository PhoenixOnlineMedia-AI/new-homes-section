import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Building2, HardHat, Home, Mail, MapPin, Search } from 'lucide-react'
import { POPULAR_STATES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Page Not Found | New Homes Section',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <main className="min-h-[72vh] bg-slate-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-7 flex h-24 w-24 animate-bounce items-center justify-center rounded-2xl border border-emerald-200 bg-white shadow-sm">
            <HardHat className="h-12 w-12 text-emerald-600" />
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">
            404
          </p>
          <h1 className="text-3xl font-bold text-slate-950 md:text-5xl">
            Oops! We couldn&apos;t find that homebuilder page.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
            The page may have moved as we organize the builder directory for launch.
            Try searching by builder, city, or state.
          </p>

          <form action="/builders" className="mx-auto mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                name="q"
                placeholder="Search builders, cities, or states..."
                className="h-14 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-28 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 h-10 -translate-y-1/2 rounded-md bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Search
              </button>
            </div>
          </form>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Button asChild variant="outline" className="h-12 bg-white">
              <Link href="/builders">
                <Building2 className="h-4 w-4" />
                Browse All Builders
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 bg-white">
              <Link href="/markets">
                <MapPin className="h-4 w-4" />
                Popular States
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 bg-white">
              <Link href="/contact">
                <Mail className="h-4 w-4" />
                Contact Us
              </Link>
            </Button>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-7">
            <p className="mb-4 text-sm font-medium text-slate-500">Popular builder directories</p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_STATES.slice(0, 6).map((state) => (
                <Link
                  key={state.code}
                  href={`/builders/${state.slug}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:border-emerald-500 hover:text-emerald-700"
                >
                  {state.name}
                </Link>
              ))}
              <Link
                href="/"
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:border-emerald-500 hover:text-emerald-700"
              >
                <Home className="mr-1 inline h-3.5 w-3.5" />
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
