-- =====================================================
-- COMPREHENSIVE ROW-LEVEL SECURITY (RLS) POLICIES
-- Created: 2026-02-15
-- Purpose: Restrict database access to authorized users only
-- =====================================================

-- =====================================================
-- 1. RSVPS TABLE
-- =====================================================
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Public can submit RSVPs (guest submissions)
CREATE POLICY "public_can_submit_rsvps"
  ON public.rsvps
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admins can view all RSVPs
CREATE POLICY "admin_can_view_rsvps"
  ON public.rsvps
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admins can update RSVPs (for management)
CREATE POLICY "admin_can_update_rsvps"
  ON public.rsvps
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Admins can delete RSVPs
CREATE POLICY "admin_can_delete_rsvps"
  ON public.rsvps
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 2. GUESTBOOK_MESSAGES TABLE
-- =====================================================
ALTER TABLE public.guestbook_messages ENABLE ROW LEVEL SECURITY;

-- Public can view approved messages only
CREATE POLICY "public_can_view_approved_messages"
  ON public.guestbook_messages
  FOR SELECT
  TO anon
  USING (approved = true);

-- Authenticated users can view all messages
CREATE POLICY "authenticated_can_view_all_messages"
  ON public.guestbook_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Public can submit messages (will need approval)
CREATE POLICY "public_can_submit_messages"
  ON public.guestbook_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admins can update messages (for moderation)
CREATE POLICY "admin_can_update_messages"
  ON public.guestbook_messages
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Admins can delete messages
CREATE POLICY "admin_can_delete_messages"
  ON public.guestbook_messages
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 3. PHOTOS TABLE
-- =====================================================
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Public can view approved photos only
CREATE POLICY "public_can_view_approved_photos"
  ON public.photos
  FOR SELECT
  TO anon
  USING (approved = true);

-- Authenticated users can view all photos
CREATE POLICY "authenticated_can_view_all_photos"
  ON public.photos
  FOR SELECT
  TO authenticated
  USING (true);

-- Public can upload photos (will need approval)
CREATE POLICY "public_can_upload_photos"
  ON public.photos
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admins can update photos (for moderation)
CREATE POLICY "admin_can_update_photos"
  ON public.photos
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Admins can delete photos
CREATE POLICY "admin_can_delete_photos"
  ON public.photos
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 4. CONTENT TABLE (CMS content)
-- =====================================================
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Public can read all content
CREATE POLICY "public_can_read_content"
  ON public.content
  FOR SELECT
  USING (true);

-- Admins can create content
CREATE POLICY "admin_can_create_content"
  ON public.content
  FOR INSERT
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Admins can update content
CREATE POLICY "admin_can_update_content"
  ON public.content
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Admins can delete content
CREATE POLICY "admin_can_delete_content"
  ON public.content
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 5. SONG_REQUESTS TABLE (if exists)
-- =====================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'song_requests') THEN
    ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;

    -- Public can submit song requests
    EXECUTE 'CREATE POLICY "public_can_submit_songs"
      ON public.song_requests
      FOR INSERT
      TO anon
      WITH CHECK (true)';

    -- Admins can view all song requests
    EXECUTE 'CREATE POLICY "admin_can_view_songs"
      ON public.song_requests
      FOR SELECT
      USING (auth.role() = ''authenticated'')';

    -- Admins can update song requests
    EXECUTE 'CREATE POLICY "admin_can_update_songs"
      ON public.song_requests
      FOR UPDATE
      USING (auth.role() = ''authenticated'')
      WITH CHECK (auth.role() = ''authenticated'')';

    -- Admins can delete song requests
    EXECUTE 'CREATE POLICY "admin_can_delete_songs"
      ON public.song_requests
      FOR DELETE
      USING (auth.role() = ''authenticated'')';
  END IF;
END $$;

-- =====================================================
-- VERIFICATION QUERIES (for testing)
-- =====================================================
-- To verify RLS is enabled, run:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
--
-- To verify policies exist, run:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
