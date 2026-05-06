'use client'

import { ChangeEvent, useMemo, useRef, useState, useTransition } from 'react'
import JSZip from 'jszip'
import { AlertCircle, Archive, CheckCircle2, FolderOpen, ImageIcon, UploadCloud, X } from 'lucide-react'
import { bulkUploadMedia } from '@/app/admin/(protected)/media/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { MediaAssetRole, MediaEntityType } from '@/lib/media/assets'

type EntityOption = {
  value: string
  label: string
  type: MediaEntityType
}

type BulkItem = {
  id: string
  file: File
  previewUrl: string
  action: 'assign' | 'unassigned' | 'discard'
  entity: string
  role: MediaAssetRole | ''
  filename: string
  title: string
  altText: string
  matchLabel: string | null
}

type UploadResult = {
  success: boolean
  message: string
  errors?: string[]
}

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg']

const ROLE_OPTIONS: { value: MediaAssetRole; label: string }[] = [
  { value: 'logo', label: 'Logo' },
  { value: 'hero', label: 'Hero image' },
  { value: 'gallery', label: 'Gallery photo' },
  { value: 'market', label: 'Market image' },
  { value: 'floor_plan', label: 'Floor plan' },
]

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function isImageFile(file: File) {
  const lowerName = file.name.toLowerCase()
  return IMAGE_TYPES.has(file.type) || IMAGE_EXTENSIONS.some((extension) => lowerName.endsWith(extension))
}

function contentTypeFromName(name: string) {
  const lowerName = name.toLowerCase()
  if (lowerName.endsWith('.svg')) return 'image/svg+xml'
  if (lowerName.endsWith('.png')) return 'image/png'
  if (lowerName.endsWith('.webp')) return 'image/webp'
  return 'image/jpeg'
}

function defaultRoleForEntity(entityType: MediaEntityType): MediaAssetRole {
  if (entityType === 'builder') return 'logo'
  if (entityType === 'builder_market') return 'market'
  if (entityType === 'market_page') return 'hero'
  return 'gallery'
}

function defaultTitle(filename: string) {
  return filename
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function findBestMatch(file: File, entityOptions: EntityOption[]) {
  const fileName = normalize(file.name)
  const folderPath = normalize((file as File & { webkitRelativePath?: string }).webkitRelativePath || '')
  const haystack = `${folderPath} ${fileName}`.trim()
  if (!haystack) return null

  const matches = entityOptions
    .filter((option) => option.type === 'builder')
    .map((option) => {
      const label = normalize(option.label.replace(/^builder:\s*/i, ''))
      const words = label.split(' ').filter((word) => word.length > 1)
      const score = words.reduce((sum, word) => sum + (haystack.includes(word) ? 1 : 0), 0)
      return { option, score, exact: label && haystack.includes(label) }
    })
    .filter((match) => match.exact || match.score >= Math.min(2, normalize(match.option.label).split(' ').length))
    .sort((a, b) => Number(b.exact) - Number(a.exact) || b.score - a.score)

  return matches[0]?.option || null
}

export function MediaBulkUpload({ entityOptions }: { entityOptions: EntityOption[] }) {
  const [items, setItems] = useState<BulkItem[]>([])
  const [bulkEntity, setBulkEntity] = useState('unassigned')
  const [bulkRole, setBulkRole] = useState<MediaAssetRole>('gallery')
  const [result, setResult] = useState<UploadResult | null>(null)
  const [zipError, setZipError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const folderInputRef = useRef<HTMLInputElement>(null)

  const selectedCount = items.filter((item) => item.action !== 'discard').length

  const entityTypeByValue = useMemo(() => {
    return new Map(entityOptions.map((option) => [option.value, option.type]))
  }, [entityOptions])

  function addFiles(files: File[]) {
    setResult(null)
    setZipError(null)

    const imageFiles = files.filter(isImageFile)
    const nextItems = imageFiles.map((file, index) => {
      const match = findBestMatch(file, entityOptions)
      const entityType = match ? entityTypeByValue.get(match.value) || match.type : 'unassigned'
      const title = defaultTitle(file.name)

      return {
        id: `${Date.now()}-${index}-${file.name}`,
        file,
        previewUrl: URL.createObjectURL(file),
        action: match ? 'assign' : 'unassigned',
        entity: match?.value || 'unassigned',
        role: match ? defaultRoleForEntity(entityType) : 'gallery',
        filename: file.name,
        title,
        altText: title,
        matchLabel: match?.label || null,
      } satisfies BulkItem
    })

    setItems((current) => [...current, ...nextItems])
  }

  function updateItem(id: string, changes: Partial<BulkItem>) {
    setItems((current) => current.map((item) => {
      if (item.id !== id) return item
      const next = { ...item, ...changes }

      if (changes.entity) {
        const entityType = entityTypeByValue.get(changes.entity) || 'unassigned'
        next.action = changes.entity === 'unassigned' ? 'unassigned' : 'assign'
        next.role = changes.entity === 'unassigned' ? 'gallery' : defaultRoleForEntity(entityType)
      }

      return next
    }))
  }

  function clearItems() {
    items.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    setItems([])
    setResult(null)
    setZipError(null)
  }

  function applyBulkAssignment() {
    const entityType = entityTypeByValue.get(bulkEntity) || 'unassigned'
    const role = bulkEntity === 'unassigned' ? bulkRole : bulkRole || defaultRoleForEntity(entityType)

    setItems((current) => current.map((item) => {
      if (item.action === 'discard') return item
      return {
        ...item,
        action: bulkEntity === 'unassigned' ? 'unassigned' : 'assign',
        entity: bulkEntity,
        role,
      }
    }))
  }

  async function handleImageFiles(event: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.target.files || []))
    event.target.value = ''
  }

  async function handleZip(event: ChangeEvent<HTMLInputElement>) {
    const zipFile = event.target.files?.[0]
    event.target.value = ''
    if (!zipFile) return

    setZipError(null)

    try {
      const zip = await JSZip.loadAsync(zipFile)
      const files: File[] = []

      for (const entry of Object.values(zip.files)) {
        if (entry.dir || !IMAGE_EXTENSIONS.some((extension) => entry.name.toLowerCase().endsWith(extension))) continue
        const blob = await entry.async('blob')
        const filename = entry.name.split('/').filter(Boolean).pop() || 'media.jpg'
        files.push(new File([blob], filename, { type: contentTypeFromName(filename) }))
      }

      if (files.length === 0) {
        setZipError('No supported images were found in that zip file.')
        return
      }

      addFiles(files)
    } catch (error) {
      setZipError(error instanceof Error ? error.message : 'Could not read that zip file.')
    }
  }

  function submitBulkUpload() {
    const formData = new FormData()
    const payload = items.map((item) => ({
      id: item.id,
      action: item.action,
      entity: item.entity,
      role: item.role,
      filename: item.filename,
      title: item.title,
      altText: item.altText,
    }))

    formData.append('items', JSON.stringify(payload))
    items.forEach((item) => {
      if (item.action !== 'discard') {
        formData.append(`file:${item.id}`, item.file, item.filename || item.file.name)
      }
    })

    startTransition(async () => {
      const uploadResult = await bulkUploadMedia(formData)
      setResult(uploadResult)
      if (uploadResult.success) clearItems()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Archive className="h-5 w-5" />
          Bulk Upload and Assign
        </CardTitle>
        <CardDescription>
          Upload individual images, open an image folder, or unpack a zip. Review every file before it is stored.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
            <Label htmlFor="bulk_files" className="flex cursor-pointer flex-col items-center gap-2 text-center">
              <ImageIcon className="h-8 w-8 text-slate-500" />
              <span className="font-medium text-slate-900">Choose image files</span>
              <span className="text-xs text-slate-500">Select one or many images.</span>
            </Label>
            <Input id="bulk_files" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" multiple className="mt-3" onChange={handleImageFiles} />
          </div>

          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
            <button
              type="button"
              className="flex w-full flex-col items-center gap-2 text-center"
              onClick={() => folderInputRef.current?.click()}
            >
              <FolderOpen className="h-8 w-8 text-slate-500" />
              <span className="font-medium text-slate-900">Open a folder</span>
              <span className="text-xs text-slate-500">Browses inside folders and imports all images.</span>
            </button>
            <input
              ref={folderInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              multiple
              className="sr-only"
              onChange={handleImageFiles}
              {...{ webkitdirectory: '', directory: '' }}
            />
          </div>

          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
            <Label htmlFor="zip_file" className="flex cursor-pointer flex-col items-center gap-2 text-center">
              <Archive className="h-8 w-8 text-slate-500" />
              <span className="font-medium text-slate-900">Upload zip</span>
              <span className="text-xs text-slate-500">Unpack and review images first.</span>
            </Label>
            <Input id="zip_file" type="file" accept=".zip,application/zip" className="mt-3" onChange={handleZip} />
          </div>
        </div>

        {zipError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {zipError}
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h3 className="font-semibold text-slate-900">{items.length} files ready to review</h3>
                <p className="text-sm text-slate-500">{selectedCount} will be uploaded. Discarded files are ignored.</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={clearItems} disabled={isPending}>
                  Clear
                </Button>
                <Button type="button" onClick={submitBulkUpload} disabled={isPending || selectedCount === 0}>
                  <UploadCloud className="h-4 w-4" />
                  {isPending ? 'Uploading...' : 'Upload Reviewed Files'}
                </Button>
              </div>
            </div>

            <div className="grid gap-3 rounded-lg border bg-slate-50 p-4 md:grid-cols-[1fr_180px_auto] md:items-end">
              <div className="space-y-2">
                <Label>Apply one assignment to all non-discarded files</Label>
                <select
                  value={bulkEntity}
                  onChange={(event) => setBulkEntity(event.target.value)}
                  className="border-input h-9 w-full rounded-md border bg-white px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <option value="unassigned">Upload without attaching</option>
                  {entityOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <select
                  value={bulkRole}
                  onChange={(event) => setBulkRole(event.target.value as MediaAssetRole)}
                  className="border-input h-9 w-full rounded-md border bg-white px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <Button type="button" variant="outline" onClick={applyBulkAssignment}>
                Apply to all
              </Button>
            </div>

            <div className="overflow-hidden rounded-lg border bg-white">
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className={item.action === 'discard' ? 'bg-slate-50 opacity-70' : 'bg-white'}>
                    <div className="grid gap-4 p-4 lg:grid-cols-[88px_minmax(0,1fr)_220px]">
                      <div className="h-20 w-20 overflow-hidden rounded-lg border bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.previewUrl} alt="" className="h-full w-full object-contain p-2" />
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Storage filename</Label>
                          <Input value={item.filename} onChange={(event) => updateItem(item.id, { filename: event.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Assign to</Label>
                          <select
                            value={item.entity}
                            onChange={(event) => updateItem(item.id, { entity: event.target.value })}
                            className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                          >
                            <option value="unassigned">Upload without attaching</option>
                            {entityOptions.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          {item.matchLabel && (
                            <p className="text-xs text-emerald-700">Suggested match: {item.matchLabel}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input value={item.title} onChange={(event) => updateItem(item.id, { title: event.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Alt text</Label>
                          <Input value={item.altText} onChange={(event) => updateItem(item.id, { altText: event.target.value })} />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Action</Label>
                          <select
                            value={item.action}
                            onChange={(event) => updateItem(item.id, { action: event.target.value as BulkItem['action'] })}
                            className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                          >
                            <option value="assign">Upload and attach</option>
                            <option value="unassigned">Upload unattached</option>
                            <option value="discard">Discard</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <select
                            value={item.role}
                            onChange={(event) => updateItem(item.id, { role: event.target.value as MediaAssetRole })}
                            disabled={item.action === 'discard'}
                            className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                          </select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => updateItem(item.id, { action: 'discard' })}
                        >
                          <X className="h-4 w-4" />
                          Discard
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className={`rounded-lg border p-4 ${result.success ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
            <div className="flex items-center gap-2 font-medium">
              {result.success ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              {result.message}
            </div>
            {result.errors && result.errors.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                {result.errors.map((error) => <li key={error}>{error}</li>)}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
