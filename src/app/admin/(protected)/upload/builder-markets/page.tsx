import { getTemplate } from '@/lib/csv/templates'
import { PreflightCSVUpload, type PreflightSelection } from '@/components/admin/PreflightCSVUpload'
import { createAdminClient } from '@/lib/supabase/admin'
import { importRemoteMedia } from '@/lib/media/assets'
import { US_STATES } from '@/lib/constants'
import { revalidatePath } from 'next/cache'

type BuilderLookup = { id: string; slug: string; name: string }
type BuilderMarketLookup = {
  id: string
  builder_id: string
  city: string | null
  state_code: string
  local_description: string | null
  image_url: string | null
  is_featured: boolean | null
  sort_order: number | null
}

const BUILDER_MARKET_FIELDS = [
  { key: 'local_description', label: 'Local Description' },
  { key: 'image_url', label: 'Market Image' },
  { key: 'is_featured', label: 'Featured' },
  { key: 'sort_order', label: 'Sort Order' },
] as const

function normalizeCity(value: string | null | undefined) {
  return value?.replace(/\s+/g, ' ').trim() || null
}

function normalizeStateCode(value: string) {
  return value.trim().toUpperCase()
}

function normalizeBuilderMarketKey(builderId: string, city: string | null, stateCode: string) {
  return `${builderId}|${(city || '').toLowerCase()}|${normalizeStateCode(stateCode)}`
}

function rowKey(index: number, row: Record<string, string>) {
  return `${index}|${row.builder_slug?.trim()}|${(row.city || '').trim().toLowerCase()}|${normalizeStateCode(row.state_code || '')}`
}

function parseBoolean(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase()
  if (!normalized) return null
  return ['true', '1', 'yes', 'y'].includes(normalized)
}

function formatBoolean(value: boolean | null | undefined) {
  if (value === null || value === undefined) return null
  return value ? 'true' : 'false'
}

function sameText(left: string | null | undefined, right: string | null | undefined) {
  return (left || '').trim() === (right || '').trim()
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function stateSlugForCode(stateCode: string) {
  return US_STATES.find((state) => state.code.toUpperCase() === stateCode.toUpperCase())?.slug
}

async function loadBuilderMarketContext(data: Record<string, string>[]) {
  const supabase = createAdminClient()
  const builderSlugs = Array.from(new Set(data.map((row) => row.builder_slug?.trim()).filter(Boolean)))
  const { data: buildersData, error: buildersError } = builderSlugs.length > 0
    ? await supabase.from('builders').select('id,slug,name').in('slug', builderSlugs)
    : { data: [], error: null }

  if (buildersError) throw new Error(buildersError.message)

  const builders = (buildersData || []) as unknown as BuilderLookup[]
  const builderBySlug = new Map(builders.map((builder) => [builder.slug, builder]))
  const builderIds = builders.map((builder) => builder.id)
  const { data: marketsData, error: marketsError } = builderIds.length > 0
    ? await supabase
      .from('builder_markets')
      .select('id,builder_id,city,state_code,local_description,image_url,is_featured,sort_order')
      .in('builder_id', builderIds)
    : { data: [], error: null }

  if (marketsError) throw new Error(marketsError.message)

  const markets = (marketsData || []) as unknown as BuilderMarketLookup[]
  const marketByKey = new Map(markets.map((market) => [
    normalizeBuilderMarketKey(market.builder_id, market.city, market.state_code),
    market,
  ]))

  return { supabase, builderBySlug, marketByKey }
}

export default function UploadBuilderMarketsPage() {
  const template = getTemplate('builder_markets')

  async function analyzeBuilderMarkets(data: Record<string, string>[]) {
    'use server'

    try {
      const { builderBySlug, marketByKey } = await loadBuilderMarketContext(data)

      return {
        rows: data.map((row, index) => {
          const builderSlug = row.builder_slug?.trim()
          const builder = builderBySlug.get(builderSlug)
          const city = normalizeCity(row.city)
          const stateCode = normalizeStateCode(row.state_code || '')
          const errors: string[] = []

          if (!builderSlug) errors.push('Builder slug is required.')
          if (!builder) errors.push(`Builder with slug "${builderSlug}" was not found.`)
          if (!city) errors.push('City is required.')
          if (!stateCode) errors.push('State code is required.')

          const existing = builder ? marketByKey.get(normalizeBuilderMarketKey(builder.id, city, stateCode)) : null

          return {
            rowKey: rowKey(index, row),
            title: `${builder?.name || builderSlug || 'Unknown Builder'} in ${city || 'Unknown City'}, ${stateCode || 'Unknown State'}`,
            description: existing
              ? 'This builder already has data for this market. Choose which fields to replace.'
              : 'This will add the builder to this market.',
            status: errors.length > 0 ? 'error' as const : existing ? 'existing' as const : 'new' as const,
            errors,
            fields: BUILDER_MARKET_FIELDS.map((field) => {
              const incoming = row[field.key]?.trim() || null
              const existingValue = field.key === 'is_featured'
                ? formatBoolean(existing?.is_featured)
                : field.key === 'sort_order'
                  ? existing?.sort_order?.toString() || null
                  : existing?.[field.key as 'local_description' | 'image_url'] || null

              return {
                key: field.key,
                label: field.label,
                incoming,
                existing: existingValue,
                changed: !sameText(incoming, existingValue),
                replaceByDefault: Boolean(incoming && !existingValue),
              }
            }),
          }
        }),
      }
    } catch (error) {
      return {
        rows: [],
        errors: [error instanceof Error ? error.message : 'Could not analyze builder markets'],
      }
    }
  }

  async function applyBuilderMarkets(data: Record<string, string>[], selections: PreflightSelection[]) {
    'use server'

    const { supabase, builderBySlug, marketByKey } = await loadBuilderMarketContext(data)
    const selectedByRowKey = new Map(selections.map((selection) => [selection.rowKey, new Set(selection.replaceFields)]))
    const errors: string[] = []
    let successCount = 0

    for (const [index, row] of data.entries()) {
      const builderSlug = row.builder_slug?.trim()
      const builder = builderBySlug.get(builderSlug)
      const city = normalizeCity(row.city)
      const stateCode = normalizeStateCode(row.state_code || '')
      const selected = selectedByRowKey.get(rowKey(index, row)) || new Set<string>()

      if (!builder || !city || !stateCode) continue

      const existing = marketByKey.get(normalizeBuilderMarketKey(builder.id, city, stateCode))
      const payload: Record<string, string | number | boolean | null> = {
        builder_id: builder.id,
        city,
        state_code: stateCode,
      }

      if (!existing || selected.has('local_description')) {
        payload.local_description = row.local_description?.trim() || null
      }
      if (!existing || selected.has('is_featured')) {
        payload.is_featured = parseBoolean(row.is_featured) || false
      }
      if (!existing || selected.has('sort_order')) {
        payload.sort_order = row.sort_order ? Number(row.sort_order) : 0
      }
      if (!existing && row.image_url) {
        payload.image_url = row.image_url.trim()
      }

      let marketId = existing?.id

      if (existing) {
        const fieldsToUpdate = Object.fromEntries(Object.entries(payload).filter(([key]) => (
          key === 'builder_id' || key === 'city' || key === 'state_code' || selected.has(key)
        )))

        if (Object.keys(fieldsToUpdate).length > 3) {
          const { error } = await supabase
            .from('builder_markets')
            .update(fieldsToUpdate as never)
            .eq('id', existing.id)

          if (error) {
            errors.push(`${builder.name} in ${city}, ${stateCode}: ${error.message}`)
            continue
          }
        }
      } else {
        const { data: inserted, error } = await supabase
          .from('builder_markets')
          .insert(payload as never)
          .select('id')
          .single()

        if (error) {
          errors.push(`${builder.name} in ${city}, ${stateCode}: ${error.message}`)
          continue
        }

        marketId = (inserted as unknown as { id: string } | null)?.id
      }

      if (marketId && row.image_url && (!existing || selected.has('image_url'))) {
        try {
          await importRemoteMedia({
            supabase,
            entityType: 'builder_market',
            entityId: marketId,
            role: 'market',
            sourceUrl: row.image_url,
            preferredName: `${builder.slug}-${city || stateCode}-market`,
            title: `${builder.name} in ${city || 'State-wide'}, ${stateCode}`,
            altText: `${builder.name} market image for ${city || stateCode}`,
          })
        } catch (error) {
          errors.push(`Image for ${builder.name} in ${city}, ${stateCode}: ${error instanceof Error ? error.message : 'Import failed'}`)
        }
      }

      successCount++
      const stateSlug = stateSlugForCode(stateCode)
      if (stateSlug) {
        revalidatePath(`/${stateSlug}`)
        revalidatePath(`/${stateSlug}/${toSlug(city)}`)
      }
    }

    revalidatePath('/admin')
    revalidatePath('/admin/upload/builder-markets')
    revalidatePath('/builders')

    return {
      success: errors.length === 0,
      message: `Successfully applied builder market changes for ${successCount} rows`,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Builder Markets</h1>
        <p className="mt-2 text-gray-600">
          Add builders to markets and review duplicates before replacing any existing market-specific builder data.
        </p>
      </div>

      <PreflightCSVUpload
        template={template}
        analyzeUpload={analyzeBuilderMarkets}
        applyUpload={applyBuilderMarkets}
        applyLabel="Apply Builder Market Changes"
      />
    </div>
  )
}
