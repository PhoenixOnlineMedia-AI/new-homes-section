import { getTemplate } from '@/lib/csv/templates'
import { CSVUpload } from '@/components/admin/CSVUpload'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export default function UploadHomesPage() {
  const template = getTemplate('homes')

  async function uploadHomes(data: Record<string, string>[]) {
    'use server'

    const supabase = createAdminClient()
    const errors: string[] = []
    let successCount = 0

    for (const row of data) {
      // Find community by slug
      const { data: community } = await supabase
        .from('communities')
        .select('id')
        .eq('slug', row.community_slug)
        .single()

      if (!community) {
        errors.push(`Row for "${row.name}": Community "${row.community_slug}" not found`)
        continue
      }

      const homeData = {
        // @ts-ignore
        community_id: community.id,
        name: row.name || null,
        address: row.address || '',
        base_price: row.base_price ? parseInt(row.base_price) : null,
        max_price: row.max_price ? parseInt(row.max_price) : null,
        bedrooms: row.bedrooms ? parseInt(row.bedrooms) : null,
        bathrooms: row.bathrooms ? parseFloat(row.bathrooms) : null,
        half_bathrooms: row.half_bathrooms ? parseInt(row.half_bathrooms) : null,
        sqft: row.sqft ? parseInt(row.sqft) : null,
        stories: row.stories ? parseInt(row.stories) : null,
        garage_spaces: row.garage_spaces ? parseInt(row.garage_spaces) : null,
        garage_type: row.garage_type || null,
        description: row.description || null,
        features: row.features ? row.features.split(',').map((s: string) => s.trim()) : [],
        status: row.status || 'available',
        images: row.images ? row.images.split(',').map((s: string) => s.trim()) : [],
        floor_plan_url: row.floor_plan_url || null,
        virtual_tour_url: row.virtual_tour_url || null,
      }

      const { error } = await supabase
        .from('homes')
        // @ts-expect-error Supabase type inference issue with server actions
        .insert(homeData)

      if (error) {
        errors.push(`Row for "${row.name}": ${error.message}`)
      } else {
        successCount++
      }
    }

    revalidatePath('/admin')
    revalidatePath('/[state]/[city]/[builderSlug]')

    return {
      success: errors.length === 0,
      message: `Successfully processed ${successCount} of ${data.length} homes`,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Homes</h1>
        <p className="text-gray-600 mt-2">
          Bulk import home/floor plan data from a CSV file. Make sure the community already exists first.
        </p>
      </div>

      <CSVUpload template={template} onUpload={uploadHomes} />
    </div>
  )
}
