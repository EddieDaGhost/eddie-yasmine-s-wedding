-- Add phone column to rsvps table
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS phone text;
