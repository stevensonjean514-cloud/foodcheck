/*
  # Add Uploads Table for User-Submitted Photos
  
  ## Overview
  This migration adds an `uploads` table to track user-submitted photos of menu items.
  This replaces the `reality_photos` table structure to better match the app requirements.
  
  ## New Tables
  
  ### `uploads`
  - `id` (uuid, primary key) - Unique identifier for each upload
  - `menu_item_id` (uuid, foreign key) - Links to menu_items table
  - `username` (text) - Display name of the uploader
  - `photo_url` (text) - URL to the uploaded photo in storage
  - `created_at` (timestamptz) - When photo was uploaded
  
  ## Security
  - RLS enabled on uploads table
  - Public read access for viewing uploads
  - Public insert access for submitting photos
  
  ## Notes
  - Photos are stored in Supabase Storage bucket 'reality-photos'
  - Username defaults to 'anonymous' if not provided
  - All uploads are immediately visible across the app
*/

-- Create uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  username text DEFAULT 'anonymous',
  photo_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_uploads_item ON uploads(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_uploads_created ON uploads(created_at DESC);

-- Enable Row Level Security
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for uploads
CREATE POLICY "Anyone can view uploads"
  ON uploads FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can submit uploads"
  ON uploads FOR INSERT
  TO public
  WITH CHECK (true);