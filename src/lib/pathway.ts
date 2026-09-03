import { supabase } from '@/lib/supabase';
import type {
  CareRequest,
  CareEvaluation,
  CarePlan,
  PathwayStep,
  PathwayHistoryEntry,
  Transmission,
  FamilyNotification,
  CareDocument,
} from '@/lib/types';

// ============================================================
// Pathway step definitions (the 15 steps)
// ============================================================

export const PATHWAY_STEP_DEFS: { key: string; label: string; defaultRole: string }[] = [
  { key: 'demande_sortie', label: 'Demande de sortie créée', defaultRole: 'Hôpital' },
  { key: 'demande_recue', label: 'Demande reçue par le service', defaultRole: 'Coordinateur' },
  { key: 'dossier_etudie', label: 'Dossier étudié', defaultRole: 'Coordinateur' },
  { key: 'evaluation_besoins', label: 'Évaluation des besoins réalisée', defaultRole: 'Coordinateur' },
  { key: 'plan_aide_defini', label: "Plan d'aide défini", defaultRole: 'Coordinateur' },
  { key: 'professionnels_recherches', label: 'Professionnels recherchés', defaultRole: 'Coordinateur' },
  { key: 'materiel_identifie', label: 'Matériel nécessaire identifié', defaultRole: 'Coordinateur' },
  { key: 'intervenants_affectes', label: 'Intervenants affectés', defaultRole: 'Coordinateur' },
  { key: 'planning_organise', label: 'Planning organisé', defaultRole: 'Coordinateur' },
  { key: 'documents_transmis', label: 'Documents transmis / validés', defaultRole: 'Coordinateur' },
  { key: 'retour_programme', label: 'Retour à domicile programmé', defaultRole: 'Hôpital' },
  { key: 'retour_effectue', label: 'Retour à domicile effectué', defaultRole: 'Transport' },
  { key: 'premiere_intervention', label: 'Première intervention réalisée', defaultRole: 'Intervenant' },
  { key: 'prise_en_charge', label: 'Prise en charge mise en place', defaultRole: 'Coordinateur' },
  { key: 'suivi_post_retour', label: 'Suivi post-retour à domicile', defaultRole: 'Coordinateur' },
];

// ============================================================
// Fetch functions
// ============================================================

export async function fetchCareRequests(): Promise<CareRequest[]> {
  const { data, error } = await supabase
    .from('care_requests')
    .select('*, patients(first_name, last_name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    ...r,
    patient: r.patients ? { ...r.patients, id: r.patient_id } : undefined,
  }));
}

export async function fetchCareRequestWithDetails(id: string): Promise<CareRequest | null> {
  const { data, error } = await supabase
    .from('care_requests')
    .select('*, patients(id, first_name, last_name, birth_date, address, fragility_level, summary)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...data, patient: data.patients ? { ...data.patients } : undefined } as any;
}

export async function fetchPathwaySteps(careRequestId: string): Promise<PathwayStep[]> {
  const { data, error } = await supabase
    .from('pathway_steps')
    .select('*')
    .eq('care_request_id', careRequestId)
    .order('step_number');
  if (error) throw error;
  return data ?? [];
}

export async function fetchPathwayHistory(careRequestId: string): Promise<PathwayHistoryEntry[]> {
  const { data, error } = await supabase
    .from('pathway_history')
    .select('*')
    .eq('care_request_id', careRequestId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchEvaluation(careRequestId: string): Promise<CareEvaluation | null> {
  const { data, error } = await supabase
    .from('care_evaluations')
    .select('*')
    .eq('care_request_id', careRequestId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchCarePlan(careRequestId: string): Promise<CarePlan | null> {
  const { data, error } = await supabase
    .from('care_plans')
    .select('*')
    .eq('care_request_id', careRequestId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as CarePlan | null;
}

export async function fetchTransmissions(patientId: string): Promise<Transmission[]> {
  const { data, error } = await supabase
    .from('transmissions')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchFamilyNotifications(patientId: string): Promise<FamilyNotification[]> {
  const { data, error } = await supabase
    .from('family_notifications')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchDocuments(patientId: string): Promise<CareDocument[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ============================================================
// Create / Update functions
// ============================================================

export async function createCareRequest(input: {
  patient_id: string;
  hospital_name: string;
  hospital_service: string;
  hospitalization_reason: string;
  discharge_date: string | null;
  autonomy_level: number;
  situation_summary: string;
  precautions: string;
  needs_summary: string;
}): Promise<CareRequest> {
  const { data, error } = await supabase
    .from('care_requests')
    .insert(input)
    .select()
    .single();
  if (error) throw error;

  // Create the 15 pathway steps
  const steps = PATHWAY_STEP_DEFS.map((def, i) => ({
    care_request_id: data.id,
    step_number: i + 1,
    step_key: def.key,
    label: def.label,
    status: i === 0 ? 'termine' : 'a_venir',
    responsible_name: '',
    responsible_role: def.defaultRole,
    started_at: i === 0 ? new Date().toISOString() : null,
    completed_at: i === 0 ? new Date().toISOString() : null,
  }));
  await supabase.from('pathway_steps').insert(steps);

  // Log history
  await supabase.from('pathway_history').insert({
    care_request_id: data.id,
    step_number: 1,
    action: 'Demande de sortie créée',
    performed_by_name: input.hospital_name,
    details: `Sortie prévue le ${input.discharge_date ?? 'date non définie'}`,
  });

  return data;
}

export async function updatePathwayStep(
  stepId: string,
  careRequestId: string,
  updates: Partial<PathwayStep>,
  performedByName: string
): Promise<void> {
  const { error } = await supabase
    .from('pathway_steps')
    .update(updates)
    .eq('id', stepId);
  if (error) throw error;

  await supabase.from('pathway_history').insert({
    care_request_id: careRequestId,
    step_number: updates.step_number,
    action: updates.status === 'termine' ? 'Étape terminée'
      : updates.status === 'bloque' ? 'Étape bloquée'
      : updates.status === 'en_cours' ? 'Étape démarrée'
      : 'Étape mise à jour',
    performed_by_name: performedByName,
    details: updates.blocked_reason || updates.notes || '',
  });
}

export async function createEvaluation(input: Omit<CareEvaluation, 'id' | 'created_at' | 'evaluated_by'>): Promise<CareEvaluation> {
  const { data, error } = await supabase
    .from('care_evaluations')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createCarePlan(input: {
  care_request_id: string;
  evaluation_id: string | null;
  title: string;
  services: any[];
  professionals_needed: any[];
  material_needed: any[];
  schedule_summary: string;
}): Promise<CarePlan> {
  const { data, error } = await supabase
    .from('care_plans')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as CarePlan;
}

export async function createTransmission(input: {
  patient_id: string;
  care_request_id?: string | null;
  author_name: string;
  content: string;
  category: string;
  priority: string;
  target_role?: string | null;
}): Promise<Transmission> {
  const { data, error } = await supabase
    .from('transmissions')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await supabase.from('family_notifications').update({ read: true }).eq('id', id);
}

export async function updateCareRequestStatus(id: string, status: string): Promise<void> {
  await supabase.from('care_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
}
