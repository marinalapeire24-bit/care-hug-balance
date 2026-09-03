/*
# CareBalance — Suivi prévu/réalité + travail invisible (Phase 1.5)

## Description
Ajoute les colonnes "réalité" aux interventions pour comparer prévu vs réel,
et crée une table `invisible_tasks` pour comptabiliser le travail non planifié.
La création de l'index est déplacée après la création de la table.

## 1. Tableaux modifiés
- `interventions` : ajout de colonnes optionnelles de réalité
## 2. Nouvelles tables
- `invisible_tasks` : tâches invisibles du soignant
## 3. Sécurité
- RLS activé sur `invisible_tasks`, propriétaire strict.
*/

ALTER TABLE interventions
  ADD COLUMN IF NOT EXISTS actual_start timestamptz,
  ADD COLUMN IF NOT EXISTS actual_end timestamptz,
  ADD COLUMN IF NOT EXISTS actual_duration int,
  ADD COLUMN IF NOT EXISTS actual_travel int,
  ADD COLUMN IF NOT EXISTS actual_difficulty int CHECK (actual_difficulty IS NULL OR actual_difficulty BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS variance_reason text,
  ADD COLUMN IF NOT EXISTS extra_tasks text;

CREATE TABLE IF NOT EXISTS invisible_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('appel','coordination','attente','materiel','transmission','aide_collegue','imprevu','deplacement','accompagnement','autre')),
  duration_minutes int NOT NULL DEFAULT 5,
  note text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invisible_tasks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_invisible_caregiver ON invisible_tasks(caregiver_id, created_at);

DROP POLICY IF EXISTS "select_own_invisible" ON invisible_tasks;
CREATE POLICY "select_own_invisible" ON invisible_tasks FOR SELECT
  TO authenticated USING (auth.uid() = caregiver_id);

DROP POLICY IF EXISTS "insert_own_invisible" ON invisible_tasks;
CREATE POLICY "insert_own_invisible" ON invisible_tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = caregiver_id);

DROP POLICY IF EXISTS "delete_own_invisible" ON invisible_tasks;
CREATE POLICY "delete_own_invisible" ON invisible_tasks FOR DELETE
  TO authenticated USING (auth.uid() = caregiver_id);
