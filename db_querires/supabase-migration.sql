-- ===============================================
-- MIGRATION: Create conversations and message limits system
-- ===============================================
-- Execute this SQL directly in Supabase SQL Editor
-- Go to: https://app.supabase.com/project/YOUR_PROJECT/sql
-- And run this entire script

-- ===============================================
-- 1. CREATE TABLES
-- ===============================================

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

-- ===============================================
-- 2. CREATE INDEXES
-- ===============================================

CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_daily_limits_user_date ON daily_message_limits(user_id, date);

-- ===============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ===============================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_message_limits ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- 4. CREATE RLS POLICIES
-- ===============================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their own limits" ON daily_message_limits;
DROP POLICY IF EXISTS "Users can update their own limits" ON daily_message_limits;
DROP POLICY IF EXISTS "Users can modify their limits" ON daily_message_limits;

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

-- ===============================================
-- 5. CREATE FUNCTIONS
-- ===============================================

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

-- ===============================================
-- MIGRATION COMPLETED
-- ===============================================
-- After running this script:
-- 1. Your conversations table will be created
-- 2. Your daily_message_limits table will be created
-- 3. Your messages table will have a conversation_id column
-- 4. All necessary functions will be created
-- 5. RLS policies will be set up
-- ===============================================