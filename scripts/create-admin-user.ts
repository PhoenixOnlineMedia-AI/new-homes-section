
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

async function createAdminUser() {
    const email = process.env.ADMIN_EMAILS

    if (!email) {
        console.error('ADMIN_EMAILS not set in .env.local')
        process.exit(1)
    }

    // We'll use the first email if multiple are provided
    const targetEmail = email.split(',')[0].trim()
    const password = 'ChangeMe123!' // Default temporary password

    console.log(`Setting up admin user for: ${targetEmail}`)

    // Check if user exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
        console.error('Error listing users:', listError)
        process.exit(1)
    }

    const existingUser = users.find(u => u.email === targetEmail)

    if (existingUser) {
        console.log('User already exists. Updating password...')
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: password, email_confirm: true }
        )

        if (updateError) {
            console.error('Error updating user:', updateError)
            process.exit(1)
        }
    } else {
        console.log('Creating new user...')
        const { error: createError } = await supabase.auth.admin.createUser({
            email: targetEmail,
            password: password,
            email_confirm: true
        })

        if (createError) {
            console.error('Error creating user:', createError)
            process.exit(1)
        }
    }

    console.log('Success! You can now log in with:')
    console.log(`Email: ${targetEmail}`)
    console.log(`Password: ${password}`)
}

createAdminUser().catch(console.error)
