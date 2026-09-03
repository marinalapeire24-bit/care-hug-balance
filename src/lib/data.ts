import { supabase } from '@/lib/supabase';
import type { Intervention, InvisibleTask, Patient, PatientAlert, PatientChange, InvisibleTaskType } from '@/lib/types';

export interface InterventionWithPatient extends Intervention {
  patient: Patient | null;
}

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function endOfToday(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export async function fetchTodayInterventions(): Promise<InterventionWithPatient[]> {
  const { data, error } = await supabase
    .from('interventions')
    .select('*, patient:patients(*)')
    .gte('scheduled_at', startOfToday())
    .lte('scheduled_at', endOfToday())
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as InterventionWithPatient[];
}

export async function fetchPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('last_name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Patient[];
}

export interface PatientDetailData {
  patient: Patient;
  alerts: PatientAlert[];
  changes: PatientChange[];
  interventions: Intervention[];
}

export async function fetchPatientDetail(patientId: string): Promise<PatientDetailData | null> {
  const [patientRes, alertsRes, changesRes, intervRes] = await Promise.all([
    supabase.from('patients').select('*').eq('id', patientId).maybeSingle(),
    supabase.from('patient_alerts').select('*').eq('patient_id', patientId).order('level', { ascending: true }),
    supabase.from('patient_changes').select('*').eq('patient_id', patientId).order('occurred_at', { ascending: false }),
    supabase.from('interventions').select('*').eq('patient_id', patientId).order('scheduled_at', { ascending: false }),
  ]);
  if (!patientRes.data) return null;
  return {
    patient: patientRes.data as Patient,
    alerts: (alertsRes.data ?? []) as PatientAlert[],
    changes: (changesRes.data ?? []) as PatientChange[],
    interventions: (intervRes.data ?? []) as Intervention[],
  };
}

const alertOrder = { critique: 0, attention: 1, info: 2 } as const;

export function sortAlerts(alerts: PatientAlert[]): PatientAlert[] {
  return [...alerts].sort((a, b) => alertOrder[a.level] - alertOrder[b.level]);
}

const difficultyActions: Record<string, string> = {
  retard: 'Prévenir le coordinateur et réorganiser la suite de la tournée.',
  duree: 'Ajouter du temps à cette intervention et décaler la suivante.',
  technique: 'Demander un renfort ou contacter le référent technique.',
  relationnel: "Créer une transmission et solliciter un appui du référent.",
  materiel: 'Signaler le manque de matériel au coordinateur.',
  securite: 'Mettre votre sécurité en priorité et prévenir immédiatement le référent.',
  aggravation: "Prévenir l'infirmière référente et créer une transmission prioritaire.",
  impossible: 'Reporter la tâche non urgente et prévenir le coordinateur.',
};

export function suggestedActionFor(type: string): string {
  return difficultyActions[type] ?? 'Prévenir le coordinateur pour trouver une solution ensemble.';
}

export async function fetchTodayInvisibleTasks(): Promise<InvisibleTask[]> {
  const { data, error } = await supabase
    .from('invisible_tasks')
    .select('*')
    .gte('created_at', startOfToday())
    .lte('created_at', endOfToday())
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as InvisibleTask[];
}

export async function addInvisibleTask(
  type: InvisibleTaskType,
  durationMinutes: number,
  note: string
): Promise<InvisibleTask | null> {
  const { data, error } = await supabase
    .from('invisible_tasks')
    .insert({ type, duration_minutes: durationMinutes, note: note.trim() })
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data as InvisibleTask | null;
}

export async function deleteInvisibleTask(id: string): Promise<void> {
  const { error } = await supabase.from('invisible_tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function updateInterventionReality(
  interventionId: string,
  updates: Partial<Pick<Intervention, 'actual_duration' | 'actual_travel' | 'actual_difficulty' | 'variance_reason' | 'extra_tasks'>>
): Promise<void> {
  const { error } = await supabase
    .from('interventions')
    .update(updates)
    .eq('id', interventionId);
  if (error) throw error;
}
