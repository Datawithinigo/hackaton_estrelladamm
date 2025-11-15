/*
  # Update profile photos to use base64 storage

  1. Update profile_photo_url column to store base64 strings directly
  2. Remove storage bucket dependencies  
  3. Update existing users with storage URLs to use base64 placeholder
*/

-- Update the profile_photo_url column to accommodate larger base64 strings
ALTER TABLE users ALTER COLUMN profile_photo_url TYPE TEXT;

-- Add a comment to clarify the new usage
COMMENT ON COLUMN users.profile_photo_url IS 'Base64 encoded image data with data URL format (e.g., data:image/jpeg;base64,...)';

-- Update existing users that have storage URLs to null (they'll need to re-upload)
-- This is safer than trying to convert existing images
UPDATE users 
SET profile_photo_url = NULL 
WHERE profile_photo_url IS NOT NULL 
  AND profile_photo_url LIKE '%storage.supabase%';

-- Note: The storage bucket and policies can remain for backward compatibility
-- if needed, but new uploads will use base64 storage in the database