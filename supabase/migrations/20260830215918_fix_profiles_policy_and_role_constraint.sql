/*
# Fix profiles table: add missing INSERT policy + update role constraint

## Problem
- The profiles table has NO INSERT policy for authenticated users.
  The trigger `handle_new_user` runs as SECURITY DEFINER so it bypasses RLS,
  but the frontend code may also need to read the profile immediately after signup.
  Adding the INSERT policy ensures the system works correctly.
- The role CHECK constraint is missing 'professionnel_sante' and 'famille' roles
  that are defined in the TypeScript types.

## Changes
1. Add INSERT policy on profiles (user can only insert their own profile row).
2. Drop and recreate the role CHECK constraint to include all 9 roles.
3. Recreate the handle_new_user function as SECURITY DEFINER to ensure
   the trigger always succeeds regardless of RLS.

## Security
- INSERT policy scoped to authenticated, WITH CHECK (auth.uid() = id).
- handle_new_user is SECURITY DEFINER (bypasses RLS) — this is intentional
  because it runs inside the auth.users trigger context.
*/

-- 1. Add missing INSERT policy on profiles
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- 2. Update role constraint to include all roles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (
  role = ANY (ARRAY[
    'soignant'::text,
    'infirmier_referent'::text,
    'coordinateur'::text,
    'directeur'::text,
    'rh'::text,
    'referent_qualite'::text,
    'administrateur'::text,
    'professionnel_sante'::text,
    'famille'::text
  ])
);

-- 3. Recreate handle_new_user to be robust
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
