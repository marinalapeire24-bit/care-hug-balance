/*
# CareBalance — Profils utilisateurs et rôles (Phase 1)

## Description
Crée la table des profils liée aux comptes d'authentification et gère
la création automatique d'un profil à l'inscription. Les rôles sont
cloisonnés et le rôle ne peut PAS être modifié par l'utilisateur lui-même.

## 1. Nouvelles tables
- `profiles`
  - `id` (uuid, clé primaire, référence auth.users)
  - `full_name` (text) — nom affiché du professionnel
  - `role` (text) — rôle métier, valeur par défaut 'soignant'
  - `created_at` (timestamptz)

## 2. Sécurité
- RLS activé sur `profiles`.
- Politique SELECT : chaque utilisateur lit uniquement son propre profil.
- Politique UPDATE : chaque utilisateur met à jour son propre profil,
  MAIS les privilèges de colonne empêchent la modification du rôle
  (protection contre l'escalade de privilèges).

## 3. Notes importantes
1. Un déclencheur crée automatiquement le profil lors de l'inscription.
2. Le rôle par défaut est 'soignant' ; la Phase 1 se concentre sur ce rôle.
3. Les rôles possibles couvrent l'ensemble des profils prévus au cahier des charges.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'soignant'
    CHECK (role IN ('soignant','infirmier_referent','coordinateur','directeur','rh','referent_qualite','administrateur')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Empêche l'utilisateur de modifier son propre rôle (escalade de privilèges)
REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (full_name) ON profiles TO authenticated;

-- Création automatique du profil à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
