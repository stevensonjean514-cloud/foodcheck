/*
  # FoodCheck Database Schema
  
  ## Overview
  This migration creates the core database structure for FoodCheck, an app that compares
  fast food promotional photos with real customer photos.
  
  ## New Tables
  
  ### `restaurants`
  - `id` (uuid, primary key) - Unique identifier for each restaurant
  - `name` (text) - Restaurant name (e.g., "McDonald's")
  - `slug` (text, unique) - URL-friendly name (e.g., "mcdonalds")
  - `logo_url` (text) - URL to restaurant logo
  - `description` (text) - Brief description
  - `created_at` (timestamptz) - When restaurant was added
  
  ### `menu_items`
  - `id` (uuid, primary key) - Unique identifier for each menu item
  - `restaurant_id` (uuid, foreign key) - Links to restaurants table
  - `name` (text) - Item name (e.g., "Big Mac")
  - `slug` (text) - URL-friendly name
  - `description` (text) - Item description
  - `category` (text) - Category (e.g., "burgers", "tacos")
  - `official_photo_url` (text) - The promotional/ad photo
  - `accuracy_score` (integer) - AI-generated accuracy score (0-100)
  - `total_votes` (integer) - Total number of votes
  - `created_at` (timestamptz) - When item was added
  
  ### `reality_photos`
  - `id` (uuid, primary key) - Unique identifier for each photo
  - `menu_item_id` (uuid, foreign key) - Links to menu_items table
  - `photo_url` (text) - URL to the uploaded photo
  - `upvotes` (integer) - Number of upvotes
  - `downvotes` (integer) - Number of downvotes
  - `is_featured` (boolean) - Whether this is the main comparison photo
  - `uploaded_by` (text) - Username or identifier
  - `created_at` (timestamptz) - When photo was uploaded
  
  ### `votes`
  - `id` (uuid, primary key) - Unique identifier for each vote
  - `photo_id` (uuid, foreign key) - Links to reality_photos table
  - `vote_type` (text) - Either 'up' or 'down'
  - `voter_ip` (text) - IP address for basic duplicate prevention
  - `created_at` (timestamptz) - When vote was cast
  
  ## Security
  - RLS enabled on all tables
  - Public read access for all tables (read-only app)
  - Authenticated users can insert photos and votes
  - Anonymous users can view all data
*/

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  category text DEFAULT 'other',
  official_photo_url text NOT NULL,
  accuracy_score integer DEFAULT 50,
  total_votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, slug)
);

-- Create reality_photos table
CREATE TABLE IF NOT EXISTS reality_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  uploaded_by text DEFAULT 'anonymous',
  created_at timestamptz DEFAULT now()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid REFERENCES reality_photos(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  voter_ip text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_accuracy ON menu_items(accuracy_score);
CREATE INDEX IF NOT EXISTS idx_reality_photos_item ON reality_photos(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_reality_photos_featured ON reality_photos(is_featured);
CREATE INDEX IF NOT EXISTS idx_votes_photo ON votes(photo_id);

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reality_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants (public read)
CREATE POLICY "Anyone can view restaurants"
  ON restaurants FOR SELECT
  TO public
  USING (true);

-- RLS Policies for menu_items (public read)
CREATE POLICY "Anyone can view menu items"
  ON menu_items FOR SELECT
  TO public
  USING (true);

-- RLS Policies for reality_photos (public read, authenticated insert)
CREATE POLICY "Anyone can view reality photos"
  ON reality_photos FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can upload reality photos"
  ON reality_photos FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policies for votes (public read and insert)
CREATE POLICY "Anyone can view votes"
  ON votes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can cast votes"
  ON votes FOR INSERT
  TO public
  WITH CHECK (true);