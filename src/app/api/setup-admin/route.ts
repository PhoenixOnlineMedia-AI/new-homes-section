import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = createAdminClient()

    // First check if user exists
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const adminEmail = 'admin@newhomessection.com'
    const adminPassword = 'admin123'

    const existingUser = users.find(u => u.email === adminEmail)

    if (existingUser) {
        // Update password to be sure it's admin123
        const { data, error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: adminPassword }
        )

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        return NextResponse.json({ message: 'Admin user password reset to admin123', user: data.user })
    } else {
        // Create the user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true
        })

        if (createError) {
            return NextResponse.json({ error: createError.message }, { status: 500 })
        }

        return NextResponse.json({ message: 'Admin user created with admin123', user: newUser.user })
    }
}
