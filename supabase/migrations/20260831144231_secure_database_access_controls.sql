-- =============================================================
-- Security hardening: revoke anon access, lock down roles, 
-- restrict sensitive columns, fix overly permissive policies
-- =============================================================

-- 1. Revoke ALL privileges from anon on every application table.
--    Only authenticated users should access data via the Data API.
REVOKE ALL ON profiles FROM anon;
REVOKE ALL ON patients FROM anon;
REVOKE ALL ON interventions FROM anon;
REVOKE ALL ON invisible_tasks FROM anon;
REVOKE ALL ON patient_alerts FROM anon;
REVOKE ALL ON patient_changes FROM anon;
REVOKE ALL ON difficulty_reports FROM anon;
REVOKE ALL ON care_requests FROM anon;
REVOKE ALL ON care_evaluations FROM anon;
REVOKE ALL ON care_plans FROM anon;
REVOKE ALL ON pathway_steps FROM anon;
REVOKE ALL ON pathway_history FROM anon;
REVOKE ALL ON transmissions FROM anon;
REVOKE ALL ON family_notifications FROM anon;
REVOKE ALL ON documents FROM anon;

-- 2. Lock down profiles.role — users must not set their own role.
--    Only allow updating display fields.
REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (full_name) ON profiles TO authenticated;

-- 3. Lock down seed_demo_data: revoke execute from authenticated.
--    It should only be callable via service_role or by the trigger.
REVOKE EXECUTE ON FUNCTION seed_demo_data FROM authenticated;
REVOKE EXECUTE ON FUNCTION seed_demo_data FROM anon;

-- 4. Fix overly permissive UPDATE policies on pathway tables.
--    Replace USING(true) WITH CHECK(true) with ownership-based checks.

-- care_evaluations: only the evaluator can update
DROP POLICY IF EXISTS "update_care_evaluations" ON care_evaluations;
CREATE POLICY "update_care_evaluations" ON care_evaluations FOR UPDATE
  TO authenticated
  USING (auth.uid() = evaluated_by)
  WITH CHECK (auth.uid() = evaluated_by);

-- care_plans: only the creator can update
DROP POLICY IF EXISTS "update_care_plans" ON care_plans;
CREATE POLICY "update_care_plans" ON care_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- care_requests: only the creator can update  
DROP POLICY IF EXISTS "update_care_requests" ON care_requests;
CREATE POLICY "update_care_requests" ON care_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- pathway_steps: any authenticated user can update steps (team collaboration)
-- but restrict what they can set via column grants
DROP POLICY IF EXISTS "update_pathway_steps" ON pathway_steps;
CREATE POLICY "update_pathway_steps" ON pathway_steps FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Restrict pathway_steps columns — users can update status and notes but not IDs
REVOKE UPDATE ON pathway_steps FROM authenticated;
GRANT UPDATE (status, responsible_name, responsible_role, started_at, completed_at, blocked_reason, blocked_since, notes) ON pathway_steps TO authenticated;

-- transmissions: only the author can update their own
DROP POLICY IF EXISTS "update_transmissions" ON transmissions;
CREATE POLICY "update_transmissions" ON transmissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- family_notifications: restrict update to read status only
REVOKE UPDATE ON family_notifications FROM authenticated;
GRANT UPDATE (read) ON family_notifications TO authenticated;

-- documents: only the uploader can update
DROP POLICY IF EXISTS "update_documents" ON documents;
CREATE POLICY "update_documents" ON documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = uploaded_by)
  WITH CHECK (auth.uid() = uploaded_by);

-- 5. Ensure ownership columns default from session and cannot be forged.
--    For tables that use created_by / author_id / evaluated_by / uploaded_by.
ALTER TABLE care_requests ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE care_evaluations ALTER COLUMN evaluated_by SET DEFAULT auth.uid();
ALTER TABLE care_plans ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE transmissions ALTER COLUMN author_id SET DEFAULT auth.uid();
ALTER TABLE pathway_history ALTER COLUMN performed_by SET DEFAULT auth.uid();
ALTER TABLE documents ALTER COLUMN uploaded_by SET DEFAULT auth.uid();

-- Restrict INSERT column access so ownership columns are auto-set
REVOKE INSERT ON care_requests FROM authenticated;
GRANT INSERT (patient_id, hospital_name, hospital_service, hospitalization_reason, discharge_date, autonomy_level, situation_summary, precautions, needs_summary, status) ON care_requests TO authenticated;

REVOKE INSERT ON care_evaluations FROM authenticated;
GRANT INSERT (care_request_id, autonomy_score, home_environment, risks, material_needs, human_needs, services_needed, frequency, duration_per_visit, evaluation_type, notes, validated) ON care_evaluations TO authenticated;

REVOKE INSERT ON care_plans FROM authenticated;
GRANT INSERT (care_request_id, evaluation_id, title, services, professionals_needed, material_needed, schedule_summary, status) ON care_plans TO authenticated;

REVOKE INSERT ON transmissions FROM authenticated;
GRANT INSERT (patient_id, care_request_id, author_name, content, category, priority, target_role) ON transmissions TO authenticated;

REVOKE INSERT ON documents FROM authenticated;
GRANT INSERT (patient_id, care_request_id, name, category, description, file_url) ON documents TO authenticated;

-- 6. Create a SECURITY DEFINER function for role changes (admin only)
CREATE OR REPLACE FUNCTION set_user_role(p_user_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('administrateur', 'directeur')
  ) THEN
    RAISE EXCEPTION 'Non autorisé : seul un administrateur peut modifier les rôles';
  END IF;

  IF p_role NOT IN (
    'soignant', 'infirmier_referent', 'coordinateur', 'directeur',
    'rh', 'referent_qualite', 'administrateur', 'professionnel_sante', 'famille'
  ) THEN
    RAISE EXCEPTION 'Rôle invalide : %', p_role;
  END IF;

  UPDATE profiles SET role = p_role WHERE id = p_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION set_user_role FROM anon;
GRANT EXECUTE ON FUNCTION set_user_role TO authenticated;
