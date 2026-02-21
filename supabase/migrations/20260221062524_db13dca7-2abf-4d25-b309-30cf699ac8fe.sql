
-- Revoke direct SELECT on the phone column from anon role
-- Phone is still accessible via the get_profile_with_contact() SECURITY DEFINER function
REVOKE SELECT (phone) ON public.profiles FROM anon;
