/**
 * CSV Templates for Bulk Uploads
 * Defines the expected columns and sample data for each entity type
 */

export interface CSVTemplate {
  name: string
  description: string
  headers: string[]
  sampleData: Record<string, string>
  requiredColumns: string[]
  validationRules: import('./parser').ValidationRule[]
}

/**
 * Builder CSV Template
 */
export const builderTemplate: CSVTemplate = {
  name: 'Builders',
  description: 'Upload builder/company information',
  headers: [
    'name',
    'slug',
    'description',
    'website',
    'phone',
    'email',
    'headquarters',
    'year_founded',
    'rating',
    'logo_url',
  ],
  sampleData: {
    name: 'Lennar',
    slug: 'lennar',
    description: 'One of the nation\'s leading homebuilders',
    website: 'https://www.lennar.com',
    phone: '(555) 123-4567',
    email: 'info@lennar.com',
    headquarters: 'Miami, FL',
    year_founded: '1954',
    rating: '4.5',
    logo_url: 'https://example.com/lennar-logo.png',
  },
  requiredColumns: ['name', 'slug'],
  validationRules: [
    { column: 'name', required: true, type: 'string' },
    { column: 'slug', required: true, type: 'string', pattern: '^[a-z0-9-]+$' },
    { column: 'website', type: 'url' },
    { column: 'email', type: 'email' },
    { column: 'year_founded', type: 'number', min: 1800, max: new Date().getFullYear() },
    { column: 'rating', type: 'number', min: 0, max: 5 },
  ],
}

/**
 * Community CSV Template
 */
export const communityTemplate: CSVTemplate = {
  name: 'Communities',
  description: 'Upload community/neighborhood information',
  headers: [
    'builder_slug',
    'name',
    'slug',
    'description',
    'address',
    'city',
    'state',
    'state_code',
    'zip_code',
    'min_price',
    'max_price',
    'min_bedrooms',
    'max_bedrooms',
    'min_bathrooms',
    'max_bathrooms',
    'min_sqft',
    'max_sqft',
    'home_count',
    'status',
    'amenities',
    'school_district',
    'images',
  ],
  sampleData: {
    builder_slug: 'lennar',
    name: 'Sunset Ridge',
    slug: 'sunset-ridge-austin',
    description: 'Beautiful family community with amenities',
    address: '123 Main St',
    city: 'Austin',
    state: 'Texas',
    state_code: 'TX',
    zip_code: '78701',
    min_price: '350000',
    max_price: '550000',
    min_bedrooms: '3',
    max_bedrooms: '5',
    min_bathrooms: '2',
    max_bathrooms: '4',
    min_sqft: '1800',
    max_sqft: '3200',
    home_count: '120',
    status: 'selling',
    amenities: 'pool,clubhouse,trails,playground',
    school_district: 'Austin ISD',
    images: 'https://example.com/img1.jpg,https://example.com/img2.jpg',
  },
  requiredColumns: ['builder_slug', 'name', 'slug', 'city', 'state', 'state_code'],
  validationRules: [
    { column: 'builder_slug', required: true, type: 'string' },
    { column: 'name', required: true, type: 'string' },
    { column: 'slug', required: true, type: 'string', pattern: '^[a-z0-9-]+$' },
    { column: 'city', required: true, type: 'string' },
    { column: 'state', required: true, type: 'string' },
    { column: 'state_code', required: true, type: 'string', pattern: '^[A-Z]{2}$' },
    { column: 'min_price', type: 'number', min: 0 },
    { column: 'max_price', type: 'number', min: 0 },
    { column: 'min_bedrooms', type: 'number', min: 0 },
    { column: 'max_bedrooms', type: 'number', min: 0 },
    { column: 'min_bathrooms', type: 'number', min: 0 },
    { column: 'max_bathrooms', type: 'number', min: 0 },
    { column: 'min_sqft', type: 'number', min: 0 },
    { column: 'max_sqft', type: 'number', min: 0 },
    { column: 'status', type: 'string', enum: ['coming_soon', 'selling', 'sold_out', 'closeout'] },
  ],
}

/**
 * Home/Floor Plan CSV Template
 */
export const homeTemplate: CSVTemplate = {
  name: 'Homes',
  description: 'Upload home/floor plan information',
  headers: [
    'community_slug',
    'name',
    'address',
    'base_price',
    'max_price',
    'bedrooms',
    'bathrooms',
    'half_bathrooms',
    'sqft',
    'stories',
    'garage_spaces',
    'garage_type',
    'description',
    'features',
    'status',
    'images',
    'floor_plan_url',
    'virtual_tour_url',
  ],
  sampleData: {
    community_slug: 'sunset-ridge-austin',
    name: 'The Hamilton',
    address: '123 Main St, Lot 45',
    base_price: '425000',
    max_price: '475000',
    bedrooms: '4',
    bathrooms: '2.5',
    half_bathrooms: '1',
    sqft: '2400',
    stories: '2',
    garage_spaces: '2',
    garage_type: 'attached',
    description: 'Spacious two-story home with open concept living',
    features: 'granite countertops,hardwood floors,stainless appliances',
    status: 'available',
    images: 'https://example.com/floorplan1.jpg,https://example.com/exterior1.jpg',
    floor_plan_url: 'https://example.com/floorplan.pdf',
    virtual_tour_url: 'https://example.com/tour',
  },
  requiredColumns: ['community_slug', 'name'],
  validationRules: [
    { column: 'community_slug', required: true, type: 'string' },
    { column: 'name', required: true, type: 'string' },
    { column: 'base_price', type: 'number', min: 0 },
    { column: 'max_price', type: 'number', min: 0 },
    { column: 'bedrooms', type: 'number', min: 0 },
    { column: 'bathrooms', type: 'number', min: 0 },
    { column: 'half_bathrooms', type: 'number', min: 0 },
    { column: 'sqft', type: 'number', min: 0 },
    { column: 'stories', type: 'number', min: 1 },
    { column: 'garage_spaces', type: 'number', min: 0 },
    { column: 'status', type: 'string', enum: ['available', 'under_contract', 'sold', 'coming_soon', 'model'] },
  ],
}

/**
 * Builder Market Template
 */
export const builderMarketTemplate: CSVTemplate = {
  name: 'Builder Markets',
  description: 'Upload market-specific descriptions for builders',
  headers: [
    'builder_slug',
    'city',
    'state_code',
    'local_description',
    'image_url',
  ],
  sampleData: {
    builder_slug: 'lennar',
    city: 'Austin',
    state_code: 'TX',
    local_description: 'Building quality homes in the heart of Austin with modern amenities.',
    image_url: 'https://example.com/austin-market-image.jpg',
  },
  requiredColumns: ['builder_slug', 'city', 'state_code'],
  validationRules: [
    { column: 'builder_slug', required: true, type: 'string', pattern: '^[a-z0-9-]+$' },
    { column: 'city', required: true, type: 'string' },
    { column: 'state_code', required: true, type: 'string', pattern: '^[A-Z]{2}$' },
  ],
}

/**
 * Get template by type
 */
export function getTemplate(type: 'builders' | 'communities' | 'homes' | 'builder_markets'): CSVTemplate {
  switch (type) {
    case 'builders':
      return builderTemplate
    case 'communities':
      return communityTemplate
    case 'homes':
      return homeTemplate
    case 'builder_markets':
      return builderMarketTemplate
    default:
      throw new Error(`Unknown template type: ${type}`)
  }
}

/**
 * Get all templates
 */
export function getAllTemplates(): Record<string, CSVTemplate> {
  return {
    builders: builderTemplate,
    communities: communityTemplate,
    homes: homeTemplate,
    builder_markets: builderMarketTemplate,
  }
}
