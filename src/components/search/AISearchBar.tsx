'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Search, X, Mic, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface AISearchBarProps {
  variant?: 'default' | 'hero' | 'compact'
  placeholder?: string
  initialValue?: string
  onSearch?: (query: string, type: 'ai' | 'standard') => void
  className?: string
  showAIHint?: boolean
}

// Example natural language queries
const exampleQueries = [
  'Homes near good schools in Phoenix',
  '4 bedroom with pool under $600K',
  'Modern townhomes in Gilbert',
  'Luxury estates with mountain views',
  'Family-friendly communities with parks',
]

export function AISearchBar({
  variant = 'default',
  placeholder = 'Describe your dream home in natural language...',
  initialValue = '',
  onSearch,
  className = '',
  showAIHint = true,
}: AISearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)
  const [isAIEnabled, setIsAIEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const trimmedQuery = query.trim()
      
      if (!trimmedQuery) return

      setIsLoading(true)

      try {
        if (onSearch) {
          await onSearch(trimmedQuery, isAIEnabled ? 'ai' : 'standard')
        } else {
          // Navigate to search page with query
          const searchType = isAIEnabled ? 'ai' : 'standard'
          router.push(`/search?q=${encodeURIComponent(trimmedQuery)}&type=${searchType}`)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [query, onSearch, router, isAIEnabled]
  )

  const handleClear = useCallback(() => {
    setQuery('')
  }, [])

  const handleExampleClick = (example: string) => {
    setQuery(example)
    setIsFocused(false)
    if (onSearch) {
      onSearch(example, isAIEnabled ? 'ai' : 'standard')
    }
  }

  const sizeClasses = {
    default: 'h-12 text-base',
    hero: 'h-14 md:h-16 text-base md:text-lg',
    compact: 'h-10 text-sm',
  }

  const inputClasses = {
    default: 'pl-12 pr-28',
    hero: 'pl-14 pr-32',
    compact: 'pl-10 pr-24',
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
        {/* AI/Search Icon */}
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
          isAIEnabled ? 'text-re-emerald-500' : 'text-slate-400'
        } ${variant === 'hero' ? 'left-4' : ''}`}>
          {isAIEnabled ? (
            <Sparkles className={iconSizes[variant]} />
          ) : (
            <Search className={iconSizes[variant]} />
          )}
        </div>

        {/* Input */}
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          disabled={isLoading}
          className={`
            w-full rounded-full border-slate-200 bg-white shadow-sm
            transition-all duration-200
            ${isFocused ? 'border-re-blue-500 ring-2 ring-re-blue-500/20' : ''}
            ${isAIEnabled ? 'focus:border-re-emerald-500 focus:ring-re-emerald-500/20' : ''}
            ${sizeClasses[variant]}
            ${inputClasses[variant]}
          `}
        />

        {/* AI Toggle */}
        <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-2 ${
          variant === 'hero' ? 'right-24 md:right-28' : 'right-20'
        }`}>
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            type="button"
            onClick={() => setIsAIEnabled(!isAIEnabled)}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all
              ${isAIEnabled 
                ? 'bg-re-emerald-100 text-re-emerald-700 hover:bg-re-emerald-200' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }
            `}
            title={isAIEnabled ? 'AI Search enabled' : 'Standard search'}
          >
            <Sparkles className="h-3 w-3" />
            AI
          </button>
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className={`
            absolute top-1/2 -translate-y-1/2 right-1 rounded-full
            transition-all duration-200
            ${variant === 'hero' 
              ? 'h-10 md:h-12 px-6 md:px-8' 
              : variant === 'compact'
              ? 'h-8 px-3 text-xs'
              : 'h-9 px-4'
            }
            ${isAIEnabled
              ? 'bg-gradient-to-r from-re-emerald-500 to-re-emerald-600 hover:from-re-emerald-600 hover:to-re-emerald-700 text-white shadow-md'
              : 'bg-re-blue-900 hover:bg-re-blue-800 text-white shadow-md'
            }
          `}
        >
          {isLoading ? (
            <Loader2 className={`${iconSizes[variant]} animate-spin`} />
          ) : (
            <>
              <Search className={`${iconSizes[variant]} ${variant !== 'compact' ? 'mr-2' : ''}`} />
              {variant !== 'compact' && (isAIEnabled ? 'AI Search' : 'Search')}
            </>
          )}
        </Button>
      </div>

      {/* AI Hint */}
      {showAIHint && isAIEnabled && !query && (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <Sparkles className="h-3 w-3 text-re-emerald-500" />
          <span>Try: &quot;4 bedroom homes with pool near Scottsdale&quot;</span>
        </div>
      )}

      {/* Example Queries Dropdown */}
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isAIEnabled ? 'Try an AI search' : 'Popular searches'}
            </p>
            {isAIEnabled && (
              <Badge variant="secondary" className="text-xs bg-re-emerald-100 text-re-emerald-700">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-re-blue-50 text-slate-600 hover:text-re-blue-700 rounded-full transition-colors text-left"
              >
                {example}
              </button>
            ))}
          </div>
          
          {isAIEnabled && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                <Sparkles className="h-3 w-3 inline mr-1" />
                AI search understands natural language and finds semantically matching homes
              </p>
            </div>
          )}
        </div>
      )}
    </form>
  )
}

export default AISearchBar
