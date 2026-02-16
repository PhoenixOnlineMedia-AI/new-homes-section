'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  variant?: 'default' | 'hero' | 'compact'
  placeholder?: string
  initialValue?: string
  onSearch?: (query: string) => void
  className?: string
}

export function SearchBar({
  variant = 'default',
  placeholder = 'Search by city, state, or zip code...',
  initialValue = '',
  onSearch,
  className = '',
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmedQuery = query.trim()
      
      if (!trimmedQuery) return

      if (onSearch) {
        onSearch(trimmedQuery)
      } else {
        // Navigate to search page with query
        router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`)
      }
    },
    [query, onSearch, router]
  )

  const handleClear = useCallback(() => {
    setQuery('')
  }, [])

  const sizeClasses = {
    default: 'h-12 text-base',
    hero: 'h-14 md:h-16 text-base md:text-lg',
    compact: 'h-10 text-sm',
  }

  const inputClasses = {
    default: 'pl-10 pr-10',
    hero: 'pl-12 pr-12',
    compact: 'pl-9 pr-9',
  }

  const iconSizes = {
    default: 'h-5 w-5',
    hero: 'h-6 w-6',
    compact: 'h-4 w-4',
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`relative w-full ${className}`}
    >
      <div className="relative">
        {/* Search Icon */}
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${
          variant === 'hero' ? 'left-4' : ''
        }`}>
          <MapPin className={iconSizes[variant]} />
        </div>

        {/* Input */}
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full rounded-full border-slate-200 bg-white shadow-sm
            transition-all duration-200
            ${isFocused ? 'border-re-blue-500 ring-2 ring-re-blue-500/20' : ''}
            ${sizeClasses[variant]}
            ${inputClasses[variant]}
          `}
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors ${
              variant === 'hero' ? 'right-24 md:right-28' : 'right-20'
            }`}
          >
            <X className={iconSizes[variant]} />
          </button>
        )}

        {/* Search Button */}
        <Button
          type="submit"
          className={`
            absolute top-1/2 -translate-y-1/2 right-1 rounded-full
            bg-re-blue-900 hover:bg-re-blue-800 text-white shadow-md hover:shadow-lg
            transition-all duration-200
            ${variant === 'hero' 
              ? 'h-10 md:h-12 px-6 md:px-8' 
              : variant === 'compact'
              ? 'h-8 px-3 text-xs'
              : 'h-9 px-4'
            }
          `}
        >
          <Search className={`${iconSizes[variant]} ${variant !== 'compact' ? 'mr-2' : ''}`} />
          {variant !== 'compact' && 'Search'}
        </Button>
      </div>

      {/* Quick suggestions - shown on focus */}
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-4 z-50">
          <p className="text-xs font-medium text-slate-500 mb-2">Popular Searches</p>
          <div className="flex flex-wrap gap-2">
            {['Austin, TX', 'Phoenix, AZ', 'Orlando, FL', 'Denver, CO'].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setQuery(suggestion)
                  router.push(`/search?q=${encodeURIComponent(suggestion)}`)
                }}
                className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-re-blue-50 text-slate-600 hover:text-re-blue-700 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  )
}
