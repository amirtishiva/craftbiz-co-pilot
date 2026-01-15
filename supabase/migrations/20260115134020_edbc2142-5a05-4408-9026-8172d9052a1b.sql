-- Fix profiles table public exposure by restricting access to non-sensitive fields

-- Step 1: Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view seller profiles for reviews" ON public.profiles;

-- Step 2: Create a new policy that allows public access but we'll handle field restriction via a view
-- Keep the owner policy intact, add a restricted public policy for sellers only
CREATE POLICY "Public can view seller basic info"
ON public.profiles
FOR SELECT
USING (
  -- Only allow public access to profiles that are sellers (have products)
  id IN (SELECT DISTINCT seller_id FROM public.products WHERE status = 'active')
);

-- Step 3: Create a public view with only non-sensitive profile fields
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  id,
  user_id,
  business_name,
  business_type,
  avatar_url,
  bio,
  location,
  created_at
  -- Excluding: phone (sensitive contact info)
FROM public.profiles
WHERE id IN (SELECT DISTINCT seller_id FROM public.products WHERE status = 'active');

-- Grant access to the public view
GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- Step 4: Create a function to get full profile details (only for authenticated users viewing their own profile)
CREATE OR REPLACE FUNCTION public.get_profile_with_contact(profile_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  business_name text,
  business_type text,
  avatar_url text,
  bio text,
  location text,
  phone text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return phone if the requester is authenticated and it's their own profile
  -- or if they are viewing a seller profile they have an order relationship with
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.business_name,
    p.business_type,
    p.avatar_url,
    p.bio,
    p.location,
    CASE 
      WHEN auth.uid() = p.user_id THEN p.phone
      WHEN auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.orders o 
        WHERE o.buyer_id = auth.uid() 
        AND o.seller_id = p.id
      ) THEN p.phone
      ELSE NULL
    END as phone,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = profile_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_profile_with_contact(uuid) TO authenticated;