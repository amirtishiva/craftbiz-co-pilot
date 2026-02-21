
-- Revoke all table-level SELECT from anon/authenticated on profiles
-- Then re-grant SELECT only on non-sensitive columns
REVOKE SELECT ON public.profiles FROM anon, authenticated;

-- Grant SELECT on all columns EXCEPT phone
GRANT SELECT (id, user_id, business_name, business_type, avatar_url, bio, location, created_at, updated_at) ON public.profiles TO anon, authenticated;

-- Grant phone SELECT only to authenticated (they'll still need RLS + the get_profile_with_contact function for actual access)
-- Actually, don't grant phone at all via direct table access - use the function instead
