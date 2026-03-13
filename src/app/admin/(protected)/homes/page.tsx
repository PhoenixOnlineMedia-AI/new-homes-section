import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Home, Plus, Upload } from 'lucide-react'
import Link from 'next/link'
import type { Home as HomeType } from '@/lib/supabase/database.types'

interface HomeWithCommunity extends HomeType {
  community?: { name: string; city: string; state_code: string }
}

export default async function HomesAdminPage() {
  const supabase = await createClient()
  
  const { data: homesData } = await supabase
    .from('homes')
    .select(`
      *,
      community:community_id(name, city, state_code)
    `)
    .order('name')
    .limit(100)

  const homes: HomeWithCommunity[] = homesData || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Homes</h1>
          <p className="text-gray-600 mt-2">
            Manage home/floor plan information
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/upload/homes">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
          </Link>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Home
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Home className="w-5 h-5" />
            Recent Homes ({homes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Community</TableHead>
                  <TableHead>Specs</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {homes.map((home) => (
                  <TableRow key={home.id}>
                    <TableCell className="font-medium">{home.name || '-'}</TableCell>
                    <TableCell>
                      {home.community?.name || '-'}<br />
                      <span className="text-sm text-gray-500">
                        {home.community?.city}, {home.community?.state_code}
                      </span>
                    </TableCell>
                    <TableCell>
                      {home.bedrooms && `${home.bedrooms} bd`}
                      {home.bedrooms && home.bathrooms && ' • '}
                      {home.bathrooms && `${home.bathrooms} ba`}
                      {home.sqft && ` • ${home.sqft.toLocaleString()} sqft`}
                    </TableCell>
                    <TableCell>
                      {home.base_price
                        ? `$${home.base_price.toLocaleString()}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        home.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : home.status === 'under_contract'
                          ? 'bg-yellow-100 text-yellow-800'
                          : home.status === 'sold'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {home.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {homes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No homes found. Add your first home to get started.
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
