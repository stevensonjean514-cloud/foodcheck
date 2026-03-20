/*
  # Add Community Submitted Flag
  
  ## Overview
  This migration adds support for user-submitted restaurants and menu items.
  
  ## Changes
  
  ### 1. Restaurants Table
  - Add `is_community_submitted` (boolean) - Flag to identify user-submitted restaurants
  - Add `cuisine_type` (text) - Category like "Fast Food", "Pizza", "Burger", etc.
  
  ### 2. Menu Items Table
  - Add `is_community_submitted` (boolean) - Flag to identify user-submitted items
  
  ### 3. Updated Policies
  - Allow public insertion of new restaurants and menu items
  - Allow public updates to maintain data integrity
  
  ## Notes
  - Community submitted content starts with 0 votes
  - Badge will be shown on UI for community-submitted items
  - All new content is immediately available across the app
*/

-- Add is_community_submitted and cuisine_type to restaurants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'is_community_submitted'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN is_community_submitted boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'cuisine_type'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN cuisine_type text DEFAULT 'Other';
  END IF;
END $$;

-- Add is_community_submitted to menu_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'is_community_submitted'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN is_community_submitted boolean DEFAULT false;
  END IF;
END $$;

-- Add policies for public insertion of restaurants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'restaurants' AND policyname = 'Anyone can submit new restaurants'
  ) THEN
    CREATE POLICY "Anyone can submit new restaurants"
      ON restaurants FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;

-- Add policies for public insertion of menu items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'menu_items' AND policyname = 'Anyone can submit new menu items'
  ) THEN
    CREATE POLICY "Anyone can submit new menu items"
      ON menu_items FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;