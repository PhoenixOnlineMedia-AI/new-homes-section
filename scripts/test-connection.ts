import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
    console.log('Testing connection to Supabase...')
    try {
        const { data, error } = await supabase.from('builders').select('*').limit(1)

        if (error) {
            console.error('Connection failed:', error)
            process.exit(1)
        }

        console.log('Connection successful!')
        console.log('Current builders:', data)

        // Create a dummy builder
        console.log('Attempting to insert a test builder...')
        const { data: insertData, error: insertError } = await supabase.from('builders').insert({
            name: 'Connection Test Builder',
            slug: 'connection-test-builder',
            description: 'A test builder to verify database connection',
            website: 'https://test.com',
            source_site: 'test_script'
        }).select()

        if (insertError) {
            console.error('Failed to insert test builder:', insertError)
            process.exit(1)
        }

        console.log('Successfully inserted test builder!', insertData)

        // Cleanup
        console.log('Cleaning up test builder...')
        const { error: deleteError } = await supabase.from('builders').delete().eq('slug', 'connection-test-builder')

        if (deleteError) {
            console.error('Failed to clean up test builder:', deleteError)
        } else {
            console.log('Cleanup successful!')
        }

    } catch (err) {
        console.error('Unexpected error:', err)
        process.exit(1)
    }
}

testConnection()
