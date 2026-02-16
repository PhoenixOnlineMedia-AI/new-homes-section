import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Home, MapPin, Upload } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch counts
  const { count: builderCount } = await supabase
    .from('builders')
    .select('*', { count: 'exact', head: true })

  const { count: communityCount } = await supabase
    .from('communities')
    .select('*', { count: 'exact', head: true })

  const { count: homeCount } = await supabase
    .from('homes')
    .select('*', { count: 'exact', head: true })

  const stats = [
    {
      title: 'Builders',
      value: builderCount || 0,
      icon: Building2,
      href: '/admin/builders',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Communities',
      value: communityCount || 0,
      icon: MapPin,
      href: '/admin/communities',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Homes',
      value: homeCount || 0,
      icon: Home,
      href: '/admin/homes',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage builders, communities, and home data
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/upload/builders">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Upload Builders CSV</h3>
                  <p className="text-sm text-gray-600">Bulk import builder data</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/upload/communities">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="p-3 rounded-lg bg-green-100">
                  <Upload className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Upload Communities CSV</h3>
                  <p className="text-sm text-gray-600">Bulk import community data</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/upload/homes">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Upload className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Upload Homes CSV</h3>
                  <p className="text-sm text-gray-600">Bulk import home/floor plan data</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
