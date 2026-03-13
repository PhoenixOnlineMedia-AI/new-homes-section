'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  SlidersHorizontal
} from 'lucide-react'

interface FilterOption {
  label: string
  value: string
  count?: number
  checked: boolean
}

interface BuildersFilterProps {
  title: string
  options: FilterOption[]
  type?: 'checkbox' | 'radio'
  defaultExpanded?: boolean
  onChange?: (value: string, checked: boolean) => void
  searchParamKey?: string
}

export function BuildersFilter({
  title,
  options,
  type = 'checkbox',
  defaultExpanded = true,
  onChange,
  searchParamKey,
}: BuildersFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [showAll, setShowAll] = useState(false)

  const selectedValues = useMemo(() => {
    if (!searchParamKey) return []
    const param = searchParams.get(searchParamKey)
    return param ? param.split(',') : []
  }, [searchParams, searchParamKey])

  const handleToggle = (value: string) => {
    let newValues: string[]

    if (type === 'radio') {
      newValues = selectedValues.includes(value) ? [] : [value]
    } else {
      newValues = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value]
    }

    if (searchParamKey) {
      const params = new URLSearchParams(searchParams.toString())
      if (newValues.length > 0) {
        params.set(searchParamKey, newValues.join(','))
      } else {
        params.delete(searchParamKey)
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    onChange?.(value, !selectedValues.includes(value))
  }

  const handleClear = () => {
    if (searchParamKey) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete(searchParamKey)
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }

  const displayOptions = showAll ? options : options.slice(0, 6)
  const hasMoreOptions = options.length > 6

  return (
    <Card className="border-slate-200">
      <CardHeader className="p-4 pb-0">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsExpanded(!isExpanded)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setIsExpanded(!isExpanded)
            }
          }}
          className="flex items-center justify-between w-full text-left cursor-pointer"
        >
          <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {selectedValues.length > 0 && (
              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                {selectedValues.length}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-4 pt-3">
          <div className="space-y-2">
            {displayOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 py-1.5 cursor-pointer group hover:bg-slate-50 rounded-md px-2 -mx-2 transition-colors"
              >
                <Checkbox
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={() => handleToggle(option.value)}
                  className="border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <span className="flex-1 text-sm text-slate-700 group-hover:text-slate-900">
                  {option.label}
                </span>
                {option.count !== undefined && (
                  <span className="text-xs text-slate-400">
                    ({option.count})
                  </span>
                )}
              </label>
            ))}
          </div>

          {hasMoreOptions && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {showAll ? 'Show Less' : `Show All (${options.length})`}
            </button>
          )}

          {selectedValues.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="mt-3 w-full text-slate-500 hover:text-slate-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear {title}
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  )
}

// Mobile filter drawer component
interface MobileFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  activeFiltersCount: number
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  children,
  activeFiltersCount,
}: MobileFilterDrawerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-600" />
            <h2 className="font-semibold text-slate-900">Filters</h2>
            {activeFiltersCount > 0 && (
              <Badge className="bg-emerald-600">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-80px)] p-4">
          {children}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Clear All
            </Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={onClose}>
              Show Results
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
