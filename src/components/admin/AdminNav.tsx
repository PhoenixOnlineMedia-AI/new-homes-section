'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Map,
  Home,
  ImageIcon,
  Upload,
  Settings,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Upload Data',
    href: '/admin/upload/builders',
    activeMatch: '/admin/upload',
    icon: Upload,
    children: [
      { title: 'Builders CSV', href: '/admin/upload/builders' },
      { title: 'Communities CSV', href: '/admin/upload/communities' },
      { title: 'Homes CSV', href: '/admin/upload/homes' },
      { title: 'Builder Markets CSV', href: '/admin/upload/builder-markets' },
      { title: 'Market Info CSV', href: '/admin/upload/market-info' },
    ],
  },
  {
    title: 'Builders',
    href: '/admin/builders',
    icon: Building2,
  },
  {
    title: 'Markets',
    href: '/admin/markets',
    icon: Map,
  },
  {
    title: 'Communities',
    href: '/admin/communities',
    icon: MapPin,
  },
  {
    title: 'Homes',
    href: '/admin/homes',
    icon: Home,
  },
  {
    title: 'Media',
    href: '/admin/media',
    icon: ImageIcon,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="p-4 space-y-1">
      {navItems.map((item) => {
        const isActive = item.activeMatch
          ? pathname === item.activeMatch || pathname?.startsWith(item.activeMatch + '/')
          : pathname === item.href

        return (
        <div key={item.href}>
          <Link
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.title}
          </Link>

          {item.children && isActive && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    pathname === child.href
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {child.title}
                </Link>
              ))}
            </div>
          )}
        </div>
        )
      })}
    </nav>
  )
}
