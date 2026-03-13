-- Migration 003: Builder Markets Featured and Sorting Properties

-- Make city nullable to support State-wide overrides
ALTER TABLE builder_markets ALTER COLUMN city DROP NOT NULL;

-- Add new featured and sorting columns
ALTER TABLE builder_markets ADD COLUMN is_featured BOOLEAN DEFAULT false;
ALTER TABLE builder_markets ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Drop previous unique constraint allowing only Builder+City+State
ALTER TABLE builder_markets DROP CONSTRAINT builder_markets_builder_id_city_state_code_key;

-- Add a new unique constraint dealing with NULL cities safely via coalesce
CREATE UNIQUE INDEX builder_markets_builder_id_city_state_code_idx 
ON builder_markets (builder_id, COALESCE(city, ''), state_code);
