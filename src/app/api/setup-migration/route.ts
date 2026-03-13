import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createAdminClient()

  const sqlStr = `
-- Make city nullable to support State-wide overrides
ALTER TABLE builder_markets ALTER COLUMN city DROP NOT NULL;

-- Add new featured and sorting columns
ALTER TABLE builder_markets ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE builder_markets ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Drop previous unique constraint allowing only Builder+City+State
ALTER TABLE builder_markets DROP CONSTRAINT IF EXISTS builder_markets_builder_id_city_state_code_key;

-- Add a new unique constraint dealing with NULL cities safely via coalesce
CREATE UNIQUE INDEX IF NOT EXISTS builder_markets_builder_id_city_state_code_idx 
ON builder_markets (builder_id, COALESCE(city, ''), state_code);
  `

  // Supabase REST API doesn't allow raw SQL executing usually, but we will call an empty RPC or attempt direct migration payload if custom functions permit.
  // Actually, we can use the Supabase REST URL trick if we had anon keys but raw query is restricted.
  return NextResponse.json({ message: "File created, but direct RPC needed." })
}
