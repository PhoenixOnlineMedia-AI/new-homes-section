---
description: Automatically scrape and synchronize builder market data
---
# Sync Market Data Automation

This workflow uses a headless script to fetch builder data, query our existing API to avoid duplicates, and uses OpenAI to generate custom market descriptions for the `builder_markets` table.

## Prerequisites
1. Ensure `OPENAI_API_KEY` is set in your `.env.local` file.
2. Ensure `API_BEARER_TOKEN` is set in your `.env.local` file (this is the token you configure on your backend to authorize data mutations).
3. Ensure `NEXT_PUBLIC_SUPABASE_URL` is set in your `.env.local` file.

## Execution

// turbo-all

1. Run the sync script using `tsx` (TypeScript executor for Node)
```bash
cd "/Users/teddgibson/GitHub Repositories/nhs/newhomessection"
npx tsx scripts/sync-market-data.ts
```

## How It Works
1. Performs Google Searches (via API or AI) to find home builders in target states.
2. Visits the official builder websites and scrapes them to determine which cities/markets they build in.
3. Interrogates our local API (`/api/v1/data/builders`) via HTTP GET to check if the Builder exists. It passes the `API_BEARER_TOKEN` as `Authorization: Bearer <token>`.
3. If missing, it makes a POST request to create the record.
4. Identifies the "Markets" (City, State) a builder operates in.
5. Checks if a `builder_markets` record already exists.
6. If not, it uses the OpenAI API to write a highly optimized SEO market description and POSTs it to the database.
