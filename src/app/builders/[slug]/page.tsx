import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Building2, MapPin, Star, Award, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { JsonLd } from '@/components/seo/JsonLd'
import { APP_NAME, APP_URL, US_STATES } from '@/lib/constants'
import StateBuildersPage, { generateMetadata as generateStateBuildersMetadata } from '@/app/markets/[state]/builders/page'

type BuilderProfileProps = {
    params: Promise<{ slug: string }>
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

type BuilderSummary = {
    name: string
    description: string | null
    slug: string
}

type BuilderRecord = BuilderSummary & {
    id: string
    logo_url?: string | null
    website?: string | null
    rating?: number | null
    review_count?: number | null
    headquarters?: string | null
    year_founded?: number | null
    is_verified?: boolean | null
    is_premium?: boolean | null
}

function stateNameFromCode(code: string) {
    return US_STATES.find((state) => state.code.toUpperCase() === code.toUpperCase())?.name || code
}

export async function generateMetadata(props: BuilderProfileProps): Promise<Metadata> {
    const { slug } = await props.params
    const stateInfo = US_STATES.find((state) => state.slug === slug.toLowerCase())

    if (stateInfo) {
        return generateStateBuildersMetadata({
            params: Promise.resolve({ state: stateInfo.slug }),
            searchParams: Promise.resolve({}),
        })
    }

    const supabase = await createClient()
    const { data } = await supabase
        .from('builders')
        .select('name,description,slug')
        .eq('slug', slug)
        .maybeSingle()
    const builder = data as BuilderSummary | null

    if (!builder) return {}

    const title = `${builder.name} Homebuilder Profile | ${APP_NAME}`
    const description = builder.description || `Learn about ${builder.name}, the states they serve, and where to find their local builder markets.`

    return {
        title,
        description,
        alternates: {
            canonical: `/builders/${builder.slug}`,
        },
        openGraph: {
            title,
            description,
            url: `${APP_URL}/builders/${builder.slug}`,
        },
    }
}

export default async function BuilderProfilePage({ params, searchParams }: BuilderProfileProps) {
    const { slug } = await params
    const stateInfo = US_STATES.find((state) => state.slug === slug.toLowerCase())

    if (stateInfo) {
        return (
            <StateBuildersPage
                params={Promise.resolve({ state: stateInfo.slug })}
                searchParams={searchParams || Promise.resolve({})}
            />
        )
    }

    const supabase = await createClient()

    // Fetch from the real database using the slug
    const { data, error } = await supabase
        .from('builders')
        .select('*')
        .eq('slug', slug)
        .single()
    const builder = data as BuilderRecord | null

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

    const activeStateCodes = Array.from(new Set([
        ...communities.map((community) => (community.state_code || community.state || '').toUpperCase()),
        ...builderMarkets.map((market) => (market.state_code || '').toUpperCase()),
    ])).filter(Boolean).sort()

    return (
        <>
        <JsonLd data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: builder.name,
            description: builder.description,
            url: builder.website || `${APP_URL}/builders/${builder.slug}`,
            sameAs: builder.website ? [builder.website] : undefined,
            aggregateRating: builder.rating ? {
                '@type': 'AggregateRating',
                ratingValue: builder.rating,
                reviewCount: builder.review_count || 0,
            } : undefined,
        }} />

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

            <h2 className="text-2xl font-bold text-slate-900 mb-6">About {builder.name}</h2>
            <div className="mb-12 rounded-xl border border-slate-200 bg-slate-50 p-6">
                <p className="max-w-4xl text-slate-700 leading-7">
                    {builder.name} is listed in the New Homes Section builder directory with
                    market coverage and profile information for buyers researching new
                    construction builders. Community and home inventory is coming soon.
                </p>
            </div>

            {activeStateCodes.length > 0 && (
                <section className="mb-12">
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Builder Markets</h2>
                            <p className="mt-1 text-slate-600">
                                Explore state-specific profiles and local builder directories.
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {activeStateCodes.slice(0, 10).map((stateCode) => {
                            const state = US_STATES.find((item) => item.code === stateCode)
                            if (!state) return null

                            return (
                                <Link
                                    key={state.code}
                                    href={`/builders/${builder.slug}/${state.slug}`}
                                    className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-md"
                                >
                                    <p className="font-semibold text-slate-950">{builder.name} in {state.name}</p>
                                    <p className="mt-1 text-sm text-slate-600">Learn about {builder.name}&apos;s {state.name} market presence.</p>
                                </Link>
                            )
                        })}
                    </div>
                    {activeStateCodes.length > 10 && (
                        <details className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                            <summary className="cursor-pointer font-semibold text-slate-900">View all markets</summary>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {activeStateCodes.slice(10).map((stateCode) => {
                                    const state = US_STATES.find((item) => item.code === stateCode)
                                    if (!state) return null
                                    return (
                                        <Link key={state.code} href={`/builders/${builder.slug}/${state.slug}`} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">
                                            {stateNameFromCode(stateCode)}
                                        </Link>
                                    )
                                })}
                            </div>
                        </details>
                    )}
                </section>
            )}
        </div>
        </>
    )
}
