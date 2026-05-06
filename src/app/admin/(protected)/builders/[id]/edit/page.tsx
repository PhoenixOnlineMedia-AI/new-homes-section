import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { Builder, Database } from '@/lib/supabase/database.types'
import { BuilderMarketsEditor } from '@/components/admin/BuilderMarketsEditor'
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

    // Fetch existing market overrides
    const { data: rawMarkets } = await supabase
        .from('builder_markets')
        .select('*')
        .eq('builder_id', id)
        .order('city', { ascending: true })

    const builderMarkets = rawMarkets || []

    async function updateBuilder(formData: FormData) {
        'use server'

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
                initialMarkets={builderMarkets}
            />
        </div>
    )
}
