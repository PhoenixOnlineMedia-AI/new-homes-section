import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JsonLd, generateBreadcrumbSchema } from '@/components/seo/JsonLd'
import { US_STATES, APP_NAME, APP_URL } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import {
    MapPin,
    Building2,
    Home,
    Phone,
    Mail,
    Globe,
    Star,
    CheckCircle2,
    BedDouble,
    Bath,
    Maximize,
    Calendar,
    Image as ImageIcon
} from 'lucide-react'

interface CommunityPageProps {
    params: Promise<{ state: string; city: string; builderSlug: string; communitySlug: string }>
}

export async function generateMetadata(props: CommunityPageProps): Promise<Metadata> {
    const { state, city, builderSlug, communitySlug } = await props.params

    const supabase = await createClient()
    const { data } = await supabase
        .from('communities')
        .select('*, builders!inner(*)')
        .eq('slug', communitySlug)
        .eq('builders.slug', builderSlug)
        .single()

    const community: any = data

    if (!community) return {}

    const builderData: any = community.builders
    const title = `${community.name} New Homes in ${community.city}, ${community.state_code} by ${builderData.name} | ${APP_NAME}`
    const description = community.meta_description || community.description || `View ${community.name} new construction homes and communities in ${community.city}, ${community.state}. Browse floor plans, pricing, and schedule a tour.`

    return {
        title,
        description,
        keywords: [
            `${community.name} ${community.city}`,
            `${community.name} new homes`,
            `new construction ${community.city}`,
            `${builderData.name} floor plans`,
        ],
        openGraph: {
            title,
            description,
            url: `${APP_URL}/${state}/${city}/${builderSlug}/${communitySlug}`,
        },
        alternates: {
            canonical: `/${state}/${city}/${builderSlug}/${communitySlug}`,
        },
    }
}

export default async function CommunityPage(props: CommunityPageProps) {
    const { state, city, builderSlug, communitySlug } = await props.params

    const supabase = await createClient()

    const { data: rawCommunity } = await supabase
        .from('communities')
        .select('*, builders!inner(*), homes(*)')
        .eq('slug', communitySlug)
        .eq('builders.slug', builderSlug)
        .single()

    if (!rawCommunity) {
        notFound()
    }

    const community: any = rawCommunity
    const builder: any = community.builders
    const homes: any[] = community.homes || []

    const stateInfo = US_STATES.find(s => s.code.toLowerCase() === state.toLowerCase() || s.slug === state.toLowerCase())
    const stateName = stateInfo ? stateInfo.name : community.state
    const stateSlug = stateInfo ? stateInfo.slug : state.toLowerCase()
    const citySlug = city.toLowerCase()
    const pageUrl = `${APP_URL}/${stateSlug}/${citySlug}/${builderSlug}/${communitySlug}`

    // Ensure prices exist for formatting
    const priceRange = (community.min_price && community.max_price)
        ? `$${(community.min_price / 1000).toFixed(0)}k - $${(community.max_price / 1000).toFixed(0)}k`
        : (community.min_price ? `Starts at $${(community.min_price / 1000).toFixed(0)}k` : 'Pricing TBD')

    // Calculate layout stats from homes 
    let bedsMin = community.min_bedrooms || Infinity
    let bedsMax = community.max_bedrooms || 0
    let bathsMin = community.min_bathrooms || Infinity
    let bathsMax = community.max_bathrooms || 0
    let sqftMin = community.min_sqft || Infinity
    let sqftMax = community.max_sqft || 0

    homes.forEach((h: any) => {
        if (h.bedrooms && h.bedrooms < bedsMin) bedsMin = h.bedrooms
        if (h.bedrooms && h.bedrooms > bedsMax) bedsMax = h.bedrooms
        if (h.bathrooms && h.bathrooms < bathsMin) bathsMin = h.bathrooms
        if (h.bathrooms && h.bathrooms > bathsMax) bathsMax = h.bathrooms
        if (h.sqft && h.sqft < sqftMin) sqftMin = h.sqft
        if (h.sqft && h.sqft > sqftMax) sqftMax = h.sqft
    })

    // Format the aggregate stats into readable labels
    const getRange = (min: number, max: number, suffix: string = '') => {
        if (min === Infinity && max === 0) return 'TBD'
        if (min === max || max === 0) return `${min}${suffix}`
        if (min === Infinity) return `${max}${suffix}`
        return `${min}-${max}${suffix}`
    }

    const bedsDisplay = getRange(bedsMin, bedsMax)
    const bathsDisplay = getRange(bathsMin, bathsMax)
    const sqftDisplay = getRange(sqftMin, sqftMax)

    // Generate structured data
    const breadcrumbData = generateBreadcrumbSchema([
        { name: 'Home', item: APP_URL },
        { name: stateName, item: `${APP_URL}/${stateSlug}` },
        { name: community.city, item: `${APP_URL}/${stateSlug}/${citySlug}` },
        { name: builder.name, item: `${APP_URL}/${stateSlug}/${citySlug}/${builderSlug}` },
        { name: community.name, item: pageUrl },
    ])

    return (
        <>
            <JsonLd data={breadcrumbData} />

            <div className="min-h-screen bg-slate-50">
                {/* Community Header */}
                <section className="bg-white border-b">
                    <div className="container mx-auto px-4 py-8">
                        <nav className="text-sm text-slate-500 mb-4">
                            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
                            <span className="mx-2">/</span>
                            <Link href={`/${stateSlug}`} className="hover:text-slate-900 transition-colors">
                                {stateName}
                            </Link>
                            <span className="mx-2">/</span>
                            <Link href={`/${stateSlug}/${citySlug}`} className="hover:text-slate-900 transition-colors">
                                {community.city}
                            </Link>
                            <span className="mx-2">/</span>
                            <Link href={`/${stateSlug}/${citySlug}/${builderSlug}`} className="hover:text-slate-900 transition-colors">
                                {builder.name}
                            </Link>
                            <span className="mx-2">/</span>
                            <span className="text-slate-900">{community.name}</span>
                        </nav>

                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                            {/* Image Block */}
                            <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                                {community.images && community.images.length > 0 ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={community.images[0]} alt={community.name} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="h-12 w-12 md:h-16 md:w-16 text-slate-400" />
                                )}
                                <Badge className={`absolute top-4 left-4 ${community.status === 'selling' ? 'bg-emerald-600' : 'bg-amber-500'
                                    }`}>
                                    {community.status === 'selling' ? 'Now Selling' : 'Coming Soon'}
                                </Badge>
                            </div>

                            {/* Community Info */}
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                                        {community.name}
                                    </h1>
                                </div>

                                <p className="flex items-center text-slate-600 mb-4 text-sm font-medium">
                                    <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                                    {community.address ? `${community.address}, ` : ''}{community.city}, {community.state_code} {community.zip_code}
                                </p>

                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-md mb-6">
                                    <Building2 className="h-4 w-4" />
                                    <span className="text-sm">Built by <strong>{builder.name}</strong></span>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-sm mb-6 border-y py-4">
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 mb-1">Price Range</span>
                                        <span className="font-semibold text-lg text-slate-900">{priceRange}</span>
                                    </div>
                                    <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 mb-1">Bedrooms</span>
                                        <span className="font-semibold flex items-center"><BedDouble className="h-4 w-4 mr-1" />{bedsDisplay}</span>
                                    </div>
                                    <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 mb-1">Bathrooms</span>
                                        <span className="font-semibold flex items-center"><Bath className="h-4 w-4 mr-1" />{bathsDisplay}</span>
                                    </div>
                                    <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 mb-1">Square Feet</span>
                                        <span className="font-semibold flex items-center"><Maximize className="h-4 w-4 mr-1" />{sqftDisplay}</span>
                                    </div>
                                </div>

                                <p className="text-slate-600 mb-4 max-w-2xl">
                                    {community.description || "Discover beautiful new homes and fantastic amenities. Check back soon for more descriptive details about this community."}
                                </p>

                            </div>

                            {/* Contact CTA */}
                            <div className="flex flex-col gap-2 md:text-right w-full md:w-48 flex-shrink-0">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 w-full mb-2">
                                    <Phone className="h-4 w-4 mr-2" /> Call Builder
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <Calendar className="h-4 w-4 mr-2" /> Request Info
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tabs Section */}
                <section className="py-8">
                    <div className="container mx-auto px-4">
                        <Tabs defaultValue="homes" className="w-full">
                            <TabsList className="w-full justify-start mb-8">
                                <TabsTrigger value="homes">Available Homes ({homes.length})</TabsTrigger>
                                <TabsTrigger value="amenities">Amenities & Info</TabsTrigger>
                                <TabsTrigger value="builder">About {builder.name}</TabsTrigger>
                            </TabsList>

                            {/* Homes Tab */}
                            <TabsContent value="homes" className="space-y-6">
                                {homes.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                                        <Home className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                        <h3 className="text-lg font-medium text-slate-900">No Homes Listed Yet</h3>
                                        <p className="text-slate-500">More property listings are coming soon for this community.</p>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {homes.map((home: any) => (
                                            <Card key={home.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                                <div className="relative h-48 bg-slate-200 flex items-center justify-center">
                                                    {home.images && home.images.length > 0 ? (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img src={home.images[0]} alt={home.name || 'Home'} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Home className="h-12 w-12 text-slate-400" />
                                                    )}
                                                </div>

                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-lg">{home.name || home.address || 'Available Home'}</CardTitle>
                                                    <CardDescription>
                                                        {home.base_price ? `Starting at $${(home.base_price / 1000).toFixed(0)}k` : 'Pricing TBD'}
                                                    </CardDescription>
                                                </CardHeader>

                                                <CardContent>
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                                            <BedDouble className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                                                            <p className="text-sm font-medium">{home.bedrooms || '-'} Beds</p>
                                                        </div>
                                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                                            <Bath className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                                                            <p className="text-sm font-medium">
                                                                {home.bathrooms || '-'}{home.half_bathrooms ? '.5' : ''} Baths
                                                            </p>
                                                        </div>
                                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                                            <Maximize className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                                                            <p className="text-sm font-medium">{home.sqft ? home.sqft.toLocaleString() : '-'} sqft</p>
                                                        </div>
                                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                                            <Home className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                                                            <p className="text-sm font-medium">{home.stories || '-'} Story</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button className="w-full" variant="outline">
                                                        View Details
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* Amenities Tab */}
                            <TabsContent value="amenities" className="space-y-8">
                                <div className="bg-white rounded-lg p-6 border border-slate-200">
                                    <h3 className="text-lg font-semibold mb-4 text-slate-900">Community Amenities</h3>
                                    {community.amenities && community.amenities.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {community.amenities.map((amenity: string, idx: number) => (
                                                <Badge key={idx} variant="secondary" className="px-3 py-1 bg-emerald-50 text-emerald-700">
                                                    {amenity}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-500">No amenities registered for this community.</p>
                                    )}
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {community.school_district && (
                                        <div className="bg-white rounded-lg p-6 border border-slate-200">
                                            <h3 className="text-lg font-semibold mb-4 text-slate-900">Schools</h3>
                                            <p className="text-sm text-slate-700 mb-2"><strong>District:</strong> {community.school_district}</p>
                                            {community.elementary_school && <p className="text-sm text-slate-700 mb-1">- Elementary: {community.elementary_school}</p>}
                                            {community.middle_school && <p className="text-sm text-slate-700 mb-1">- Middle: {community.middle_school}</p>}
                                            {community.high_school && <p className="text-sm text-slate-700 mb-1">- High: {community.high_school}</p>}
                                        </div>
                                    )}

                                    <div className="bg-white rounded-lg p-6 border border-slate-200">
                                        <h3 className="text-lg font-semibold mb-4 text-slate-900">Homeowner Fees</h3>
                                        <p className="text-sm text-slate-700 mb-2">
                                            <strong>HOA Fees:</strong> {community.hoa_fees ? `$${community.hoa_fees} / ${community.hoa_frequency || 'month'}` : 'Not Specified'}
                                        </p>
                                        <p className="text-sm text-slate-700 mb-2">
                                            <strong>Property Tax Rate:</strong> {community.property_tax_rate ? `${community.property_tax_rate}%` : 'Not Specified'}
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Builder Tab */}
                            <TabsContent value="builder" className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">About {builder.name}</h3>
                                        <p className="text-slate-600 mb-4">
                                            {builder.description || "A premier new home builder committed to quality."}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                                        <h3 className="text-lg font-semibold mb-4">Builder Info</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between border-b pb-2">
                                                <span className="text-sm text-slate-500">Founded</span>
                                                <span className="font-medium">{builder.year_founded || 'Unknown'}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b pb-2">
                                                <span className="text-sm text-slate-500">Headquarters</span>
                                                <span className="font-medium">{builder.headquarters || 'Unknown'}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b pb-2">
                                                <span className="text-sm text-slate-500">Verified</span>
                                                <span className="font-medium">{builder.is_verified ? 'Yes' : 'No'}</span>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="w-full mt-4" asChild>
                                            <Link href={`/builders/${builder.slug}`}>
                                                View Full Builder Profile <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </section>
            </div>
        </>
    )
}

function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
