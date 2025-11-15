/*
  # Fix Message Limits per Tier
  
  Changes the base message limits to:
  - Bronce: 5 messages/day
  - Plata: 10 messages/day
  - Oro: 15 messages/day
  
  Also fixes beer invitation to properly add bonus messages.
*/

-- Function to get base message limit based on user level
CREATE OR REPLACE FUNCTION get_base_message_limit(
  p_user_level text
)
RETURNS integer
LANGUAGE plpgsql
AS $$
BEGIN
  CASE p_user_level
    WHEN 'Oro' THEN
      RETURN 15; -- Oro gets 15 messages
    WHEN 'Plata' THEN
      RETURN 10; -- Plata gets 10 messages
    ELSE
      RETURN 5; -- Bronce gets 5 messages
  END CASE;
END;
$$;

-- Update the get_message_status function with new base limits
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
  v_base_limit integer;
BEGIN
  -- Get base limit for user level
  v_base_limit := get_base_message_limit(p_user_level);
  
  SELECT COALESCE(messages_sent, 0), COALESCE(bonus_messages, 0)
  INTO v_current_sent, v_bonus_messages
  FROM daily_message_limits
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  -- If no record exists, return defaults
  IF v_current_sent IS NULL THEN
    v_current_sent := 0;
    v_bonus_messages := 0;
  END IF;

  -- Total available = base limit + bonus messages
  RETURN json_build_object(
    'messages_sent', v_current_sent,
    'bonus_messages', v_bonus_messages,
    'level_bonus', 0, -- No additional level bonus, it's in base_limit
    'base_limit', v_base_limit,
    'total_available', v_base_limit + v_bonus_messages,
    'can_send', v_current_sent < (v_base_limit + v_bonus_messages),
    'remaining', GREATEST(0, (v_base_limit + v_bonus_messages) - v_current_sent)
  );
END;
$$;

-- Update the increment_daily_messages function with new limits
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
  v_base_limit integer;
  v_total_available integer;
BEGIN
  -- Get base limit for user level
  v_base_limit := get_base_message_limit(p_user_level);
  
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
  v_total_available := v_base_limit + v_bonus_messages;
  
  -- Check if user can send more messages
  IF v_current_sent >= v_total_available THEN
    RETURN json_build_object(
      'success', false,
      'messages_sent', v_current_sent,
      'bonus_messages', v_bonus_messages,
      'level_bonus', 0,
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
    'level_bonus', 0,
    'total_available', v_base_limit + v_bonus_messages,
    'can_send', v_current_sent < (v_base_limit + v_bonus_messages)
  );
END;
$$;

-- Function to add bonus messages from beer invitations
CREATE OR REPLACE FUNCTION add_beer_bonus_messages(
  p_user_id uuid,
  p_bonus_amount integer DEFAULT 10
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_new_bonus integer;
BEGIN
  -- Add bonus messages to today's record
  INSERT INTO daily_message_limits (user_id, date, messages_sent, bonus_messages)
  VALUES (p_user_id, CURRENT_DATE, 0, p_bonus_amount)
  ON CONFLICT (user_id, date)
  DO UPDATE SET bonus_messages = daily_message_limits.bonus_messages + p_bonus_amount
  RETURNING bonus_messages INTO v_new_bonus;
  
  RETURN json_build_object(
    'success', true,
    'bonus_messages_added', p_bonus_amount,
    'total_bonus_messages', v_new_bonus
  );
END;
$$;

-- Drop old function that's no longer needed
DROP FUNCTION IF EXISTS get_level_message_bonus(text);
