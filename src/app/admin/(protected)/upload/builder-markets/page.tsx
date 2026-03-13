import { getTemplate } from '@/lib/csv/templates'
import { CSVUpload } from '@/components/admin/CSVUpload'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export default function UploadBuilderMarketsPage() {
    const template = getTemplate('builder_markets')

    async function uploadBuilderMarkets(data: Record<string, string>[]) {
        'use server'

        const supabase = createAdminClient()
        const errors: string[] = []
        let successCount = 0

        for (const row of data) {
            // Find builder ID by slug
            const { data: builderData, error: builderError } = await supabase
                .from('builders')
                .select('id')
                .eq('slug', row.builder_slug)
                .single()

            const builder: any = builderData

            if (builderError || !builder) {
                errors.push(`Row for "${row.city}, ${row.state_code}": Builder with slug '${row.builder_slug}' not found.`)
                continue
            }

            // Check if builder market override already exists
            const { data: existingData } = await supabase
                .from('builder_markets')
                .select('id')
                .eq('builder_id', builder.id)
                .ilike('city', row.city)
                .ilike('state_code', row.state_code)
                .maybeSingle()

            const existing: any = existingData

            const marketData = {
                builder_id: builder.id,
                city: row.city,
                state_code: row.state_code,
                local_description: row.local_description || null,
                image_url: row.image_url || null,
            }

            if (existing) {
                // Update existing
                const { error } = await supabase
                    .from('builder_markets')
                    // @ts-expect-error Supabase inference
                    .update(marketData)
                    // @ts-ignore
                    .eq('id', existing.id)

                if (error) {
                    errors.push(`Row for "${row.city}, ${row.state_code}": ${error.message}`)
                } else {
                    successCount++
                }
            } else {
                // Insert new
                const { error } = await supabase
                    .from('builder_markets')
                    // @ts-expect-error Supabase inference
                    .insert(marketData)

                if (error) {
                    errors.push(`Row for "${row.city}, ${row.state_code}": ${error.message}`)
                } else {
                    successCount++
                }
            }
        }

        revalidatePath('/admin')
        revalidatePath('/builders')
        revalidatePath('/[state]')
        revalidatePath('/[state]/[city]')

        return {
            success: errors.length === 0,
            message: `Successfully processed ${successCount} of ${data.length} builder markets`,
            errors: errors.length > 0 ? errors : undefined,
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Upload Builder Markets</h1>
                <p className="text-gray-600 mt-2">
                    Bulk import market-specific override descriptions for builders
                </p>
            </div>

            <CSVUpload template={template} onUpload={uploadBuilderMarkets} />
        </div>
    )
}
