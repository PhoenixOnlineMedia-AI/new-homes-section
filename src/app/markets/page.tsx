import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Building2, MapPin, Search, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { JsonLd } from '@/components/seo/JsonLd'
import { generateBreadcrumbSchema } from '@/components/seo/JsonLd'
import { APP_NAME, APP_URL, POPULAR_STATES, US_STATES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: `Browse Builders by Market | ${APP_NAME}`,
  description: 'Browse new construction builder markets by state and city. Compare verified builders and local market guides across the United States.',
  alternates: {
    canonical: '/markets',
  },
  openGraph: {
    title: `Browse Builders by Market | ${APP_NAME}`,
    description: 'Browse new construction builder markets by state and city.',
    url: `${APP_URL}/markets`,
  },
}

type StateSummary = {
  name: string
  code: string
  slug: string
  cityCount: number
  builderCount: number
  communityCount: number
  homeCount: number
  guideCount: number
  cities: { name: string; slug: string }[]
}

type CommunityMarket = {
  city: string | null
  state: string | null
  state_code: string | null
  builder_id: string | null
  home_count: number | null
  total_homes: number | null
}

type BuilderMarket = {
  city: string | null
  state_code: string | null
  builder_id: string | null
}

type MarketPage = {
  city: string | null
  state_code: string | null
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function normalizeCityName(raw: string | null | undefined) {
  return toTitleCase(String(raw || '').replace(/\s+/g, ' ').trim())
}

function stateForRecord(stateCode: string | null | undefined, stateName: string | null | undefined) {
  const code = String(stateCode || '').toUpperCase()
  const name = String(stateName || '').toUpperCase()

  return US_STATES.find((state) => (
    state.code.toUpperCase() === code ||
    state.code.toUpperCase() === name ||
    state.name.toUpperCase() === name
  ))
}

function formatCount(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
  }
  return value.toLocaleString()
}

export default async function MarketsPage() {
  const supabase = await createClient()

  const [{ data: communitiesData }, { data: builderMarketsData }, { data: marketPagesData }] = await Promise.all([
    supabase.from('communities').select('city,state,state_code,builder_id,home_count,total_homes'),
    supabase.from('builder_markets').select('city,state_code,builder_id'),
    supabase.from('market_pages').select('city,state_code'),
  ])

  const summaryMap = new Map<string, StateSummary & {
    cityNames: Map<string, string>
    builderIds: Set<string>
  }>()

  US_STATES.forEach((state) => {
    summaryMap.set(state.code, {
      ...state,
      cityCount: 0,
      builderCount: 0,
      communityCount: 0,
      homeCount: 0,
      guideCount: 0,
      cities: [],
      cityNames: new Map<string, string>(),
      builderIds: new Set<string>(),
    })
  })

  const addCity = (stateCode: string, rawCity: string | null | undefined) => {
    const summary = summaryMap.get(stateCode)
    const cityName = normalizeCityName(rawCity)
    const citySlug = toSlug(cityName)
    if (!summary || !citySlug) return
    summary.cityNames.set(citySlug, cityName)
  }

  ;((communitiesData || []) as CommunityMarket[]).forEach((community) => {
    const stateInfo = stateForRecord(community.state_code, community.state)
    if (!stateInfo) return
    const summary = summaryMap.get(stateInfo.code)
    if (!summary) return

    addCity(stateInfo.code, community.city)
    if (community.builder_id) summary.builderIds.add(community.builder_id)
    summary.communityCount += 1
    summary.homeCount += community.total_homes || community.home_count || 0
  })

  ;((builderMarketsData || []) as BuilderMarket[]).forEach((market) => {
    const stateInfo = stateForRecord(market.state_code, null)
    if (!stateInfo) return
    const summary = summaryMap.get(stateInfo.code)
    if (!summary) return

    addCity(stateInfo.code, market.city)
    if (market.builder_id) summary.builderIds.add(market.builder_id)
  })

  ;((marketPagesData || []) as MarketPage[]).forEach((marketPage) => {
    const stateInfo = stateForRecord(marketPage.state_code, null)
    if (!stateInfo) return
    const summary = summaryMap.get(stateInfo.code)
    if (!summary) return

    addCity(stateInfo.code, marketPage.city)
    summary.guideCount += 1
  })

  const states = Array.from(summaryMap.values()).map((summary) => {
    const cities = Array.from(summary.cityNames.entries())
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return {
      name: summary.name,
      code: summary.code,
      slug: summary.slug,
      cityCount: cities.length,
      builderCount: summary.builderIds.size,
      communityCount: summary.communityCount,
      homeCount: summary.homeCount,
      guideCount: summary.guideCount,
      cities,
    }
  })

  const activeStates = states
    .filter((state) => state.cityCount > 0 || state.builderCount > 0 || state.communityCount > 0 || state.guideCount > 0)
    .sort((a, b) => {
      if (b.cityCount !== a.cityCount) return b.cityCount - a.cityCount
      if (b.builderCount !== a.builderCount) return b.builderCount - a.builderCount
      return a.name.localeCompare(b.name)
    })

  const featuredStates = [
    ...POPULAR_STATES
      .map((popularState) => activeStates.find((state) => state.code === popularState.code))
      .filter(Boolean),
    ...activeStates,
  ]
    .filter((state, index, list): state is StateSummary => Boolean(state) && list.findIndex((item) => item?.code === state?.code) === index)
    .slice(0, 6)

  const guideCities = states
    .filter((state) => state.guideCount > 0)
    .flatMap((state) => state.cities.slice(0, 4).map((city) => ({ ...city, state })))
    .slice(0, 8)

  const totals = {
    states: activeStates.length,
    cities: activeStates.reduce((sum, state) => sum + state.cityCount, 0),
    builders: new Set(activeStates.flatMap((state) => Array.from({ length: state.builderCount }, (_, index) => `${state.code}-${index}`))).size,
    communities: activeStates.reduce((sum, state) => sum + state.communityCount, 0),
  }

  const breadcrumbData = generateBreadcrumbSchema([
    { name: 'Home', item: APP_URL },
    { name: 'Markets', item: `${APP_URL}/markets` },
  ])

  return (
    <>
      <JsonLd data={breadcrumbData} />

      <main className="min-h-screen bg-slate-50">
        <section
          className="relative overflow-hidden bg-slate-950 text-white"
          style={{
            backgroundImage: 'linear-gradient(90deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.78), rgba(15, 23, 42, 0.58)), url(/images/hero-mansion.jpg)',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div className="container mx-auto px-4 py-16 md:py-20">
            <nav className="mb-6 text-sm text-slate-300">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-white">Markets</span>
            </nav>

            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-300">Builder markets</p>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Browse builders by market
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
                Start with a state, then drill into city market pages with local builders and market guides as they become available.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" variant="cta" asChild>
                  <Link href="#all-markets">
                    View all states
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-slate-950" asChild>
                  <Link href="/builders">Browse builders</Link>
                </Button>
              </div>
            </div>

            <div className="mt-12 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/15 bg-white/15 md:grid-cols-4">
              {[
                { label: 'Active states', value: totals.states || US_STATES.length },
                { label: 'City markets', value: totals.cities },
                { label: 'Builders indexed', value: activeStates.reduce((sum, state) => sum + state.builderCount, 0) },
                { label: 'Market guides', value: activeStates.reduce((sum, state) => sum + state.guideCount, 0) },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-950/55 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-bold text-white">{formatCount(stat.value)}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {featuredStates.length > 0 && (
          <section className="border-b border-slate-200 bg-white py-12">
            <div className="container mx-auto px-4">
              <div className="mb-7 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                  <p className="mb-2 text-sm font-semibold text-emerald-700">Active directories</p>
                  <h2 className="text-2xl font-bold text-slate-950 md:text-3xl">Markets with live builder data</h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-slate-600">
                  These states already have city or builder-market records. New market-info uploads will automatically deepen the city pages linked here.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {featuredStates.map((state) => (
                  <Link
                    key={state.code}
                    href={`/builders/${state.slug}`}
                    className="group rounded-lg border border-slate-200 bg-white p-5 transition-all hover:border-emerald-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xl font-bold text-slate-950 group-hover:text-emerald-700">{state.name}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {state.cityCount > 0 ? `${state.cityCount} city markets` : 'State directory'}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-slate-50">{state.code}</Badge>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3 border-y border-slate-100 py-4 text-sm">
                      <div>
                        <p className="font-semibold text-slate-950">{state.builderCount}</p>
                        <p className="text-xs text-slate-500">Builders</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950">{state.cityCount}</p>
                        <p className="text-xs text-slate-500">Cities</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950">{state.guideCount}</p>
                        <p className="text-xs text-slate-500">Guides</p>
                      </div>
                    </div>

                    {state.cities.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {state.cities.slice(0, 4).map((city) => (
                          <span key={city.slug} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {city.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="all-markets" className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8 max-w-2xl">
              <p className="mb-2 text-sm font-semibold text-emerald-700">State directory</p>
              <h2 className="text-2xl font-bold text-slate-950 md:text-3xl">All new home markets</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                State builder pages live at <span className="font-medium text-slate-900">/builders/state</span>, and city markets live at <span className="font-medium text-slate-900">/builders/state/city</span>.
              </p>
            </div>

            <div className="grid gap-x-8 gap-y-2 md:grid-cols-2 xl:grid-cols-3">
              {states.map((state) => (
                <Link
                  key={state.code}
                  href={`/builders/${state.slug}`}
                  className="group flex items-center justify-between gap-4 border-t border-slate-200 py-4 transition-colors hover:border-emerald-300"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-950 group-hover:text-emerald-700">{state.name}</span>
                      <span className="text-xs font-medium text-slate-400">{state.code}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {state.cityCount > 0
                        ? `${state.cityCount} cities · ${state.builderCount} builders`
                        : 'Directory ready for market data'}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-700" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {guideCities.length > 0 && (
          <section className="border-y border-slate-200 bg-white py-12">
            <div className="container mx-auto px-4">
              <div className="mb-7 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-sm font-semibold text-emerald-700">Market guides</p>
                  <h2 className="text-2xl font-bold text-slate-950">Recently enriched city pages</h2>
                </div>
                <Sparkles className="hidden h-8 w-8 text-emerald-600 md:block" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {guideCities.map(({ state, ...city }) => (
                  <Link
                    key={`${state.code}-${city.slug}`}
                    href={`/builders/${state.slug}/${city.slug}`}
                    className="group rounded-lg border border-slate-200 p-4 transition-all hover:border-emerald-300 hover:bg-emerald-50/40"
                  >
                    <MapPin className="mb-3 h-5 w-5 text-emerald-600" />
                    <p className="font-semibold text-slate-950 group-hover:text-emerald-700">{city.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{state.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 rounded-lg bg-slate-900 p-6 text-white md:grid-cols-[1fr_auto] md:items-center md:p-8">
              <div>
                <h2 className="text-2xl font-bold">Need to narrow the list?</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Search by city, builder name, or state while community and home inventory is prepared for launch.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="cta" asChild>
                  <Link href="/builders">
                    <Search className="h-4 w-4" />
                    Browse builders
                  </Link>
                </Button>
                <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-slate-950" asChild>
                  <Link href="/builders">
                    <Building2 className="h-4 w-4" />
                    Find builders
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
