/*
  # Add message_type column to messages table

  This migration adds a message_type column to the messages table to support different types of messages:
  - 'text' (default) - Regular text messages  
  - 'beer_invite' - Beer invitation messages that should have special styling
  
  This allows for future expansion of message types while maintaining backward compatibility.
*/

-- Add message_type column with default value
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text';

-- Add index for message type queries
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);

-- Add a check constraint to ensure valid message types
ALTER TABLE messages 
ADD CONSTRAINT valid_message_type 
CHECK (message_type IN ('text', 'beer_invite'));