// ============================================
// App Constants
// ============================================

export const APP_NAME = 'New Homes Section'
export const APP_DOMAIN = 'newhomessection.com'
export const APP_URL = `https://${APP_DOMAIN}`
export const APP_TAGLINE = 'Find Your Perfect New Home'
export const APP_DESCRIPTION = 'Search new home communities, builders, and new construction homes for sale. Compare prices, floor plans, and amenities across the best new home developments.'

export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/newhomessection',
  twitter: 'https://twitter.com/newhomessection',
  instagram: 'https://instagram.com/newhomessection',
  linkedin: 'https://linkedin.com/company/newhomessection',
}

export const CONTACT_INFO = {
  email: 'info@newhomessection.com',
  phone: '1-800-NEW-HOME',
  address: '',
}

// Price ranges for filters
export const PRICE_RANGES = [
  { min: 0, max: 200000, label: 'Under $200k' },
  { min: 200000, max: 300000, label: '$200k - $300k' },
  { min: 300000, max: 400000, label: '$300k - $400k' },
  { min: 400000, max: 500000, label: '$400k - $500k' },
  { min: 500000, max: 750000, label: '$500k - $750k' },
  { min: 750000, max: 1000000, label: '$750k - $1M' },
  { min: 1000000, max: null, label: '$1M+' },
]

// Bedroom options
export const BEDROOM_OPTIONS = [
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 5, label: '5+' },
]

// Bathroom options
export const BATHROOM_OPTIONS = [
  { value: 1, label: '1+' },
  { value: 1.5, label: '1.5+' },
  { value: 2, label: '2+' },
  { value: 2.5, label: '2.5+' },
  { value: 3, label: '3+' },
]

// Square footage ranges
export const SQFT_RANGES = [
  { min: 0, max: 1000, label: 'Under 1,000' },
  { min: 1000, max: 1500, label: '1,000 - 1,500' },
  { min: 1500, max: 2000, label: '1,500 - 2,000' },
  { min: 2000, max: 2500, label: '2,000 - 2,500' },
  { min: 2500, max: 3500, label: '2,500 - 3,500' },
  { min: 3500, max: null, label: '3,500+' },
]

// Popular states for quick navigation
export const POPULAR_STATES = [
  { name: 'Texas', code: 'TX', slug: 'texas' },
  { name: 'Florida', code: 'FL', slug: 'florida' },
  { name: 'California', code: 'CA', slug: 'california' },
  { name: 'Arizona', code: 'AZ', slug: 'arizona' },
  { name: 'North Carolina', code: 'NC', slug: 'north-carolina' },
  { name: 'Georgia', code: 'GA', slug: 'georgia' },
  { name: 'Colorado', code: 'CO', slug: 'colorado' },
  { name: 'Tennessee', code: 'TN', slug: 'tennessee' },
]

// Home status labels
export const HOME_STATUS_LABELS = {
  available: 'Available',
  under_contract: 'Under Contract',
  sold: 'Sold',
  coming_soon: 'Coming Soon',
}

export const COMMUNITY_STATUS_LABELS = {
  coming_soon: 'Coming Soon',
  selling: 'Now Selling',
  sold_out: 'Sold Out',
  closeout: 'Closeout',
}

// Default pagination
export const DEFAULT_PAGE_SIZE = 24
export const MAX_PAGE_SIZE = 100

// Full list of 50 US States
export const US_STATES = [
  { name: 'Alabama', code: 'AL', slug: 'alabama' },
  { name: 'Alaska', code: 'AK', slug: 'alaska' },
  { name: 'Arizona', code: 'AZ', slug: 'arizona' },
  { name: 'Arkansas', code: 'AR', slug: 'arkansas' },
  { name: 'California', code: 'CA', slug: 'california' },
  { name: 'Colorado', code: 'CO', slug: 'colorado' },
  { name: 'Connecticut', code: 'CT', slug: 'connecticut' },
  { name: 'Delaware', code: 'DE', slug: 'delaware' },
  { name: 'Florida', code: 'FL', slug: 'florida' },
  { name: 'Georgia', code: 'GA', slug: 'georgia' },
  { name: 'Hawaii', code: 'HI', slug: 'hawaii' },
  { name: 'Idaho', code: 'ID', slug: 'idaho' },
  { name: 'Illinois', code: 'IL', slug: 'illinois' },
  { name: 'Indiana', code: 'IN', slug: 'indiana' },
  { name: 'Iowa', code: 'IA', slug: 'iowa' },
  { name: 'Kansas', code: 'KS', slug: 'kansas' },
  { name: 'Kentucky', code: 'KY', slug: 'kentucky' },
  { name: 'Louisiana', code: 'LA', slug: 'louisiana' },
  { name: 'Maine', code: 'ME', slug: 'maine' },
  { name: 'Maryland', code: 'MD', slug: 'maryland' },
  { name: 'Massachusetts', code: 'MA', slug: 'massachusetts' },
  { name: 'Michigan', code: 'MI', slug: 'michigan' },
  { name: 'Minnesota', code: 'MN', slug: 'minnesota' },
  { name: 'Mississippi', code: 'MS', slug: 'mississippi' },
  { name: 'Missouri', code: 'MO', slug: 'missouri' },
  { name: 'Montana', code: 'MT', slug: 'montana' },
  { name: 'Nebraska', code: 'NE', slug: 'nebraska' },
  { name: 'Nevada', code: 'NV', slug: 'nevada' },
  { name: 'New Hampshire', code: 'NH', slug: 'new-hampshire' },
  { name: 'New Jersey', code: 'NJ', slug: 'new-jersey' },
  { name: 'New Mexico', code: 'NM', slug: 'new-mexico' },
  { name: 'New York', code: 'NY', slug: 'new-york' },
  { name: 'North Carolina', code: 'NC', slug: 'north-carolina' },
  { name: 'North Dakota', code: 'ND', slug: 'north-dakota' },
  { name: 'Ohio', code: 'OH', slug: 'ohio' },
  { name: 'Oklahoma', code: 'OK', slug: 'oklahoma' },
  { name: 'Oregon', code: 'OR', slug: 'oregon' },
  { name: 'Pennsylvania', code: 'PA', slug: 'pennsylvania' },
  { name: 'Rhode Island', code: 'RI', slug: 'rhode-island' },
  { name: 'South Carolina', code: 'SC', slug: 'south-carolina' },
  { name: 'South Dakota', code: 'SD', slug: 'south-dakota' },
  { name: 'Tennessee', code: 'TN', slug: 'tennessee' },
  { name: 'Texas', code: 'TX', slug: 'texas' },
  { name: 'Utah', code: 'UT', slug: 'utah' },
  { name: 'Vermont', code: 'VT', slug: 'vermont' },
  { name: 'Virginia', code: 'VA', slug: 'virginia' },
  { name: 'Washington', code: 'WA', slug: 'washington' },
  { name: 'West Virginia', code: 'WV', slug: 'west-virginia' },
  { name: 'Wisconsin', code: 'WI', slug: 'wisconsin' },
  { name: 'Wyoming', code: 'WY', slug: 'wyoming' },
  { name: 'Washington, D.C.', code: 'DC', slug: 'washington-dc' }
]
