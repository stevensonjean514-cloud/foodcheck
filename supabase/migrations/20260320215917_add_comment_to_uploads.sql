/*
  # Add Comment Field to Uploads
  
  1. Changes
    - Add `comment` column to `uploads` table to store user comments
    - Text field with no character limit (enforced in UI)
    - Optional field - users can upload without a comment
    
  2. Notes
    - Character limit of 280 characters enforced in the frontend
    - Comments are displayed alongside photos in the app
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'uploads' AND column_name = 'comment'
  ) THEN
    ALTER TABLE uploads ADD COLUMN comment text;
  END IF;
END $$;
