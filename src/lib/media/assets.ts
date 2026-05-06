import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/lib/supabase/database.types'

export type MediaEntityType = 'builder' | 'builder_market' | 'market_page' | 'community' | 'home' | 'unassigned'
export type MediaAssetRole = 'logo' | 'hero' | 'gallery' | 'floor_plan' | 'market'
export type MediaAssetStatus = 'pending' | 'matched' | 'approved' | 'rejected'

type AdminClient = ReturnType<typeof createAdminClient>
type MediaAssetInsert = Database['public']['Tables']['media_assets']['Insert']

const IMAGE_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
])

export function bucketForMedia(entityType: MediaEntityType, role: MediaAssetRole) {
  if (entityType === 'unassigned') return 'media-library'
  if (entityType === 'builder' && role === 'logo') return 'builder-logos'
  if (entityType === 'builder_market') return 'builder-market-media'
  if (entityType === 'market_page') return 'market-page-media'
  if (entityType === 'community') return 'community-photos'
  if (entityType === 'home') return 'home-photos'
  return 'community-photos'
}

export function splitMediaUrlList(value: string | null | undefined) {
  if (!value) return []

  const delimiter = value.includes('|') ? '|' : ','

  return value
    .split(delimiter)
    .map((url) => url.trim())
    .filter(Boolean)
}

function sanitizePathPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'media'
}

function extensionFromContentType(contentType: string | null) {
  const normalized = contentType?.split(';')[0].trim().toLowerCase()

  switch (normalized) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/svg+xml':
      return 'svg'
    default:
      return null
  }
}

function extensionFromName(filename: string | null | undefined) {
  const match = filename?.toLowerCase().match(/\.([a-z0-9]+)(?:\?|#|$)/)
  const ext = match?.[1]

  if (ext && ['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) {
    return ext === 'jpeg' ? 'jpg' : ext
  }

  return null
}

function fileNameFromUrl(sourceUrl: string) {
  try {
    const url = new URL(sourceUrl)
    const name = url.pathname.split('/').filter(Boolean).pop()
    return name ? decodeURIComponent(name) : null
  } catch {
    return null
  }
}

function buildStoragePath(options: {
  entityType: MediaEntityType
  entityId: string | null
  role: MediaAssetRole
  preferredName: string
  extension: string
  sortOrder?: number
}) {
  const prefix = options.entityType.replace('_', '-')
  const role = sanitizePathPart(options.role)
  const name = sanitizePathPart(options.preferredName.replace(/\.[a-z0-9]+$/i, ''))
  const index = String(options.sortOrder ?? 0).padStart(2, '0')

  return `${prefix}/${options.entityId || 'library'}/${role}/${index}-${name}.${options.extension}`
}

function getPublicUrl(supabase: AdminClient, bucket: string, path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

async function recordMediaAsset(
  supabase: AdminClient,
  asset: Omit<MediaAssetInsert, 'status'> & { status?: MediaAssetStatus }
) {
  const { data, error } = await supabase
    .from('media_assets')
    // @ts-expect-error Generated Supabase types do not infer enum inserts cleanly here.
    .upsert(asset, { onConflict: 'bucket,path' })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return data
}

export async function uploadMediaFile(options: {
  entityType: MediaEntityType
  entityId?: string | null
  role: MediaAssetRole
  file: File
  preferredName?: string | null
  title?: string | null
  altText?: string | null
  sortOrder?: number
  status?: MediaAssetStatus
}) {
  const contentType = options.file.type || 'application/octet-stream'

  if (!IMAGE_CONTENT_TYPES.has(contentType)) {
    throw new Error(`Unsupported file type: ${contentType}`)
  }

  const supabase = createAdminClient()
  const bucket = bucketForMedia(options.entityType, options.role)
  const extension = extensionFromContentType(contentType) || extensionFromName(options.file.name) || 'jpg'
  const path = buildStoragePath({
    entityType: options.entityType,
    entityId: options.entityId || null,
    role: options.role,
    preferredName: options.preferredName || options.file.name,
    extension,
    sortOrder: options.sortOrder,
  })
  const buffer = Buffer.from(await options.file.arrayBuffer())
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    })

  if (error) throw new Error(error.message)

  const publicUrl = getPublicUrl(supabase, bucket, path)

  await recordMediaAsset(supabase, {
    entity_type: options.entityType,
    entity_id: options.entityId || null,
    bucket,
    path,
    public_url: publicUrl,
    original_filename: options.file.name,
    title: options.title || null,
    alt_text: options.altText || null,
    role: options.role,
    sort_order: options.sortOrder ?? 0,
    status: options.status || 'approved',
    content_type: contentType,
    size_bytes: options.file.size,
  })

  if (options.entityType !== 'unassigned' && options.entityId) {
    await syncEntityMediaUrl(supabase, {
      entityType: options.entityType,
      entityId: options.entityId,
      role: options.role,
      publicUrl,
      sortOrder: options.sortOrder ?? 0,
    })
  }

  return publicUrl
}

export async function importRemoteMedia(options: {
  supabase?: AdminClient
  entityType: MediaEntityType
  entityId?: string | null
  role: MediaAssetRole
  sourceUrl: string
  preferredName?: string
  title?: string | null
  altText?: string | null
  sortOrder?: number
  status?: MediaAssetStatus
}) {
  const sourceUrl = options.sourceUrl.trim()
  if (!sourceUrl) return null

  const supabase = options.supabase || createAdminClient()
  const response = await fetch(sourceUrl, {
    headers: {
      'User-Agent': 'NewHomesSection media importer',
    },
  })

  if (!response.ok) {
    throw new Error(`Could not download ${sourceUrl}: ${response.status}`)
  }

  const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() || null

  if (!contentType || !IMAGE_CONTENT_TYPES.has(contentType)) {
    throw new Error(`Unsupported media type for ${sourceUrl}: ${contentType || 'unknown'}`)
  }

  const contentLength = Number(response.headers.get('content-length') || 0)
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const sourceName = fileNameFromUrl(sourceUrl)
  const extension = extensionFromContentType(contentType) || extensionFromName(sourceName) || 'jpg'
  const bucket = bucketForMedia(options.entityType, options.role)
  const path = buildStoragePath({
    entityType: options.entityType,
    entityId: options.entityId || null,
    role: options.role,
    preferredName: options.preferredName || sourceName || options.role,
    extension,
    sortOrder: options.sortOrder,
  })

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    })

  if (error) throw new Error(error.message)

  const publicUrl = getPublicUrl(supabase, bucket, path)

  await recordMediaAsset(supabase, {
    entity_type: options.entityType,
    entity_id: options.entityId || null,
    bucket,
    path,
    public_url: publicUrl,
    source_url: sourceUrl,
    original_filename: sourceName,
    title: options.title || null,
    alt_text: options.altText || null,
    role: options.role,
    sort_order: options.sortOrder ?? 0,
    status: options.status || 'approved',
    content_type: contentType,
    size_bytes: buffer.byteLength || contentLength || null,
  })

  if (options.entityType !== 'unassigned' && options.entityId) {
    await syncEntityMediaUrl(supabase, {
      entityType: options.entityType,
      entityId: options.entityId,
      role: options.role,
      publicUrl,
      sortOrder: options.sortOrder ?? 0,
    })
  }

  return publicUrl
}

export async function syncEntityMediaUrl(
  supabase: AdminClient,
  options: {
    entityType: MediaEntityType
    entityId: string
    role: MediaAssetRole
    publicUrl: string
    sortOrder: number
  }
) {
  if (options.entityType === 'builder' && options.role === 'logo') {
    const { error } = await supabase
      .from('builders')
      .update({ logo_url: options.publicUrl } as never)
      .eq('id', options.entityId)

    if (error) throw new Error(error.message)
    return
  }

  if (options.entityType === 'builder_market') {
    const { error } = await supabase
      .from('builder_markets')
      .update({ image_url: options.publicUrl } as never)
      .eq('id', options.entityId)

    if (error) throw new Error(error.message)
    return
  }

  if (options.entityType === 'market_page') {
    const { error } = await supabase
      .from('market_pages')
      .update({ hero_image_url: options.publicUrl } as never)
      .eq('id', options.entityId)

    if (error) throw new Error(error.message)
    return
  }

  if (options.entityType === 'community') {
    await appendImageUrl(supabase, 'communities', options.entityId, options.publicUrl)
    return
  }

  if (options.entityType === 'home') {
    await appendImageUrl(supabase, 'homes', options.entityId, options.publicUrl)
  }
}

async function appendImageUrl(
  supabase: AdminClient,
  table: 'communities' | 'homes',
  entityId: string,
  publicUrl: string
) {
  const { data, error: fetchError } = await supabase
    .from(table)
    .select('images')
    .eq('id', entityId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  const imageRecord = data as unknown as { images: string[] | null } | null
  const existing = Array.isArray(imageRecord?.images) ? imageRecord.images : []
  const images = [...existing.filter((url) => url !== publicUrl), publicUrl]

  const { error } = await supabase
    .from(table)
    .update({ images } as never)
    .eq('id', entityId)

  if (error) throw new Error(error.message)
}
