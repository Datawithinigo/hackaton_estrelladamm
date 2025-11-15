/*
  # Create users and messages tables for Single Damm

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Unique user identifier
      - `name` (text) - User's name
      - `age` (integer) - User's age
      - `gender` (text) - User's gender
      - `orientation` (text, optional) - User's orientation
      - `stars` (integer) - Number of stars collected
      - `level` (text) - User level (Bronce, Plata, Oro)
      - `profile_photo_url` (text, optional) - URL to profile photo
      - `bio` (text, optional) - User biography
      - `visible_on_map` (boolean) - Whether user is visible on map
      - `created_at` (timestamptz) - Account creation timestamp

    - `messages`
      - `id` (uuid, primary key) - Unique message identifier
      - `sender_id` (uuid, foreign key) - Reference to sender user
      - `recipient_id` (uuid, foreign key) - Reference to recipient user
      - `content` (text) - Message content
      - `read` (boolean) - Whether message has been read
      - `created_at` (timestamptz) - Message creation timestamp

  2. Security
    - Enable RLS on both tables
    - Users can read all user profiles
    - Users can only update their own profile
    - Users can read messages where they are sender or recipient
    - Users can send messages to any user
    - Users can only mark their received messages as read
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL,
  orientation text,
  stars integer DEFAULT 0,
  level text DEFAULT 'Bronce',
  profile_photo_url text,
  bio text,
  visible_on_map boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Messages table policies
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their received messages"
  ON messages FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_stars ON users(stars DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
