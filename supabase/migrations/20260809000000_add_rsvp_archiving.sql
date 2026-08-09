-- Allow an RSVP to be reset without losing it.
--
-- Resetting marks the RSVP archived and frees the invite so the guest can
-- respond again. The original row stays in the table so an accidental reset
-- can be reviewed — and recovered — from the admin RSVP list.
ALTER TABLE public.rsvps ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Archived rows are excluded from every active view, so index for that.
CREATE INDEX IF NOT EXISTS rsvps_archived_at_idx ON public.rsvps (archived_at);

-- Admins reset RSVPs from the dashboard, which authenticates via Supabase Auth.
DROP POLICY IF EXISTS "admin_can_update_rsvps" ON public.rsvps;
CREATE POLICY "admin_can_update_rsvps"
  ON public.rsvps
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

NOTIFY pgrst, 'reload schema';
