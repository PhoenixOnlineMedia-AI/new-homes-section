import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MarketBuildersEditor } from '@/components/admin/MarketBuildersEditor'
import { US_STATES } from '@/lib/constants'
import type { Database, MarketPageRow, MarketPageUpdate } from '@/lib/supabase/database.types'

type BuilderWithMarketData = Database['public']['Tables']['builders']['Row'] & {
  communities?: {
    city: string | null
    state: string | null
    state_code: string | null
  }[]
  builder_markets?: {
    id: string
    city: string | null
    state_code: string
    is_featured: boolean | null
    sort_order: number | null
  }[]
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function safeArray<T>(value: T[] | T | null | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function matchesMarketCity(value: string | null | undefined, city: string) {
  return (value || '').trim().toLowerCase() === city.trim().toLowerCase()
}

function matchesMarketState(
  value: string | null | undefined,
  stateCode: string,
  stateName: string | undefined
) {
  const normalized = (value || '').trim().toUpperCase()
  return normalized === stateCode.toUpperCase() || normalized === (stateName || '').toUpperCase()
}

export default async function EditMarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: marketPageData, error } = await supabase
    .from('market_pages')
    .select('*')
    .eq('id', id)
    .single()

  const marketPage = marketPageData as MarketPageRow | null

  if (error || !marketPage) {
    notFound()
  }

  const currentMarketPage: MarketPageRow = marketPage
  const stateInfo = US_STATES.find((state) => state.code === currentMarketPage.state_code)
  const stateSlug = stateInfo?.slug || currentMarketPage.state_code.toLowerCase()
  const citySlug = toSlug(currentMarketPage.city)

  const { data: buildersData } = await supabase
    .from('builders')
    .select('id,name,slug,communities(city,state,state_code),builder_markets(id,city,state_code,is_featured,sort_order)')
    .order('name')

  const builderRows = ((buildersData || []) as unknown as BuilderWithMarketData[])
    .map((builder) => {
      const matchingCommunities = safeArray(builder.communities).filter((community) =>
        matchesMarketCity(community.city, currentMarketPage.city) &&
        (
          matchesMarketState(community.state_code, currentMarketPage.state_code, stateInfo?.name) ||
          matchesMarketState(community.state, currentMarketPage.state_code, stateInfo?.name)
        )
      )

      const marketOverride = safeArray(builder.builder_markets).find((market) =>
        matchesMarketCity(market.city, currentMarketPage.city) &&
        matchesMarketState(market.state_code, currentMarketPage.state_code, stateInfo?.name)
      )

      if (!marketOverride && matchingCommunities.length === 0) {
        return null
      }

      return {
        builderId: builder.id,
        builderName: builder.name,
        builderSlug: builder.slug,
        builderMarketId: marketOverride?.id || null,
        city: currentMarketPage.city,
        stateCode: currentMarketPage.state_code,
        isFeatured: marketOverride?.is_featured || false,
        sortOrder: marketOverride?.sort_order ?? 0,
        communityCount: matchingCommunities.length,
        hasMarketOverride: Boolean(marketOverride),
      }
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))

  async function updateMarket(formData: FormData) {
    'use server'

    await requireAdmin()

    const supabaseAdmin = createAdminClient()
    const city = ((formData.get('city') as string) || '').trim()
    const stateCode = ((formData.get('state_code') as string) || '').trim().toUpperCase()

    const updateData: MarketPageUpdate = {
      city,
      state_code: stateCode,
      city_overview: ((formData.get('city_overview') as string) || '').trim() || null,
      key_stats: ((formData.get('key_stats') as string) || '').trim() || null,
      neighborhood_breakdown: ((formData.get('neighborhood_breakdown') as string) || '').trim() || null,
      economy_job_market: ((formData.get('economy_job_market') as string) || '').trim() || null,
      schools_education: ((formData.get('schools_education') as string) || '').trim() || null,
      lifestyle_amenities: ((formData.get('lifestyle_amenities') as string) || '').trim() || null,
      faqs: ((formData.get('faqs') as string) || '').trim() || null,
      hero_image_url: ((formData.get('hero_image_url') as string) || '').trim() || null,
      hero_image_alt: ((formData.get('hero_image_alt') as string) || '').trim() || null,
    }

    const { error: updateError } = await supabaseAdmin
      .from('market_pages')
      .update(updateData as never)
      .eq('id', id)

    if (updateError) {
      console.error('Failed to update market page', updateError)
      return
    }

    const nextStateInfo = US_STATES.find((state) => state.code === stateCode)
    revalidatePath('/admin/markets')
    revalidatePath(`/admin/markets/${id}/edit`)
    revalidatePath(`/${nextStateInfo?.slug || stateCode.toLowerCase()}/${toSlug(city)}`)
    redirect('/admin/markets')
  }

  async function saveMarketBuilderSettings(input: {
    builderId: string
    builderMarketId: string | null
    isFeatured: boolean
    sortOrder: number
  }): Promise<{ ok: boolean; id?: string; error?: string }> {
    'use server'

    await requireAdmin()

    const supabaseAdmin = createAdminClient()
    const sortOrder = Number.isFinite(input.sortOrder) ? input.sortOrder : 0
    let builderMarketId = input.builderMarketId

    if (!builderMarketId) {
      const { data: existingRows, error: findError } = await supabaseAdmin
        .from('builder_markets')
        .select('id,city')
        .eq('builder_id', input.builderId)
        .eq('state_code', currentMarketPage.state_code)

      if (findError) {
        console.error('Failed to find existing builder market row', findError)
        return { ok: false, error: findError.message || 'Could not find builder market settings' }
      }

      const existingBuilderMarkets = (existingRows || []) as unknown as { id: string; city: string | null }[]
      const existing = existingBuilderMarkets.find((row) =>
        matchesMarketCity(row.city, currentMarketPage.city)
      )
      builderMarketId = existing?.id || null
    }

    if (builderMarketId) {
      const { error: updateError } = await supabaseAdmin
        .from('builder_markets')
        .update({
          is_featured: input.isFeatured,
          sort_order: sortOrder,
        } as never)
        .eq('id', builderMarketId)

      if (updateError) {
        console.error('Failed to update market builder settings', updateError)
        return { ok: false, error: updateError.message || 'Could not update builder market settings' }
      }

      revalidatePath(`/admin/markets/${id}/edit`)
      revalidatePath(`/${stateSlug}/${citySlug}`)
      return { ok: true, id: builderMarketId }
    }

    const { data: insertedRows, error: insertError } = await supabaseAdmin
      .from('builder_markets')
      .insert({
        builder_id: input.builderId,
        city: currentMarketPage.city,
        state_code: currentMarketPage.state_code,
        is_featured: input.isFeatured,
        sort_order: sortOrder,
      } as never)
      .select('id')

    if (insertError) {
      console.error('Failed to create market builder settings', insertError)
      return { ok: false, error: insertError.message || 'Could not create builder market settings' }
    }

    const inserted = (insertedRows as unknown as { id: string }[] | null)?.[0]

    if (!inserted?.id) {
      return { ok: false, error: 'Builder market settings were saved, but no id was returned.' }
    }

    revalidatePath(`/admin/markets/${id}/edit`)
    revalidatePath(`/${stateSlug}/${citySlug}`)
    return { ok: true, id: inserted.id }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Market: {marketPage.city}, {marketPage.state_code}
          </h1>
          <p className="mt-2 text-gray-600">
            Update the public market page content and featured builder order.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/${stateSlug}/${citySlug}`} target="_blank">
            View Page
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Market Page Content</CardTitle>
          <CardDescription>
            These fields feed the content sections on the city market page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateMarket} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" defaultValue={marketPage.city} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state_code">State Code</Label>
                <Input
                  id="state_code"
                  name="state_code"
                  defaultValue={marketPage.state_code}
                  maxLength={2}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city_overview">City Overview</Label>
              <Textarea id="city_overview" name="city_overview" defaultValue={marketPage.city_overview || ''} className="min-h-32" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key_stats">Key Stats</Label>
              <Textarea id="key_stats" name="key_stats" defaultValue={marketPage.key_stats || ''} className="min-h-24" />
              <p className="text-xs text-gray-500">Use the same pipe-delimited format as the Market Info CSV.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="neighborhood_breakdown">Neighborhood Breakdown</Label>
                <Textarea id="neighborhood_breakdown" name="neighborhood_breakdown" defaultValue={marketPage.neighborhood_breakdown || ''} className="min-h-32" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="economy_job_market">Economy & Job Market</Label>
                <Textarea id="economy_job_market" name="economy_job_market" defaultValue={marketPage.economy_job_market || ''} className="min-h-32" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schools_education">Schools & Education</Label>
                <Textarea id="schools_education" name="schools_education" defaultValue={marketPage.schools_education || ''} className="min-h-32" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lifestyle_amenities">Lifestyle & Amenities</Label>
                <Textarea id="lifestyle_amenities" name="lifestyle_amenities" defaultValue={marketPage.lifestyle_amenities || ''} className="min-h-32" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="faqs">FAQs</Label>
              <Textarea id="faqs" name="faqs" defaultValue={marketPage.faqs || ''} className="min-h-32" />
              <p className="text-xs text-gray-500">Use the format: Q: Question A: Answer</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hero_image_url">Hero Image URL</Label>
                <Input id="hero_image_url" name="hero_image_url" type="url" defaultValue={marketPage.hero_image_url || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero_image_alt">Hero Image Alt Text</Label>
                <Input id="hero_image_alt" name="hero_image_alt" defaultValue={marketPage.hero_image_alt || ''} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit">Save Market</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/markets">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Featured Builder Sorting</CardTitle>
          <CardDescription>
            Builders appear here when they have a matching market override or a community in this city.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MarketBuildersEditor
            initialBuilders={builderRows}
            onSaveBuilderSettings={saveMarketBuilderSettings}
          />
        </CardContent>
      </Card>
    </div>
  )
}
