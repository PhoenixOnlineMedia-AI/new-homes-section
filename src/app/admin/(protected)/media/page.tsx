import { revalidatePath } from 'next/cache'
import { LinkIcon, UploadCloud } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { importRemoteMedia, uploadMediaFile, type MediaAssetRole, type MediaEntityType } from '@/lib/media/assets'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { MediaAsset } from '@/lib/supabase/database.types'

type EntityOption = {
  value: string
  label: string
  type: MediaEntityType
}
type BuilderOption = { id: string; name: string; slug: string }
type MarketOption = { id: string; builder_id: string; city: string | null; state_code: string }
type CommunityOption = { id: string; name: string; city: string; state_code: string }
type HomeOption = { id: string; name: string | null; address: string | null }

const ROLE_OPTIONS: { value: MediaAssetRole; label: string }[] = [
  { value: 'logo', label: 'Logo' },
  { value: 'hero', label: 'Hero image' },
  { value: 'gallery', label: 'Gallery photo' },
  { value: 'market', label: 'Market image' },
  { value: 'floor_plan', label: 'Floor plan' },
]

function parseEntity(value: FormDataEntryValue | null) {
  const [entityType, entityId] = String(value || '').split(':')

  if (!entityType || !entityId) {
    throw new Error('Choose where this media belongs.')
  }

  return {
    entityType: entityType as MediaEntityType,
    entityId,
  }
}

function defaultRole(entityType: MediaEntityType, role: string) {
  if (role) return role as MediaAssetRole
  if (entityType === 'builder') return 'logo'
  if (entityType === 'builder_market') return 'market'
  return 'gallery'
}

function assetLabel(asset: MediaAsset, labels: Map<string, string>) {
  return labels.get(`${asset.entity_type}:${asset.entity_id}`) || `${asset.entity_type} ${asset.entity_id.slice(0, 8)}`
}

export default async function AdminMediaPage() {
  const supabase = createAdminClient()

  const [
    { data: buildersData },
    { data: marketsData },
    { data: communitiesData },
    { data: homesData },
    { data: mediaData },
  ] = await Promise.all([
    supabase.from('builders').select('id,name,slug').order('name'),
    supabase.from('builder_markets').select('id,builder_id,city,state_code').order('state_code'),
    supabase.from('communities').select('id,name,city,state_code').order('name'),
    supabase.from('homes').select('id,name,address').order('name'),
    supabase.from('media_assets').select('*').order('created_at', { ascending: false }).limit(36),
  ])

  const builders = (buildersData || []) as unknown as BuilderOption[]
  const markets = (marketsData || []) as unknown as MarketOption[]
  const communities = (communitiesData || []) as unknown as CommunityOption[]
  const homes = (homesData || []) as unknown as HomeOption[]
  const builderNameById = new Map(builders.map((builder) => [builder.id, builder.name]))
  const entityOptions: EntityOption[] = [
    ...builders.map((builder) => ({
      value: `builder:${builder.id}`,
      label: `Builder: ${builder.name}`,
      type: 'builder' as const,
    })),
    ...markets.map((market) => ({
      value: `builder_market:${market.id}`,
      label: `Market: ${builderNameById.get(market.builder_id) || 'Builder'} - ${market.city || 'State-wide'}, ${market.state_code}`,
      type: 'builder_market' as const,
    })),
    ...communities.map((community) => ({
      value: `community:${community.id}`,
      label: `Community: ${community.name} - ${community.city}, ${community.state_code}`,
      type: 'community' as const,
    })),
    ...homes.map((home) => ({
      value: `home:${home.id}`,
      label: `Home: ${home.name || home.address || home.id.slice(0, 8)}`,
      type: 'home' as const,
    })),
  ]
  const entityLabels = new Map(entityOptions.map((option) => [option.value, option.label]))
  const mediaAssets: MediaAsset[] = mediaData || []

  async function importFromUrl(formData: FormData) {
    'use server'

    const { entityType, entityId } = parseEntity(formData.get('entity'))
    const role = defaultRole(entityType, String(formData.get('role') || ''))
    const sourceUrl = String(formData.get('source_url') || '')
    const title = String(formData.get('title') || '').trim() || null
    const altText = String(formData.get('alt_text') || '').trim() || title

    await importRemoteMedia({
      entityType,
      entityId,
      role,
      sourceUrl,
      title,
      altText,
      preferredName: title || role,
    })

    revalidatePath('/admin/media')
    revalidatePath('/builders')
    revalidatePath('/[state]')
    revalidatePath('/[state]/[city]')
  }

  async function uploadFile(formData: FormData) {
    'use server'

    const { entityType, entityId } = parseEntity(formData.get('entity'))
    const role = defaultRole(entityType, String(formData.get('role') || ''))
    const file = formData.get('file')

    if (!(file instanceof File) || file.size === 0) {
      throw new Error('Choose an image file to upload.')
    }

    const title = String(formData.get('title') || '').trim() || null
    const altText = String(formData.get('alt_text') || '').trim() || title

    await uploadMediaFile({
      entityType,
      entityId,
      role,
      file,
      title,
      altText,
    })

    revalidatePath('/admin/media')
    revalidatePath('/builders')
    revalidatePath('/[state]')
    revalidatePath('/[state]/[city]')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
        <p className="text-gray-600">
          Import, upload, and assign first-party images for builders, markets, communities, and homes.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LinkIcon className="h-5 w-5" />
              Import From URL
            </CardTitle>
            <CardDescription>
              Pull an existing logo or photo into Supabase Storage and attach it to the selected record.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={importFromUrl} className="space-y-4">
              <MediaAssignmentFields entityOptions={entityOptions} />
              <div className="space-y-2">
                <Label htmlFor="source_url">Source URL</Label>
                <Input id="source_url" name="source_url" type="url" placeholder="https://example.com/logo.png" required />
              </div>
              <MetadataFields />
              <Button type="submit" className="w-full">
                Import and Assign
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UploadCloud className="h-5 w-5" />
              Upload File
            </CardTitle>
            <CardDescription>
              Upload a local logo or photo directly, then sync the public display URL automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={uploadFile} className="space-y-4">
              <MediaAssignmentFields entityOptions={entityOptions} />
              <div className="space-y-2">
                <Label htmlFor="file">Image File</Label>
                <Input id="file" name="file" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" required />
              </div>
              <MetadataFields />
              <Button type="submit" className="w-full">
                Upload and Assign
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Recent Media</h2>
            <p className="text-sm text-gray-600">Newest assigned assets across the site.</p>
          </div>
          <div className="text-sm text-gray-500">{mediaAssets.length} shown</div>
        </div>

        {mediaAssets.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-white p-10 text-center text-sm text-gray-500">
            No media assets have been imported yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {mediaAssets.map((asset) => (
              <div key={asset.id} className="overflow-hidden rounded-lg border bg-white">
                <div className="aspect-[4/3] bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.public_url} alt={asset.alt_text || asset.title || 'Media asset'} className="h-full w-full object-contain p-3" />
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                      {asset.role}
                    </span>
                    <span className="text-xs text-gray-500">{asset.content_type || 'image'}</span>
                  </div>
                  <div>
                    <p className="truncate text-sm font-medium text-gray-900">{asset.title || asset.original_filename || asset.path}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">{assetLabel(asset, entityLabels)}</p>
                  </div>
                  {asset.source_url && (
                    <p className="truncate text-xs text-gray-400">Source: {asset.source_url}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function MediaAssignmentFields({ entityOptions }: { entityOptions: EntityOption[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="entity">Assign To</Label>
        <select
          id="entity"
          name="entity"
          required
          className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <option value="">Choose a record</option>
          {entityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Media Role</Label>
        <select
          id="role"
          name="role"
          className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <option value="">Use default role</option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function MetadataFields() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Optional display title" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="alt_text">Alt Text</Label>
        <Input id="alt_text" name="alt_text" placeholder="Optional accessibility text" />
      </div>
    </div>
  )
}
