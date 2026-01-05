-- Create invites table for household invite links
CREATE TABLE public.invites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    max_guests SMALLINT NOT NULL DEFAULT 2,
    used_by UUID REFERENCES public.rsvps(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    label TEXT -- Optional label for admin reference (e.g., "Smith Family")
);

-- Enable Row Level Security
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Public can read invites to validate codes
CREATE POLICY "public_can_read_invites" 
ON public.invites 
FOR SELECT 
USING (true);

-- Public can update invites to mark as used (only used_by field)
CREATE POLICY "public_can_use_invite" 
ON public.invites 
FOR UPDATE 
USING (used_by IS NULL)
WITH CHECK (used_by IS NOT NULL);

-- Authenticated admins can do everything
CREATE POLICY "admin_can_manage_invites" 
ON public.invites 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create index on code for fast lookups
CREATE INDEX idx_invites_code ON public.invites(code);

-- Add invite_code column to rsvps table to track which invite was used
ALTER TABLE public.rsvps ADD COLUMN IF NOT EXISTS invite_code TEXT;