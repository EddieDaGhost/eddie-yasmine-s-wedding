-- =====================================================
-- Guest submissions: schema, row-level security, rate limits
-- Safe to run more than once. Paste into the Supabase SQL Editor and run.
--
-- WHY THIS EXISTS
-- ---------------
-- 20260215000000_add_rls_policies.sql opens with a bare
--   ALTER TABLE public.guestbook_messages ENABLE ROW LEVEL SECURITY;
-- but no table of that name has ever existed — the real table is `messages`.
-- The SQL Editor runs a script as one transaction, so that line aborts the
-- whole file and rolls back every policy in it, including the ones for rsvps.
-- 20260215000001_add_rate_limiting.sql fails the same way.
--
-- The practical result is that `messages` and `photos` very likely have no RLS
-- at all, leaving them readable, editable and deletable by anyone holding the
-- anon key — which ships in the client bundle. Check first:
--
--   SELECT relname, relrowsecurity FROM pg_class
--   WHERE relname IN ('messages','photos');
--
-- This script targets the tables that actually exist.
-- =====================================================


-- 1. Columns the guest forms write -------------------------------------

-- The message wall collects an author's name; `messages` had nowhere to put it.
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS author_name text;

-- Same for photo uploads.
ALTER TABLE public.photos   ADD COLUMN IF NOT EXISTS uploader_name text;

-- photos.guest_id is NOT NULL with a foreign key to `guests`, which an
-- anonymous guest cannot satisfy. Uploads are keyed by uploader_name instead.
ALTER TABLE public.photos   ALTER COLUMN guest_id DROP NOT NULL;

-- Posts are published immediately, so default the flag rather than relying on
-- every insert to set it.
ALTER TABLE public.messages ALTER COLUMN approved SET DEFAULT true;
ALTER TABLE public.photos   ALTER COLUMN approved SET DEFAULT true;


-- 2. Row-level security: messages --------------------------------------
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_can_view_approved_messages" ON public.messages;
CREATE POLICY "public_can_view_approved_messages"
  ON public.messages
  FOR SELECT
  TO anon
  USING (approved = true);

DROP POLICY IF EXISTS "public_can_submit_messages" ON public.messages;
CREATE POLICY "public_can_submit_messages"
  ON public.messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_can_view_all_messages" ON public.messages;
CREATE POLICY "admin_can_view_all_messages"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_can_manage_messages" ON public.messages;
CREATE POLICY "admin_can_manage_messages"
  ON public.messages
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- 3. Row-level security: photos ----------------------------------------
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_can_view_approved_photos" ON public.photos;
CREATE POLICY "public_can_view_approved_photos"
  ON public.photos
  FOR SELECT
  TO anon
  USING (approved = true);

DROP POLICY IF EXISTS "public_can_upload_photos" ON public.photos;
CREATE POLICY "public_can_upload_photos"
  ON public.photos
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_can_view_all_photos" ON public.photos;
CREATE POLICY "admin_can_view_all_photos"
  ON public.photos
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_can_manage_photos" ON public.photos;
CREATE POLICY "admin_can_manage_photos"
  ON public.photos
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- 4. Rate limits, rewritten --------------------------------------------
-- The original guestbook trigger keyed on NEW.name against a table with no
-- `name` column, so it would have rejected every insert at runtime. Re-keyed
-- onto author_name.
CREATE OR REPLACE FUNCTION check_message_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.author_name IS NULL THEN
    RETURN NEW;
  END IF;
  IF (
    SELECT COUNT(*)
    FROM public.messages
    WHERE author_name = NEW.author_name
      AND created_at > NOW() - INTERVAL '1 hour'
  ) >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before posting another message.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS guestbook_rate_limit_trigger ON public.messages;
DROP TRIGGER IF EXISTS message_rate_limit_trigger ON public.messages;
CREATE TRIGGER message_rate_limit_trigger
BEFORE INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION check_message_rate_limit();

-- The original photo limit was 10 per hour across the ENTIRE table, so the
-- first few guests at the reception would have locked out everyone else.
-- Now per uploader, and high enough for someone working through a camera roll.
CREATE OR REPLACE FUNCTION check_photo_upload_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.uploader_name IS NULL THEN
    RETURN NEW;
  END IF;
  IF (
    SELECT COUNT(*)
    FROM public.photos
    WHERE uploader_name = NEW.uploader_name
      AND created_at > NOW() - INTERVAL '1 hour'
  ) >= 100 THEN
    RAISE EXCEPTION 'Photo upload rate limit exceeded. Please try again later.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS photo_upload_rate_limit_trigger ON public.photos;
CREATE TRIGGER photo_upload_rate_limit_trigger
BEFORE INSERT ON public.photos
FOR EACH ROW
EXECUTE FUNCTION check_photo_upload_rate_limit();


-- 5. Storage bucket for guest photos -----------------------------------
-- Public read, so getPublicUrl() returns a URL the gallery can actually load.
INSERT INTO storage.buckets (id, name, public)
VALUES ('guest_photos', 'guest_photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "public_can_read_guest_photos" ON storage.objects;
CREATE POLICY "public_can_read_guest_photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'guest_photos');

DROP POLICY IF EXISTS "public_can_upload_guest_photos" ON storage.objects;
CREATE POLICY "public_can_upload_guest_photos"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'guest_photos');

DROP POLICY IF EXISTS "admin_can_manage_guest_photos" ON storage.objects;
CREATE POLICY "admin_can_manage_guest_photos"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'guest_photos')
  WITH CHECK (bucket_id = 'guest_photos');


NOTIFY pgrst, 'reload schema';


-- =====================================================
-- Diagnostics — run separately to confirm.
-- =====================================================
-- SELECT relname, relrowsecurity FROM pg_class
--   WHERE relname IN ('messages','photos','rsvps','invites');
-- SELECT tablename, policyname, cmd, roles FROM pg_policies
--   WHERE tablename IN ('messages','photos') ORDER BY tablename, policyname;
-- SELECT id, public FROM storage.buckets WHERE id = 'guest_photos';
