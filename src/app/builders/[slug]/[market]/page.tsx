import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Building2, CheckCircle2, ExternalLink, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JsonLd } from '@/components/seo/JsonLd'
import CityPage, { generateMetadata as generateCityMetadata } from '@/app/[state]/[city]/page'
import { APP_NAME, APP_URL, US_STATES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'

type BuilderMarketPageProps = {
  params: Promise<{ slug: string; market: string }>
}

type BuilderSummary = {
  name: string
  description: string | null
  slug: string
}

type BuilderRecord = BuilderSummary & {
  id: string
  website?: string | null
  communities?: unknown
  builder_markets?: unknown
}

type CommunityRecord = {
  city?: string | null
  state?: string | null
  state_code?: string | null
}

type BuilderMarketRecord = {
  local_description?: string | null
  image_url?: string | null
  city?: string | null
  state_code?: string | null
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function cityNameFromSlug(slug: string) {
  return toTitleCase(slug.replace(/-/g, ' '))
}

function safeArray<T>(arr: T[] | T | null | undefined): T[] {
  if (!arr) return []
  return Array.isArray(arr) ? arr : [arr]
}

export async function generateMetadata({ params }: BuilderMarketPageProps): Promise<Metadata> {
  const { slug, market } = await params
  const stateInfo = US_STATES.find((state) => state.slug === slug.toLowerCase())

  if (stateInfo) {
    return generateCityMetadata({
      params: Promise.resolve({ state: stateInfo.slug, city: market }),
    })
  }

  const builderState = US_STATES.find((state) => state.slug === market.toLowerCase())
  if (!builderState) return {}

  const supabase = await createClient()
  const { data } = await supabase
    .from('builders')
    .select('name,description,slug')
    .eq('slug', slug)
    .maybeSingle()
  const builder = data as BuilderSummary | null

  if (!builder) return {}

  const title = `${builder.name} in ${builderState.name} | New Construction Builders | ${APP_NAME}`
  const description = `Learn about ${builder.name}'s ${builderState.name} market presence, active cities, and official builder website links.`

  return {
    title,
    description,
    alternates: {
      canonical: `/builders/${builder.slug}/${builderState.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/builders/${builder.slug}/${builderState.slug}`,
    },
  }
}

export default async function BuilderMarketPage({ params }: BuilderMarketPageProps) {
  const { slug, market } = await params
  const stateInfo = US_STATES.find((state) => state.slug === slug.toLowerCase())

  if (stateInfo) {
    return (
      <CityPage
        params={Promise.resolve({ state: stateInfo.slug, city: market })}
      />
    )
  }

  const builderState = US_STATES.find((state) => state.slug === market.toLowerCase())
  if (!builderState) {
    notFound()
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('builders')
    .select('*, communities(*), builder_markets(*)')
    .eq('slug', slug)
    .single()
  const builder = data as BuilderRecord | null

  if (error || !builder) {
    notFound()
  }

  const stateCommunities = safeArray(builder.communities as CommunityRecord[] | CommunityRecord | null).filter((community) => (
    (community.state_code || '').toUpperCase() === builderState.code ||
    (community.state || '').toUpperCase() === builderState.code ||
    (community.state || '').toUpperCase() === builderState.name.toUpperCase()
  ))

  const stateMarkets = safeArray(builder.builder_markets as BuilderMarketRecord[] | BuilderMarketRecord | null).filter((marketRecord) => (
    (marketRecord.state_code || '').toUpperCase() === builderState.code
  ))
  const stateProfile = stateMarkets.find((marketRecord) => !(marketRecord.city || '').trim()) || null

  const cityNames = Array.from(new Set([
    ...stateCommunities.map((community) => community.city),
    ...stateMarkets.map((marketRecord) => marketRecord.city),
  ].filter((city): city is string => Boolean(city)))).sort()

  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: `${builder.name} in ${builderState.name}`,
        description: `${builder.name} builder profile for ${builderState.name}.`,
        url: `${APP_URL}/builders/${builder.slug}/${builderState.slug}`,
        sameAs: builder.website ? [builder.website] : undefined,
        areaServed: {
          '@type': 'State',
          name: builderState.name,
        },
      }} />

      <main className="min-h-screen bg-slate-50">
        <section className="bg-slate-900 py-12 text-white md:py-16">
          <div className="container mx-auto px-4">
            <nav className="mb-5 text-sm text-slate-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/builders" className="hover:text-white">Builders</Link>
              <span className="mx-2">/</span>
              <Link href={`/builders/${builder.slug}`} className="hover:text-white">{builder.name}</Link>
              <span className="mx-2">/</span>
              <span className="text-white">{builderState.name}</span>
            </nav>

            <div className="max-w-4xl">
              <Badge className="mb-4 bg-emerald-600 hover:bg-emerald-700">
                <MapPin className="h-3 w-3 mr-1" />
                {builderState.name} Builder Profile
              </Badge>
              <h1 className="text-3xl font-bold md:text-5xl">
                {builder.name} in {builderState.name}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                {stateProfile?.local_description || `${builder.name}'s ${builderState.name} presence includes builder market coverage${cityNames.length > 0 ? ` in ${cityNames.slice(0, 4).join(', ')}` : ''}. Community and home inventory will be added as launch data comes online.`}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {builder.website && (
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <a href={builder.website} target="_blank" rel="noopener noreferrer">
                      Visit {builder.name} online
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-slate-950">
                  <Link href={`/builders/${builder.slug}`}>Learn about {builder.name}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <article className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-950">About {builder.name} in {builderState.name}</h2>
                    <p className="text-sm text-slate-500">State-specific builder overview</p>
                  </div>
                </div>
                <p className="leading-7 text-slate-700">
                  {stateProfile?.local_description || builder.description || `${builder.name} is a homebuilder serving buyers in selected markets.`}
                </p>
                <p className="mt-4 leading-7 text-slate-700">
                  Buyers researching {builder.name} in {builderState.name} can use this
                  profile to confirm active markets, compare nearby city builder pages,
                  and continue to the builder&apos;s official site for current details.
                </p>
              </article>

              <aside className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-slate-950">{builderState.name} Markets</h2>
                {cityNames.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {cityNames.slice(0, 12).map((city) => (
                      <Link
                        key={city}
                        href={`/builders/${builderState.slug}/${city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`}
                        className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        {cityNameFromSlug(city.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Market details for {builderState.name} are being verified.
                  </p>
                )}
                <div className="mt-6 border-t border-slate-200 pt-5">
                  <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Verified builder profile
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
