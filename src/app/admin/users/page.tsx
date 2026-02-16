import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Shield } from 'lucide-react'

export default async function UsersAdminPage() {
  const supabase = await createClient()
  
  // Note: In a real implementation, you'd query the auth users table
  // or a custom users table. This is a placeholder.
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600 mt-2">
          Manage admin users and permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminEmails.map((email) => (
              <div
                key={email}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{email}</p>
                  <p className="text-sm text-gray-500">Administrator</p>
                </div>
              </div>
            ))}
            {adminEmails.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No admin users configured. Set ADMIN_EMAILS in your environment variables.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Environment Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            To add admin users, update the <code className="bg-gray-100 px-2 py-1 rounded">ADMIN_EMAILS</code> environment variable with comma-separated email addresses.
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
            ADMIN_EMAILS=admin@example.com,another@example.com
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
