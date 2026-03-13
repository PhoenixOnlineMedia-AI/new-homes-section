import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

/**
 * Creates a Supabase client with the service role key.
 * This client bypasses Row Level Security (RLS) entirely.
 * NEVER expose this client or the service role key to the browser.
 * Only use this in server-side code (Server Actions, API routes) after checking authorization.
 */
export function createAdminClient() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
    }

    return createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}
