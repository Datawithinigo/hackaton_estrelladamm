-- Execute this script directly in your Supabase database
-- New message limits system: Base 30 messages + level bonuses + promo bonuses

-- Add bonus_messages column to daily_message_limits if it doesn't exist
ALTER TABLE daily_message_limits ADD COLUMN IF NOT EXISTS bonus_messages integer DEFAULT 0;

-- Function to get level-based message bonus
CREATE OR REPLACE FUNCTION get_level_message_bonus(
  p_user_level text
)
RETURNS integer
LANGUAGE plpgsql
AS $$
BEGIN
  CASE p_user_level
    WHEN 'Oro' THEN
      RETURN 10; -- Oro gets +10 messages
    WHEN 'Plata' THEN
      RETURN 5; -- Plata gets +5 messages
    ELSE
      RETURN 0; -- Bronce gets no bonus
  END CASE;
END;
$$;

-- Update the increment_daily_messages function to handle bonus messages and user level
CREATE OR REPLACE FUNCTION increment_daily_messages(
  p_user_id uuid,
  p_user_level text DEFAULT 'Bronce'
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_sent integer;
  v_bonus_messages integer;
  v_level_bonus integer;
  v_total_available integer;
  v_base_limit integer := 30; -- New base daily limit
  v_max_limit integer := 30; -- Maximum daily limit (before bonus messages)
BEGIN
  -- Get level-based bonus
  v_level_bonus := get_level_message_bonus(p_user_level);
  
  -- Get current state
  SELECT COALESCE(messages_sent, 0), COALESCE(bonus_messages, 0)
  INTO v_current_sent, v_bonus_messages
  FROM daily_message_limits
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  -- If no record exists, create one
  IF v_current_sent IS NULL THEN
    v_current_sent := 0;
    v_bonus_messages := 0;
  END IF;
  
  -- Calculate total available messages
  -- Level bonus is capped at the max limit, but promo bonus messages can exceed it
  v_total_available := LEAST(v_base_limit + v_level_bonus, v_max_limit) + v_bonus_messages;
  
  -- Check if user can send more messages
  IF v_current_sent >= v_total_available THEN
    RETURN json_build_object(
      'success', false,
      'messages_sent', v_current_sent,
      'bonus_messages', v_bonus_messages,
      'level_bonus', v_level_bonus,
      'total_available', v_total_available,
      'can_send', false
    );
  END IF;
  
  -- Increment message count
  INSERT INTO daily_message_limits (user_id, date, messages_sent, bonus_messages)
  VALUES (p_user_id, CURRENT_DATE, 1, 0)
  ON CONFLICT (user_id, date)
  DO UPDATE SET messages_sent = daily_message_limits.messages_sent + 1
  RETURNING messages_sent, bonus_messages INTO v_current_sent, v_bonus_messages;

  RETURN json_build_object(
    'success', true,
    'messages_sent', v_current_sent,
    'bonus_messages', v_bonus_messages,
    'level_bonus', v_level_bonus,
    'total_available', LEAST(v_base_limit + v_level_bonus, v_max_limit) + v_bonus_messages,
    'can_send', v_current_sent < (LEAST(v_base_limit + v_level_bonus, v_max_limit) + v_bonus_messages)
  );
END;
$$;

-- Function to get current message status
CREATE OR REPLACE FUNCTION get_message_status(
  p_user_id uuid,
  p_user_level text DEFAULT 'Bronce'
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_sent integer;
  v_bonus_messages integer;
  v_level_bonus integer;
  v_base_limit integer := 30;
  v_max_limit integer := 30;
BEGIN
  -- Get level-based bonus
  v_level_bonus := get_level_message_bonus(p_user_level);
  
  SELECT COALESCE(messages_sent, 0), COALESCE(bonus_messages, 0)
  INTO v_current_sent, v_bonus_messages
  FROM daily_message_limits
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  -- If no record exists, return defaults
  IF v_current_sent IS NULL THEN
    v_current_sent := 0;
    v_bonus_messages := 0;
  END IF;

  RETURN json_build_object(
    'messages_sent', v_current_sent,
    'bonus_messages', v_bonus_messages,
    'level_bonus', v_level_bonus,
    'base_limit', v_base_limit,
    'max_limit', v_max_limit,
    'total_available', LEAST(v_base_limit + v_level_bonus, v_max_limit) + v_bonus_messages,
    'can_send', v_current_sent < (LEAST(v_base_limit + v_level_bonus, v_max_limit) + v_bonus_messages),
    'remaining', GREATEST(0, (LEAST(v_base_limit + v_level_bonus, v_max_limit) + v_bonus_messages) - v_current_sent)
  );
END;
$$;

-- Update the add_bonus_messages function to properly handle bonus messages
CREATE OR REPLACE FUNCTION add_bonus_messages(
  p_user_id uuid,
  p_bonus_messages integer,
  p_reason text DEFAULT 'bonus'
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert or update today's daily limit with bonus messages
  INSERT INTO daily_message_limits (user_id, date, messages_sent, bonus_messages)
  VALUES (p_user_id, CURRENT_DATE, 0, p_bonus_messages)
  ON CONFLICT (user_id, date)
  DO UPDATE SET bonus_messages = daily_message_limits.bonus_messages + p_bonus_messages;
  
  RETURN true;
END;
$$;