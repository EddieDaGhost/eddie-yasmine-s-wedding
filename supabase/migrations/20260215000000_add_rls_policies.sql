-- =====================================================
-- COMPREHENSIVE ROW-LEVEL SECURITY (RLS) POLICIES
-- Created: 2026-02-15
-- Purpose: Restrict database access to authorized users only
-- Idempotent: Safe to run multiple times
-- =====================================================

-- =====================================================
-- 1. RSVPS TABLE
-- =====================================================
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_can_submit_rsvps" ON public.rsvps;
CREATE POLICY "public_can_submit_rsvps"
  ON public.rsvps
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_can_view_rsvps" ON public.rsvps;
CREATE POLICY "admin_can_view_rsvps"
  ON public.rsvps
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin_can_update_rsvps" ON public.rsvps;
CREATE POLICY "admin_can_update_rsvps"
  ON public.rsvps
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin_can_delete_rsvps" ON public.rsvps;
CREATE POLICY "admin_can_delete_rsvps"
  ON public.rsvps
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 2. GUESTBOOK_MESSAGES TABLE
-- =====================================================
ALTER TABLE public.guestbook_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_can_view_approved_messages" ON public.guestbook_messages;
CREATE POLICY "public_can_view_approved_messages"
  ON public.guestbook_messages
  FOR SELECT
  TO anon
  USING (approved = true);

DROP POLICY IF EXISTS "authenticated_can_view_all_messages" ON public.guestbook_messages;
CREATE POLICY "authenticated_can_view_all_messages"
  ON public.guestbook_messages
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "public_can_submit_messages" ON public.guestbook_messages;
CREATE POLICY "public_can_submit_messages"
  ON public.guestbook_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_can_update_messages" ON public.guestbook_messages;
CREATE POLICY "admin_can_update_messages"
  ON public.guestbook_messages
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin_can_delete_messages" ON public.guestbook_messages;
CREATE POLICY "admin_can_delete_messages"
  ON public.guestbook_messages
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 3. PHOTOS TABLE
-- =====================================================
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_can_view_approved_photos" ON public.photos;
CREATE POLICY "public_can_view_approved_photos"
  ON public.photos
  FOR SELECT
  TO anon
  USING (approved = true);

DROP POLICY IF EXISTS "authenticated_can_view_all_photos" ON public.photos;
CREATE POLICY "authenticated_can_view_all_photos"
  ON public.photos
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "public_can_upload_photos" ON public.photos;
CREATE POLICY "public_can_upload_photos"
  ON public.photos
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_can_update_photos" ON public.photos;
CREATE POLICY "admin_can_update_photos"
  ON public.photos
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin_can_delete_photos" ON public.photos;
CREATE POLICY "admin_can_delete_photos"
  ON public.photos
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 4. CONTENT TABLE (CMS content)
-- =====================================================
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_can_read_content" ON public.content;
CREATE POLICY "public_can_read_content"
  ON public.content
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "admin_can_create_content" ON public.content;
CREATE POLICY "admin_can_create_content"
  ON public.content
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin_can_update_content" ON public.content;
CREATE POLICY "admin_can_update_content"
  ON public.content
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin_can_delete_content" ON public.content;
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

    EXECUTE 'DROP POLICY IF EXISTS "public_can_submit_songs" ON public.song_requests';
    EXECUTE 'CREATE POLICY "public_can_submit_songs"
      ON public.song_requests
      FOR INSERT
      TO anon
      WITH CHECK (true)';

    EXECUTE 'DROP POLICY IF EXISTS "admin_can_view_songs" ON public.song_requests';
    EXECUTE 'CREATE POLICY "admin_can_view_songs"
      ON public.song_requests
      FOR SELECT
      USING (auth.role() = ''authenticated'')';

    EXECUTE 'DROP POLICY IF EXISTS "admin_can_update_songs" ON public.song_requests';
    EXECUTE 'CREATE POLICY "admin_can_update_songs"
      ON public.song_requests
      FOR UPDATE
      USING (auth.role() = ''authenticated'')
      WITH CHECK (auth.role() = ''authenticated'')';

    EXECUTE 'DROP POLICY IF EXISTS "admin_can_delete_songs" ON public.song_requests';
    EXECUTE 'CREATE POLICY "admin_can_delete_songs"
      ON public.song_requests
      FOR DELETE
      USING (auth.role() = ''authenticated'')';
  END IF;
END $$;

-- =====================================================
-- 6. EVENTS TABLE
-- =====================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

    EXECUTE 'DROP POLICY IF EXISTS "public_can_read_events" ON public.events';
    EXECUTE 'CREATE POLICY "public_can_read_events"
      ON public.events
      FOR SELECT
      USING (true)';

    EXECUTE 'DROP POLICY IF EXISTS "admin_can_manage_events" ON public.events';
    EXECUTE 'CREATE POLICY "admin_can_manage_events"
      ON public.events
      FOR ALL
      USING (auth.role() = ''authenticated'')
      WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
END $$;

-- =====================================================
-- 7. INVITES TABLE
-- =====================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invites') THEN
    ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

    -- Public can read invites (needed for invite code lookup)
    EXECUTE 'DROP POLICY IF EXISTS "public_can_read_invites" ON public.invites';
    EXECUTE 'CREATE POLICY "public_can_read_invites"
      ON public.invites
      FOR SELECT
      USING (true)';

    -- Only admins can create/update/delete invites
    EXECUTE 'DROP POLICY IF EXISTS "admin_can_manage_invites" ON public.invites';
    EXECUTE 'CREATE POLICY "admin_can_manage_invites"
      ON public.invites
      FOR ALL
      USING (auth.role() = ''authenticated'')
      WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
END $$;

-- =====================================================
-- 8. PAGE_DRAFTS TABLE
-- =====================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'page_drafts') THEN
    ALTER TABLE public.page_drafts ENABLE ROW LEVEL SECURITY;

    -- Only admins can access page drafts
    EXECUTE 'DROP POLICY IF EXISTS "admin_can_manage_drafts" ON public.page_drafts';
    EXECUTE 'CREATE POLICY "admin_can_manage_drafts"
      ON public.page_drafts
      FOR ALL
      USING (auth.role() = ''authenticated'')
      WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
END $$;

-- =====================================================
-- 9. INVITE_ANALYTICS TABLE
-- =====================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invite_analytics') THEN
    ALTER TABLE public.invite_analytics ENABLE ROW LEVEL SECURITY;

    -- Public can insert analytics events (tracking invite opens)
    EXECUTE 'DROP POLICY IF EXISTS "public_can_insert_analytics" ON public.invite_analytics';
    EXECUTE 'CREATE POLICY "public_can_insert_analytics"
      ON public.invite_analytics
      FOR INSERT
      TO anon
      WITH CHECK (true)';

    -- Only admins can read analytics
    EXECUTE 'DROP POLICY IF EXISTS "admin_can_read_analytics" ON public.invite_analytics';
    EXECUTE 'CREATE POLICY "admin_can_read_analytics"
      ON public.invite_analytics
      FOR SELECT
      USING (auth.role() = ''authenticated'')';
  END IF;
END $$;

-- =====================================================
-- 10. MESSAGES TABLE (if separate from guestbook_messages)
-- =====================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') THEN
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

    EXECUTE 'DROP POLICY IF EXISTS "public_can_view_approved_msg" ON public.messages';
    EXECUTE 'CREATE POLICY "public_can_view_approved_msg"
      ON public.messages
      FOR SELECT
      TO anon
      USING (approved = true)';

    EXECUTE 'DROP POLICY IF EXISTS "authenticated_can_view_all_msg" ON public.messages';
    EXECUTE 'CREATE POLICY "authenticated_can_view_all_msg"
      ON public.messages
      FOR SELECT
      TO authenticated
      USING (true)';

    EXECUTE 'DROP POLICY IF EXISTS "public_can_submit_msg" ON public.messages';
    EXECUTE 'CREATE POLICY "public_can_submit_msg"
      ON public.messages
      FOR INSERT
      TO anon
      WITH CHECK (true)';

    EXECUTE 'DROP POLICY IF EXISTS "admin_can_manage_msg" ON public.messages';
    EXECUTE 'CREATE POLICY "admin_can_manage_msg"
      ON public.messages
      FOR ALL
      USING (auth.role() = ''authenticated'')
      WITH CHECK (auth.role() = ''authenticated'')';
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
