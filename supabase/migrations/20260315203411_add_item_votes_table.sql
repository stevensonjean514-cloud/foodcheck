/*
  # Add Item Votes Tracking

  ## Overview
  This migration adds a new table to track votes directly on menu items (honest vs lie votes)
  and adds columns to track vote counts for better performance.

  ## New Tables
  
  ### `item_votes`
  - `id` (uuid, primary key) - Unique identifier for each vote
  - `menu_item_id` (uuid, foreign key) - Links to menu_items table
  - `vote_type` (text) - Either 'honest' or 'lie'
  - `voter_session` (text) - Session identifier to prevent duplicate votes
  - `created_at` (timestamptz) - When vote was cast

  ## Changes to Existing Tables
  
  ### `menu_items`
  - Add `honest_votes` (integer) - Count of honest votes
  - Add `lie_votes` (integer) - Count of lie votes
  
  ## Security
  - RLS enabled on item_votes table
  - Public read and insert access for voting
*/

-- Create item_votes table
CREATE TABLE IF NOT EXISTS item_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('honest', 'lie')),
  voter_session text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add vote columns to menu_items if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'honest_votes'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN honest_votes integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'lie_votes'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN lie_votes integer DEFAULT 0;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_item_votes_item ON item_votes(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_item_votes_session ON item_votes(voter_session, menu_item_id);

-- Enable Row Level Security
ALTER TABLE item_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for item_votes
CREATE POLICY "Anyone can view item votes"
  ON item_votes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can cast item votes"
  ON item_votes FOR INSERT
  TO public
  WITH CHECK (true);

-- Initialize vote counts based on accuracy scores (simulate existing votes)
UPDATE menu_items 
SET 
  honest_votes = FLOOR(total_votes * accuracy_score / 100.0),
  lie_votes = FLOOR(total_votes * (100 - accuracy_score) / 100.0)
WHERE honest_votes = 0 AND lie_votes = 0;
