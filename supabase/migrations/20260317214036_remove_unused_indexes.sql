/*
  # Remove Unused Indexes

  1. Changes
    - Drop unused index `idx_item_votes_item` on `item_votes` table
    - Drop unused index `idx_item_votes_session` on `item_votes` table
    - Drop unused index `idx_menu_items_accuracy` on `menu_items` table
    - Drop unused index `idx_reality_photos_featured` on `reality_photos` table
    - Drop unused index `idx_votes_photo` on `votes` table
    - Drop unused index `idx_uploads_created` on `uploads` table

  2. Rationale
    - These indexes are not being used by any queries
    - Removing them improves write performance and reduces storage overhead
*/

DROP INDEX IF EXISTS idx_item_votes_item;
DROP INDEX IF EXISTS idx_item_votes_session;
DROP INDEX IF EXISTS idx_menu_items_accuracy;
DROP INDEX IF EXISTS idx_reality_photos_featured;
DROP INDEX IF EXISTS idx_votes_photo;
DROP INDEX IF EXISTS idx_uploads_created;
