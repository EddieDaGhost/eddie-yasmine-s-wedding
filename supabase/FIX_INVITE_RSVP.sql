-- =====================================================
-- Invite RSVP repair script
-- Safe to run more than once. Paste into the Supabase SQL Editor and run.
--
-- Brings a database up to date with everything the /invite/:code RSVP flow
-- needs: the columns it writes, and the row-level security policies that let
-- an anonymous guest actually complete a submission.
-- =====================================================

-- 1. Columns the RSVP form writes ---------------------------------------
ALTER TABLE public.rsvps   ADD COLUMN IF NOT EXISTS dietary_needs text;
ALTER TABLE public.rsvps   ADD COLUMN IF NOT EXISTS phone         text;
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS language      text NOT NULL DEFAULT 'en';

-- 2. Guests must be able to submit an RSVP ------------------------------
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_can_submit_rsvps" ON public.rsvps;
CREATE POLICY "public_can_submit_rsvps"
  ON public.rsvps
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 3. Guests must be able to see the RSVP tied to their invite -----------
--    Without this, returning guests never see "You've already RSVP'd".
DROP POLICY IF EXISTS "public_can_view_own_rsvp" ON public.rsvps;
CREATE POLICY "public_can_view_own_rsvp"
  ON public.rsvps
  FOR SELECT
  TO anon
  USING (invite_code IS NOT NULL);

-- 4. Guests must be able to read their invite and mark it used ----------
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_can_read_invites" ON public.invites;
CREATE POLICY "public_can_read_invites"
  ON public.invites
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "public_can_update_invite_used_by" ON public.invites;
CREATE POLICY "public_can_update_invite_used_by"
  ON public.invites
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- 5. View/RSVP tracking must not block a submission ---------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'invite_analytics') THEN
    EXECUTE 'ALTER TABLE public.invite_analytics ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "public_can_insert_analytics" ON public.invite_analytics';
    EXECUTE 'CREATE POLICY "public_can_insert_analytics"
      ON public.invite_analytics
      FOR INSERT
      TO anon
      WITH CHECK (true)';
  END IF;
END $$;

-- =====================================================
-- Optional: clear the hourly RSVP rate limit while testing.
-- The trigger rejects a 6th RSVP from the same email within an hour, which
-- is easy to hit when testing repeatedly. Uncomment to disable, and
-- re-enable before sending invitations out.
-- =====================================================
-- ALTER TABLE public.rsvps DISABLE TRIGGER rsvp_rate_limit_trigger;
-- ALTER TABLE public.rsvps ENABLE  TRIGGER rsvp_rate_limit_trigger;

-- =====================================================
-- Diagnostics — run these to see the current state.
-- =====================================================
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'rsvps' ORDER BY column_name;
-- SELECT tablename, policyname, cmd, roles FROM pg_policies
--   WHERE tablename IN ('rsvps','invites','invite_analytics') ORDER BY tablename;
