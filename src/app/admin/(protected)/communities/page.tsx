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
import { MapPin, Plus, Upload } from 'lucide-react'
import Link from 'next/link'
import type { Community } from '@/lib/supabase/database.types'

interface CommunityWithBuilder extends Community {
  builder?: { name: string }
}

export default async function CommunitiesAdminPage() {
  const supabase = await createClient()
  
  const { data: communitiesData } = await supabase
    .from('communities')
    .select(`
      *,
      builder:builder_id(name)
    `)
    .order('name')

  const communities: CommunityWithBuilder[] = communitiesData || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
          <p className="text-gray-600 mt-2">
            Manage community/neighborhood information
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/upload/communities">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
          </Link>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Community
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            All Communities ({communities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Builder</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {communities.map((community) => (
                  <TableRow key={community.id}>
                    <TableCell className="font-medium">{community.name}</TableCell>
                    <TableCell>{community.builder?.name || '-'}</TableCell>
                    <TableCell>
                      {community.city}, {community.state_code}
                    </TableCell>
                    <TableCell>
                      {community.min_price && community.max_price
                        ? `$${community.min_price.toLocaleString()} - $${community.max_price.toLocaleString()}`
                        : community.min_price
                        ? `From $${community.min_price.toLocaleString()}`
                        : community.max_price
                        ? `Up to $${community.max_price.toLocaleString()}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        community.status === 'selling'
                          ? 'bg-green-100 text-green-800'
                          : community.status === 'coming_soon'
                          ? 'bg-yellow-100 text-yellow-800'
                          : community.status === 'sold_out'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {community.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {communities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No communities found. Add your first community to get started.
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
