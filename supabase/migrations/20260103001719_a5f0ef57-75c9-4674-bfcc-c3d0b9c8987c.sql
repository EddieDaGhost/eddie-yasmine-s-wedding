-- Add CHECK constraints for server-side input validation on rsvps table
-- This ensures data integrity even if client-side validation is bypassed

-- Add constraint for name length (1-100 characters)
ALTER TABLE public.rsvps 
ADD CONSTRAINT rsvps_name_length 
CHECK (name IS NULL OR (char_length(name) >= 1 AND char_length(name) <= 100));

-- Add constraint for email format validation
ALTER TABLE public.rsvps 
ADD CONSTRAINT rsvps_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add constraint for guests (1-10 range)
ALTER TABLE public.rsvps 
ADD CONSTRAINT rsvps_guests_range 
CHECK (guests IS NULL OR (guests >= 1 AND guests <= 10));

-- Add constraint for message length (max 2000 characters)
ALTER TABLE public.rsvps 
ADD CONSTRAINT rsvps_message_length 
CHECK (message IS NULL OR char_length(message) <= 2000);

-- Add CHECK constraints for messages table
ALTER TABLE public.messages 
ADD CONSTRAINT messages_content_length 
CHECK (content IS NULL OR (char_length(content) >= 1 AND char_length(content) <= 2000));

-- Add CHECK constraints for song_requests table
ALTER TABLE public.song_requests 
ADD CONSTRAINT song_requests_title_length 
CHECK (title IS NULL OR (char_length(title) >= 1 AND char_length(title) <= 200));

ALTER TABLE public.song_requests 
ADD CONSTRAINT song_requests_artist_length 
CHECK (artist IS NULL OR (char_length(artist) >= 1 AND char_length(artist) <= 200));