-- Add custom_message column to invites table for personalized invite messages
ALTER TABLE invites ADD COLUMN IF NOT EXISTS custom_message text;
