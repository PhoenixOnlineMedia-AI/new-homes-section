import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Building2, MapPin, Star, Home, TrendingUp, Award, CheckCircle2, BedDouble, Bath, Maximize } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function BuilderProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createClient()

    // Fetch from the real database using the slug
    const { data, error } = await supabase
        .from('builders')
        .select('*')
        .eq('slug', slug)
        .single()
    const builder: any = data

    if (error || !builder) {
        notFound()
    }

    // Fetch communities to compute builder stats
    const { data: communitiesData } = await supabase
        .from('communities')
        .select('*')
        .eq('builder_id', builder.id)
    const communities: any[] = communitiesData || []
    
    // Fetch builder_markets to make sure local builder markets are accounted for
    const { data: builderMarketsData } = await supabase
        .from('builder_markets')
        .select('*')
        .eq('builder_id', builder.id)
    const builderMarkets: any[] = builderMarketsData || []

    const citiesFromCommunities = communities.map(c => c.city).filter(Boolean)
    const citiesFromBuilderMarkets = builderMarkets.map(m => m.city).filter(Boolean)
    const uniqueMarkets = new Set([...citiesFromCommunities, ...citiesFromBuilderMarkets]).size
    
    const totalHomes = communities.reduce((acc, curr) => acc + (curr.home_count || 0), 0)

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-32 h-32 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                        {builder.logo_url ? (
                            <img src={builder.logo_url} alt={`${builder.name} logo`} className="w-full h-full object-contain p-4" />
                        ) : (
                            <Building2 className="h-16 w-16 text-slate-400" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-slate-900">{builder.name}</h1>
                            {builder.is_verified && (
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Verified
                                </Badge>
                            )}
                            {builder.is_premium && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                                    <Award className="h-4 w-4 mr-1" />
                                    Premium
                                </Badge>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-emerald-700 mb-6">
                            <div className="flex items-center gap-1">
                                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                                <span className="font-semibold text-slate-900">{builder.rating || 'New'}</span>
                                <span className="text-slate-500">({builder.review_count || 0} reviews)</span>
                            </div>
                            <span className="text-slate-300">|</span>
                            <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {builder.headquarters || 'Various Locations'}
                            </span>
                            <span className="text-slate-300">|</span>
                            <span>Est. {builder.year_founded || 'Unknown'}</span>
                        </div>

                        <p className="text-slate-600 text-lg leading-relaxed max-w-4xl">
                            {builder.description || 'No description available for this builder.'}
                        </p>

                        <div className="flex gap-4 mt-6">
                            {(builder.website) && (
                                <a href={builder.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white shadow hover:bg-emerald-600/90 h-9 px-4 py-2">
                                    Visit Website
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Missing Mock Information usually rendered on pages */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">About {builder.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Home className="h-5 w-5 text-emerald-600" />
                        <span className="font-semibold text-slate-900">Total Communities</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">{communities.length}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-slate-900">Total Available Homes</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{totalHomes > 0 ? totalHomes : 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <MapPin className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold text-slate-900">Markets</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">{uniqueMarkets}</p>
                </div>
            </div>

            {communities.length > 0 && (
                <>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Communities by {builder.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {communities.map((community: any) => (
                            <Card key={community.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="relative h-48 bg-slate-200 flex items-center justify-center">
                                    {community.images?.[0] ? (
                                        <img src={community.images[0]} alt={community.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 className="h-12 w-12 text-slate-400" />
                                    )}
                                    <Badge className="absolute top-3 left-3 bg-emerald-600">
                                        {community.home_count || 0} Homes
                                    </Badge>
                                </div>

                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">{community.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {community.city}, {community.state_code}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    <p className="text-xl font-semibold text-slate-900">
                                        {community.min_price || community.max_price
                                            ? `$${(community.min_price || 0).toLocaleString()} ${community.max_price ? `- $${community.max_price.toLocaleString()}` : '+'}`
                                            : 'Pricing Unavailable'}
                                    </p>

                                    <div className="flex items-center gap-4 text-sm text-slate-600">
                                        <span className="flex items-center gap-1">
                                            <BedDouble className="h-4 w-4" /> {community.min_bedrooms ? `${community.min_bedrooms}-${community.max_bedrooms || community.min_bedrooms}` : 'N/A'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Bath className="h-4 w-4" /> {community.min_bathrooms ? `${community.min_bathrooms}-${community.max_bathrooms || community.min_bathrooms}` : 'N/A'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Maximize className="h-4 w-4" /> {community.min_sqft ? `${community.min_sqft.toLocaleString()}+ sqft` : 'N/A sqft'}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                        {(community.amenities || []).slice(0, 3).map((tag: string) => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>

                                    <Button className="w-full mt-2" variant="outline" asChild>
                                        <Link href={`/${(community.state || community.state_code || '').toLowerCase().replace(/\\s+/g, '-')}/${(community.city || '').toLowerCase().replace(/\\s+/g, '-')}/${builder.slug}/${community.slug}`}>
                                            View Community
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
