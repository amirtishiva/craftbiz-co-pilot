-- Assign buyer role to all existing users who don't have any roles
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'buyer'::app_role
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id
);

-- Assign seller role to users who already have seller profiles
INSERT INTO public.user_roles (user_id, role)
SELECT sp.user_id, 'seller'::app_role
FROM public.seller_profiles sp
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = sp.user_id AND ur.role = 'seller'
);