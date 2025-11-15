/*
  # Complete Beer Invite System Migration
  
  This migration creates the complete beer invitation system by:
  1. Creating the beers_sent table for tracking beer invitations
  2. Adding the message_type column to support different message types
  3. Setting up proper indexes and constraints
  
  Run this script in your Supabase SQL Editor to enable beer invitations.
*/

-- Step 1: Create beers_sent table for tracking beer invitations
CREATE TABLE IF NOT EXISTS beers_sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false,
  CONSTRAINT different_users_beer CHECK (sender_id != recipient_id)
);

-- Step 2: Create indexes for beers_sent table
CREATE INDEX IF NOT EXISTS idx_beers_sender ON beers_sent(sender_id);
CREATE INDEX IF NOT EXISTS idx_beers_recipient ON beers_sent(recipient_id);
CREATE INDEX IF NOT EXISTS idx_beers_created ON beers_sent(created_at DESC);

-- Step 3: Enable RLS on beers_sent table
ALTER TABLE beers_sent ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies for beers_sent table
CREATE POLICY "Users can send beers"
  ON beers_sent FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view beers they sent or received"
  ON beers_sent FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can mark received beers as read"
  ON beers_sent FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Step 5: Add message_type column to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text';

-- Step 6: Create index for message type queries
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);

-- Step 7: Add constraint to ensure valid message types
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS valid_message_type;

ALTER TABLE messages 
ADD CONSTRAINT valid_message_type 
CHECK (message_type IN ('text', 'beer_invite'));

-- Step 8: Create helper functions for beer counting
CREATE OR REPLACE FUNCTION get_beers_received_count(
  p_user_id uuid
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM beers_sent
  WHERE recipient_id = p_user_id;

  RETURN COALESCE(v_count, 0);
END;
$$;

CREATE OR REPLACE FUNCTION get_unread_beers_count(
  p_user_id uuid
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM beers_sent
  WHERE recipient_id = p_user_id AND read = false;

  RETURN COALESCE(v_count, 0);
END;
$$;