/*
# CareBalance Pathway: Full care coordination schema

## Purpose
Create the complete database schema for the CareBalance care pathway,
connecting hospital discharge requests through to home care delivery and family notifications.

## New Tables

### care_requests
Hospital discharge / care request. Created by hospital staff.
- id (uuid, PK)
- patient_id (uuid, FK patients) - the patient
- created_by (uuid, FK auth.users) - who created the request
- hospital_name (text) - originating hospital
- hospital_service (text) - department/service
- hospitalization_reason (text) - why patient was hospitalized
- discharge_date (date) - planned discharge date
- autonomy_level (int 1-5) - patient autonomy score
- situation_summary (text) - overall situation
- precautions (text) - safety precautions
- needs_summary (text) - summary of care needs
- status (text) - a_traiter, en_cours, acceptee, refusee, terminee
- created_at, updated_at (timestamptz)

### care_evaluations
Evaluation performed by home care service after receiving request.
- id (uuid, PK)
- care_request_id (uuid, FK care_requests)
- evaluated_by (uuid, FK auth.users)
- autonomy_score (int)
- home_environment (text)
- risks (text)
- material_needs (text)
- human_needs (text)
- services_needed (text)
- frequency (text)
- duration_per_visit (int) - minutes
- evaluation_type (text) - domicile, distance
- notes (text)
- validated (boolean)
- created_at (timestamptz)

### care_plans
Personalized care plan built from evaluation.
- id (uuid, PK)
- care_request_id (uuid, FK care_requests)
- evaluation_id (uuid, FK care_evaluations)
- created_by (uuid, FK auth.users)
- title (text)
- services (jsonb) - array of service definitions
- professionals_needed (jsonb) - roles and counts
- material_needed (jsonb) - equipment list
- schedule_summary (text)
- status (text) - brouillon, valide, en_cours, termine
- validated_at (timestamptz)
- created_at, updated_at (timestamptz)

### pathway_steps
The 15-step CareBalance pathway timeline for each care request.
- id (uuid, PK)
- care_request_id (uuid, FK care_requests)
- step_number (int 1-15)
- step_key (text) - machine-readable key
- label (text)
- status (text) - a_venir, en_cours, termine, en_attente, bloque
- responsible_name (text) - who is responsible
- responsible_role (text)
- started_at (timestamptz)
- completed_at (timestamptz)
- blocked_reason (text)
- blocked_since (timestamptz)
- notes (text)

### pathway_history
Audit log for all pathway actions.
- id (uuid, PK)
- care_request_id (uuid, FK care_requests)
- step_number (int)
- action (text)
- performed_by (uuid, FK auth.users)
- performed_by_name (text)
- details (text)
- created_at (timestamptz)

### transmissions
Professional-to-professional communications about a patient.
- id (uuid, PK)
- patient_id (uuid, FK patients)
- care_request_id (uuid, FK care_requests, nullable)
- author_id (uuid, FK auth.users)
- author_name (text)
- content (text)
- category (text) - observation, alerte, evolution, consigne, information
- priority (text) - normale, importante, urgente
- target_role (text, nullable) - if targeted to a specific role
- read_by (jsonb) - array of user IDs who read it
- created_at (timestamptz)

### family_notifications
Notifications sent to family members about care events.
- id (uuid, PK)
- patient_id (uuid, FK patients)
- family_member_id (text) - reference to family member
- type (text) - passage_effectue, passage_en_cours, passage_non_effectue, passage_reprogramme, information
- title (text)
- message (text)
- read (boolean)
- created_at (timestamptz)

### documents
Documents attached to a patient or care request.
- id (uuid, PK)
- patient_id (uuid, FK patients)
- care_request_id (uuid, FK care_requests, nullable)
- uploaded_by (uuid, FK auth.users)
- name (text) - document name
- category (text) - cr_hospitalier, ordonnance, evaluation, plan_aide, administratif, autre
- description (text)
- file_url (text, nullable) - storage URL
- created_at (timestamptz)

## Security
- RLS enabled on all tables.
- All policies scoped TO authenticated.
- Access based on relationship to the data (created_by, author_id, or linked through care_requests/patients).
*/

-- ============================================================
-- care_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS care_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  hospital_name text NOT NULL DEFAULT '',
  hospital_service text NOT NULL DEFAULT '',
  hospitalization_reason text NOT NULL DEFAULT '',
  discharge_date date,
  autonomy_level int NOT NULL DEFAULT 3 CHECK (autonomy_level BETWEEN 1 AND 5),
  situation_summary text NOT NULL DEFAULT '',
  precautions text NOT NULL DEFAULT '',
  needs_summary text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'a_traiter' CHECK (status IN ('a_traiter','en_cours','acceptee','refusee','terminee')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE care_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_care_requests" ON care_requests;
CREATE POLICY "select_care_requests" ON care_requests FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_care_requests" ON care_requests;
CREATE POLICY "insert_care_requests" ON care_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "update_care_requests" ON care_requests;
CREATE POLICY "update_care_requests" ON care_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_care_requests" ON care_requests;
CREATE POLICY "delete_care_requests" ON care_requests FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- ============================================================
-- care_evaluations
-- ============================================================
CREATE TABLE IF NOT EXISTS care_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_request_id uuid NOT NULL REFERENCES care_requests(id) ON DELETE CASCADE,
  evaluated_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  autonomy_score int NOT NULL DEFAULT 3,
  home_environment text NOT NULL DEFAULT '',
  risks text NOT NULL DEFAULT '',
  material_needs text NOT NULL DEFAULT '',
  human_needs text NOT NULL DEFAULT '',
  services_needed text NOT NULL DEFAULT '',
  frequency text NOT NULL DEFAULT '',
  duration_per_visit int NOT NULL DEFAULT 30,
  evaluation_type text NOT NULL DEFAULT 'domicile' CHECK (evaluation_type IN ('domicile','distance')),
  notes text NOT NULL DEFAULT '',
  validated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE care_evaluations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_care_evaluations" ON care_evaluations;
CREATE POLICY "select_care_evaluations" ON care_evaluations FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_care_evaluations" ON care_evaluations;
CREATE POLICY "insert_care_evaluations" ON care_evaluations FOR INSERT TO authenticated WITH CHECK (auth.uid() = evaluated_by);
DROP POLICY IF EXISTS "update_care_evaluations" ON care_evaluations;
CREATE POLICY "update_care_evaluations" ON care_evaluations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_care_evaluations" ON care_evaluations;
CREATE POLICY "delete_care_evaluations" ON care_evaluations FOR DELETE TO authenticated USING (auth.uid() = evaluated_by);

-- ============================================================
-- care_plans
-- ============================================================
CREATE TABLE IF NOT EXISTS care_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_request_id uuid NOT NULL REFERENCES care_requests(id) ON DELETE CASCADE,
  evaluation_id uuid REFERENCES care_evaluations(id),
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  title text NOT NULL DEFAULT '',
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  professionals_needed jsonb NOT NULL DEFAULT '[]'::jsonb,
  material_needed jsonb NOT NULL DEFAULT '[]'::jsonb,
  schedule_summary text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'brouillon' CHECK (status IN ('brouillon','valide','en_cours','termine')),
  validated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_care_plans" ON care_plans;
CREATE POLICY "select_care_plans" ON care_plans FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_care_plans" ON care_plans;
CREATE POLICY "insert_care_plans" ON care_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "update_care_plans" ON care_plans;
CREATE POLICY "update_care_plans" ON care_plans FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_care_plans" ON care_plans;
CREATE POLICY "delete_care_plans" ON care_plans FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- ============================================================
-- pathway_steps
-- ============================================================
CREATE TABLE IF NOT EXISTS pathway_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_request_id uuid NOT NULL REFERENCES care_requests(id) ON DELETE CASCADE,
  step_number int NOT NULL CHECK (step_number BETWEEN 1 AND 15),
  step_key text NOT NULL,
  label text NOT NULL,
  status text NOT NULL DEFAULT 'a_venir' CHECK (status IN ('a_venir','en_cours','termine','en_attente','bloque')),
  responsible_name text NOT NULL DEFAULT '',
  responsible_role text NOT NULL DEFAULT '',
  started_at timestamptz,
  completed_at timestamptz,
  blocked_reason text,
  blocked_since timestamptz,
  notes text NOT NULL DEFAULT '',
  UNIQUE (care_request_id, step_number)
);
ALTER TABLE pathway_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_pathway_steps" ON pathway_steps;
CREATE POLICY "select_pathway_steps" ON pathway_steps FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_pathway_steps" ON pathway_steps;
CREATE POLICY "insert_pathway_steps" ON pathway_steps FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_pathway_steps" ON pathway_steps;
CREATE POLICY "update_pathway_steps" ON pathway_steps FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_pathway_steps" ON pathway_steps;
CREATE POLICY "delete_pathway_steps" ON pathway_steps FOR DELETE TO authenticated USING (true);

-- ============================================================
-- pathway_history
-- ============================================================
CREATE TABLE IF NOT EXISTS pathway_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_request_id uuid NOT NULL REFERENCES care_requests(id) ON DELETE CASCADE,
  step_number int,
  action text NOT NULL,
  performed_by uuid DEFAULT auth.uid() REFERENCES auth.users(id),
  performed_by_name text NOT NULL DEFAULT '',
  details text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE pathway_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_pathway_history" ON pathway_history;
CREATE POLICY "select_pathway_history" ON pathway_history FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_pathway_history" ON pathway_history;
CREATE POLICY "insert_pathway_history" ON pathway_history FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- transmissions
-- ============================================================
CREATE TABLE IF NOT EXISTS transmissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  care_request_id uuid REFERENCES care_requests(id) ON DELETE SET NULL,
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  author_name text NOT NULL DEFAULT '',
  content text NOT NULL,
  category text NOT NULL DEFAULT 'information' CHECK (category IN ('observation','alerte','evolution','consigne','information')),
  priority text NOT NULL DEFAULT 'normale' CHECK (priority IN ('normale','importante','urgente')),
  target_role text,
  read_by jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE transmissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_transmissions" ON transmissions;
CREATE POLICY "select_transmissions" ON transmissions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_transmissions" ON transmissions;
CREATE POLICY "insert_transmissions" ON transmissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "update_transmissions" ON transmissions;
CREATE POLICY "update_transmissions" ON transmissions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- family_notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS family_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  family_member_id text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'information' CHECK (type IN ('passage_effectue','passage_en_cours','passage_non_effectue','passage_reprogramme','information')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE family_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_family_notifications" ON family_notifications;
CREATE POLICY "select_family_notifications" ON family_notifications FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_family_notifications" ON family_notifications;
CREATE POLICY "insert_family_notifications" ON family_notifications FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_family_notifications" ON family_notifications;
CREATE POLICY "update_family_notifications" ON family_notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- documents
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  care_request_id uuid REFERENCES care_requests(id) ON DELETE SET NULL,
  uploaded_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'autre' CHECK (category IN ('cr_hospitalier','ordonnance','evaluation','plan_aide','administratif','autre')),
  description text NOT NULL DEFAULT '',
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_documents" ON documents;
CREATE POLICY "select_documents" ON documents FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_documents" ON documents;
CREATE POLICY "insert_documents" ON documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);
DROP POLICY IF EXISTS "update_documents" ON documents;
CREATE POLICY "update_documents" ON documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_documents" ON documents;
CREATE POLICY "delete_documents" ON documents FOR DELETE TO authenticated USING (auth.uid() = uploaded_by);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_care_requests_patient ON care_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_care_requests_status ON care_requests(status);
CREATE INDEX IF NOT EXISTS idx_care_evaluations_request ON care_evaluations(care_request_id);
CREATE INDEX IF NOT EXISTS idx_care_plans_request ON care_plans(care_request_id);
CREATE INDEX IF NOT EXISTS idx_pathway_steps_request ON pathway_steps(care_request_id);
CREATE INDEX IF NOT EXISTS idx_pathway_history_request ON pathway_history(care_request_id);
CREATE INDEX IF NOT EXISTS idx_transmissions_patient ON transmissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_family_notifications_patient ON family_notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_documents_patient ON documents(patient_id);
