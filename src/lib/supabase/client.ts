import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

/**
 * Creates a Supabase client for browser-side operations.
 * Use this in Client Components ("use client").
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// For convenience, export a singleton instance
// Note: In Next.js, it's often better to use createClient() directly in components
// to avoid issues with hot reloading during development
export const supabase = createClient()
