import { getTemplate } from '@/lib/csv/templates'
import { CSVUpload } from '@/components/admin/CSVUpload'
import { createAdminClient } from '@/lib/supabase/admin'
import { importRemoteMedia, splitMediaUrlList } from '@/lib/media/assets'
import { revalidatePath } from 'next/cache'

type IdOnly = { id: string }

export default function UploadCommunitiesPage() {
  const template = getTemplate('communities')

  async function uploadCommunities(data: Record<string, string>[]) {
    'use server'

    const supabase = createAdminClient()
    const errors: string[] = []
    let successCount = 0

    for (const row of data) {
      // Find builder by slug
      const { data: builder } = await supabase
        .from('builders')
        .select('id')
        .eq('slug', row.builder_slug)
        .single()

      if (!builder) {
        errors.push(`Row for "${row.name}": Builder "${row.builder_slug}" not found`)
        continue
      }
      const builderRecord = builder as unknown as IdOnly

      // Check if community already exists by slug
      const { data: existing } = await supabase
        .from('communities')
        .select('id')
        .eq('slug', row.slug)
        .single()

      const communityData = {
        builder_id: builderRecord.id,
        name: row.name,
        slug: row.slug,
        description: row.description || null,
        address: row.address || '',
        city: row.city,
        state: row.state,
        state_code: row.state_code,
        zip_code: row.zip_code || '',
        min_price: row.min_price ? parseInt(row.min_price) : null,
        max_price: row.max_price ? parseInt(row.max_price) : null,
        min_bedrooms: row.min_bedrooms ? parseInt(row.min_bedrooms) : null,
        max_bedrooms: row.max_bedrooms ? parseInt(row.max_bedrooms) : null,
        min_bathrooms: row.min_bathrooms ? parseFloat(row.min_bathrooms) : null,
        max_bathrooms: row.max_bathrooms ? parseFloat(row.max_bathrooms) : null,
        min_sqft: row.min_sqft ? parseInt(row.min_sqft) : null,
        max_sqft: row.max_sqft ? parseInt(row.max_sqft) : null,
        home_count: row.home_count ? parseInt(row.home_count) : 0,
        status: row.status || 'selling',
        amenities: row.amenities ? row.amenities.split(',').map((s: string) => s.trim()) : [],
        school_district: row.school_district || null,
        images: [],
        source_site: 'csv_upload',
      }

      const existingCommunity = existing as unknown as IdOnly | null
      let communityId = existingCommunity?.id

      if (existingCommunity) {
        const { error } = await supabase
          .from('communities')
          // @ts-expect-error Supabase type inference issue with server actions
          .update(communityData)
          .eq('id', existingCommunity.id)

        if (error) {
          errors.push(`Row for "${row.name}": ${error.message}`)
          continue
        } else {
          successCount++
        }
      } else {
        const { data: inserted, error } = await supabase
          .from('communities')
          // @ts-expect-error Supabase type inference issue with server actions
          .insert(communityData)
          .select('id')
          .single()

        if (error) {
          errors.push(`Row for "${row.name}": ${error.message}`)
          continue
        } else {
          communityId = (inserted as unknown as IdOnly | null)?.id
          successCount++
        }
      }

      if (communityId && row.images) {
        const imageUrls = splitMediaUrlList(row.images)

        for (const [index, imageUrl] of imageUrls.entries()) {
          try {
            await importRemoteMedia({
              supabase,
              entityType: 'community',
              entityId: communityId,
              role: index === 0 ? 'hero' : 'gallery',
              sourceUrl: imageUrl,
              preferredName: `${row.slug}-${index + 1}`,
              title: row.name,
              altText: `${row.name} community photo`,
              sortOrder: index,
            })
          } catch (error) {
            errors.push(`Image ${index + 1} for "${row.name}": ${error instanceof Error ? error.message : 'Import failed'}`)
          }
        }
      }
    }

    revalidatePath('/admin')
    revalidatePath('/[state]/[city]')

    return {
      success: errors.length === 0,
      message: `Successfully processed ${successCount} of ${data.length} communities`,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Communities</h1>
        <p className="text-gray-600 mt-2">
          Bulk import community data from a CSV file. Make sure the builder already exists first.
        </p>
      </div>

      <CSVUpload template={template} onUpload={uploadCommunities} />
    </div>
  )
}
