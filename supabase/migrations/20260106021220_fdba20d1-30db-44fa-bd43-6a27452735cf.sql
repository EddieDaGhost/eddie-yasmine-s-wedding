-- Add tags column to photos table
ALTER TABLE public.photos ADD COLUMN tags text[] DEFAULT '{}';

-- Create index for efficient tag filtering
CREATE INDEX idx_photos_tags ON public.photos USING GIN(tags);