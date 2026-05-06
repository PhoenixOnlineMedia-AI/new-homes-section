'use server'

import { revalidatePath } from 'next/cache'
import { uploadMediaFile, type MediaAssetRole, type MediaEntityType } from '@/lib/media/assets'

type BulkUploadItem = {
  id: string
  action: 'assign' | 'unassigned' | 'discard'
  entity?: string
  role?: MediaAssetRole | ''
  filename?: string
  title?: string
  altText?: string
}

function parseEntity(value: string | null | undefined): { entityType: MediaEntityType; entityId: string | null } {
  if (!value || value === 'unassigned') {
    return { entityType: 'unassigned', entityId: null }
  }

  const [entityType, entityId] = value.split(':')
  if (!entityType || !entityId) {
    return { entityType: 'unassigned', entityId: null }
  }

  return { entityType: entityType as MediaEntityType, entityId }
}

function defaultRole(entityType: MediaEntityType, role: string | null | undefined): MediaAssetRole {
  if (role) return role as MediaAssetRole
  if (entityType === 'builder') return 'logo'
  if (entityType === 'builder_market') return 'market'
  if (entityType === 'market_page') return 'hero'
  if (entityType === 'home') return 'gallery'
  return 'gallery'
}

export async function bulkUploadMedia(formData: FormData) {
  const items = JSON.parse(String(formData.get('items') || '[]')) as BulkUploadItem[]
  const results = {
    uploaded: 0,
    skipped: 0,
    errors: [] as string[],
  }

  for (const item of items) {
    if (item.action === 'discard') {
      results.skipped += 1
      continue
    }

    const file = formData.get(`file:${item.id}`)
    if (!(file instanceof File) || file.size === 0) {
      results.errors.push(`${item.filename || item.id}: missing file`)
      continue
    }

    try {
      const { entityType, entityId } = item.action === 'unassigned'
        ? { entityType: 'unassigned' as MediaEntityType, entityId: null }
        : parseEntity(item.entity)
      const role = defaultRole(entityType, item.role)

      await uploadMediaFile({
        entityType,
        entityId,
        role,
        file,
        preferredName: item.filename || file.name,
        title: item.title?.trim() || null,
        altText: item.altText?.trim() || item.title?.trim() || null,
        status: entityType === 'unassigned' ? 'pending' : 'approved',
      })

      results.uploaded += 1
    } catch (error) {
      results.errors.push(`${item.filename || file.name}: ${error instanceof Error ? error.message : 'Upload failed'}`)
    }
  }

  revalidatePath('/admin/media')
  revalidatePath('/builders')
  revalidatePath('/[state]')
  revalidatePath('/[state]/[city]')

  return {
    success: results.errors.length === 0,
    message: `${results.uploaded} uploaded, ${results.skipped} skipped${results.errors.length ? `, ${results.errors.length} failed` : ''}.`,
    errors: results.errors,
  }
}
