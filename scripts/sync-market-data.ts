import * as dotenv from 'dotenv'
import OpenAI from 'openai'
import path from 'path'
import fs from 'fs'
import axios from 'axios'
import * as cheerio from 'cheerio'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const SERPER_API_KEY = process.env.SERPER_API_KEY
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY

if (!NEXT_PUBLIC_SUPABASE_URL || !API_BEARER_TOKEN || !OPENAI_API_KEY) {
    console.error('Missing required environment variables. Check .env.local')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, API_BEARER_TOKEN, OPENAI_API_KEY')
    process.exit(1)
}

const API_URL = process.env.API_URL || 'http://localhost:3000/api/v1/data'
const REQUEST_TIMEOUT_MS = Number(process.env.SYNC_REQUEST_TIMEOUT_MS || 8000)
const SEARCH_PAGES = Math.max(1, Number(process.env.SYNC_SEARCH_PAGES || 3))
const MAX_BUILDERS_PER_STATE = Math.max(1, Number(process.env.SYNC_MAX_BUILDERS_PER_STATE || 30))
const MAX_STATES = Math.max(1, Number(process.env.SYNC_STATE_LIMIT || 5))
const MAX_CANDIDATE_PAGES_PER_BUILDER = Math.max(25, Number(process.env.SYNC_MAX_PAGES_PER_BUILDER || 1200))
const MAX_CITIES_PER_BUILDER_PER_STATE = Math.max(2, Number(process.env.SYNC_MAX_CITIES_PER_BUILDER || 40))
const MAX_HTML_PAGES_PER_BUILDER = Math.max(5, Number(process.env.SYNC_MAX_HTML_PAGES_PER_BUILDER || 30))
const START_STATE = (process.env.SYNC_START_STATE || 'TX').toUpperCase()
const CSV_DEFAULT_STATE = (process.env.SYNC_CSV_DEFAULT_STATE || START_STATE).toUpperCase()
const BUILDERS_CSV_PATH = process.env.SYNC_BUILDERS_CSV_PATH?.trim()
const BUILDERS_CSV_INLINE = process.env.SYNC_BUILDERS_CSV?.trim()
const ALLOW_SEARCH_DISCOVERY = process.env.SYNC_ALLOW_SEARCH_DISCOVERY === 'true'
const ENABLE_TEXT_CITY_EXTRACTION = process.env.SYNC_ENABLE_TEXT_CITY_EXTRACTION === 'true'
const ENABLE_AI_CITY_FILTER = process.env.SYNC_ENABLE_AI_CITY_FILTER !== 'false'
const REFRESH_BUILDER_DESCRIPTIONS = process.env.SYNC_REFRESH_BUILDER_DESCRIPTIONS !== 'false'
const ENABLE_DEEP_LINK_CRAWL = process.env.SYNC_ENABLE_DEEP_LINK_CRAWL !== 'false'
const MAX_CRAWL_PAGES_PER_BUILDER = Math.max(5, Number(process.env.SYNC_MAX_CRAWL_PAGES_PER_BUILDER || 20))

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

const HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_BEARER_TOKEN}`
}

const HTTP_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; BuilderMarketSync/1.0; +https://localhost)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

const US_STATES: Record<string, string> = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
    CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',
    IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
    ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
    MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
    NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
    OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
    TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
    WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'
}

const BLOCKED_HOST_SUBSTRINGS = [
    'newhomesource.', 'newhomesdirectory.', 'newhomeguide.', 'zillow.', 'realtor.', 'redfin.', 'trulia.',
    'homes.com', 'har.com', 'facebook.com', 'instagram.com', 'linkedin.com', 'x.com', 'twitter.com',
    'youtube.com', 'wikipedia.org', 'yelp.com', 'angi.com', 'thumbtack.com', 'mapquest.com',
    'yellowpages.com', 'bbb.org', 'houzz.com', 'newhomessection.com', 'inven.ai', 'realestate.com',
    'real-estate', 'listingservice', 'homeshow', 'mls'
]

const MARKET_LINK_HINTS = [
    'where-we-build', 'where we build', 'locations', 'location', 'areas', 'markets', 'communities',
    'new-homes', 'new homes', 'find-your-home', 'homes-in', 'cities', 'city', 'state', 'build-on-your-lot'
]

const URL_STATE_PATH_BLOCKLIST = new Set([
    'community', 'communities', 'home', 'homes', 'new-homes', 'new-home', 'quick-move-in', 'quick-move-ins',
    'floor-plans', 'floorplan', 'plans', 'plan', 'inventory', 'available-homes', 'available',
    'locations', 'location', 'markets', 'areas', 'city', 'state', 'county', 'about', 'contact',
    'blog', 'news', 'resources', 'financing', 'mortgage', 'privacy-policy', 'terms', 'sitemap',
    'careers', 'warranty', 'move-in-ready'
])

const URL_FILE_EXT_BLOCKLIST = ['.xml', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.pdf', '.css', '.js', '.json']

const CITY_STOPWORDS = new Set([
    'homes', 'home', 'communities', 'community', 'location', 'locations', 'market', 'markets',
    'state', 'states', 'learn', 'view', 'details', 'quick', 'move', 'inventory', 'available', 'featured',
    'model', 'plan', 'plans', 'our', 'about', 'find', 'search', 'build', 'builder', 'builders', 'texas', 'at'
])

const NON_CITY_WORDS = new Set([
    'org', 'com', 'net', 'www', 'homebuyer', 'education', 'assistance', 'privacy', 'policy', 'terms',
    'contact', 'sitemap', 'cookie', 'cookies', 'estate', 'real', 'agent', 'broker', 'brokers', 'listing',
    'listings', 'mortgage', 'loan', 'loans', 'floorplan', 'floorplans', 'community', 'communities',
    'builder', 'builders', 'texas', 'newhomes', 'newhome', 'area', 'greater', 'metro',
    'event', 'sereno', 'tapestry', 'destination', 'valle', 'norte', 'county'
])

const NON_BUILDER_TITLE_PHRASES = [
    'top ', 'best ', 'companies', 'who to avoid', 'how to choose', 'review', 'directory',
    'comparison', 'vs ', 'ranked', 'list of', 'real estate', 'homes for sale', 'realtor', 'brokerage'
]

const BUILDER_SIGNAL_PHRASES = [
    'new homes', 'floor plans', 'quick move-in', 'quick move in', 'where we build', 'find your home',
    'our communities', 'move-in ready', 'build on your lot', 'model homes'
]

const NON_BUILDER_BODY_PHRASES = [
    'real estate agent', 'homes for sale', 'mls listings', 'for rent', 'brokerage', 'list your home',
    'property search', 'realtor', 'open house'
]

const CITY_DENYLIST_BY_STATE: Record<string, Set<string>> = {
    AZ: new Set([
        'event',
        'sereno canyon',
        'sterling grove',
        'tapestry at destination',
        'valle norte',
    ]),
    NV: new Set([
        'bella strada',
        'cinnamon ridge',
        'cordillera',
        'crestwood ranch',
        'elkhorn grove',
        'glenrock',
        'harris ranch',
        'incanta lago',
        'liberty ridge',
        'mira villa',
        'quilici',
        'raven crest',
        'reflection ridge',
        'rivercrest',
        'the loughton',
        'venado valley',
    ]),
    OR: new Set([
        'central oregon',
        'northeastern oregon',
        'southern oregon',
        'southern willamette valley',
        'willamette valley',
    ]),
    WA: new Set([
        'blogs',
        'canopy cottages',
        'camas meadows crossing',
        'color schemes',
        'cross kirkland towns',
        'finance',
        'homeowners',
        'house and homesite',
        'lacamas hills',
        'luxury inclusions',
        'mainvue buzz',
        'mainvue difference',
        'modern facades',
        'multi generation designs',
        'my mainvue',
        'open house series',
        'site map',
        'townhome color schemes',
        'townhome collection',
        'tri cities',
        'virtual tours',
        'woodinville square',
    ]),
}

type ScrapedMarketRecord = {
    builder_name: string
    builder_slug: string
    city: string
    state_code: string
    builder_site_url?: string
}

type SearchResult = {
    title: string
    url: string
    snippet: string
}

type BuilderCandidate = {
    builder_name: string
    site_url: string
}

type BuilderLookup = {
    bySlug: Map<string, { id: string; name: string; slug: string; description: string | null; website: string | null }>
    byNormalizedName: Map<string, { id: string; name: string; slug: string; description: string | null; website: string | null }>
}

type ScrapeResult = {
    rows: ScrapedMarketRecord[]
    builders: BuilderCandidate[]
}

const SEEDED_BUILDERS_BY_STATE: Record<string, BuilderCandidate[]> = {
    TX: [
        { builder_name: 'LGI Homes', site_url: 'https://www.lgihomes.com' },
        { builder_name: 'Terrata Homes', site_url: 'https://www.terratahomes.com' },
        { builder_name: 'Perry Homes', site_url: 'https://www.perryhomes.com' },
        { builder_name: 'Sandlin Homes', site_url: 'https://www.sandlinhomes.com' },
        { builder_name: 'John Houston Homes', site_url: 'https://www.jhoustonhomes.com' },
        { builder_name: 'Our Country Homes', site_url: 'https://www.ourcountryhomes.com' },
        { builder_name: 'Cantegra Developments', site_url: 'https://www.cantegra.com' },
        { builder_name: 'Symcox Development Company', site_url: 'https://www.symcoxdevelopment.com' },
        { builder_name: 'Seven Custom Homes', site_url: 'https://sevencustomhomes.com' },
        { builder_name: 'Tilson Homes', site_url: 'https://www.tilsonhomes.com' },
        { builder_name: 'Meritage Homes', site_url: 'https://www.meritagehomes.com' },
        { builder_name: 'Chesmar Homes', site_url: 'https://www.chesmar.com' },
        { builder_name: 'Century Communities', site_url: 'https://www.centurycommunities.com' },
        { builder_name: 'M/I Homes', site_url: 'https://www.mihomes.com' },
        { builder_name: 'Brohn Homes', site_url: 'https://www.brohnhomes.com' },
        { builder_name: 'Ashton Woods Homes', site_url: 'https://www.ashtonwoods.com' },
        { builder_name: 'Ash Creek Homes', site_url: 'https://www.ashcreekhomes.com' },
        { builder_name: 'Brookfield Residential', site_url: 'https://www.brookfieldresidential.com' },
        { builder_name: 'Castlerock Communities', site_url: 'https://www.c-rock.com' },
        { builder_name: 'Lennar Homes', site_url: 'https://www.lennar.com' },
        { builder_name: 'David Weekley Homes', site_url: 'https://www.davidweekleyhomes.com' },
        { builder_name: 'Empire Communities', site_url: 'https://www.empirecommunities.com' },
        { builder_name: 'First America Homes', site_url: 'https://www.firstamericahomes.com' },
        { builder_name: 'Highland Homes', site_url: 'https://www.highlandhomes.com' },
        { builder_name: 'Toll Brothers', site_url: 'https://www.tollbrothers.com' },
        { builder_name: 'Grand Endeavor Homes', site_url: 'https://www.grandendeavorhomes.com' },
        { builder_name: 'Scott Felder Homes', site_url: 'https://www.scottfelderhomes.com' },
        { builder_name: 'MileStone Community Builders', site_url: 'https://www.mymilestone.com' },
        { builder_name: 'Newmark Homes', site_url: 'https://www.newmarkhomes.com' },
        { builder_name: 'Centex Homes', site_url: 'https://www.centex.com' },
        { builder_name: 'New Home Co.', site_url: 'https://www.newhomeco.com' },
        { builder_name: 'Bellaire Homes', site_url: 'https://www.bellairehomes.com' },
        { builder_name: 'Gracepoint Homes', site_url: 'https://www.gracepointhomes.com' },
        { builder_name: 'Sterling Classic Homes', site_url: 'https://www.sterlingclassic.com' },
        { builder_name: 'Olerio Homes', site_url: 'https://www.oleriohomes.com' },
    ],
    AZ: [
        { builder_name: 'Fulton Homes', site_url: 'https://www.fultonhomes.com' },
        { builder_name: 'Meritage Homes', site_url: 'https://www.meritagehomes.com' },
        { builder_name: 'D.R. Horton', site_url: 'https://www.drhorton.com' },
        { builder_name: 'Lennar Homes', site_url: 'https://www.lennar.com' },
        { builder_name: 'Taylor Morrison', site_url: 'https://www.taylormorrison.com' },
        { builder_name: 'Pulte Homes', site_url: 'https://www.pulte.com' },
        { builder_name: 'Richmond American Homes', site_url: 'https://www.richmondamerican.com' },
        { builder_name: 'Shea Homes', site_url: 'https://www.sheahomes.com' },
        { builder_name: 'KB Home', site_url: 'https://www.kbhome.com' },
        { builder_name: 'Centex Homes', site_url: 'https://www.centex.com' },
        { builder_name: 'Del Webb', site_url: 'https://www.delwebb.com' },
        { builder_name: 'Cachet Homes', site_url: 'https://www.cachethomes.net' },
        { builder_name: 'Regency Custom Homes', site_url: 'https://www.regencyhomes-az.com' },
        { builder_name: 'Socon Builders', site_url: 'https://www.soconbuilders.com' },
        { builder_name: 'Arlington Custom Builders', site_url: 'https://www.arlingtonaz.com' },
        { builder_name: 'DLB Custom Homes', site_url: 'https://www.dlbcustomhomes.com' },
        { builder_name: 'Argue Custom Homes', site_url: 'https://www.arguecustomhomes.com' },
        { builder_name: 'Desert Sky Development', site_url: 'https://www.desertskydevelopment.com' },
        { builder_name: 'Cullum Homes', site_url: 'https://www.cullumhomes.com' },
        { builder_name: 'Forte Homes', site_url: 'https://www.fortehomes.com' },
        { builder_name: 'Adair Homes', site_url: 'https://www.adairhomes.com' },
        { builder_name: 'Rafterhouse', site_url: 'https://rafterhouse.com' },
        { builder_name: 'Wilson Builders LLC', site_url: 'https://www.wilsonbuildersllc.com' },
        { builder_name: 'Camelot Homes', site_url: 'https://www.camelothomes.com' },
        { builder_name: 'Beazer Homes', site_url: 'https://www.beazer.com' },
        { builder_name: 'New Home Co.', site_url: 'https://www.newhomeco.com' },
        { builder_name: 'Toll Brothers', site_url: 'https://www.tollbrothers.com' },
        { builder_name: 'Ashton Woods Homes', site_url: 'https://www.ashtonwoods.com' },
        { builder_name: 'Pepper Viner Homes', site_url: 'https://www.pepperviner.com' },
        { builder_name: 'Phoenix Home Builder', site_url: 'https://phxhomebuilder.com' },
    ],
}

function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}

function parseCsvLine(line: string) {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (let idx = 0; idx < line.length; idx++) {
        const char = line[idx]
        if (char === '"') {
            if (inQuotes && line[idx + 1] === '"') {
                current += '"'
                idx += 1
            } else {
                inQuotes = !inQuotes
            }
            continue
        }
        if (char === ',' && !inQuotes) {
            values.push(current.trim())
            current = ''
            continue
        }
        current += char
    }
    values.push(current.trim())
    return values
}

function normalizeBuilderNameKey(name: string) {
    const cleaned = name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    if (!cleaned) return ''

    const removableTailTokens = new Set([
        'homes', 'home', 'builders', 'builder', 'communities', 'community',
        'inc', 'llc', 'ltd', 'co', 'company', 'corp', 'corporation'
    ])

    const rawTokens = cleaned.split(' ').filter(Boolean)
    const tokens: string[] = []
    for (let idx = 0; idx < rawTokens.length; idx++) {
        const current = rawTokens[idx]
        const next = rawTokens[idx + 1]
        if (current.length === 1 && next && next.length === 1) {
            tokens.push(`${current}${next}`)
            idx += 1
            continue
        }
        tokens.push(current)
    }

    while (tokens.length > 1 && removableTailTokens.has(tokens[tokens.length - 1])) {
        tokens.pop()
    }
    return tokens.join(' ')
}

function buildSlugCandidates(builderName: string, incomingSlug: string) {
    const candidates = new Set<string>()
    if (incomingSlug) candidates.add(incomingSlug)
    candidates.add(slugify(builderName))
    const normalizedKey = normalizeBuilderNameKey(builderName)
    if (normalizedKey) candidates.add(slugify(normalizedKey))
    return Array.from(candidates).filter(Boolean)
}

function isDeniedCityForState(city: string, stateCode: string) {
    const denylist = CITY_DENYLIST_BY_STATE[stateCode]
    if (!denylist) return false
    return denylist.has(city.toLowerCase())
}

function wordCount(text: string) {
    return cleanText(text).split(' ').filter(Boolean).length
}

function trimToWordLimit(text: string, maxWords: number) {
    const words = cleanText(text).split(' ').filter(Boolean)
    if (words.length <= maxWords) return cleanText(text)
    return words.slice(0, maxWords).join(' ').replace(/[;,:\-]+$/, '') + '.'
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function getStateSequence() {
    const rest = Object.keys(US_STATES).filter((state) => state !== START_STATE)
    return [START_STATE, ...rest]
}

function cleanText(text: string) {
    return text.replace(/\s+/g, ' ').trim()
}

function safeHostname(inputUrl: string) {
    try {
        return new URL(inputUrl).hostname.toLowerCase()
    } catch {
        return ''
    }
}

function isBlockedDomain(inputUrl: string) {
    const host = safeHostname(inputUrl)
    if (!host) return true
    return BLOCKED_HOST_SUBSTRINGS.some((blocked) => {
        const normalized = blocked.toLowerCase().trim()
        if (!normalized) return false

        // Entries ending with "." block a domain family (example: newhomesource.)
        if (normalized.endsWith('.')) {
            const base = normalized.slice(0, -1)
            return host === base || host.endsWith(`.${base}`)
        }

        // Full domains block only exact host (and optional www form)
        if (normalized.includes('.')) {
            return host === normalized || host === `www.${normalized}`
        }

        // Plain keywords block by substring
        return host.includes(normalized)
    })
}

function normalizeCandidateSite(inputUrl: string) {
    try {
        const parsed = new URL(inputUrl)
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
        if (isBlockedDomain(parsed.toString())) return null
        return `${parsed.protocol}//${parsed.hostname}`
    } catch {
        return null
    }
}

function normalizeStateCode(rawState: string | undefined | null) {
    const cleaned = String(rawState || '').toUpperCase().replace(/[^A-Z]/g, '')
    if (cleaned.length === 2 && US_STATES[cleaned]) return cleaned
    return null
}

function addBuilderSeed(
    seedsByState: Record<string, BuilderCandidate[]>,
    stateCode: string,
    builderName: string,
    siteUrl: string
) {
    const normalizedState = normalizeStateCode(stateCode)
    if (!normalizedState) return

    const normalizedSite = normalizeCandidateSite(siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`)
    if (!normalizedSite) return

    const resolvedName = cleanText(builderName) || titleFromDomain(normalizedSite)
    const nextBuilder: BuilderCandidate = {
        builder_name: resolvedName,
        site_url: normalizedSite,
    }

    if (!seedsByState[normalizedState]) {
        seedsByState[normalizedState] = []
    }

    const bySite = new Map<string, BuilderCandidate>()
    for (const existing of seedsByState[normalizedState]) {
        bySite.set(normalizeCandidateSite(existing.site_url) || existing.site_url, existing)
    }
    bySite.set(normalizedSite, nextBuilder)
    seedsByState[normalizedState] = Array.from(bySite.values())
}

function parseBuilderSeedsCsv(rawCsv: string, fallbackStateCode: string) {
    const output: Record<string, BuilderCandidate[]> = {}
    const lines = rawCsv
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

    if (lines.length === 0) return output

    const header = parseCsvLine(lines[0]).map((column) => column.trim().toLowerCase())
    const idxState = header.findIndex((column) => column === 'state_code' || column === 'state')
    const idxName = header.findIndex((column) => column === 'name' || column === 'builder_name')
    const idxDomain = header.findIndex((column) => column === 'domain' || column === 'site' || column === 'website' || column === 'url')
    if (idxName < 0 || idxDomain < 0) return output

    const defaultState = normalizeStateCode(fallbackStateCode) || START_STATE
    for (let lineIdx = 1; lineIdx < lines.length; lineIdx++) {
        const cells = parseCsvLine(lines[lineIdx])
        const name = cleanText(cells[idxName] || '')
        const domain = cleanText(cells[idxDomain] || '')
        if (!name || !domain) continue
        const stateCell = idxState >= 0 ? cleanText(cells[idxState] || '') : ''
        const normalizedState = normalizeStateCode(stateCell) || defaultState
        addBuilderSeed(output, normalizedState, name, domain)
    }

    return output
}

function loadBuilderSeedsByState() {
    const output: Record<string, BuilderCandidate[]> = {}

    for (const [stateCode, builders] of Object.entries(SEEDED_BUILDERS_BY_STATE)) {
        for (const builder of builders) {
            addBuilderSeed(output, stateCode, builder.builder_name, builder.site_url)
        }
    }

    if (BUILDERS_CSV_PATH) {
        try {
            const csvPath = path.resolve(process.cwd(), BUILDERS_CSV_PATH)
            const rawCsv = fs.readFileSync(csvPath, 'utf8')
            const parsed = parseBuilderSeedsCsv(rawCsv, CSV_DEFAULT_STATE)
            for (const [stateCode, builders] of Object.entries(parsed)) {
                for (const builder of builders) {
                    addBuilderSeed(output, stateCode, builder.builder_name, builder.site_url)
                }
            }
            console.log(`📥 Loaded builder seed CSV from ${csvPath}`)
        } catch (err: any) {
            console.error(`⚠️ Could not read SYNC_BUILDERS_CSV_PATH: ${err.message}`)
        }
    }

    if (BUILDERS_CSV_INLINE) {
        try {
            const parsed = parseBuilderSeedsCsv(BUILDERS_CSV_INLINE, CSV_DEFAULT_STATE)
            for (const [stateCode, builders] of Object.entries(parsed)) {
                for (const builder of builders) {
                    addBuilderSeed(output, stateCode, builder.builder_name, builder.site_url)
                }
            }
            console.log('📥 Loaded inline builder seed CSV from SYNC_BUILDERS_CSV')
        } catch (err: any) {
            console.error(`⚠️ Could not parse SYNC_BUILDERS_CSV: ${err.message}`)
        }
    }

    return output
}

function titleFromDomain(inputUrl: string) {
    const host = safeHostname(inputUrl).replace(/^www\./, '')
    const root = host.split('.')[0]
    return root
        .replace(/[-_]+/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
}

function normalizeBuilderName(title: string, fallbackUrl: string) {
    const raw = cleanText(title)
    const cleaned = raw
        .replace(/\s*[\|\-–:]\s*(Official Site|Home|New Homes.*|.*Builders?.*)$/i, '')
        .replace(/\s*\|\s*.*$/g, '')
        .replace(/\s+-\s+.*$/g, '')
        .trim()
    if (cleaned.length >= 3) return cleaned
    return titleFromDomain(fallbackUrl)
}

async function fetchHtml(url: string) {
    try {
        const response = await axios.get<string>(url, {
            timeout: REQUEST_TIMEOUT_MS,
            headers: HTTP_HEADERS,
            maxRedirects: 5,
            responseType: 'text',
            validateStatus: (status) => status >= 200 && status < 400,
        })
        return response.data
    } catch {
        return null
    }
}

async function fetchSearchResults(query: string, page: number): Promise<SearchResult[]> {
    if (SERPER_API_KEY) {
        const response = await axios.post(
            'https://google.serper.dev/search',
            { q: query, num: 10, page },
            {
                timeout: REQUEST_TIMEOUT_MS,
                headers: {
                    'X-API-KEY': SERPER_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        )
        return (response.data?.organic || []).map((item: any) => ({
            title: item.title || '',
            url: item.link || '',
            snippet: item.snippet || '',
        }))
    }

    if (SERPAPI_API_KEY) {
        const response = await axios.get('https://serpapi.com/search.json', {
            timeout: REQUEST_TIMEOUT_MS,
            params: {
                engine: 'google',
                q: query,
                api_key: SERPAPI_API_KEY,
                start: (page - 1) * 10,
                num: 10,
            },
        })
        return (response.data?.organic_results || []).map((item: any) => ({
            title: item.title || '',
            url: item.link || '',
            snippet: item.snippet || '',
        }))
    }

    const start = (page - 1) * 30
    const ddgUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}&s=${start}`
    const html = await fetchHtml(ddgUrl)
    if (!html) return []

    const $ = cheerio.load(html)
    const results: SearchResult[] = []

    $('div.result').each((_, element) => {
        const anchor = $(element).find('a.result__a').first()
        const href = anchor.attr('href') || ''
        let targetUrl = href
        try {
            const maybe = new URL(href, 'https://duckduckgo.com')
            const uddg = maybe.searchParams.get('uddg')
            if (uddg) targetUrl = decodeURIComponent(uddg)
        } catch {
            targetUrl = href
        }
        results.push({
            title: cleanText(anchor.text()),
            url: targetUrl,
            snippet: cleanText($(element).find('.result__snippet').text()),
        })
    })

    return results
}

function looksLikeBuilderSite(result: SearchResult) {
    const text = `${result.title} ${result.snippet}`.toLowerCase()
    if (!result.url) return false
    if (isBlockedDomain(result.url)) return false
    if (NON_BUILDER_TITLE_PHRASES.some((phrase) => text.includes(phrase))) return false
    return text.includes('builder') || text.includes('new home') || text.includes('homes')
}

function stateNameToSlug(stateName: string) {
    return stateName.toLowerCase().replace(/\s+/g, '-')
}

function toTitleCase(input: string) {
    return input
        .toLowerCase()
        .split(' ')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
}

function cleanCityCandidate(rawCity: string) {
    const original = rawCity.trim()
    const originalLower = original.toLowerCase()
    if (
        /explore|browse|search|find your|communit(?:y|ies)|floor plan|quick move|new homes? in/.test(originalLower) ||
        (originalLower.includes(' in ') && original.split(/\s+/).length > 2)
    ) {
        return null
    }

    const cleaned = rawCity
        .replace(/[^a-zA-Z\s'-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    if (!cleaned) return null
    if (cleaned.length < 2 || cleaned.length > 40) return null
    if (/\d/.test(cleaned)) return null
    const first = cleaned.split(' ')[0]?.toLowerCase()
    if (first && CITY_STOPWORDS.has(first)) return null
    if (!isLikelyCityName(cleaned)) return null
    return toTitleCase(cleaned)
}

function isLikelyCityName(value: string) {
    const words = value
        .split(' ')
        .map((word) => word.trim().toLowerCase())
        .filter(Boolean)
    if (words.length === 0 || words.length > 3) return false
    const prepositions = new Set(['at', 'of', 'near', 'inside'])
    if (words.some((word) => prepositions.has(word))) return false
    const blockedWordCount = words.filter((word) => CITY_STOPWORDS.has(word)).length
    if (blockedWordCount > 0) return false
    if (words.some((word) => NON_CITY_WORDS.has(word))) return false
    if (words.some((word) => word.length <= 1)) return false
    return true
}

function hasBlockedFileExtension(pathname: string) {
    const lower = pathname.toLowerCase()
    return URL_FILE_EXT_BLOCKLIST.some((ext) => lower.endsWith(ext))
}

function decodePathSegment(segment: string) {
    try {
        return decodeURIComponent(segment)
    } catch {
        return segment
    }
}

function extractCityFromStatePath(url: string, stateCode: string, stateName: string) {
    try {
        const parsed = new URL(url)
        if (hasBlockedFileExtension(parsed.pathname)) return null

        const segments = parsed.pathname
            .split('/')
            .map((segment) => decodePathSegment(segment).trim().toLowerCase())
            .filter(Boolean)
            .map((segment) => segment.replace(/[_\s]+/g, '-'))

        if (segments.length < 2) return null

        const stateTokens = new Set([stateNameToSlug(stateName), stateCode.toLowerCase()])
        for (let idx = 0; idx < segments.length - 1; idx++) {
            if (!stateTokens.has(segments[idx])) continue

            const candidate = segments[idx + 1]
            if (!candidate || URL_STATE_PATH_BLOCKLIST.has(candidate)) continue
            if (candidate.length < 2 || candidate.length > 36) continue
            if (/\d/.test(candidate)) continue

            const city = cleanCityCandidate(candidate.replace(/-/g, ' '))
            if (city) return city
        }
    } catch {
        return null
    }
    return null
}

function extractBuilderSiteSnippet(html: string) {
    const $ = cheerio.load(html)
    const title = cleanText($('title').first().text())
    const metaDescription = cleanText($('meta[name="description"]').attr('content') || '')
    const h1 = cleanText($('h1').first().text())
    const p1 = cleanText($('main p, article p, section p, p').first().text())
    const p2 = cleanText($('main p, article p, section p, p').eq(1).text())

    const parts = [title, metaDescription, h1, p1, p2].filter(Boolean)
    const uniqueParts: string[] = []
    for (const part of parts) {
        if (!uniqueParts.includes(part)) uniqueParts.push(part)
    }
    return uniqueParts.join(' ').slice(0, 1400)
}

async function filterCitiesWithAI(builderName: string, stateCode: string, stateName: string, rawCities: string[]) {
    if (!ENABLE_AI_CITY_FILTER || rawCities.length === 0) return rawCities
    if (rawCities.length === 1) return rawCities

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: 'You filter market city names for US homebuilder data quality. Return strict JSON only.',
                },
                {
                    role: 'user',
                    content: [
                        `Builder: ${builderName}`,
                        `State: ${stateName} (${stateCode})`,
                        'Task: Keep only valid market-level city names in that state. Remove neighborhood names, street names, community names, malformed fragments, and marketing phrases.',
                        `Input cities: ${JSON.stringify(rawCities)}`,
                        'Return JSON object with key "valid_cities" as an array. Reuse only strings from input.',
                    ].join('\n'),
                },
            ],
        })

        const responseText = completion.choices[0].message.content || '{}'
        const parsed = JSON.parse(responseText)
        const proposed = Array.isArray(parsed.valid_cities) ? parsed.valid_cities : []
        const allow = new Set(rawCities.map((city) => city.toLowerCase()))
        const output: string[] = []

        for (const value of proposed) {
            const cleaned = cleanCityCandidate(String(value))
            if (!cleaned) continue
            if (!allow.has(cleaned.toLowerCase())) continue
            if (!output.some((existing) => existing.toLowerCase() === cleaned.toLowerCase())) {
                output.push(cleaned)
            }
        }

        return output.length > 0 ? output : rawCities
    } catch {
        return rawCities
    }
}

function extractCitiesFromText(text: string, stateCode: string, stateName: string) {
    const citySet = new Set<string>()
    const patterns = [
        new RegExp(`\\b([A-Z][A-Za-z'\\-]+(?:\\s+[A-Z][A-Za-z'\\-]+){0,3}),\\s*${stateCode}\\b`, 'g'),
        new RegExp(`\\b([A-Z][A-Za-z'\\-]+(?:\\s+[A-Z][A-Za-z'\\-]+){0,3}),\\s*${stateName}\\b`, 'g'),
    ]

    for (const pattern of patterns) {
        let match: RegExpExecArray | null
        while ((match = pattern.exec(text)) !== null) {
            const city = cleanCityCandidate(match[1] || '')
            if (city) citySet.add(city)
        }
    }

    return citySet
}

function isStateMatch(region: string, stateCode: string, stateName: string) {
    const normalized = region.toLowerCase()
    return normalized === stateCode.toLowerCase() || normalized.includes(stateName.toLowerCase())
}

function extractCitiesFromJsonLd($: cheerio.CheerioAPI, stateCode: string, stateName: string) {
    const citySet = new Set<string>()
    const scripts = $('script[type="application/ld+json"]')

    const walk = (node: any) => {
        if (!node || typeof node !== 'object') return

        if (Array.isArray(node)) {
            for (const item of node) walk(item)
            return
        }

        const locality = node.addressLocality
        const region = node.addressRegion
        if (typeof locality === 'string' && typeof region === 'string' && isStateMatch(region, stateCode, stateName)) {
            const city = cleanCityCandidate(locality)
            if (city) citySet.add(city)
        }

        for (const value of Object.values(node)) {
            walk(value)
        }
    }

    scripts.each((_, script) => {
        const raw = $(script).text()
        if (!raw) return
        try {
            const parsed = JSON.parse(raw)
            walk(parsed)
        } catch {
            // ignore non-JSON payloads
        }
    })

    return citySet
}

function extractCityFromPath(url: string, stateCode: string, stateName: string) {
    try {
        const parsed = new URL(url)
        const segments = parsed.pathname
            .split('/')
            .map((segment) => segment.trim())
            .filter(Boolean)
            .map((segment) => segment.toLowerCase())
        const stateSlug = stateNameToSlug(stateName)
        for (let idx = 0; idx < segments.length - 1; idx++) {
            if (segments[idx] === stateSlug || segments[idx] === stateCode.toLowerCase()) {
                const cityCandidate = cleanCityCandidate(segments[idx + 1].replace(/-/g, ' '))
                if (cityCandidate) return cityCandidate
            }
        }
    } catch {
        return null
    }
    return null
}

function isRelevantMarketLink(href: string, stateCode: string, stateName: string) {
    const lowerHref = href.toLowerCase()
    const stateSlug = stateNameToSlug(stateName)
    return (
        MARKET_LINK_HINTS.some((hint) => lowerHref.includes(hint)) ||
        lowerHref.includes(`/${stateSlug}`) ||
        lowerHref.includes(`/${stateCode.toLowerCase()}`)
    )
}

async function fetchSitemapUrls(siteRoot: string) {
    const queue = [`${siteRoot}/sitemap.xml`, `${siteRoot}/sitemap_index.xml`]
    const visited = new Set<string>()
    const found = new Set<string>()

    while (queue.length > 0 && visited.size < 12 && found.size < MAX_CANDIDATE_PAGES_PER_BUILDER) {
        const sitemapUrl = queue.shift()
        if (!sitemapUrl || visited.has(sitemapUrl)) continue
        visited.add(sitemapUrl)

        const xml = await fetchHtml(sitemapUrl)
        if (!xml) continue
        const locMatches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => (match[1] || '').trim())
        for (const loc of locMatches) {
            if (!loc.startsWith(siteRoot)) continue
            if (loc.endsWith('.xml') && queue.length < 20) {
                queue.push(loc)
                continue
            }
            found.add(loc)
            if (found.size >= MAX_CANDIDATE_PAGES_PER_BUILDER) break
        }
    }

    return Array.from(found)
}

async function qualifyBuilderSite(siteUrl: string, fallbackBuilderName: string) {
    const homepage = await fetchHtml(siteUrl)
    if (!homepage) return null

    const $ = cheerio.load(homepage)
    const pageTitle = cleanText($('title').first().text())
    const ogSiteName = cleanText($('meta[property="og:site_name"]').attr('content') || '')
    const bodyText = cleanText($('body').text()).toLowerCase().slice(0, 25000)
    const titleLower = pageTitle.toLowerCase()
    const host = safeHostname(siteUrl)

    if (
        NON_BUILDER_TITLE_PHRASES.some((phrase) => titleLower.includes(phrase)) ||
        host.includes('blog') ||
        host.includes('magazine') ||
        host.includes('contractor') ||
        host.includes('news')
    ) {
        return null
    }

    if (NON_BUILDER_BODY_PHRASES.some((phrase) => bodyText.includes(phrase))) {
        return null
    }

    let signalScore = 0
    for (const phrase of BUILDER_SIGNAL_PHRASES) {
        if (bodyText.includes(phrase)) signalScore += 1
    }
    if (bodyText.includes('community') || bodyText.includes('communities')) signalScore += 1
    if (bodyText.includes('new home')) signalScore += 1

    if (signalScore < 2) return null

    const resolvedName = normalizeBuilderName(ogSiteName || pageTitle || fallbackBuilderName, siteUrl)
    return {
        builder_name: resolvedName,
        site_url: siteUrl,
    } as BuilderCandidate
}

async function collectCandidateUrls(builderSiteUrl: string, stateCode: string, stateName: string) {
    const candidateUrls = new Set<string>([builderSiteUrl])
    const host = safeHostname(builderSiteUrl)
    const html = await fetchHtml(builderSiteUrl)
    if (html) {
        const $ = cheerio.load(html)
        $('a[href]').each((_, link) => {
            const href = $(link).attr('href') || ''
            if (!href) return
            try {
                const absolute = new URL(href, builderSiteUrl).toString()
                const sameHost = safeHostname(absolute) === host
                if (!sameHost) return
                if (isRelevantMarketLink(absolute, stateCode, stateName)) {
                    candidateUrls.add(absolute)
                }
            } catch {
                // ignore malformed href
            }
        })
    }

    const sitemapUrls = await fetchSitemapUrls(builderSiteUrl)
    for (const sitemapUrl of sitemapUrls) {
        if (isRelevantMarketLink(sitemapUrl, stateCode, stateName)) {
            candidateUrls.add(sitemapUrl)
        }
        if (candidateUrls.size >= MAX_CANDIDATE_PAGES_PER_BUILDER) break
    }

    if (ENABLE_DEEP_LINK_CRAWL) {
        const crawlQueue = Array.from(candidateUrls)
            .filter((candidate) => isRelevantMarketLink(candidate, stateCode, stateName))
            .slice(0, MAX_CRAWL_PAGES_PER_BUILDER)
        const visited = new Set<string>()

        while (
            crawlQueue.length > 0 &&
            visited.size < MAX_CRAWL_PAGES_PER_BUILDER &&
            candidateUrls.size < MAX_CANDIDATE_PAGES_PER_BUILDER
        ) {
            const pageUrl = crawlQueue.shift()
            if (!pageUrl || visited.has(pageUrl)) continue
            visited.add(pageUrl)

            const pageHtml = await fetchHtml(pageUrl)
            if (!pageHtml) continue

            const $ = cheerio.load(pageHtml)
            const links = $('a[href]').toArray()
            for (const link of links) {
                const href = $(link).attr('href') || ''
                if (!href) continue
                try {
                    const absolute = new URL(href, pageUrl).toString()
                    if (safeHostname(absolute) !== host) continue
                    if (!isRelevantMarketLink(absolute, stateCode, stateName)) continue
                    if (candidateUrls.has(absolute)) continue

                    candidateUrls.add(absolute)
                    if (
                        crawlQueue.length < MAX_CRAWL_PAGES_PER_BUILDER &&
                        !visited.has(absolute)
                    ) {
                        crawlQueue.push(absolute)
                    }
                    if (candidateUrls.size >= MAX_CANDIDATE_PAGES_PER_BUILDER) break
                } catch {
                    // ignore malformed href
                }
            }
        }
    }

    return Array.from(candidateUrls).slice(0, MAX_CANDIDATE_PAGES_PER_BUILDER)
}

async function discoverBuildersForState(stateCode: string, seedsByState: Record<string, BuilderCandidate[]>) {
    const seeded = seedsByState[stateCode]
    if (seeded && seeded.length > 0) {
        const buildersBySite = new Map<string, BuilderCandidate>()
        for (const seededBuilder of seeded) {
            const normalizedSite = normalizeCandidateSite(seededBuilder.site_url)
            if (!normalizedSite) continue
            if (buildersBySite.has(normalizedSite)) continue
            buildersBySite.set(normalizedSite, {
                builder_name: seededBuilder.builder_name,
                site_url: normalizedSite,
            })
        }
        return Array.from(buildersBySite.values())
    }

    if (!ALLOW_SEARCH_DISCOVERY) {
        return []
    }

    const stateName = US_STATES[stateCode]
    const queries = [
        `Home Builders in ${stateName}`,
        `new home builders ${stateName}`,
        `national home builder ${stateName}`,
    ]
    const buildersBySite = new Map<string, BuilderCandidate>()

    for (const query of queries) {
        for (let page = 1; page <= SEARCH_PAGES; page++) {
            let results: SearchResult[] = []
            try {
                results = await fetchSearchResults(query, page)
            } catch (err: any) {
                console.error(`⚠️ Search failure (${query}, page ${page}): ${err.message}`)
            }

            for (const result of results) {
                if (!looksLikeBuilderSite(result)) continue
                const siteUrl = normalizeCandidateSite(result.url)
                if (!siteUrl) continue
                if (buildersBySite.has(siteUrl)) continue
                const qualified = await qualifyBuilderSite(siteUrl, normalizeBuilderName(result.title, siteUrl))
                if (!qualified) continue
                buildersBySite.set(siteUrl, qualified)
                if (buildersBySite.size >= MAX_BUILDERS_PER_STATE) break
            }

            if (buildersBySite.size >= MAX_BUILDERS_PER_STATE) break
            await sleep(250)
        }

        if (buildersBySite.size >= MAX_BUILDERS_PER_STATE) break
    }

    return Array.from(buildersBySite.values())
}

async function scrapeBuilderMarketsForState(builder: BuilderCandidate, stateCode: string): Promise<ScrapedMarketRecord[]> {
    const stateName = US_STATES[stateCode]
    const marketRows: ScrapedMarketRecord[] = []
    const citySet = new Set<string>()

    const candidateUrls = await collectCandidateUrls(builder.site_url, stateCode, stateName)

    // Primary extraction: state/city path pattern from the URL itself (works well with sitemap URLs).
    for (const pageUrl of candidateUrls) {
        const cityFromPath = extractCityFromStatePath(pageUrl, stateCode, stateName)
        if (cityFromPath) citySet.add(cityFromPath)
        if (citySet.size >= MAX_CITIES_PER_BUILDER_PER_STATE) break
    }

    const htmlTargets = candidateUrls.slice(0, MAX_HTML_PAGES_PER_BUILDER)
    for (const pageUrl of htmlTargets) {
        const html = await fetchHtml(pageUrl)
        if (!html) continue

        const $ = cheerio.load(html)

        // Keep noisy text parsing opt-in; structured JSON-LD is the default path.
        if (ENABLE_TEXT_CITY_EXTRACTION) {
            const text = cleanText($('body').text())
            for (const city of extractCitiesFromText(text, stateCode, stateName)) {
                citySet.add(city)
            }
        }
        for (const city of extractCitiesFromJsonLd($, stateCode, stateName)) {
            citySet.add(city)
        }

        if (citySet.size >= MAX_CITIES_PER_BUILDER_PER_STATE) break
    }

    const filteredCities = await filterCitiesWithAI(
        builder.builder_name,
        stateCode,
        stateName,
        Array.from(citySet).slice(0, MAX_CITIES_PER_BUILDER_PER_STATE)
    )

    for (const city of filteredCities) {
        if (isDeniedCityForState(city, stateCode)) continue
        marketRows.push({
            builder_name: builder.builder_name,
            builder_slug: slugify(builder.builder_name),
            city,
            state_code: stateCode,
            builder_site_url: builder.site_url,
        })
    }

    return marketRows
}

async function buildScrapedData(): Promise<ScrapeResult> {
    const output: ScrapedMarketRecord[] = []
    const discoveredBuildersByKey = new Map<string, BuilderCandidate>()
    const seedsByState = loadBuilderSeedsByState()
    const seededStates = Object.keys(seedsByState).filter((stateCode) => seedsByState[stateCode]?.length > 0)
    const states = seededStates.length > 0
        ? getStateSequence().filter((stateCode) => seededStates.includes(stateCode)).slice(0, MAX_STATES)
        : getStateSequence().filter((stateCode) => !!US_STATES[stateCode]).slice(0, MAX_STATES)

    console.log('\n================================')
    console.log('🌐 Starting Builder Site Scrape')
    console.log('================================')
    console.log(`Discovery mode: ${seededStates.length > 0 ? 'Vetted builder seed list' : ALLOW_SEARCH_DISCOVERY ? 'Search discovery' : 'No discovery available'}`)
    if (ALLOW_SEARCH_DISCOVERY) {
        console.log(`Search provider: ${SERPER_API_KEY ? 'Serper (Google)' : SERPAPI_API_KEY ? 'SerpApi (Google)' : 'Native search fallback (no search API key detected)'}`)
    }
    console.log(`State order: ${states.join(', ')}`)

    for (let idx = 0; idx < states.length; idx++) {
        const stateCode = states[idx]
        const stateName = US_STATES[stateCode]
        console.log(`\n📍 [${idx + 1}/${states.length}] Processing ${stateName} (${stateCode})...`)

        let builders: BuilderCandidate[] = []
        try {
            builders = await discoverBuildersForState(stateCode, seedsByState)
        } catch (err: any) {
            console.error(`❌ Failed discovery for ${stateCode}: ${err.message}`)
            continue
        }

        console.log(`🔎 Discovered ${builders.length} builder site candidates in ${stateCode}.`)

        for (let bIdx = 0; bIdx < builders.length; bIdx++) {
            const builder = builders[bIdx]
            const builderKey = `${safeHostname(builder.site_url)}|${normalizeBuilderNameKey(builder.builder_name) || slugify(builder.builder_name)}`
            discoveredBuildersByKey.set(builderKey, builder)
            console.log(`   🏗️  [${bIdx + 1}/${builders.length}] ${builder.builder_name} (${builder.site_url})`)

            try {
                const rows = await scrapeBuilderMarketsForState(builder, stateCode)
                if (rows.length === 0) {
                    console.log('      ↳ No cities parsed for this state.')
                    continue
                }
                output.push(...rows)
                console.log(`      ↳ Parsed ${rows.length} city market(s).`)
            } catch (err: any) {
                console.error(`      ❌ Scrape failure for ${builder.builder_name}: ${err.message}`)
            }
            await sleep(200)
        }

        console.log(`✅ Completed ${stateName} (${stateCode}). Current row count: ${output.length}`)
    }

    const deduped = new Map<string, ScrapedMarketRecord>()
    for (const row of output) {
        const key = `${row.builder_slug}|${row.city.toLowerCase()}|${row.state_code}`
        deduped.set(key, row)
    }

    const finalRows = Array.from(deduped.values())
    console.log(`\n📦 Scraping complete. Parsed ${output.length} rows, deduped to ${finalRows.length}.`)
    return { rows: finalRows, builders: Array.from(discoveredBuildersByKey.values()) }
}

async function fetchEntity(table: string, filters: Record<string, string>) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(filters)) {
        params.append(key, value)
    }
    const response = await fetch(`${API_URL}/${table}?${params.toString()}`, { headers: HEADERS })
    if (!response.ok) {
        const txt = await response.text()
        throw new Error(`Failed to fetch ${table}: ${response.status} ${txt}`)
    }
    const json = await response.json()
    return json.data
}

async function createEntity(table: string, payload: any) {
    const response = await fetch(`${API_URL}/${table}`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(payload),
    })
    if (!response.ok) {
        const txt = await response.text()
        throw new Error(`Failed to create in ${table}: ${response.status} ${txt}`)
    }
    const json = await response.json()
    return json.data
}

async function updateEntity(table: string, id: string, payload: any) {
    const response = await fetch(`${API_URL}/${table}?id=${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify(payload),
    })
    if (!response.ok) {
        const txt = await response.text()
        throw new Error(`Failed to update in ${table}: ${response.status} ${txt}`)
    }
    const json = await response.json()
    return json.data
}

async function loadExistingBuilderLookup(): Promise<BuilderLookup> {
    const bySlug = new Map<string, { id: string; name: string; slug: string; description: string | null; website: string | null }>()
    const byNormalizedName = new Map<string, { id: string; name: string; slug: string; description: string | null; website: string | null }>()

    let offset = 0
    const limit = 1000
    while (true) {
        const rows = await fetchEntity('builders', { limit: String(limit), offset: String(offset) })
        if (!Array.isArray(rows) || rows.length === 0) break

        for (const row of rows) {
            const model = {
                id: row.id,
                name: String(row.name || ''),
                slug: String(row.slug || ''),
                description: row.description ? String(row.description) : null,
                website: row.website ? String(row.website) : null,
            }
            if (model.slug) bySlug.set(model.slug, model)
            const normalizedName = normalizeBuilderNameKey(model.name)
            if (normalizedName) byNormalizedName.set(normalizedName, model)
        }

        if (rows.length < limit) break
        offset += limit
    }

    return { bySlug, byNormalizedName }
}

async function generateBuilderDescription(builderName: string, siteSnippet: string) {
    const prompt = [
        `Write one SEO-friendly description for the home builder "${builderName}".`,
        'Length: 55-75 words. Tone: factual, optimistic, concise.',
        'Use only information implied by the snippet. Do not invent facts.',
        'Output one paragraph only.',
        `Snippet: ${siteSnippet}`,
    ].join('\n')

    const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o-mini',
    })
    let description = completion.choices[0].message.content?.trim() || null
    if (!description) return null

    if (wordCount(description) < 55 || wordCount(description) > 75) {
        const rewritePrompt = [
            `Rewrite the description below to 55-75 words while preserving only known facts about "${builderName}".`,
            'Keep one paragraph, factual tone, no bullet points.',
            `Description: ${description}`,
        ].join('\n')
        const rewrite = await openai.chat.completions.create({
            messages: [{ role: 'user', content: rewritePrompt }],
            model: 'gpt-4o-mini',
        })
        description = rewrite.choices[0].message.content?.trim() || description
    }

    if (wordCount(description) < 55) {
        description = `${builderName} is a residential home builder focused on new construction neighborhoods and move-in ready opportunities in select markets. Buyers can explore active communities, floor plan collections, and purchase details through the company website. This profile summarizes verified market coverage and core builder information so shoppers can compare locations, evaluate options, and plan a home search with confidence.`
    } else if (wordCount(description) > 75) {
        description = trimToWordLimit(description, 75)
    }

    return description
}

function buildFallbackBuilderDescription(builderName: string) {
    return `${builderName} is a residential home builder focused on new construction neighborhoods and move-in ready opportunities in select markets. Buyers can explore active communities, floor plan collections, and purchase details through the company website. This profile summarizes verified market coverage and core builder information so shoppers can compare locations, evaluate options, and plan a home search with confidence.`
}

function buildFallbackMarketDescription(builderName: string, city: string, state: string) {
    return `${builderName} builds new homes in ${city}, ${state}. Buyers researching this market can review current community availability, floor plans, and inventory options on the builder website. This page summarizes the builder's local presence to support market-level comparison, helping shoppers evaluate neighborhoods, timing, and housing choices while planning a move within ${city} and nearby areas.`
}

async function generateMarketDescription(builderName: string, city: string, state: string) {
    const prompt = [
        `Write one concise SEO-friendly market description for "${builderName}" in ${city}, ${state}.`,
        'Length: 60-85 words. One paragraph only. Keep tone factual and local.',
        'Avoid hype, avoid bullet points, avoid mentioning unknown amenities.',
    ].join('\n')

    const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o-mini',
    })
    let description = completion.choices[0].message.content?.trim() || null
    if (!description) return null

    if (wordCount(description) < 60 || wordCount(description) > 85) {
        const rewritePrompt = [
            `Rewrite the description below to 60-85 words for "${builderName}" in ${city}, ${state}.`,
            'Use one paragraph, factual tone, and avoid unverifiable claims.',
            `Description: ${description}`,
        ].join('\n')
        const rewrite = await openai.chat.completions.create({
            messages: [{ role: 'user', content: rewritePrompt }],
            model: 'gpt-4o-mini',
        })
        description = rewrite.choices[0].message.content?.trim() || description
    }

    if (wordCount(description) < 60) {
        description = buildFallbackMarketDescription(builderName, city, state)
    } else if (wordCount(description) > 85) {
        description = trimToWordLimit(description, 85)
    }

    return description
}

async function ensureBuilderDescription(
    builderId: string,
    builderName: string,
    builderSiteUrl: string | undefined,
    existingDescription: string | null | undefined
) {
    if (!builderSiteUrl) return
    if (!REFRESH_BUILDER_DESCRIPTIONS && existingDescription && existingDescription.length >= 40) return

    const homepageHtml = await fetchHtml(builderSiteUrl)
    const snippet = homepageHtml
        ? extractBuilderSiteSnippet(homepageHtml)
        : `Builder name: ${builderName}. Website: ${builderSiteUrl}.`
    if (!snippet) return

    let description: string | null = null
    try {
        description = await generateBuilderDescription(builderName, snippet)
    } catch {
        description = null
    }

    if (!description || wordCount(description) < 55) {
        description = buildFallbackBuilderDescription(builderName)
    }

    await updateEntity('builders', builderId, {
        description,
        website: builderSiteUrl,
        source_url: builderSiteUrl,
        source_site: safeHostname(builderSiteUrl),
    })
}

async function runSync() {
    console.log('🚀 Starting Data Sync Automation...')
    console.log(`Using API URL: ${API_URL}`)

    try {
        await fetchEntity('builders', {})
    } catch (err: any) {
        throw new Error(`Cannot reach ingestion API at ${API_URL}. Start your local Next.js server first. Details: ${err.message}`)
    }

    const scrapeResult = await buildScrapedData()
    const scrapedData = scrapeResult.rows
    const discoveredBuilders = scrapeResult.builders
    if (discoveredBuilders.length === 0) {
        console.log('No builders discovered. Exiting.')
        return
    }

    const builderCache: Record<string, string> = {}
    const builderLookup = await loadExistingBuilderLookup()
    const activeMarkets = new Set<string>()

    for (const builder of discoveredBuilders) {
        const raw = {
            builder_name: builder.builder_name,
            builder_slug: slugify(builder.builder_name),
            builder_site_url: builder.site_url,
        }
        const slugCandidates = buildSlugCandidates(raw.builder_name, raw.builder_slug)
        let builderId: string | null = slugCandidates.map((slug) => builderCache[slug]).find(Boolean) || null

        if (!builderId) {
            console.log(`\n🔍 Checking Builder: ${raw.builder_name}...`)
            let found = slugCandidates
                .map((slug) => builderLookup.bySlug.get(slug))
                .find(Boolean)

            if (!found) {
                const normalizedName = normalizeBuilderNameKey(raw.builder_name)
                if (normalizedName) {
                    found = builderLookup.byNormalizedName.get(normalizedName)
                }
            }

            if (found) {
                builderId = found.id
                console.log(`✅ Found existing Builder ID: ${builderId} (${found.name})`)
                try {
                    await ensureBuilderDescription(builderId, found.name, raw.builder_site_url, found.description)
                } catch (err: any) {
                    console.error(`⚠️ Could not refresh builder description for ${found.name}: ${err.message}`)
                }
            } else {
                console.log('➕ Creating new Builder...')
                const newBuilder = await createEntity('builders', {
                    name: raw.builder_name,
                    slug: raw.builder_slug,
                    website: raw.builder_site_url || null,
                    source_url: raw.builder_site_url || null,
                    source_site: raw.builder_site_url ? safeHostname(raw.builder_site_url) : null,
                })
                if (!newBuilder?.id) {
                    throw new Error(`Builder creation returned no id for ${raw.builder_name}`)
                }
                builderId = String(newBuilder.id)
                console.log(`✅ Created Builder ID: ${builderId}`)

                const createdModel = {
                    id: builderId,
                    name: raw.builder_name,
                    slug: raw.builder_slug,
                    description: null,
                    website: raw.builder_site_url || null,
                }
                builderLookup.bySlug.set(raw.builder_slug, createdModel)
                const normalizedName = normalizeBuilderNameKey(raw.builder_name)
                if (normalizedName) builderLookup.byNormalizedName.set(normalizedName, createdModel)

                try {
                    await ensureBuilderDescription(builderId, raw.builder_name, raw.builder_site_url, null)
                } catch (err: any) {
                    console.error(`⚠️ Could not generate builder description for ${raw.builder_name}: ${err.message}`)
                }
            }
            if (!builderId) {
                console.error(`⚠️ Could not resolve builder id for ${raw.builder_name}.`)
                continue
            }
            for (const slug of slugCandidates) {
                builderCache[slug] = builderId
            }
        }
    }

    if (scrapedData.length === 0) {
        console.log('No market rows parsed after builder discovery. Exiting before market sync.')
        return
    }

    for (const raw of scrapedData) {
        const slugCandidates = buildSlugCandidates(raw.builder_name, raw.builder_slug)
        const builderId = slugCandidates.map((slug) => builderCache[slug]).find(Boolean)
        if (!builderId) {
            console.error(`⚠️ Skipping market because builder ID could not be resolved: ${raw.builder_name} (${raw.builder_slug})`)
            continue
        }

        activeMarkets.add(`${builderId}|${raw.builder_name}|${raw.city}|${raw.state_code}`)
    }

    console.log('\n================================')
    console.log('🤖 Starting LLM Market Sync...')
    console.log('================================\n')

    for (const marketToken of activeMarkets) {
        const [bId, bName, city, stateCode] = marketToken.split('|')

        console.log(`🔍 Checking Market Override: ${bName} in ${city}, ${stateCode}...`)
        const existingOverride = await fetchEntity('builder_markets', {
            builder_id__eq: bId,
            city__eq: city,
            state_code__eq: stateCode,
        })

        if (existingOverride && existingOverride.length > 0) {
            console.log('✅ Existing override found. Skipping generation.')
            continue
        }

        console.log(`✨ Generating AI description for ${bName} @ ${city}...`)
        try {
            let generatedText: string | null = null
            try {
                generatedText = await generateMarketDescription(bName, city, stateCode)
            } catch {
                generatedText = null
            }
            if (!generatedText || wordCount(generatedText) < 60) {
                generatedText = buildFallbackMarketDescription(bName, city, stateCode)
            }

            console.log('➕ Saving AI override to database...')
            await createEntity('builder_markets', {
                builder_id: bId,
                city,
                state_code: stateCode,
                local_description: generatedText,
            })
            console.log('✅ Market Override Saved!')
        } catch (err: any) {
            console.error(`❌ Failed to generate text via OpenAI: ${err.message}`)
        }
    }

    console.log('\n🎉 Automation Completed Successfully!')
}

runSync().catch((err) => {
    console.error('\n💥 Sync failed:', err.message || err)
    process.exit(1)
})
