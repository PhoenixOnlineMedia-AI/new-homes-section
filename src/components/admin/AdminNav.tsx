'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Home,
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
    icon: Upload,
    children: [
      { title: 'Builders CSV', href: '/admin/upload/builders' },
      { title: 'Communities CSV', href: '/admin/upload/communities' },
      { title: 'Homes CSV', href: '/admin/upload/homes' },
    ],
  },
  {
    title: 'Builders',
    href: '/admin/builders',
    icon: Building2,
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
      {navItems.map((item) => (
        <div key={item.href}>
          <Link
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === item.href || pathname?.startsWith(item.href + '/')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.title}
          </Link>
          
          {item.children && (pathname?.startsWith(item.href) || pathname === item.href) && (
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
      ))}
    </nav>
  )
}
