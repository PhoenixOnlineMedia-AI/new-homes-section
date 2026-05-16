import type { NextConfig } from "next";

const stateSlugs = [
  'alabama',
  'alaska',
  'arizona',
  'arkansas',
  'california',
  'colorado',
  'connecticut',
  'delaware',
  'florida',
  'georgia',
  'hawaii',
  'idaho',
  'illinois',
  'indiana',
  'iowa',
  'kansas',
  'kentucky',
  'louisiana',
  'maine',
  'maryland',
  'massachusetts',
  'michigan',
  'minnesota',
  'mississippi',
  'missouri',
  'montana',
  'nebraska',
  'nevada',
  'new-hampshire',
  'new-jersey',
  'new-mexico',
  'new-york',
  'north-carolina',
  'north-dakota',
  'ohio',
  'oklahoma',
  'oregon',
  'pennsylvania',
  'rhode-island',
  'south-carolina',
  'south-dakota',
  'tennessee',
  'texas',
  'utah',
  'vermont',
  'virginia',
  'washington',
  'west-virginia',
  'wisconsin',
  'wyoming',
  'washington-dc',
]

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: __dirname,
  },
  
  // Image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Trailing slashes for SEO
  trailingSlash: true,
  
  // Enable strict mode for better development
  reactStrictMode: true,
  
  // Experimental features
  experimental: {
    // Enable optimistic updates
    optimisticClientCache: true,
  },
  
  // Headers for SEO and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
        ],
      },
    ];
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      // Redirect /index to /
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
      ...stateSlugs.map((state) => ({
        source: `/${state}`,
        destination: `/builders/${state}`,
        statusCode: 301,
      })),
      ...stateSlugs.map((state) => ({
        source: `/${state}/:city`,
        destination: `/builders/${state}/:city`,
        statusCode: 301,
      })),
    ];
  },
};

export default nextConfig;
