
-- Recreate profiles_public view with security_invoker = true
-- This ensures the view respects the querying user's RLS policies
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  business_name,
  business_type,
  avatar_url,
  bio,
  location,
  created_at
FROM public.profiles
WHERE id IN (
  SELECT DISTINCT seller_id 
  FROM public.products 
  WHERE status = 'active'
);
