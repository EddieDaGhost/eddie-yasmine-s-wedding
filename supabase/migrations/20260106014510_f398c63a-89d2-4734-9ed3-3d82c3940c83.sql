-- Create invite_analytics table for tracking events
CREATE TABLE public.invite_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id uuid NOT NULL REFERENCES public.invites(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('view', 'rsvp', 'checkin')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.invite_analytics ENABLE ROW LEVEL SECURITY;

-- Public can insert analytics events (for tracking views)
CREATE POLICY "public_can_insert_analytics"
ON public.invite_analytics
FOR INSERT
WITH CHECK (true);

-- Admin can read all analytics
CREATE POLICY "admin_can_read_analytics"
ON public.invite_analytics
FOR SELECT
USING (auth.role() = 'authenticated');

-- Admin can manage analytics
CREATE POLICY "admin_can_manage_analytics"
ON public.invite_analytics
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Index for faster queries
CREATE INDEX idx_invite_analytics_invite_id ON public.invite_analytics(invite_id);
CREATE INDEX idx_invite_analytics_event_type ON public.invite_analytics(event_type);