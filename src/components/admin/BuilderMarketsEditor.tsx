'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BuilderMarket {
    id: string
    builder_id: string
    city: string | null
    state_code: string
    local_description: string | null
    is_featured: boolean | null
    sort_order: number | null
    created_at: string
    updated_at: string
}

interface BuilderMarketsEditorProps {
    builderId: string
    initialMarkets: BuilderMarket[]
}

export function BuilderMarketsEditor({ builderId, initialMarkets }: BuilderMarketsEditorProps) {
    const router = useRouter()
    const supabase = createClient()

    const [markets, setMarkets] = useState<BuilderMarket[]>(initialMarkets)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [city, setCity] = useState('')
    const [stateCode, setStateCode] = useState('')
    const [localDescription, setLocalDescription] = useState('')
    const [isFeatured, setIsFeatured] = useState(false)
    const [sortOrder, setSortOrder] = useState<number>(0)

    async function handleAddMarket(e: React.FormEvent) {
        e.preventDefault()
        if (!stateCode) {
            setError('State Code is required')
            return
        }

        setIsSaving(true)
        setError(null)

        const { data, error: insertError } = await supabase
            .from('builder_markets')
            // @ts-expect-error - Type inference failing on manually generated Supabase types
            .insert({
                builder_id: builderId,
                city: city.trim() || null,
                state_code: stateCode.trim().toUpperCase(),
                local_description: localDescription.trim() || null,
                is_featured: isFeatured,
                sort_order: sortOrder
            })
            .select()
            .single()

        if (insertError) {
            console.error('Error adding market:', insertError)
            setError(insertError.message || 'Failed to add market override')
            setIsSaving(false)
            return
        }

        if (data) {
            setMarkets(prev => [...prev, data as BuilderMarket].sort((a, b) => (a.city || '').localeCompare(b.city || '')))
            setCity('')
            setStateCode('')
            setLocalDescription('')
            setIsFeatured(false)
            setSortOrder(0)
            router.refresh()
        }
        setIsSaving(false)
    }

    async function handleDeleteMarket(marketId: string) {
        if (!window.confirm('Are you sure you want to delete this market override? The builder will fall back to their national description in this market.')) {
            return
        }

        setIsDeleting(marketId)
        setError(null)

        const { error: deleteError } = await supabase
            .from('builder_markets')
            .delete()
            .eq('id', marketId)

        if (deleteError) {
            console.error('Error deleting market:', deleteError)
            setError('Failed to delete market override')
            setIsDeleting(null)
            return
        }

        setMarkets(prev => prev.filter(m => m.id !== marketId))
        setIsDeleting(null)
        router.refresh()
    }

    return (
        <Card className="mt-8 border-blue-100">
            <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Market-Specific Overrides</CardTitle>
                <CardDescription>
                    Provide custom descriptions for this builder when they appear in specific local markets. If no override exists for a market, the national description will be used automatically.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                {/* Add New Market Form */}
                <form onSubmit={handleAddMarket} className="space-y-4 bg-white p-4 rounded-lg border">
                    <h3 className="text-sm font-semibold">Add New Market Override</h3>

                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="market_city">City (Optional)</Label>
                            <Input
                                id="market_city"
                                placeholder="e.g. Austin"
                                value={city}
                                onChange={e => setCity(e.target.value)}
                            />
                            <p className="text-xs text-slate-500">Leave blank to feature the builder State-Wide.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="market_state">State Code</Label>
                            <Input
                                id="market_state"
                                placeholder="e.g. TX"
                                value={stateCode}
                                onChange={e => setStateCode(e.target.value.toUpperCase())}
                                maxLength={2}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 flex flex-col justify-end">
                            <label className="flex items-center gap-2 text-sm font-medium leading-none cursor-pointer p-2 border rounded-md hover:bg-slate-50">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                                    checked={isFeatured}
                                    onChange={e => setIsFeatured(e.target.checked)}
                                />
                                Feature this builder
                            </label>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sort_order">Sort Order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                placeholder="e.g. 1"
                                value={sortOrder}
                                onChange={e => setSortOrder(Number(e.target.value))}
                            />
                            <p className="text-xs text-slate-500">Lower numbers appear first.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="local_desc">Local Description (Optional)</Label>
                        <Textarea
                            id="local_desc"
                            placeholder="e.g. Taylor Morrison brings their award-winning designs to the greater Austin metro..."
                            className="h-24"
                            value={localDescription}
                            onChange={e => setLocalDescription(e.target.value)}
                        />
                        <p className="text-xs text-slate-500">Leave blank if you only want to register the market without overriding the text.</p>
                    </div>

                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Adding...' : 'Add Market Override'}
                    </Button>
                </form>

                {/* Existing Markets List */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Existing Overrides ({markets.length})</h3>

                    {markets.length === 0 ? (
                        <div className="text-sm text-slate-500 italic p-4 text-center border rounded-lg border-dashed">
                            No market overrides exist for this builder yet.
                        </div>
                    ) : (
                        <div className="rounded-lg border divide-y overflow-hidden">
                            {markets.map(market => (
                                <div key={market.id} className="p-4 flex gap-4 items-start bg-white hover:bg-slate-50 transition-colors">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{market.city || 'State-Wide'}, {market.state_code}</span>
                                            {market.is_featured && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                                    Featured
                                                </span>
                                            )}
                                            {market.sort_order !== null && market.sort_order !== 0 && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border">
                                                    Rank: {market.sort_order}
                                                </span>
                                            )}
                                        </div>
                                        {market.local_description ? (
                                            <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">
                                                {market.local_description}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-slate-400 italic mt-2">
                                                No description set. Using national default.
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                        onClick={() => handleDeleteMarket(market.id)}
                                        disabled={isDeleting === market.id}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
