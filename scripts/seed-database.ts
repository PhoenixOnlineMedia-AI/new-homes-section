#!/usr/bin/env tsx
/**
 * Database Seed Script
 * 
 * Seeds the Supabase database with sample builders, communities, and homes
 * for development and testing.
 * 
 * Usage: npx tsx scripts/seed-database.ts
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables. Please set:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Sample data
const builders = [
  {
    id: uuidv4(),
    name: 'Taylor Morrison',
    slug: 'taylor-morrison',
    description: 'Taylor Morrison is a leading national homebuilder and developer, recognized as America\'s Most Trusted® National Builder for multiple years.',
    website: 'https://www.taylormorrison.com',
    phone: '(844) 237-6283',
    email: 'info@taylormorrison.com',
    year_founded: 1936,
    headquarters: 'Scottsdale, AZ',
    rating: 4.7,
    review_count: 2847,
    is_verified: true,
    is_premium: true,
    logo_url: 'https://www.taylormorrison.com/-/media/project/taylor-morrison/icons/taylor-morrison-logo.svg',
    meta_title: 'Taylor Morrison - New Homes for Sale',
    meta_description: 'Find your dream home with Taylor Morrison. New homes for sale across the United States.'
  },
  {
    id: uuidv4(),
    name: 'Lennar',
    slug: 'lennar',
    description: 'Lennar is one of the nation\'s leading homebuilders, providing beautifully crafted homes with Everything\'s Included® features.',
    website: 'https://www.lennar.com',
    phone: '(888) 536-5651',
    email: 'info@lennar.com',
    year_founded: 1954,
    headquarters: 'Miami, FL',
    rating: 4.5,
    review_count: 5234,
    is_verified: true,
    is_premium: true,
    logo_url: 'https://www.lennar.com/images/lennar-logo.svg',
    meta_title: 'Lennar - New Homes for Sale',
    meta_description: 'Discover new homes for sale with Lennar. Everything\'s Included® homes in communities across the country.'
  },
  {
    id: uuidv4(),
    name: 'DR Horton',
    slug: 'dr-horton',
    description: 'America\'s largest homebuilder by volume, D.R. Horton offers quality homes at affordable prices across 33 states.',
    website: 'https://www.drhorton.com',
    phone: '(866) 375-4746',
    email: 'info@drhorton.com',
    year_founded: 1978,
    headquarters: 'Arlington, TX',
    rating: 4.3,
    review_count: 3892,
    is_verified: true,
    is_premium: false,
    logo_url: 'https://www.drhorton.com/images/drh-logo.svg',
    meta_title: 'DR Horton - New Homes for Sale',
    meta_description: 'Find affordable new homes with DR Horton, America\'s largest homebuilder.'
  },
  {
    id: uuidv4(),
    name: 'Pulte Homes',
    slug: 'pulte-homes',
    description: 'Pulte Homes builds quality new homes with innovative designs and energy-efficient features for every stage of life.',
    website: 'https://www.pulte.com',
    phone: '(888) 458-5385',
    email: 'info@pulte.com',
    year_founded: 1950,
    headquarters: 'Atlanta, GA',
    rating: 4.6,
    review_count: 2156,
    is_verified: true,
    is_premium: true,
    logo_url: 'https://www.pulte.com/images/pulte-logo.svg',
    meta_title: 'Pulte Homes - New Home Builder',
    meta_description: 'Build the life you envision with Pulte Homes. Quality new homes designed for how you live.'
  }
]

const communities = [
  {
    id: uuidv4(),
    name: 'The Oaks at Mueller',
    slug: 'the-oaks-at-mueller',
    builder_id: builders[0].id, // Taylor Morrison
    description: 'The Oaks at Mueller offers modern, energy-efficient homes in Austin\'s beloved Mueller development. Walkable to parks, shops, and the Thinkery children\'s museum. Homes feature open floor plans, gourmet kitchens, and private yards in a vibrant urban setting.',
    address: '1800 Aldrich St',
    city: 'Austin',
    state: 'Texas',
    state_code: 'TX',
    zip_code: '78723',
    county: 'Travis',
    latitude: 30.297,
    longitude: -97.709,
    min_price: 650000,
    max_price: 850000,
    price_per_sqft: 320,
    min_bedrooms: 3,
    max_bedrooms: 5,
    min_bathrooms: 2,
    max_bathrooms: 4,
    min_sqft: 2100,
    max_sqft: 3200,
    home_count: 45,
    total_homes: 78,
    amenities: ['Swimming Pool', 'Fitness Center', 'Walking Trails', 'Dog Park', 'Community Garden', 'Playground', 'Electric Vehicle Charging'],
    home_types: ['Single Family', 'Townhome'],
    status: 'selling',
    year_established: 2021,
    school_district: 'Austin ISD',
    elementary_school: 'Mueller Elementary',
    middle_school: 'Kealing Middle',
    high_school: 'McCallum High',
    hoa_fees: 185,
    hoa_frequency: 'monthly',
    property_tax_rate: 2.15,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
    ],
    meta_title: 'The Oaks at Mueller | New Homes in Austin, TX',
    meta_description: 'New homes for sale at The Oaks at Mueller in Austin, TX. 3-5 bedroom homes from $650,000. Modern designs in a walkable community.'
  },
  {
    id: uuidv4(),
    name: 'Sunset Ridge',
    slug: 'sunset-ridge',
    builder_id: builders[1].id, // Lennar
    description: 'Sunset Ridge offers stunning new homes with spectacular hill country views. This master-planned community features resort-style amenities and homes with Lennar\'s signature Everything\'s Included® package.',
    address: '12500 Sunset Ridge Dr',
    city: 'Austin',
    state: 'Texas',
    state_code: 'TX',
    zip_code: '78737',
    county: 'Hays',
    latitude: 30.208,
    longitude: -97.936,
    min_price: 520000,
    max_price: 720000,
    price_per_sqft: 245,
    min_bedrooms: 3,
    max_bedrooms: 5,
    min_bathrooms: 2,
    max_bathrooms: 3.5,
    min_sqft: 1900,
    max_sqft: 3100,
    home_count: 120,
    total_homes: 340,
    amenities: ['Resort Pool', 'Clubhouse', 'Hiking Trails', 'Tennis Courts', 'Fitness Center', 'Lakes'],
    home_types: ['Single Family'],
    status: 'selling',
    year_established: 2020,
    school_district: 'Hays ISD',
    elementary_school: 'Sunset Valley Elementary',
    middle_school: 'Barton Middle',
    high_school: 'Jack C. Hays High',
    hoa_fees: 125,
    hoa_frequency: 'monthly',
    property_tax_rate: 1.85,
    images: [
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800'
    ],
    meta_title: 'Sunset Ridge | New Homes in Austin, TX',
    meta_description: 'New homes for sale at Sunset Ridge in Austin, TX. 3-5 bedroom homes from $520,000 with hill country views and resort amenities.'
  },
  {
    id: uuidv4(),
    name: 'Bridgeland',
    slug: 'bridgeland',
    builder_id: builders[2].id, // DR Horton
    description: 'Bridgeland is an award-winning master-planned community in Cypress, TX. With over 3,000 acres of lakes, parks, and trails, it offers an exceptional lifestyle with affordable homes from DR Horton.',
    address: '16919 N Bridgeland Lake Pkwy',
    city: 'Cypress',
    state: 'Texas',
    state_code: 'TX',
    zip_code: '77433',
    county: 'Harris',
    latitude: 29.973,
    longitude: -95.712,
    min_price: 340000,
    max_price: 480000,
    price_per_sqft: 165,
    min_bedrooms: 3,
    max_bedrooms: 5,
    min_bathrooms: 2,
    max_bathrooms: 3,
    min_sqft: 1600,
    max_sqft: 2800,
    home_count: 85,
    total_homes: 1200,
    amenities: ['Multiple Lakes', 'Trails', 'Fitness Centers', 'Water Parks', 'Community Centers', 'Tennis Courts'],
    home_types: ['Single Family', 'Townhome'],
    status: 'selling',
    year_established: 2018,
    school_district: 'Cypress-Fairbanks ISD',
    elementary_school: 'Pope Elementary',
    middle_school: 'Sprague Middle',
    high_school: 'Bridgeland High',
    hoa_fees: 95,
    hoa_frequency: 'monthly',
    property_tax_rate: 3.25,
    images: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800'
    ],
    meta_title: 'Bridgeland | New Homes in Cypress, TX',
    meta_description: 'Affordable new homes at Bridgeland in Cypress, TX. 3-5 bedroom homes from $340,000 in a 3,000-acre master-planned community.'
  },
  {
    id: uuidv4(),
    name: 'Village Farms',
    slug: 'village-farms',
    builder_id: builders[3].id, // Pulte
    description: 'Village Farms is a vibrant community in Frisco offering thoughtfully designed homes with flexible living spaces. Located near Toyota Stadium and The Star, it provides easy access to dining, shopping, and entertainment.',
    address: '9555 Stonebrook Pkwy',
    city: 'Frisco',
    state: 'Texas',
    state_code: 'TX',
    zip_code: '75035',
    county: 'Collin',
    latitude: 33.145,
    longitude: -96.828,
    min_price: 580000,
    max_price: 780000,
    price_per_sqft: 235,
    min_bedrooms: 3,
    max_bedrooms: 5,
    min_bathrooms: 2,
    max_bathrooms: 4,
    min_sqft: 2000,
    max_sqft: 3400,
    home_count: 32,
    total_homes: 156,
    amenities: ['Community Pool', 'Playground', 'Walking Trails', 'Sports Courts', 'Greenbelt Access'],
    home_types: ['Single Family'],
    status: 'selling',
    year_established: 2022,
    school_district: 'Frisco ISD',
    elementary_school: 'Nichols Elementary',
    middle_school: 'Cobb Middle',
    high_school: 'Heritage High',
    hoa_fees: 150,
    hoa_frequency: 'monthly',
    property_tax_rate: 2.08,
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800'
    ],
    meta_title: 'Village Farms | New Homes in Frisco, TX',
    meta_description: 'New homes for sale at Village Farms in Frisco, TX. 3-5 bedroom homes from $580,000 near Toyota Stadium and The Star.'
  },
  {
    id: uuidv4(),
    name: 'Alvadora',
    slug: 'alvadora',
    builder_id: builders[1].id, // Lennar
    description: 'Alvadora offers luxurious new homes in Overland Park with sophisticated designs and premium finishes. This boutique community provides an exclusive lifestyle with large homesites and mature trees.',
    address: '14300 Switzer Rd',
    city: 'Overland Park',
    state: 'Kansas',
    state_code: 'KS',
    zip_code: '66221',
    county: 'Johnson',
    latitude: 38.915,
    longitude: -94.738,
    min_price: 750000,
    max_price: 1200000,
    price_per_sqft: 285,
    min_bedrooms: 4,
    max_bedrooms: 6,
    min_bathrooms: 3.5,
    max_bathrooms: 5.5,
    min_sqft: 3200,
    max_sqft: 5500,
    home_count: 18,
    total_homes: 42,
    amenities: ['Community Pool', 'Clubhouse', 'Tennis Court', 'Walking Trails', 'Gated Entry'],
    home_types: ['Single Family'],
    status: 'selling',
    year_established: 2023,
    school_district: 'Blue Valley USD',
    elementary_school: 'Aubry Bend Elementary',
    middle_school: 'Pleasant Ridge Middle',
    high_school: 'Blue Valley Southwest',
    hoa_fees: 275,
    hoa_frequency: 'monthly',
    property_tax_rate: 1.65,
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09a15956?w=800',
      'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800',
      'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800'
    ],
    meta_title: 'Alvadora | Luxury New Homes in Overland Park, KS',
    meta_description: 'Luxury new homes at Alvadora in Overland Park, KS. 4-6 bedroom estate homes from $750,000 in a gated community.'
  }
]

const homes = [
  // The Oaks at Mueller homes
  {
    id: uuidv4(),
    community_id: communities[0].id,
    name: 'The Hamilton',
    address: '1800 Aldrich St, Lot 12',
    base_price: 725000,
    max_price: 750000,
    bedrooms: 4,
    bathrooms: 3,
    half_bathrooms: 1,
    sqft: 2850,
    stories: 2,
    garage_spaces: 2,
    garage_type: 'Attached',
    description: 'The Hamilton offers an open-concept design with a gourmet kitchen featuring quartz countertops and stainless steel appliances. The primary suite includes a spa-like bathroom with soaking tub and walk-in shower.',
    features: ['Gourmet Kitchen', 'Quartz Countertops', 'Hardwood Floors', 'Smart Home Technology', 'Covered Patio', 'Tankless Water Heater'],
    included_upgrades: ['Stainless Steel Appliances', 'Blinds Throughout', 'Front Yard Landscaping', '2-Year Warranty'],
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'
    ]
  },
  {
    id: uuidv4(),
    community_id: communities[0].id,
    name: 'The Jefferson',
    address: '1800 Aldrich St, Lot 8',
    base_price: 825000,
    max_price: 850000,
    bedrooms: 5,
    bathrooms: 4,
    half_bathrooms: 1,
    sqft: 3200,
    stories: 2,
    garage_spaces: 3,
    garage_type: 'Attached',
    description: 'The Jefferson is our largest plan at The Oaks, featuring a stunning two-story great room, main-floor guest suite, and an expansive primary suite with dual walk-in closets.',
    features: ['Two-Story Great Room', 'Main Floor Guest Suite', 'Dual Primary Closets', 'Outdoor Fireplace', 'Gourmet Kitchen', 'Butler Pantry'],
    included_upgrades: ['Premium Appliances Package', 'Extended Covered Patio', 'Gas Fireplace', '3-Year Warranty'],
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
    ]
  },
  // Sunset Ridge homes
  {
    id: uuidv4(),
    community_id: communities[1].id,
    name: 'Highland Plan',
    address: '12500 Sunset Ridge Dr, Lot 45',
    base_price: 595000,
    max_price: 620000,
    bedrooms: 4,
    bathrooms: 3,
    half_bathrooms: 0,
    sqft: 2450,
    stories: 1,
    garage_spaces: 2,
    garage_type: 'Attached',
    description: 'Popular one-story design with open living spaces and hill country views. Features Lennar\'s Everything\'s Included® package with upgraded finishes throughout.',
    features: ['Everything\'s Included®', 'Open Concept', 'Hill Country Views', 'Covered Patio', 'Energy Star Certified'],
    included_upgrades: ['Granite Countertops', '42" Cabinets', 'SS Appliances', 'Smart Thermostat', 'LED Lighting'],
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
    ]
  },
  // Bridgeland homes
  {
    id: uuidv4(),
    community_id: communities[2].id,
    name: 'The Express 2100',
    address: '16919 N Bridgeland Lake Pkwy, Lot 203',
    base_price: 385000,
    max_price: 410000,
    bedrooms: 3,
    bathrooms: 2,
    half_bathrooms: 1,
    sqft: 2100,
    stories: 1,
    garage_spaces: 2,
    garage_type: 'Attached',
    description: 'Affordable single-story home perfect for first-time buyers. Open floor plan with large island kitchen and spacious primary suite.',
    features: ['Open Floor Plan', 'Kitchen Island', 'Walk-in Pantry', 'Covered Entry', 'Sprinkler System'],
    included_upgrades: ['Granite Countertops', 'Vinyl Plank Flooring', 'Blinds', 'Garage Door Opener'],
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800'
    ]
  },
  // Village Farms homes
  {
    id: uuidv4(),
    community_id: communities[3].id,
    name: 'Delaney',
    address: '9555 Stonebrook Pkwy, Lot 18',
    base_price: 675000,
    max_price: 710000,
    bedrooms: 4,
    bathrooms: 3,
    half_bathrooms: 1,
    sqft: 2950,
    stories: 2,
    garage_spaces: 2,
    garage_type: 'Attached',
    description: 'The Delaney offers flexible living with a main-floor guest suite option and an expansive gameroom upstairs. Gourmet kitchen with large walk-in pantry.',
    features: ['Flexible Floor Plan', 'Gourmet Kitchen', 'Walk-in Pantry', 'Gameroom', 'Covered Patio', 'Tankless Water Heater'],
    included_upgrades: ['Quartz Countertops', 'Hardwood Entry', 'Smart Home Package', 'Extended Patio'],
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800'
    ]
  }
]

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n')

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...')
    await supabase.from('homes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('communities').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('builders').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('✅ Cleared existing data\n')

    // Insert builders
    console.log('🏗️  Inserting builders...')
    const { error: buildersError } = await supabase.from('builders').insert(builders)
    if (buildersError) throw buildersError
    console.log(`✅ Inserted ${builders.length} builders\n`)

    // Insert communities
    console.log('🏘️  Inserting communities...')
    const { error: communitiesError } = await supabase.from('communities').insert(communities)
    if (communitiesError) throw communitiesError
    console.log(`✅ Inserted ${communities.length} communities\n`)

    // Insert homes
    console.log('🏠 Inserting homes...')
    const { error: homesError } = await supabase.from('homes').insert(homes)
    if (homesError) throw homesError
    console.log(`✅ Inserted ${homes.length} homes\n`)

    console.log('🎉 Database seed completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Builders: ${builders.length}`)
    console.log(`   - Communities: ${communities.length}`)
    console.log(`   - Homes: ${homes.length}`)
    
    // Print locations for reference
    console.log('\n📍 Locations seeded:')
    const locations = [...new Set(communities.map(c => `${c.city}, ${c.state_code}`))]
    locations.forEach(loc => console.log(`   - ${loc}`))

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
