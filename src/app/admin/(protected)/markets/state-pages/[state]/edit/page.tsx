import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { US_STATES } from '@/lib/constants'
import type { StatePageRow, StatePageUpdate } from '@/lib/supabase/database.types'

export default async function EditStatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params
  const stateInfo = US_STATES.find((item) => item.slug === state.toLowerCase())

  if (!stateInfo) {
    notFound()
  }

  const currentStateInfo = stateInfo

  const supabase = createAdminClient()
  const { data: statePageData } = await supabase
    .from('state_pages')
    .select('*')
    .eq('state_code', stateInfo.code)
    .maybeSingle()

  const statePage = statePageData as StatePageRow | null

  async function updateStatePage(formData: FormData) {
    'use server'

    await requireAdmin()

    const supabaseAdmin = createAdminClient()
    const payload: StatePageUpdate = {
      state_code: currentStateInfo.code,
      intro: ((formData.get('intro') as string) || '').trim() || null,
      key_stats: ((formData.get('key_stats') as string) || '').trim() || null,
      market_overview: ((formData.get('market_overview') as string) || '').trim() || null,
      builder_landscape: ((formData.get('builder_landscape') as string) || '').trim() || null,
      featured_cities: ((formData.get('featured_cities') as string) || '').trim() || null,
      faqs: ((formData.get('faqs') as string) || '').trim() || null,
      hero_image_url: ((formData.get('hero_image_url') as string) || '').trim() || null,
      hero_image_alt: ((formData.get('hero_image_alt') as string) || '').trim() || null,
      meta_title: ((formData.get('meta_title') as string) || '').trim() || null,
      meta_description: ((formData.get('meta_description') as string) || '').trim() || null,
      source_site: 'admin',
    }

    const { data: existing } = await supabaseAdmin
      .from('state_pages')
      .select('id')
      .eq('state_code', currentStateInfo.code)
      .maybeSingle()

    const existingPage = existing as { id: string } | null
    const { error } = existingPage
      ? await supabaseAdmin
          .from('state_pages')
          .update(payload as never)
          .eq('id', existingPage.id)
      : await supabaseAdmin
          .from('state_pages')
          .insert(payload as never)

    if (error) {
      console.error('Failed to save state page', error)
      return
    }

    revalidatePath('/admin/markets/state-pages')
    revalidatePath(`/admin/markets/state-pages/${currentStateInfo.slug}/edit`)
    revalidatePath(`/builders/${currentStateInfo.slug}`)
    revalidatePath(`/${currentStateInfo.slug}`)
    redirect('/admin/markets/state-pages')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {statePage ? 'Edit' : 'Create'} State Page: {stateInfo.name}
          </h1>
          <p className="mt-2 text-gray-600">
            Add state-level intro, stats, and supporting content for the public builder directory.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/builders/${stateInfo.slug}`} target="_blank">
            View Page
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>State Page Content</CardTitle>
          <CardDescription>
            Key stats use the same pipe-delimited format as market pages: Metric | Value | Metric | Value.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateStatePage} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="state_name">State</Label>
                <Input id="state_name" value={stateInfo.name} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state_code">State Code</Label>
                <Input id="state_code" value={stateInfo.code} readOnly />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="intro">Intro Paragraph</Label>
              <Textarea id="intro" name="intro" defaultValue={statePage?.intro || ''} className="min-h-32" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key_stats">Key Stats</Label>
              <Textarea id="key_stats" name="key_stats" defaultValue={statePage?.key_stats || ''} className="min-h-24" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="market_overview">Market Overview</Label>
                <Textarea id="market_overview" name="market_overview" defaultValue={statePage?.market_overview || ''} className="min-h-36" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="builder_landscape">Builder Landscape</Label>
                <Textarea id="builder_landscape" name="builder_landscape" defaultValue={statePage?.builder_landscape || ''} className="min-h-36" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featured_cities">Featured Cities</Label>
                <Textarea id="featured_cities" name="featured_cities" defaultValue={statePage?.featured_cities || ''} className="min-h-36" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faqs">FAQs</Label>
                <Textarea id="faqs" name="faqs" defaultValue={statePage?.faqs || ''} className="min-h-36" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hero_image_url">Hero Image URL</Label>
                <Input id="hero_image_url" name="hero_image_url" type="url" defaultValue={statePage?.hero_image_url || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero_image_alt">Hero Image Alt Text</Label>
                <Input id="hero_image_alt" name="hero_image_alt" defaultValue={statePage?.hero_image_alt || ''} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input id="meta_title" name="meta_title" defaultValue={statePage?.meta_title || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Input id="meta_description" name="meta_description" defaultValue={statePage?.meta_description || ''} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit">Save State Page</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/markets/state-pages">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
