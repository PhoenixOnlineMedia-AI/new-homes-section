'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save } from 'lucide-react'

type StateOption = {
  code: string
  name: string
  slug: string
}

export type BuilderStateProfileRow = {
  id: string | null
  stateCode: string
  stateName: string
  stateSlug: string
  localDescription: string
  imageUrl: string
  isFeatured: boolean
  sortOrder: number
}

type BuilderStateProfilesEditorProps = {
  builderSlug: string
  stateOptions: StateOption[]
  initialProfiles: BuilderStateProfileRow[]
  onSaveProfile: (input: {
    id: string | null
    stateCode: string
    localDescription: string
    imageUrl: string
    isFeatured: boolean
    sortOrder: number
  }) => Promise<{ ok: boolean; id?: string; error?: string }>
  onDeleteProfile: (id: string) => Promise<{ ok: boolean; error?: string }>
}

function sortProfiles(profiles: BuilderStateProfileRow[]) {
  return [...profiles].sort((a, b) => a.stateName.localeCompare(b.stateName))
}

export function BuilderStateProfilesEditor({
  builderSlug,
  stateOptions,
  initialProfiles,
  onSaveProfile,
  onDeleteProfile,
}: BuilderStateProfilesEditorProps) {
  const router = useRouter()
  const [profiles, setProfiles] = useState<BuilderStateProfileRow[]>(() => sortProfiles(initialProfiles))
  const [selectedStateCode, setSelectedStateCode] = useState(stateOptions[0]?.code || '')
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const profileStateCodes = useMemo(
    () => new Set(profiles.map((profile) => profile.stateCode)),
    [profiles]
  )

  const availableStates = stateOptions.filter((state) => !profileStateCodes.has(state.code))
  const selectedState = stateOptions.find((state) => state.code === selectedStateCode) || availableStates[0]

  function updateProfile(key: string, updates: Partial<BuilderStateProfileRow>) {
    setProfiles((current) =>
      current.map((profile) => (profile.id || profile.stateCode) === key ? { ...profile, ...updates } : profile)
    )
  }

  async function saveProfile(profile: BuilderStateProfileRow) {
    setSavingKey(profile.id || profile.stateCode)
    setError(null)

    const result = await onSaveProfile({
      id: profile.id,
      stateCode: profile.stateCode,
      localDescription: profile.localDescription,
      imageUrl: profile.imageUrl,
      isFeatured: profile.isFeatured,
      sortOrder: Number.isFinite(profile.sortOrder) ? profile.sortOrder : 0,
    })

    if (!result.ok) {
      setError(result.error || 'Could not save state profile.')
      setSavingKey(null)
      return
    }

    if (result.id) {
      setProfiles((current) => sortProfiles(current.map((item) =>
        item.stateCode === profile.stateCode ? { ...item, id: result.id || item.id } : item
      )))
    }

    setSavingKey(null)
    router.refresh()
  }

  async function addProfile() {
    if (!selectedState) {
      setError('Choose a state to add.')
      return
    }

    const newProfile: BuilderStateProfileRow = {
      id: null,
      stateCode: selectedState.code,
      stateName: selectedState.name,
      stateSlug: selectedState.slug,
      localDescription: '',
      imageUrl: '',
      isFeatured: false,
      sortOrder: 0,
    }

    setProfiles((current) => sortProfiles([...current, newProfile]))
    const nextState = availableStates.find((state) => state.code !== selectedState.code)
    setSelectedStateCode(nextState?.code || '')
  }

  async function deleteProfile(profile: BuilderStateProfileRow) {
    if (!profile.id) {
      setProfiles((current) => current.filter((item) => item.stateCode !== profile.stateCode))
      return
    }

    if (!window.confirm(`Remove the ${profile.stateName} state profile?`)) {
      return
    }

    setDeletingId(profile.id)
    setError(null)

    const result = await onDeleteProfile(profile.id)

    if (!result.ok) {
      setError(result.error || 'Could not delete state profile.')
      setDeletingId(null)
      return
    }

    setProfiles((current) => current.filter((item) => item.id !== profile.id))
    setDeletingId(null)
    router.refresh()
  }

  return (
    <Card className="mt-8 border-blue-100">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle>Builder State Profiles</CardTitle>
        <CardDescription>
          Add state-wide builder profiles that appear on the builder page and link to state-specific builder pages.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {error && (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="state_profile_state">Add State Profile</Label>
            <select
              id="state_profile_state"
              value={selectedStateCode}
              onChange={(event) => setSelectedStateCode(event.target.value)}
              className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {availableStates.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" onClick={addProfile} disabled={availableStates.length === 0}>
            Add State
          </Button>
        </div>

        <div className="space-y-4">
          {profiles.map((profile) => {
            const key = profile.id || profile.stateCode

            return (
              <div key={key} className="rounded-lg border bg-white p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{profile.stateName}</h3>
                    <Link
                      href={`/builders/${builderSlug}/${profile.stateSlug}`}
                      target="_blank"
                      className="text-sm text-blue-700 hover:underline"
                    >
                      View public profile
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => saveProfile(profile)}
                      disabled={savingKey === key}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {savingKey === key ? 'Saving' : 'Save'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => deleteProfile(profile)}
                      disabled={deletingId === profile.id}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_160px]">
                  <div className="space-y-2">
                    <Label htmlFor={`${key}_description`}>State Profile Description</Label>
                    <Textarea
                      id={`${key}_description`}
                      value={profile.localDescription}
                      onChange={(event) => updateProfile(key, { localDescription: event.target.value })}
                      className="min-h-28"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 rounded-md border p-2 text-sm font-medium">
                      <Checkbox
                        checked={profile.isFeatured}
                        onCheckedChange={(checked) => updateProfile(key, { isFeatured: checked === true })}
                      />
                      Featured statewide
                    </label>
                    <div className="space-y-2">
                      <Label htmlFor={`${key}_sort_order`}>Sort Order</Label>
                      <Input
                        id={`${key}_sort_order`}
                        type="number"
                        value={profile.sortOrder}
                        onChange={(event) => updateProfile(key, { sortOrder: Number(event.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor={`${key}_image_url`}>State Profile Image URL</Label>
                  <Input
                    id={`${key}_image_url`}
                    type="url"
                    value={profile.imageUrl}
                    onChange={(event) => updateProfile(key, { imageUrl: event.target.value })}
                  />
                </div>
              </div>
            )
          })}

          {profiles.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
              No state profiles exist for this builder yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
