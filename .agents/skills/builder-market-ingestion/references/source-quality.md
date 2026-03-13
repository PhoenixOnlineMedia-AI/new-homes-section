# Source Quality Rules

## Trust Hierarchy

1. User-provided state seed list of official builder domains.
2. Builder-owned pages discovered from the same domain (`/locations`, `/where-we-build`, sitemap).
3. Search engine discovery only when no seed list exists.

## Allowed Source Scope

- Use the builder's own domain root and same-host subpaths.
- Allow normalized host forms (`example.com`, `www.example.com`).

## Blocked Source Patterns

- Listing portals and marketplaces.
- Competitor directories and "top builders" blogs.
- Social-only and profile-only pages.

## Operational Policy

- Keep search discovery disabled by default.
- Log every accepted builder host.
- Deduplicate by normalized domain before scraping.
