-- Invite delivery tracking + letting the admin reset invite open counts.
-- Safe to run more than once.

-- 1. Delivery status for each invite: not provided yet (default), dropped off, or mailed.
ALTER TABLE public.invites
  ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'not_provided';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invites_delivery_status_check'
  ) THEN
    ALTER TABLE public.invites
      ADD CONSTRAINT invites_delivery_status_check
      CHECK (delivery_status IN ('not_provided', 'dropped_off', 'mailed'));
  END IF;
END $$;

-- 2. Allow a signed-in admin to delete invite analytics rows
--    (used by the "Reset open counts" button on the Invites page).
DROP POLICY IF EXISTS "admin_can_delete_analytics" ON public.invite_analytics;
CREATE POLICY "admin_can_delete_analytics"
  ON public.invite_analytics
  FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');
