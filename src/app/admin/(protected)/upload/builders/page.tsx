import { getTemplate } from '@/lib/csv/templates'
import { CSVUpload } from '@/components/admin/CSVUpload'
import { createAdminClient } from '@/lib/supabase/admin'
import { importRemoteMedia } from '@/lib/media/assets'
import { revalidatePath } from 'next/cache'

type IdOnly = { id: string }

export default function UploadBuildersPage() {
  const template = getTemplate('builders')

  async function uploadBuilders(data: Record<string, string>[]) {
    'use server'

    const supabase = createAdminClient()
    const errors: string[] = []
    let successCount = 0

    for (const row of data) {
      // Check if builder already exists by slug
      const { data: existing } = await supabase
        .from('builders')
        .select('id')
        .eq('slug', row.slug)
        .single()

      const builderData = {
        name: row.name,
        slug: row.slug,
        description: row.description || null,
        website: row.website || null,
        phone: row.phone || null,
        email: row.email || null,
        headquarters: row.headquarters || null,
        year_founded: row.year_founded ? parseInt(row.year_founded) : null,
        rating: row.rating ? parseFloat(row.rating) : null,
        source_site: 'csv_upload',
      }

      const existingBuilder = existing as unknown as IdOnly | null
      let builderId = existingBuilder?.id

      if (existingBuilder) {
        // Update existing
        const { error } = await supabase
          .from('builders')
          // @ts-expect-error Supabase type inference issue with server actions
          .update(builderData)
          .eq('id', existingBuilder.id)

        if (error) {
          errors.push(`Row for "${row.name}": ${error.message}`)
          continue
        } else {
          successCount++
        }
      } else {
        // Insert new
        const { data: inserted, error } = await supabase
          .from('builders')
          // @ts-expect-error Supabase type inference issue with server actions
          .insert(builderData)
          .select('id')
          .single()

        if (error) {
          errors.push(`Row for "${row.name}": ${error.message}`)
          continue
        } else {
          builderId = (inserted as unknown as IdOnly | null)?.id
          successCount++
        }
      }

      if (builderId && row.logo_url) {
        try {
          await importRemoteMedia({
            supabase,
            entityType: 'builder',
            entityId: builderId,
            role: 'logo',
            sourceUrl: row.logo_url,
            preferredName: `${row.slug}-logo`,
            title: `${row.name} logo`,
            altText: `${row.name} logo`,
          })
        } catch (error) {
          errors.push(`Logo for "${row.name}": ${error instanceof Error ? error.message : 'Import failed'}`)
        }
      }
    }

    revalidatePath('/admin')
    revalidatePath('/builders')

    return {
      success: errors.length === 0,
      message: `Successfully processed ${successCount} of ${data.length} builders`,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Builders</h1>
        <p className="text-gray-600 mt-2">
          Bulk import builder data from a CSV file
        </p>
      </div>

      <CSVUpload template={template} onUpload={uploadBuilders} />
    </div>
  )
}
