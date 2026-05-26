import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { Builder, Database } from '@/lib/supabase/database.types'
import { BuilderMarketsEditor } from '@/components/admin/BuilderMarketsEditor'
import { BuilderStateProfilesEditor, type BuilderStateProfileRow } from '@/components/admin/BuilderStateProfilesEditor'
import { US_STATES } from '@/lib/constants'
import Link from 'next/link'

type BuilderUpdate = Database['public']['Tables']['builders']['Update']

export default async function EditBuilderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('builders')
        .select('*')
        .eq('id', id)
        .single()
    const builder = data as Builder | null

    if (error || !builder) {
        return <div>Builder not found</div>
    }
    const currentBuilder = builder

    // Fetch existing market overrides
    const { data: rawMarkets } = await supabase
        .from('builder_markets')
        .select('*')
        .eq('builder_id', id)
        .order('city', { ascending: true })

    const builderMarkets = (rawMarkets || []) as Database['public']['Tables']['builder_markets']['Row'][]
    const stateProfiles: BuilderStateProfileRow[] = builderMarkets
        .filter((market) => !(market.city || '').trim())
        .map((market) => {
            const state = US_STATES.find((item) => item.code === market.state_code)
            return {
                id: market.id,
                stateCode: market.state_code,
                stateName: state?.name || market.state_code,
                stateSlug: state?.slug || market.state_code.toLowerCase(),
                localDescription: market.local_description || '',
                imageUrl: market.image_url || '',
                isFeatured: market.is_featured || false,
                sortOrder: market.sort_order || 0,
            }
        })

    const cityMarkets = builderMarkets.filter((market) => (market.city || '').trim())

    async function updateBuilder(formData: FormData) {
        'use server'

        await requireAdmin()

        const updateData: BuilderUpdate = {
            name: formData.get('name') as string,
            slug: formData.get('slug') as string,
            description: formData.get('description') as string,
            website: formData.get('website') as string,
            phone: formData.get('phone') as string,
            email: formData.get('email') as string,
            headquarters: formData.get('headquarters') as string,
            year_founded: formData.get('year_founded') ? parseInt(formData.get('year_founded') as string) : null,
            logo_url: formData.get('logo_url') as string,
            rating: formData.get('rating') ? parseFloat(formData.get('rating') as string) : null,
        }

        const supabaseAdmin = createAdminClient()
        const { error: updateError } = await supabaseAdmin
            .from('builders')
            .update(updateData as never)
            .eq('id', id)

        if (updateError) {
            console.error('Failed to update builder', updateError)
            return
        }

        revalidatePath('/builders')
        revalidatePath('/admin/builders')
        revalidatePath(`/builders/${updateData.slug}`)
        redirect('/builders')
    }

    // Call redirect inside a try/catch if Next.js errors, but the proper way in Next.js 14+ is 
    // to put redirect outside try/catch because redirect() throws an error internally.
    // The issue with the original attempt was the syntax of the inline action, so let's bind it.

    // Create a bound action that doesn't capture the `params` closure incorrectly for Server Actions
    const boundUpdateBuilder = updateBuilder.bind(null)

    async function saveStateProfile(input: {
        id: string | null
        stateCode: string
        localDescription: string
        imageUrl: string
        isFeatured: boolean
        sortOrder: number
    }): Promise<{ ok: boolean; id?: string; error?: string }> {
        'use server'

        await requireAdmin()

        const supabaseAdmin = createAdminClient()
        const stateCode = input.stateCode.trim().toUpperCase()
        const payload = {
            builder_id: id,
            city: null,
            state_code: stateCode,
            local_description: input.localDescription.trim() || null,
            image_url: input.imageUrl.trim() || null,
            is_featured: input.isFeatured,
            sort_order: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
        }

        let profileId = input.id
        if (!profileId) {
            const { data: existingRows, error: findError } = await supabaseAdmin
                .from('builder_markets')
                .select('id,city')
                .eq('builder_id', id)
                .eq('state_code', stateCode)

            if (findError) {
                console.error('Failed to find state profile', findError)
                return { ok: false, error: findError.message || 'Could not find state profile.' }
            }

            const existingProfiles = (existingRows || []) as unknown as { id: string; city: string | null }[]
            profileId = existingProfiles.find((profile) => !(profile.city || '').trim())?.id || null
        }

        if (profileId) {
            const { error: updateError } = await supabaseAdmin
                .from('builder_markets')
                .update(payload as never)
                .eq('id', profileId)

            if (updateError) {
                console.error('Failed to update state profile', updateError)
                return { ok: false, error: updateError.message || 'Could not update state profile.' }
            }

            const state = US_STATES.find((item) => item.code === stateCode)
            revalidatePath(`/admin/builders/${id}/edit`)
            revalidatePath(`/builders/${currentBuilder.slug}`)
            if (state) revalidatePath(`/builders/${currentBuilder.slug}/${state.slug}`)
            return { ok: true, id: profileId }
        }

        const { data: insertedRows, error: insertError } = await supabaseAdmin
            .from('builder_markets')
            .insert(payload as never)
            .select('id')

        if (insertError) {
            console.error('Failed to create state profile', insertError)
            return { ok: false, error: insertError.message || 'Could not create state profile.' }
        }

        const inserted = (insertedRows as unknown as { id: string }[] | null)?.[0]
        if (!inserted?.id) {
            return { ok: false, error: 'State profile was saved, but no id was returned.' }
        }

        const state = US_STATES.find((item) => item.code === stateCode)
        revalidatePath(`/admin/builders/${id}/edit`)
        revalidatePath(`/builders/${currentBuilder.slug}`)
        if (state) revalidatePath(`/builders/${currentBuilder.slug}/${state.slug}`)
        return { ok: true, id: inserted.id }
    }

    async function deleteStateProfile(profileId: string): Promise<{ ok: boolean; error?: string }> {
        'use server'

        await requireAdmin()

        const supabaseAdmin = createAdminClient()
        const { error: deleteError } = await supabaseAdmin
            .from('builder_markets')
            .delete()
            .eq('id', profileId)
            .eq('builder_id', id)

        if (deleteError) {
            console.error('Failed to delete state profile', deleteError)
            return { ok: false, error: deleteError.message || 'Could not delete state profile.' }
        }

        revalidatePath(`/admin/builders/${id}/edit`)
        revalidatePath(`/builders/${currentBuilder.slug}`)
        return { ok: true }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Builder: {builder.name}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Builder Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={boundUpdateBuilder} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" defaultValue={builder.name} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input id="slug" name="slug" defaultValue={builder.slug} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={builder.description || ''}
                                className="h-32"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input id="website" name="website" type="url" defaultValue={builder.website || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" defaultValue={builder.phone || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" defaultValue={builder.email || ''} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="headquarters">Headquarters</Label>
                                <Input id="headquarters" name="headquarters" defaultValue={builder.headquarters || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="year_founded">Year Founded</Label>
                                <Input id="year_founded" name="year_founded" type="number" defaultValue={builder.year_founded || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rating">Rating (0-5)</Label>
                                <Input id="rating" name="rating" type="number" step="0.1" max="5" defaultValue={builder.rating || ''} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="logo_url">Logo URL</Label>
                            <Input id="logo_url" name="logo_url" defaultValue={builder.logo_url || ''} />
                            <p className="text-xs text-slate-500">
                                For permanent hosting, use the <Link href="/admin/media" className="font-medium text-blue-700 hover:underline">Media Library</Link> to upload or import a logo.
                            </p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                                Save Changes
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/builders">Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <BuilderMarketsEditor
                builderId={builder.id}
                initialMarkets={cityMarkets}
            />

            <BuilderStateProfilesEditor
                builderSlug={currentBuilder.slug}
                stateOptions={US_STATES.map((state) => ({
                    code: state.code,
                    name: state.name,
                    slug: state.slug,
                }))}
                initialProfiles={stateProfiles}
                onSaveProfile={saveStateProfile}
                onDeleteProfile={deleteStateProfile}
            />
        </div>
    )
}
