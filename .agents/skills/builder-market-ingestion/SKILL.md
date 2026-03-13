---
name: builder-market-ingestion
description: Collect and ingest builder plus city/state market data for real-estate directories using vetted builder domains, strict deduping, and market-quality checks. Use when processing per-state builder website lists, extracting builder markets from official builder sites, resuming ingestion runs, or validating builder_market rows before database writes.
---

# Builder Market Ingestion

Use this skill to keep builder-market ingestion stable and reproducible across states.

## Workflow

1. Normalize incoming state seed CSV.
2. Use only official builder domains as primary discovery.
3. Extract city/state markets from builder-owned pages.
4. Validate rows before any DB mutation.
5. Run sync with resume-safe state slicing.
6. Report counts and suspicious rows after each run.

## Step 1: Normalize Seed Lists

Run:

```bash
python3 .agents/skills/builder-market-ingestion/scripts/seed_csv_to_seedmap.py \
  --input /path/to/state-builders.csv \
  --format ts
```

Expected CSV columns:
- `state_code`
- `name`
- `domain`

This removes duplicate `(state_code, domain)` entries and emits normalized `https://` roots.

## Step 2: Source Rules

Apply source policy in:
- [source-quality.md](references/source-quality.md)

Hard rules:
- Prefer state seed lists from user.
- Treat search discovery as fallback only.
- Scrape official builder domains only.
- Reject listing portals and broad directories.

## Step 3: Market Extraction Rules

Apply market policy in:
- [market-validation.md](references/market-validation.md)

Default extraction order:
1. Structured signals (`application/ld+json`, `addressLocality/addressRegion`)
2. Explicit `City, ST` text matches (opt-in if needed)
3. Reject path/anchor-derived community strings unless validated

## Step 4: Validate Rows Before Ingest

Run:

```bash
python3 .agents/skills/builder-market-ingestion/scripts/validate_market_rows.py \
  --input /path/to/rows.csv \
  --out /path/to/rows.clean.csv \
  --rejects /path/to/rows.rejects.csv
```

Required columns:
- `builder_name`
- `builder_slug`
- `city`
- `state_code`

This enforces state-code format, city token quality, and row dedupe on `(builder_slug, city, state_code)`.

## Step 5: Run Sync

Run scoped state windows for resumability:

```bash
SYNC_START_STATE=AZ SYNC_STATE_LIMIT=1 npx tsx scripts/sync-market-data.ts
```

For strict runs, keep noisy text-city parsing disabled unless coverage is too low:

```bash
SYNC_ENABLE_TEXT_CITY_EXTRACTION=true npx tsx scripts/sync-market-data.ts
```

## Step 6: Post-Run Audit

After each run:
1. Report `builders` and `builder_markets` counts.
2. Spot-check newest market rows for malformed city names.
3. If noise appears, tighten validation and rerun that state only.
