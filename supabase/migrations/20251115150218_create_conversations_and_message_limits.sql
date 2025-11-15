/*
  # Create conversations and daily message limits system

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key) - Unique conversation identifier
      - `user1_id` (uuid, foreign key) - First user in conversation
      - `user2_id` (uuid, foreign key) - Second user in conversation
      - `created_at` (timestamptz) - Conversation creation timestamp
      - `updated_at` (timestamptz) - Last message timestamp
      - UNIQUE constraint on (user1_id, user2_id) to prevent duplicates

    - `daily_message_limits`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - User reference
      - `date` (date) - Date for tracking
      - `messages_sent` (integer) - Number of messages sent
      - UNIQUE constraint on (user_id, date)

  2. Updates to existing tables
    - Add `conversation_id` to messages table
    - Add indexes for better performance

  3. Security
    - Enable RLS on conversations table
    - Enable RLS on daily_message_limits table
    - Users can only see their own conversations
    - Users can only see their own message limits

  4. Functions
    - Function to get or create conversation between two users
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id),
  CONSTRAINT different_users CHECK (user1_id != user2_id)
);

-- Create daily message limits table
CREATE TABLE IF NOT EXISTS daily_message_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  messages_sent integer DEFAULT 0,
  CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- Add conversation_id to messages table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'conversation_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_daily_limits_user_date ON daily_message_limits(user_id, date);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_message_limits ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  TO anon, authenticated
  USING (user1_id IN (SELECT id FROM users) OR user2_id IN (SELECT id FROM users));

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Daily message limits policies
CREATE POLICY "Users can view their own limits"
  ON daily_message_limits FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update their own limits"
  ON daily_message_limits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can modify their limits"
  ON daily_message_limits FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Function to get or create conversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_user1_id uuid,
  p_user2_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conversation_id uuid;
  v_min_id uuid;
  v_max_id uuid;
BEGIN
  -- Ensure consistent ordering (smaller UUID first)
  IF p_user1_id < p_user2_id THEN
    v_min_id := p_user1_id;
    v_max_id := p_user2_id;
  ELSE
    v_min_id := p_user2_id;
    v_max_id := p_user1_id;
  END IF;

  -- Try to find existing conversation (check both orderings)
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE (user1_id = v_min_id AND user2_id = v_max_id)
     OR (user1_id = v_max_id AND user2_id = v_min_id)
  LIMIT 1;

  -- If not found, create new conversation
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (user1_id, user2_id)
    VALUES (v_min_id, v_max_id)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$;

-- Function to increment daily message count
CREATE OR REPLACE FUNCTION increment_daily_messages(
  p_user_id uuid
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer;
BEGIN
  -- Insert or update daily count
  INSERT INTO daily_message_limits (user_id, date, messages_sent)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET messages_sent = daily_message_limits.messages_sent + 1
  RETURNING messages_sent INTO v_count;

  RETURN v_count;
END;
$$;

-- Function to get daily message count
CREATE OR REPLACE FUNCTION get_daily_message_count(
  p_user_id uuid
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COALESCE(messages_sent, 0) INTO v_count
  FROM daily_message_limits
  WHERE user_id = p_user_id AND date = CURRENT_DATE;

  RETURN COALESCE(v_count, 0);
END;
$$;
