import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase admin client (bypasses RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Allowed tables to prevent arbitrary table querying
const ALLOWED_TABLES = ['builders', 'communities', 'homes', 'floor_plans', 'builder_markets']

// Allowed filter fields per table
const FILTER_ALLOWLIST: Record<string, string[]> = {
    builders: ['slug', 'name', 'is_verified', 'is_premium'],
    communities: ['slug', 'builder_id', 'builder_slug', 'state_code', 'city', 'zip_code', 'status'],
    homes: ['community_id', 'community_slug', 'status', 'bedrooms', 'bathrooms', 'stories'],
    floor_plans: ['community_id', 'community_slug', 'status', 'bedrooms', 'bathrooms', 'stories'],
    builder_markets: ['builder_id', 'city', 'state_code']
}

// Authentication Middleware
function isAuthorized(request: Request) {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return false
    }
    const token = authHeader.split(' ')[1]
    return token === process.env.API_BEARER_TOKEN
}

// GET Handler - Fetch records
export async function GET(
    request: Request,
    { params }: { params: Promise<{ table: string }> }
) {
    if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const resolvedParams = await params
    const table = resolvedParams.table
    if (!ALLOWED_TABLES.includes(table)) {
        return NextResponse.json({ error: `Table '${table}' is not supported by this API.` }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    try {
        let query = supabaseAdmin.from(table).select('*')

        if (id) {
            // @ts-expect-error - Dynamic query typing mismatch
            query = query.eq('id', id).single()
        } else {
            // Add optional limit/offset for bulk reads
            const limit = parseInt(searchParams.get('limit') || '50')
            const offset = parseInt(searchParams.get('offset') || '0')

            // Virtual field lookups
            if (table === 'communities' && searchParams.has('builder_slug')) {
                const bSlug = searchParams.get('builder_slug')!
                const { data: b } = await supabaseAdmin.from('builders').select('id').eq('slug', bSlug).maybeSingle()
                if (!b) return NextResponse.json({ data: [] })
                query = query.eq('builder_id', b.id)
            }

            if ((table === 'homes' || table === 'floor_plans') && searchParams.has('community_slug')) {
                const cSlug = searchParams.get('community_slug')!
                const { data: c } = await supabaseAdmin.from('communities').select('id').eq('slug', cSlug).maybeSingle()
                if (!c) return NextResponse.json({ data: [] })
                query = query.eq('community_id', c.id)
            }

            // Dynamic field filtering
            const allowedOperators = ['eq', 'in', 'ilike']
            for (const [key, value] of Array.from(searchParams.entries())) {
                // Skip reserved pagination/id params and virtuals we already handled
                if (['limit', 'offset', 'id', 'builder_slug', 'community_slug'].includes(key)) continue;

                let field = key;
                let op = 'eq';
                if (key.includes('__')) {
                    const parts = key.split('__');
                    field = parts[0];
                    op = parts[1];
                }

                if (!FILTER_ALLOWLIST[table]?.includes(field)) {
                    return NextResponse.json({ error: `Invalid filter field: '${field}' for table '${table}'. Allowed fields are: ${FILTER_ALLOWLIST[table]?.join(', ')}` }, { status: 400 });
                }

                if (!allowedOperators.includes(op)) {
                    return NextResponse.json({ error: `Invalid operator: '${op}'. Allowed operators are: eq, in, ilike` }, { status: 400 });
                }

                // Apply filters
                if (op === 'eq') {
                    // Booleans and numbers are often parsed correctly by PostgREST but we pass them as strings standard
                    // Supabase JS takes care of string to specific type casting safely based on parameterized schema
                    query = query.eq(field, value);
                } else if (op === 'in') {
                    query = query.in(field, value.split(','));
                } else if (op === 'ilike') {
                    query = query.ilike(field, `%${value}%`);
                }
            }

            query = query.range(offset, offset + limit - 1)
        }

        const { data, error } = await query

        if (error) throw error
        return NextResponse.json({ data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST Handler - Create a record
export async function POST(
    request: Request,
    { params }: { params: Promise<{ table: string }> }
) {
    if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const resolvedParams = await params
    const table = resolvedParams.table
    if (!ALLOWED_TABLES.includes(table)) {
        return NextResponse.json({ error: `Table '${table}' is not supported by this API.` }, { status: 400 })
    }

    try {
        const body = await request.json()
        const { data, error } = await supabaseAdmin.from(table).insert(body).select().single()

        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PUT Handler - Update a record
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ table: string }> }
) {
    if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const resolvedParams = await params
    const table = resolvedParams.table
    if (!ALLOWED_TABLES.includes(table)) {
        return NextResponse.json({ error: `Table '${table}' is not supported by this API.` }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ error: 'Missing id query parameter.' }, { status: 400 })
    }

    try {
        const body = await request.json()
        const { data, error } = await supabaseAdmin.from(table).update(body).eq('id', id).select().single()

        if (error) throw error
        return NextResponse.json({ data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE Handler - Delete a record
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ table: string }> }
) {
    if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const resolvedParams = await params
    const table = resolvedParams.table
    if (!ALLOWED_TABLES.includes(table)) {
        return NextResponse.json({ error: `Table '${table}' is not supported by this API.` }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ error: 'Missing id query parameter.' }, { status: 400 })
    }

    try {
        const { error } = await supabaseAdmin.from(table).delete().eq('id', id)

        if (error) throw error
        return NextResponse.json({ message: `Record ${id} successfully deleted from ${table}.` })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
