'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, Search, Home, MapPin, Building2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants'

const mainNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/builders', label: 'Find Builders', icon: Building2 },
  { href: '/search', label: 'Communities', icon: Search },
  { href: '/markets', label: 'Markets', icon: MapPin },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-x-0 border-t-0 rounded-none">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-re-blue-900 to-re-blue-700 text-white shadow-lg group-hover:shadow-xl transition-shadow">
            <Home className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-re-blue-900 transition-colors">
              {APP_NAME}
            </h1>
            <p className="text-xs text-slate-500 leading-tight">{APP_TAGLINE}</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-re-blue-800 rounded-lg hover:bg-re-blue-50 transition-all"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="cta" size="sm" asChild>
            <Link href="/search">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu" className="text-slate-600">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px] border-l border-slate-200">
            <div className="flex flex-col gap-6 pt-6">
              {/* Mobile Logo */}
              <Link
                href="/"
                className="flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-re-blue-900 to-re-blue-700 text-white shadow-lg">
                  <Home className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">{APP_NAME}</h1>
                  <p className="text-xs text-slate-500">{APP_TAGLINE}</p>
                </div>
              </Link>

              {/* Mobile Navigation */}
              <nav className="flex flex-col gap-1">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-600 hover:text-re-blue-800 rounded-lg hover:bg-re-blue-50 transition-all"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile CTA */}
              <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-slate-100">
                <Button variant="cta" asChild>
                  <Link href="/search" onClick={() => setIsOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
