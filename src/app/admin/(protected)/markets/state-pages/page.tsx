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
import { Map as MapIcon } from 'lucide-react'
import { US_STATES } from '@/lib/constants'
import type { StatePageRow } from '@/lib/supabase/database.types'

export default async function StatePagesAdminPage() {
  const supabase = await createClient()

  const { data: statePagesData } = await supabase
    .from('state_pages')
    .select('*')
    .order('state_code')

  const statePages = (statePagesData || []) as StatePageRow[]
  const statePageByCode = new globalThis.Map(statePages.map((page) => [page.state_code.toUpperCase(), page]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">State Pages</h1>
        <p className="mt-2 text-gray-600">
          Manage state-level content for builder directory pages like /builders/texas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapIcon className="h-5 w-5" />
            State Builder Pages ({US_STATES.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>State</TableHead>
                  <TableHead>Intro</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Overview</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {US_STATES.map((state) => {
                  const page = statePageByCode.get(state.code)

                  return (
                    <TableRow key={state.code}>
                      <TableCell className="font-medium">
                        {state.name}, {state.code}
                      </TableCell>
                      <TableCell>{page?.intro ? 'Yes' : '-'}</TableCell>
                      <TableCell>{page?.key_stats ? 'Yes' : '-'}</TableCell>
                      <TableCell>{page?.market_overview || page?.builder_landscape ? 'Yes' : '-'}</TableCell>
                      <TableCell className="text-gray-500">
                        {page?.updated_at ? new Date(page.updated_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/markets/state-pages/${state.slug}/edit`}>
                            {page ? 'Edit' : 'Create'}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
