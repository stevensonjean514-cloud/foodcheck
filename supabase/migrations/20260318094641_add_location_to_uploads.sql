/*
  # Add Location Fields to Uploads
  
  1. Changes
    - Add `location_address` column to `uploads` table to store full address
    - Add `location_lat` column to store latitude coordinate
    - Add `location_lng` column to store longitude coordinate
    - Add `location_place_id` column to store Google Places ID for reference
    
  2. Notes
    - Location fields are optional to maintain backwards compatibility
    - These fields enable location-based features and displaying addresses on uploads
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'uploads' AND column_name = 'location_address'
  ) THEN
    ALTER TABLE uploads ADD COLUMN location_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'uploads' AND column_name = 'location_lat'
  ) THEN
    ALTER TABLE uploads ADD COLUMN location_lat double precision;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'uploads' AND column_name = 'location_lng'
  ) THEN
    ALTER TABLE uploads ADD COLUMN location_lng double precision;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'uploads' AND column_name = 'location_place_id'
  ) THEN
    ALTER TABLE uploads ADD COLUMN location_place_id text;
  END IF;
END $$;
