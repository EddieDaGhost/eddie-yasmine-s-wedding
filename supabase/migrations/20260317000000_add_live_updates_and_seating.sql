-- =====================================================
-- LIVE UPDATES TABLE
-- Purpose: Real-time wedding day updates pushed by admin
-- =====================================================
CREATE TABLE IF NOT EXISTS public.live_updates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.live_updates ENABLE ROW LEVEL SECURITY;

-- Everyone can read live updates
DROP POLICY IF EXISTS "public_can_read_live_updates" ON public.live_updates;
CREATE POLICY "public_can_read_live_updates"
  ON public.live_updates
  FOR SELECT
  USING (true);

-- Only admins can manage live updates
DROP POLICY IF EXISTS "admin_can_manage_live_updates" ON public.live_updates;
CREATE POLICY "admin_can_manage_live_updates"
  ON public.live_updates
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Enable realtime for live_updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_updates;

-- =====================================================
-- SEATING ASSIGNMENTS TABLE
-- Purpose: Table/seating assignments for guests
-- =====================================================
CREATE TABLE IF NOT EXISTS public.seating_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name text NOT NULL,
  table_number text NOT NULL,
  table_name text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.seating_assignments ENABLE ROW LEVEL SECURITY;

-- Everyone can read seating assignments
DROP POLICY IF EXISTS "public_can_read_seating" ON public.seating_assignments;
CREATE POLICY "public_can_read_seating"
  ON public.seating_assignments
  FOR SELECT
  USING (true);

-- Only admins can manage seating assignments
DROP POLICY IF EXISTS "admin_can_manage_seating" ON public.seating_assignments;
CREATE POLICY "admin_can_manage_seating"
  ON public.seating_assignments
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
