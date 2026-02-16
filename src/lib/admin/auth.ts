import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Simple admin check - in production, you'd use a proper roles table
// For now, we'll check against a list of admin emails from env
export async function requireAdmin() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/admin/login')
  }
  
  // Check if user is admin
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
  
  if (!adminEmails.includes(user.email || '')) {
    redirect('/admin/unauthorized')
  }
  
  return user
}

export async function getSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function isAdmin(userEmail: string | undefined): Promise<boolean> {
  if (!userEmail) return false
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
  return adminEmails.includes(userEmail)
}
