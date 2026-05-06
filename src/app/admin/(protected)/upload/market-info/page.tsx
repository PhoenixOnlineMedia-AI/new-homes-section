import { revalidatePath } from 'next/cache'
import { getTemplate } from '@/lib/csv/templates'
import { PreflightCSVUpload, type PreflightSelection } from '@/components/admin/PreflightCSVUpload'
import { createAdminClient } from '@/lib/supabase/admin'
import { US_STATES } from '@/lib/constants'

const CONTENT_FIELDS = [
  { key: 'city_overview', label: 'City Overview' },
  { key: 'key_stats', label: 'Key Stats' },
  { key: 'neighborhood_breakdown', label: 'Neighborhood Breakdown' },
  { key: 'economy_job_market', label: 'Economy & Job Market' },
  { key: 'schools_education', label: 'Schools & Education' },
  { key: 'lifestyle_amenities', label: 'Lifestyle & Amenities' },
  { key: 'faqs', label: 'FAQs' },
] as const

type ContentFieldKey = typeof CONTENT_FIELDS[number]['key']
type MarketPageLookup = {
  id: string
  city: string
  state_code: string
} & Record<ContentFieldKey, string | null>

function normalizeCity(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeStateCode(value: string) {
  return value.trim().toUpperCase()
}

function rowKey(index: number, row: Record<string, string>) {
  return `${index}|${normalizeCity(row.city).toLowerCase()}|${normalizeStateCode(row.state_code)}`
}

function marketKey(city: string, stateCode: string) {
  return `${normalizeCity(city).toLowerCase()}|${normalizeStateCode(stateCode)}`
}

function sameText(left: string | null | undefined, right: string | null | undefined) {
  return (left || '').trim() === (right || '').trim()
}

function stateSlugForCode(stateCode: string) {
  return US_STATES.find((state) => state.code.toUpperCase() === stateCode.toUpperCase())?.slug
}

export default function UploadMarketInfoPage() {
  const template = getTemplate('market_info')

  async function analyzeMarketInfo(data: Record<string, string>[]) {
    'use server'

    const supabase = createAdminClient()
    const stateCodes = Array.from(new Set(data.map((row) => normalizeStateCode(row.state_code)).filter(Boolean)))
    const { data: existingData, error } = stateCodes.length > 0
      ? await supabase
        .from('market_pages')
        .select('id,city,state_code,city_overview,key_stats,neighborhood_breakdown,economy_job_market,schools_education,lifestyle_amenities,faqs')
        .in('state_code', stateCodes)
      : { data: [], error: null }

    if (error) {
      return {
        rows: [],
        errors: [error.message],
      }
    }

    const existingByKey = new Map(
      ((existingData || []) as unknown as MarketPageLookup[]).map((market) => [
        marketKey(market.city, market.state_code),
        market,
      ])
    )

    return {
      rows: data.map((row, index) => {
        const city = normalizeCity(row.city)
        const stateCode = normalizeStateCode(row.state_code)
        const errors: string[] = []

        if (!city) errors.push('City is required.')
        if (!stateCode) errors.push('State code is required.')

        const existing = existingByKey.get(marketKey(city, stateCode))

        return {
          rowKey: rowKey(index, row),
          title: `${city || 'Unknown City'}, ${stateCode || 'Unknown State'}`,
          description: existing
            ? 'This market page already has city-level content. Choose which sections to replace.'
            : 'This will create city-level content for the existing market URL.',
          status: errors.length > 0 ? 'error' as const : existing ? 'existing' as const : 'new' as const,
          errors,
          fields: CONTENT_FIELDS.map((field) => {
            const incoming = row[field.key]?.trim() || null
            const current = existing?.[field.key] || null

            return {
              key: field.key,
              label: field.label,
              incoming,
              existing: current,
              changed: !sameText(incoming, current),
              replaceByDefault: Boolean(incoming && !current),
            }
          }),
        }
      }),
    }
  }

  async function applyMarketInfo(data: Record<string, string>[], selections: PreflightSelection[]) {
    'use server'

    const supabase = createAdminClient()
    const selectedByRowKey = new Map(selections.map((selection) => [selection.rowKey, new Set(selection.replaceFields)]))
    const errors: string[] = []
    let successCount = 0

    for (const [index, row] of data.entries()) {
      const city = normalizeCity(row.city)
      const stateCode = normalizeStateCode(row.state_code)
      const selected = selectedByRowKey.get(rowKey(index, row)) || new Set<string>()

      if (!city || !stateCode || selected.size === 0) {
        continue
      }

      const updateData: Record<string, string | null> = {
        city,
        state_code: stateCode,
        source_site: 'market_info_csv',
      }

      for (const field of CONTENT_FIELDS) {
        if (selected.has(field.key)) {
          updateData[field.key] = row[field.key]?.trim() || null
        }
      }

      const { data: existingMarket } = await supabase
        .from('market_pages')
        .select('id')
        .eq('state_code', stateCode)
        .ilike('city', city)
        .maybeSingle()

      const { error } = existingMarket
        ? await supabase
          .from('market_pages')
          .update(updateData as never)
          .eq('id', (existingMarket as { id: string }).id)
        : await supabase
          .from('market_pages')
          .insert(updateData as never)

      if (error) {
        errors.push(`${city}, ${stateCode}: ${error.message}`)
      } else {
        successCount++
        const stateSlug = stateSlugForCode(stateCode)
        if (stateSlug) {
          revalidatePath(`/${stateSlug}`)
          revalidatePath(`/${stateSlug}/${city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`)
        }
      }
    }

    revalidatePath('/admin')
    revalidatePath('/admin/upload/market-info')
    revalidatePath('/sitemap.xml')

    return {
      success: errors.length === 0,
      message: `Successfully applied market info changes for ${successCount} rows`,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Market Info</h1>
        <p className="mt-2 text-gray-600">
          Add city-level overview, stats, neighborhood, economy, school, lifestyle, and FAQ content without changing builders or communities.
        </p>
      </div>

      <PreflightCSVUpload
        template={template}
        analyzeUpload={analyzeMarketInfo}
        applyUpload={applyMarketInfo}
        applyLabel="Apply Market Info Changes"
      />
    </div>
  )
}
