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
import { Building2, Plus, Upload } from 'lucide-react'
import Link from 'next/link'
import type { Builder } from '@/lib/supabase/database.types'

export default async function BuildersAdminPage() {
  const supabase = await createClient()

  const { data: buildersData } = await supabase
    .from('builders')
    .select('*')
    .order('name')

  const builders: Builder[] = buildersData || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Builders</h1>
          <p className="text-gray-600 mt-2">
            Manage builder information
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/upload/builders">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
          </Link>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Builder
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            All Builders ({builders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {builders.map((builder) => (
                  <TableRow key={builder.id}>
                    <TableCell className="font-medium">{builder.name}</TableCell>
                    <TableCell className="text-gray-500">{builder.slug}</TableCell>
                    <TableCell>
                      {builder.website ? (
                        <a
                          href={builder.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {builder.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{builder.phone || '-'}</TableCell>
                    <TableCell>{builder.rating || '-'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/builders/${builder.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {builders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No builders found. Add your first builder to get started.
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
