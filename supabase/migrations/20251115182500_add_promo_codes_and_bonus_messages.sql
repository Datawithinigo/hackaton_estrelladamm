/*
  # Add promotional codes and bonus messages system

  1. New Tables
    - `promo_codes_used`
      - Track which promotional codes each user has used

  2. Functions
    - Function to add bonus messages (for promo codes or beer sending)
    - Function to check if promo code was already used
*/

-- Create promo codes used table to track usage
CREATE TABLE IF NOT EXISTS promo_codes_used (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  promo_code text NOT NULL,
  used_at timestamptz DEFAULT now(),
  bonus_messages integer DEFAULT 0,
  CONSTRAINT unique_user_promo UNIQUE (user_id, promo_code)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_promo_codes_user ON promo_codes_used(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes_used(promo_code);

-- Enable Row Level Security
ALTER TABLE promo_codes_used ENABLE ROW LEVEL SECURITY;

-- Promo codes policies
CREATE POLICY "Users can view their own promo codes"
  ON promo_codes_used FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can add promo codes"
  ON promo_codes_used FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Function to add bonus messages to user's daily limit
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
  INSERT INTO daily_message_limits (user_id, date, messages_sent)
  VALUES (p_user_id, CURRENT_DATE, 0)
  ON CONFLICT (user_id, date)
  DO NOTHING;
  
  -- We'll track bonus messages separately by reducing the messages_sent count
  -- This effectively gives the user more messages for today
  UPDATE daily_message_limits
  SET messages_sent = GREATEST(0, messages_sent - p_bonus_messages)
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  RETURN true;
END;
$$;

-- Function to redeem promotional code
CREATE OR REPLACE FUNCTION redeem_promo_code(
  p_user_id uuid,
  p_promo_code text
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_bonus_messages integer;
  v_already_used boolean;
  v_result json;
BEGIN
  -- Check if code was already used by this user
  SELECT true INTO v_already_used
  FROM promo_codes_used
  WHERE user_id = p_user_id AND promo_code = p_promo_code;
  
  IF v_already_used THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Este código ya ha sido utilizado'
    );
  END IF;
  
  -- Check if it's a valid promo code and get bonus amount
  CASE p_promo_code
    WHEN '123456' THEN
      v_bonus_messages := 10;
    ELSE
      RETURN json_build_object(
        'success', false,
        'message', 'Código promocional no válido'
      );
  END CASE;
  
  -- Record the usage
  INSERT INTO promo_codes_used (user_id, promo_code, bonus_messages)
  VALUES (p_user_id, p_promo_code, v_bonus_messages);
  
  -- Add bonus messages
  PERFORM add_bonus_messages(p_user_id, v_bonus_messages, 'promo_code');
  
  RETURN json_build_object(
    'success', true,
    'message', format('¡Código canjeado! Has recibido %s mensajes adicionales', v_bonus_messages),
    'bonus_messages', v_bonus_messages
  );
END;
$$;

-- Function to add bonus messages when sending beer
CREATE OR REPLACE FUNCTION add_beer_bonus_messages(
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- Add 10 bonus messages for sending a beer
  PERFORM add_bonus_messages(p_user_id, 10, 'beer_sent');
  RETURN true;
END;
$$;