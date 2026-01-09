-- Create page_drafts table for draft mode and version history
CREATE TABLE public.page_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  version INTEGER NOT NULL DEFAULT 1,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create index for faster lookups
CREATE INDEX idx_page_drafts_page_key ON public.page_drafts (page_key);
CREATE INDEX idx_page_drafts_page_key_version ON public.page_drafts (page_key, version DESC);

-- Enable RLS
ALTER TABLE public.page_drafts ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "admin_can_read_drafts"
  ON public.page_drafts
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "admin_can_modify_drafts"
  ON public.page_drafts
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');