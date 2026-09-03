/*
# CareBalance — Patients, interventions et informations terrain (Phase 1)

## Description
Crée les tables du cœur métier : patients, interventions planifiées,
alertes critiques, changements récents ("Ce qui a changé") et
signalements de difficulté ("Je suis en difficulté"). Toutes les
données sont fictives et destinées à la démonstration.

## 1. Nouvelles tables
- `patients` : identité, environnement (domicile/établissement), chambre/adresse,
  indice de fragilité opérationnelle, courte synthèse.
- `interventions` : visite planifiée reliée à un patient et à un soignant,
  horaire, durée, niveau de difficulté, trajet, consignes, matériel, statut.
- `patient_alerts` : alertes critiques d'un patient (niveau critique/attention/info).
- `patient_changes` : changements récents observés (nouvelle douleur, chute, etc.).
- `difficulty_reports` : signalements rapides de difficulté par un soignant.

## 2. Sécurité
- RLS activé sur toutes les tables.
- Un soignant ne voit que les interventions qui LUI sont attribuées.
- Un patient (et ses alertes/changements) n'est visible que si le soignant
  a une intervention avec ce patient — cloisonnement des données de santé.
- Les signalements de difficulté sont strictement privés à leur auteur.
- Les patients ne peuvent PAS être créés directement par le client ;
  seule la fonction de démonstration (SECURITY DEFINER) les insère.

## 3. Notes importantes
1. `caregiver_id` a une valeur par défaut `auth.uid()` pour fiabiliser les insertions.
2. Aucune donnée réelle de santé ne doit être utilisée.
3. L'indice de fragilité est un simple repère d'attention, jamais un diagnostic.
*/

CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  birth_date date,
  environment text NOT NULL DEFAULT 'domicile' CHECK (environment IN ('domicile','etablissement')),
  room text,
  address text,
  fragility_level int NOT NULL DEFAULT 0 CHECK (fragility_level BETWEEN 0 AND 100),
  summary text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  caregiver_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  duration_minutes int NOT NULL DEFAULT 30,
  difficulty_level int NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  travel_minutes int NOT NULL DEFAULT 0,
  address text,
  room text,
  instructions text NOT NULL DEFAULT '',
  required_equipment text NOT NULL DEFAULT '',
  required_skills text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'a_faire' CHECK (status IN ('a_faire','en_cours','termine')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patient_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  level text NOT NULL DEFAULT 'info' CHECK (level IN ('critique','attention','info')),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patient_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'autre',
  description text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS difficulty_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  intervention_id uuid REFERENCES interventions(id) ON DELETE SET NULL,
  type text NOT NULL,
  note text NOT NULL DEFAULT '',
  suggested_action text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'ouvert' CHECK (status IN ('ouvert','en_cours','resolu')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interventions_caregiver ON interventions(caregiver_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interventions_patient ON interventions(patient_id);
CREATE INDEX IF NOT EXISTS idx_alerts_patient ON patient_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_changes_patient ON patient_changes(patient_id);
CREATE INDEX IF NOT EXISTS idx_difficulty_caregiver ON difficulty_reports(caregiver_id, created_at);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE difficulty_reports ENABLE ROW LEVEL SECURITY;

-- INTERVENTIONS : chaque soignant gère uniquement les siennes
DROP POLICY IF EXISTS "select_own_interventions" ON interventions;
CREATE POLICY "select_own_interventions" ON interventions FOR SELECT
  TO authenticated USING (auth.uid() = caregiver_id);

DROP POLICY IF EXISTS "insert_own_interventions" ON interventions;
CREATE POLICY "insert_own_interventions" ON interventions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = caregiver_id);

DROP POLICY IF EXISTS "update_own_interventions" ON interventions;
CREATE POLICY "update_own_interventions" ON interventions FOR UPDATE
  TO authenticated USING (auth.uid() = caregiver_id) WITH CHECK (auth.uid() = caregiver_id);

DROP POLICY IF EXISTS "delete_own_interventions" ON interventions;
CREATE POLICY "delete_own_interventions" ON interventions FOR DELETE
  TO authenticated USING (auth.uid() = caregiver_id);

-- PATIENTS : visibles seulement via une intervention attribuée au soignant
DROP POLICY IF EXISTS "select_linked_patients" ON patients;
CREATE POLICY "select_linked_patients" ON patients FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM interventions i
      WHERE i.patient_id = patients.id AND i.caregiver_id = auth.uid()
    )
  );

-- ALERTES : visibles via un patient lié au soignant
DROP POLICY IF EXISTS "select_linked_alerts" ON patient_alerts;
CREATE POLICY "select_linked_alerts" ON patient_alerts FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM interventions i
      WHERE i.patient_id = patient_alerts.patient_id AND i.caregiver_id = auth.uid()
    )
  );

-- CHANGEMENTS : visibles via un patient lié au soignant
DROP POLICY IF EXISTS "select_linked_changes" ON patient_changes;
CREATE POLICY "select_linked_changes" ON patient_changes FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM interventions i
      WHERE i.patient_id = patient_changes.patient_id AND i.caregiver_id = auth.uid()
    )
  );

-- SIGNALEMENTS DE DIFFICULTÉ : strictement privés à leur auteur
DROP POLICY IF EXISTS "select_own_difficulty" ON difficulty_reports;
CREATE POLICY "select_own_difficulty" ON difficulty_reports FOR SELECT
  TO authenticated USING (auth.uid() = caregiver_id);

DROP POLICY IF EXISTS "insert_own_difficulty" ON difficulty_reports;
CREATE POLICY "insert_own_difficulty" ON difficulty_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = caregiver_id);

DROP POLICY IF EXISTS "update_own_difficulty" ON difficulty_reports;
CREATE POLICY "update_own_difficulty" ON difficulty_reports FOR UPDATE
  TO authenticated USING (auth.uid() = caregiver_id) WITH CHECK (auth.uid() = caregiver_id);

DROP POLICY IF EXISTS "delete_own_difficulty" ON difficulty_reports;
CREATE POLICY "delete_own_difficulty" ON difficulty_reports FOR DELETE
  TO authenticated USING (auth.uid() = caregiver_id);
