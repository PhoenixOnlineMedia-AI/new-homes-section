import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Database, Cloud } from 'lucide-react'

export default function SettingsAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          System configuration and information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Provider</dt>
                <dd className="text-gray-900">Supabase PostgreSQL</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-green-700">Connected</span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Provider</dt>
                <dd className="text-gray-900">Supabase Storage</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-green-700">Active</span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              CSV Upload Limits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Max File Size</dt>
                <dd className="text-gray-900">10 MB</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Supported Formats</dt>
                <dd className="text-gray-900">.csv</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Batch Size</dt>
                <dd className="text-gray-900">Unlimited (processed row by row)</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Version Info</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Admin Panel</dt>
                <dd className="text-gray-900">v1.0.0</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Next.js</dt>
                <dd className="text-gray-900">16.1.6</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">React</dt>
                <dd className="text-gray-900">19.2.3</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
