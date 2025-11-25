-- Create settings table to store application configuration
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the access code (needed for frontend verification)
CREATE POLICY "Anyone can view access code"
  ON public.settings FOR SELECT
  USING (key = 'MRP_DEALS_ACCESS_CODE');

-- Only admins can view other settings
CREATE POLICY "Admins can view other settings"
  ON public.settings FOR SELECT
  USING (
    key != 'MRP_DEALS_ACCESS_CODE' AND
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings"
  ON public.settings FOR INSERT
  WITH CHECK ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
  ON public.settings FOR UPDATE
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Only admins can delete settings
CREATE POLICY "Admins can delete settings"
  ON public.settings FOR DELETE
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Note: Edge Functions will use service role key to bypass RLS when reading settings
-- No additional policy needed as service role bypasses RLS by default

-- Create a function to get the access code (can be called by Edge Functions)
CREATE OR REPLACE FUNCTION public.get_access_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  access_code TEXT;
BEGIN
  SELECT value INTO access_code
  FROM public.settings
  WHERE key = 'MRP_DEALS_ACCESS_CODE'
  LIMIT 1;
  
  RETURN access_code;
END;
$$;

-- Grant execute permission to authenticated users and anon (for Edge Functions)
GRANT EXECUTE ON FUNCTION public.get_access_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_access_code() TO anon;

-- Insert the default access code (you can update this via SQL)
INSERT INTO public.settings (key, value, description)
VALUES ('MRP_DEALS_ACCESS_CODE', 'MRP_ROCKS', 'Secret access code to unlock premium deals')
ON CONFLICT (key) DO NOTHING;

-- Trigger to update updated_at
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

