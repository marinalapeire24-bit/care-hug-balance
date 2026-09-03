-- Update the handle_new_user trigger to read role from user metadata.
-- The role must be a valid enum value; default to 'soignant' if missing or invalid.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_role text;
  v_valid_roles text[] := ARRAY[
    'soignant', 'infirmier_referent', 'coordinateur', 'directeur',
    'rh', 'referent_qualite', 'administrateur', 'professionnel_sante', 'famille'
  ];
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'soignant');
  IF NOT v_role = ANY(v_valid_roles) THEN
    v_role := 'soignant';
  END IF;

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    v_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
