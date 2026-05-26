import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Map, Upload } from 'lucide-react'
import type { MarketPageRow } from '@/lib/supabase/database.types'

export default async function MarketsAdminPage() {
  const supabase = await createClient()

  const { data: marketPagesData } = await supabase
    .from('market_pages')
    .select('*')
    .order('state_code')
    .order('city')

  const marketPages: MarketPageRow[] = marketPagesData || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Markets</h1>
          <p className="mt-2 text-gray-600">
            Manage city market page content and featured builder ordering.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/markets/state-pages">
            <Button variant="outline">
              State Pages
            </Button>
          </Link>
          <Link href="/admin/upload/market-info">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload Market Info
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Map className="h-5 w-5" />
            Market Pages ({marketPages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Market</TableHead>
                  <TableHead>Overview</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>FAQs</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketPages.map((market) => (
                  <TableRow key={market.id}>
                    <TableCell className="font-medium">
                      {market.city}, {market.state_code}
                    </TableCell>
                    <TableCell>{market.city_overview ? 'Yes' : '-'}</TableCell>
                    <TableCell>{market.key_stats ? 'Yes' : '-'}</TableCell>
                    <TableCell>{market.faqs ? 'Yes' : '-'}</TableCell>
                    <TableCell className="text-gray-500">
                      {market.updated_at ? new Date(market.updated_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/markets/${market.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {marketPages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                      No market page content found. Upload Market Info CSV data to create market pages.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
