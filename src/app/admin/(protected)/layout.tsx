import { requireAdmin } from '@/lib/admin/auth'
import { AdminNav } from '@/components/admin/AdminNav'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This will redirect to login if not authenticated
  const user = await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} />
      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-4rem)] bg-white border-r">
          <AdminNav />
        </aside>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
