# Market Validation Rules

## Row Schema

- `builder_name`: non-empty text
- `builder_slug`: normalized slug
- `city`: city-only label (no community/marketing phrases)
- `state_code`: 2-letter US state code

## Acceptance Rules

1. Prefer structured locality data (`addressLocality` + `addressRegion`).
2. Allow explicit `City, ST` matches when confidence is high.
3. Reject labels containing campaign or navigation language.
4. Reject rows with malformed or non-state codes.
5. Deduplicate by `(builder_slug, city, state_code)`.

## Common Reject Signals

- `find your`, `explore`, `quick move`, `new homes in`
- concatenated community names like `Xyzroadmesa`
- obvious fragments (`Antonio`, `Marcos`, `Worth`) when detached from expected city context

## Safe Iteration Strategy

1. Run one state at a time.
2. Validate and inspect rejects.
3. Ingest cleaned rows.
4. Resume with next state.
