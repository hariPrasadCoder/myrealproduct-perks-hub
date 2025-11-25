-- Add display_order column to deals table for custom ordering
ALTER TABLE public.deals
ADD COLUMN display_order INTEGER;

-- Create an index for better query performance
CREATE INDEX idx_deals_display_order ON public.deals(display_order);

-- Set initial display_order based on current featured status and creation date
-- Featured deals get lower numbers (appear first), then by created_at
UPDATE public.deals
SET display_order = subquery.row_number
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      ORDER BY is_featured DESC, created_at DESC
    ) as row_number
  FROM public.deals
) AS subquery
WHERE deals.id = subquery.id;

