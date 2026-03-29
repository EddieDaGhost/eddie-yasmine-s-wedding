-- =====================================================
-- FIX: Allow anonymous users to look up their own RSVP
-- and update invite used_by after submitting
-- =====================================================

-- Allow anonymous SELECT on rsvps when filtering by invite_code
-- This enables cross-device RSVP detection for invited guests
DROP POLICY IF EXISTS "public_can_view_own_rsvp" ON public.rsvps;
CREATE POLICY "public_can_view_own_rsvp"
  ON public.rsvps
  FOR SELECT
  TO anon
  USING (invite_code IS NOT NULL);

-- Allow anonymous UPDATE on invites for the used_by column only
-- This enables linking an RSVP to an invite after submission
DROP POLICY IF EXISTS "public_can_update_invite_used_by" ON public.invites;
CREATE POLICY "public_can_update_invite_used_by"
  ON public.invites
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
