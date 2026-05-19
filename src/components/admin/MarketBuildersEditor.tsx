'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowUpDown, Save } from 'lucide-react'

type MarketBuilderRow = {
  builderId: string
  builderName: string
  builderSlug: string
  builderMarketId: string | null
  city: string
  stateCode: string
  isFeatured: boolean
  sortOrder: number
  communityCount: number
  hasMarketOverride: boolean
}

type MarketBuildersEditorProps = {
  initialBuilders: MarketBuilderRow[]
  onSaveBuilderSettings: (input: {
    builderId: string
    builderMarketId: string | null
    isFeatured: boolean
    sortOrder: number
  }) => Promise<{ ok: boolean; id?: string; error?: string }>
}

function sortRows(rows: MarketBuilderRow[]) {
  return [...rows].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
    if (a.communityCount !== b.communityCount) return b.communityCount - a.communityCount
    return a.builderName.localeCompare(b.builderName)
  })
}

export function MarketBuildersEditor({
  initialBuilders,
  onSaveBuilderSettings,
}: MarketBuildersEditorProps) {
  const router = useRouter()
  const [rows, setRows] = useState<MarketBuilderRow[]>(() => sortRows(initialBuilders))
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showFeaturedFirst, setShowFeaturedFirst] = useState(true)

  const displayedRows = useMemo(() => {
    if (showFeaturedFirst) return sortRows(rows)
    return [...rows].sort((a, b) => a.builderName.localeCompare(b.builderName))
  }, [rows, showFeaturedFirst])

  function updateRow(builderId: string, updates: Partial<MarketBuilderRow>) {
    setRows((current) =>
      current.map((row) => row.builderId === builderId ? { ...row, ...updates } : row)
    )
  }

  async function saveRow(row: MarketBuilderRow) {
    setSavingId(row.builderId)
    setError(null)

    const sortOrder = Number.isFinite(row.sortOrder) ? row.sortOrder : 0

    const result = await onSaveBuilderSettings({
      builderId: row.builderId,
      builderMarketId: row.builderMarketId,
      isFeatured: row.isFeatured,
      sortOrder,
    })

    if (!result.ok) {
      setError(result.error || 'Could not save builder market settings')
      setSavingId(null)
      return
    }

    if (result.id) {
      updateRow(row.builderId, {
        builderMarketId: result.id,
        hasMarketOverride: true,
      })
    }

    setSavingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Builders in this market</h2>
          <p className="text-sm text-gray-600">
            Featured and sort order values are shared with each builder&apos;s Market Override.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowFeaturedFirst((value) => !value)}
        >
          <ArrowUpDown className="mr-2 h-4 w-4" />
          {showFeaturedFirst ? 'Show A-Z' : 'Show Featured'}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Builder</TableHead>
              <TableHead>Communities</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedRows.map((row) => (
              <TableRow key={row.builderId}>
                <TableCell className="font-medium">
                  <Link
                    href={`/admin/builders/${row.builderId}/edit`}
                    className="text-blue-700 hover:underline"
                  >
                    {row.builderName}
                  </Link>
                </TableCell>
                <TableCell>{row.communityCount}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={row.isFeatured}
                    onCheckedChange={(checked) =>
                      updateRow(row.builderId, { isFeatured: checked === true })
                    }
                    aria-label={`Feature ${row.builderName}`}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={row.sortOrder}
                    onChange={(event) =>
                      updateRow(row.builderId, { sortOrder: Number(event.target.value) })
                    }
                    className="w-24"
                    aria-label={`${row.builderName} sort order`}
                  />
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {row.hasMarketOverride ? 'Market Override' : 'Community data'}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => saveRow(row)}
                    disabled={savingId === row.builderId}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {savingId === row.builderId ? 'Saving' : 'Save'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {displayedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                  No builders are connected to this market yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
