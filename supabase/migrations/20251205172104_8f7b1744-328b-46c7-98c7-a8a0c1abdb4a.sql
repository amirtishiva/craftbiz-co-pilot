-- Update handle_new_user function to read selected role from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_role text;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id)
  VALUES (new.id);
  
  -- Get selected role from metadata (default to 'buyer')
  selected_role := COALESCE(new.raw_user_meta_data->>'selected_role', 'buyer');
  
  -- Assign buyer role to everyone
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'buyer');
  
  -- If seller, also assign seller role
  IF selected_role = 'seller' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'seller');
  END IF;
  
  RETURN new;
END;
$$;