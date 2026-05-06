import { getTemplate } from '@/lib/csv/templates'
import { CSVUpload } from '@/components/admin/CSVUpload'
import { createAdminClient } from '@/lib/supabase/admin'
import { importRemoteMedia } from '@/lib/media/assets'
import { revalidatePath } from 'next/cache'

type BuilderLookup = { id: string; slug: string }
type BuilderMarketLookup = {
    id: string
    builder_id: string
    city: string | null
    state_code: string
}
type PreparedMarketRow = {
    source: Record<string, string>
    builderId: string
    city: string | null
    stateCode: string
    localDescription: string | null
}

function normalizeKey(builderId: string, city: string | null, stateCode: string) {
    return `${builderId}|${(city || '').trim().toLowerCase()}|${stateCode.trim().toUpperCase()}`
}

export default function UploadBuilderMarketsPage() {
    const template = getTemplate('builder_markets')

    async function uploadBuilderMarkets(data: Record<string, string>[]) {
        'use server'

        const supabase = createAdminClient()
        const errors: string[] = []
        let successCount = 0

        const builderSlugs = Array.from(new Set(data.map((row) => row.builder_slug?.trim()).filter(Boolean)))
        const { data: buildersData, error: buildersError } = await supabase
            .from('builders')
            .select('id,slug')
            .in('slug', builderSlugs)

        if (buildersError) {
            return {
                success: false,
                message: buildersError.message,
                errors: [buildersError.message],
            }
        }

        const builders = (buildersData || []) as unknown as BuilderLookup[]
        const builderIdBySlug = new Map(builders.map((builder) => [builder.slug, builder.id]))
        const preparedRows: PreparedMarketRow[] = []

        for (const row of data) {
            const builderSlug = row.builder_slug?.trim()
            const builderId = builderIdBySlug.get(builderSlug)

            if (!builderId) {
                errors.push(`Row for "${row.city}, ${row.state_code}": Builder with slug '${row.builder_slug}' not found.`)
                continue
            }

            preparedRows.push({
                source: row,
                builderId,
                city: row.city?.trim() || null,
                stateCode: row.state_code?.trim().toUpperCase(),
                localDescription: row.local_description?.trim() || null,
            })
        }

        const builderIds = Array.from(new Set(preparedRows.map((row) => row.builderId)))
        const { data: existingMarketsData, error: existingMarketsError } = builderIds.length > 0
            ? await supabase
                .from('builder_markets')
                .select('id,builder_id,city,state_code')
                .in('builder_id', builderIds)
            : { data: [], error: null }

        if (existingMarketsError) {
            return {
                success: false,
                message: existingMarketsError.message,
                errors: [existingMarketsError.message],
            }
        }

        const existingMarkets = (existingMarketsData || []) as unknown as BuilderMarketLookup[]
        const existingByKey = new Map(existingMarkets.map((market) => [
            normalizeKey(market.builder_id, market.city, market.state_code),
            market,
        ]))
        const importedMarketIds = new Map<string, string>()
        const inserts: PreparedMarketRow[] = []

        for (const row of preparedRows) {
            const key = normalizeKey(row.builderId, row.city, row.stateCode)
            const existing = existingByKey.get(key)

            if (!existing) {
                inserts.push(row)
                continue
            }

            const { error } = await supabase
                .from('builder_markets')
                .update({
                    builder_id: row.builderId,
                    city: row.city,
                    state_code: row.stateCode,
                    local_description: row.localDescription,
                } as never)
                .eq('id', existing.id)

            if (error) {
                errors.push(`Row for "${row.city || 'State-wide'}, ${row.stateCode}": ${error.message}`)
            } else {
                successCount++
                importedMarketIds.set(key, existing.id)
            }
        }

        if (inserts.length > 0) {
            const { data: insertedMarkets, error: insertError } = await supabase
                .from('builder_markets')
                .insert(inserts.map((row) => ({
                    builder_id: row.builderId,
                    city: row.city,
                    state_code: row.stateCode,
                    local_description: row.localDescription,
                })) as never)
                .select('id,builder_id,city,state_code')

            if (insertError) {
                for (const row of inserts) {
                    errors.push(`Row for "${row.city || 'State-wide'}, ${row.stateCode}": ${insertError.message}`)
                }
            } else {
                const inserted = (insertedMarkets || []) as unknown as BuilderMarketLookup[]

                for (const market of inserted) {
                    importedMarketIds.set(normalizeKey(market.builder_id, market.city, market.state_code), market.id)
                }

                successCount += inserted.length
            }
        }

        for (const row of preparedRows) {
            const marketId = importedMarketIds.get(normalizeKey(row.builderId, row.city, row.stateCode))

            if (marketId && row.source.image_url) {
                try {
                    await importRemoteMedia({
                        supabase,
                        entityType: 'builder_market',
                        entityId: marketId,
                        role: 'market',
                        sourceUrl: row.source.image_url,
                        preferredName: `${row.source.builder_slug}-${row.city || row.stateCode}-market`,
                        title: `${row.city || 'State-wide'}, ${row.stateCode}`,
                        altText: `${row.source.builder_slug} market image for ${row.city || row.stateCode}`,
                    })
                } catch (error) {
                    errors.push(`Image for "${row.city || 'State-wide'}, ${row.stateCode}": ${error instanceof Error ? error.message : 'Import failed'}`)
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

            <CSVUpload template={template} onUpload={uploadBuilderMarkets} batchSize={75} />
        </div>
    )
}
