-- Add dietary_needs to rsvps so the invite RSVP form can record dietary
-- restrictions collected after all meal selections are made.
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS dietary_needs text;
