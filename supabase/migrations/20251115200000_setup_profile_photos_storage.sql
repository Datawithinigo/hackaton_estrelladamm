/*
  # Setup Profile Photos Storage

  1. Create storage bucket for profile photos
  2. Set up storage policies for public access
  3. Update users table to support proper image URLs
*/

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Public Access for Profile Photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

CREATE POLICY "Authenticated users can upload profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-photos');

-- Add auth_user_id field to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id uuid;

-- Create index on auth_user_id for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- Update existing users with email column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS email text;

-- Create index on email for better performance  
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);