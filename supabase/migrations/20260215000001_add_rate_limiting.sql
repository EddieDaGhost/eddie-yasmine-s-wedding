-- =====================================================
-- RATE LIMITING FOR PUBLIC SUBMISSIONS
-- Created: 2026-02-15
-- Purpose: Prevent spam and abuse via database triggers
-- =====================================================

-- =====================================================
-- 1. RSVP RATE LIMITING
-- Max 5 submissions per email per hour
-- =====================================================
CREATE OR REPLACE FUNCTION check_rsvp_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM public.rsvps
    WHERE email = NEW.email
    AND created_at > NOW() - INTERVAL '1 hour'
  ) >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rsvp_rate_limit_trigger
BEFORE INSERT ON public.rsvps
FOR EACH ROW
EXECUTE FUNCTION check_rsvp_rate_limit();

-- =====================================================
-- 2. GUESTBOOK MESSAGE RATE LIMITING
-- Max 3 messages per name per hour
-- =====================================================
CREATE OR REPLACE FUNCTION check_guestbook_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM public.guestbook_messages
    WHERE name = NEW.name
    AND created_at > NOW() - INTERVAL '1 hour'
  ) >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before posting another message.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guestbook_rate_limit_trigger
BEFORE INSERT ON public.guestbook_messages
FOR EACH ROW
EXECUTE FUNCTION check_guestbook_rate_limit();

-- =====================================================
-- 3. PHOTO UPLOAD RATE LIMITING
-- Max 10 photos per hour (by created_at timestamp)
-- =====================================================
CREATE OR REPLACE FUNCTION check_photo_upload_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_uploads INTEGER;
BEGIN
  -- Count recent uploads (last hour)
  SELECT COUNT(*)
  INTO recent_uploads
  FROM public.photos
  WHERE created_at > NOW() - INTERVAL '1 hour';

  IF recent_uploads >= 10 THEN
    RAISE EXCEPTION 'Photo upload rate limit exceeded. Please try again later.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER photo_upload_rate_limit_trigger
BEFORE INSERT ON public.photos
FOR EACH ROW
EXECUTE FUNCTION check_photo_upload_rate_limit();

-- =====================================================
-- 4. SONG REQUEST RATE LIMITING (if table exists)
-- Max 5 requests per email per hour
-- =====================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'song_requests') THEN
    EXECUTE '
      CREATE OR REPLACE FUNCTION check_song_request_rate_limit()
      RETURNS TRIGGER AS $func$
      BEGIN
        IF (
          SELECT COUNT(*)
          FROM public.song_requests
          WHERE email = NEW.email
          AND created_at > NOW() - INTERVAL ''1 hour''
        ) >= 5 THEN
          RAISE EXCEPTION ''Too many song requests. Please try again later.'';
        END IF;
        RETURN NEW;
      END;
      $func$ LANGUAGE plpgsql;
    ';

    EXECUTE '
      CREATE TRIGGER song_request_rate_limit_trigger
      BEFORE INSERT ON public.song_requests
      FOR EACH ROW
      EXECUTE FUNCTION check_song_request_rate_limit();
    ';
  END IF;
END $$;

-- =====================================================
-- TESTING RATE LIMITS
-- =====================================================
-- To test, try inserting multiple records rapidly:
-- INSERT INTO rsvps (email, name, ...) VALUES ('[email protected]', 'Test', ...);
-- The 6th insert within an hour should fail with rate limit error
