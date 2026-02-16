import Script from 'next/script'
import { JsonLdSchema } from '@/types'

interface JsonLdProps {
  data: JsonLdSchema | JsonLdSchema[]
}

/**
 * Renders JSON-LD structured data for SEO.
 * Supports single schema or array of schemas.
 * 
 * Usage:
 * <JsonLd data={{
 *   '@context': 'https://schema.org',
 *   '@type': 'RealEstateListing',
 *   name: 'Beautiful Home in Austin',
 *   ...
 * }} />
 */
export function JsonLd({ data }: JsonLdProps) {
  const schemas = Array.isArray(data) ? data : [data]
  
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemas.length === 1 ? schemas[0] : schemas),
      }}
    />
  )
}

/**
 * Generate RealEstateListing schema for a home
 */
export function generateRealEstateListingSchema(home: {
  id: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number
  description?: string | null
  images: string[]
  url: string
  datePosted?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': home.url,
    url: home.url,
    name: `${home.bedrooms} Bedroom Home in ${home.city}, ${home.state}`,
    description: home.description || `Beautiful ${home.bedrooms} bedroom, ${home.bathrooms} bathroom home in ${home.city}, ${home.state}`,
    datePosted: home.datePosted || new Date().toISOString(),
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    image: home.images,
    address: {
      '@type': 'PostalAddress',
      streetAddress: home.address,
      addressLocality: home.city,
      addressRegion: home.state,
      postalCode: home.zipCode,
      addressCountry: 'US',
    },
    numberOfRooms: home.bedrooms,
    numberOfBedrooms: home.bedrooms,
    numberOfBathroomsTotal: home.bathrooms,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: home.sqft,
      unitCode: 'FTK',
    },
    price: home.price,
    priceCurrency: 'USD',
    businessFunction: 'http://purl.org/goodrelations/v1#Sell',
    offeredBy: {
      '@type': 'RealEstateAgent',
      name: 'New Homes Section',
    },
  }
}

/**
 * Generate Place schema for a community
 */
export function generatePlaceSchema(community: {
  name: string
  description?: string | null
  address: string
  city: string
  state: string
  zipCode: string
  latitude: number
  longitude: number
  images: string[]
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    '@id': community.url,
    name: community.name,
    description: community.description,
    url: community.url,
    image: community.images,
    address: {
      '@type': 'PostalAddress',
      streetAddress: community.address,
      addressLocality: community.city,
      addressRegion: community.state,
      postalCode: community.zipCode,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: community.latitude,
      longitude: community.longitude,
    },
  }
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  }
}

/**
 * Generate WebSite schema with search
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'New Homes Section',
    url: 'https://newhomessection.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://newhomessection.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'New Homes Section',
    url: 'https://newhomessection.com',
    logo: 'https://newhomessection.com/logo.png',
    sameAs: [
      'https://facebook.com/newhomessection',
      'https://twitter.com/newhomessection',
      'https://instagram.com/newhomessection',
    ],
  }
}
