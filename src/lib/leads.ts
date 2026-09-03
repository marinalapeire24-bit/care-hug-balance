import { supabase } from '@/lib/supabase';
import type {
  Lead,
  LeadRelationship,
  LeadServiceType,
  LeadUrgency,
  LeadStatus,
} from '@/lib/types';

export const relationshipLabels: Record<LeadRelationship, string> = {
  moi_meme: 'Pour moi-même',
  parent: 'Pour un parent',
  conjoint: 'Pour mon conjoint',
  enfant: 'Pour mon enfant',
  autre: 'Pour une autre personne',
};

export const serviceTypeLabels: Record<LeadServiceType, string> = {
  aide_a_domicile: 'Aide à domicile',
  soins_infirmiers: 'Soins infirmiers',
  accompagnement_handicap: 'Accompagnement handicap',
  garde_nuit: 'Garde de nuit',
  transport: 'Transport médical',
  autre: 'Autre / je ne sais pas',
};

export const urgencyLabels: Record<LeadUrgency, string> = {
  urgent: 'Urgent — sous 48 h',
  cette_semaine: 'Cette semaine',
  ce_mois: 'Dans le mois',
  pas_presse: 'Pas pressé(e)',
};

export const urgencyColors: Record<LeadUrgency, string> = {
  urgent: 'text-danger-700 bg-danger-50 dark:bg-danger-700/20 dark:text-danger-100',
  cette_semaine: 'text-warn-700 bg-warn-50 dark:bg-warn-600/20 dark:text-warn-100',
  ce_mois: 'text-info-700 bg-info-50 dark:bg-info-600/20 dark:text-info-100',
  pas_presse: 'text-ink-600 bg-ink-100 dark:bg-ink-900 dark:text-ink-300',
};

export const statusLabels: Record<LeadStatus, string> = {
  nouveau: 'Nouveau',
  qualifie: 'Qualifié',
  en_cours: 'En cours',
  converti: 'Converti en client',
  perdu: 'Perdu',
  a_rappeler: 'À rappeler',
};

export const statusColors: Record<LeadStatus, string> = {
  nouveau: 'bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200',
  qualifie: 'bg-info-100 text-info-700 dark:bg-info-600/30 dark:text-info-100',
  en_cours: 'bg-warn-100 text-warn-700 dark:bg-warn-600/30 dark:text-warn-100',
  converti: 'bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200',
  perdu: 'bg-ink-100 text-ink-500 dark:bg-ink-900 dark:text-ink-400',
  a_rappeler: 'bg-danger-100 text-danger-700 dark:bg-danger-700/30 dark:text-danger-100',
};

export interface LeadQualification {
  priorityScore: number;
  qualificationNote: string;
}

export function qualifyLead(
  urgency: LeadUrgency,
  serviceType: LeadServiceType,
  situation: string
): LeadQualification {
  let score = 50;
  let note = '';

  switch (urgency) {
    case 'urgent':
      score += 35;
      note = 'Demande urgente — rappeler sous 2 h. ';
      break;
    case 'cette_semaine':
      score += 20;
      note = "Rappeler aujourd'hui ou demain. ";
      break;
    case 'ce_mois':
      score += 8;
      note = 'Rappeler dans la semaine. ';
      break;
    case 'pas_presse':
      score -= 5;
      note = 'Pas de pression — rappel différé possible. ';
      break;
  }

  switch (serviceType) {
    case 'aide_a_domicile':
      score += 10;
      note += 'Aide à domicile — service récurrent. ';
      break;
    case 'soins_infirmiers':
      score += 12;
      note += 'Soins infirmiers — prescription probable. ';
      break;
    case 'garde_nuit':
      score += 8;
      break;
    case 'accompagnement_handicap':
      score += 6;
      break;
    case 'transport':
      score += 2;
      break;
  }

  if (situation.trim().length >= 20) {
    score += 5;
    note += 'Situation décrite — qualification facilitée. ';
  }

  score = Math.max(0, Math.min(100, score));
  return { priorityScore: score, qualificationNote: note.trim() };
}

export async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchNewLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('status', 'nouveau')
    .order('priority_score', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchUrgentLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('status', 'nouveau')
    .gte('priority_score', 70)
    .order('priority_score', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export interface NewLeadInput {
  full_name: string;
  phone: string;
  email: string | null;
  relationship: LeadRelationship;
  service_type: LeadServiceType;
  urgency: LeadUrgency;
  situation: string;
  preferred_contact_time: string | null;
  city: string | null;
}

export async function createLead(input: NewLeadInput): Promise<Lead> {
  const q = qualifyLead(input.urgency, input.service_type, input.situation);
  const { data, error } = await supabase
    .from('leads')
    .insert({
      full_name: input.full_name.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || null,
      relationship: input.relationship,
      service_type: input.service_type,
      urgency: input.urgency,
      situation: input.situation.trim(),
      preferred_contact_time: input.preferred_contact_time?.trim() || null,
      city: input.city?.trim() || null,
      status: 'nouveau',
      priority_score: q.priorityScore,
      qualification_note: q.qualificationNote,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function markLeadCalled(id: string): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('leads')
    .update({ called_at: now, updated_at: now })
    .eq('id', id);
  if (error) throw error;
}

export interface LeadStats {
  total: number;
  newCount: number;
  urgentNewCount: number;
  qualifiedCount: number;
  inProgressCount: number;
  convertedCount: number;
  lostCount: number;
  callBackCount: number;
  conversionRate: number;
  avgResponseMinutes: number;
}

export async function computeLeadStats(): Promise<LeadStats> {
  const { data: leads, error } = await supabase.from('leads').select('*');
  if (error) throw error;
  const all = leads ?? [];

  const total = all.length;
  const newCount = all.filter((l) => l.status === 'nouveau').length;
  const urgentNewCount = all.filter((l) => l.status === 'nouveau' && l.priority_score >= 70).length;
  const qualifiedCount = all.filter((l) => l.status === 'qualifie').length;
  const inProgressCount = all.filter((l) => l.status === 'en_cours').length;
  const convertedCount = all.filter((l) => l.status === 'converti').length;
  const lostCount = all.filter((l) => l.status === 'perdu').length;
  const callBackCount = all.filter((l) => l.status === 'a_rappeler').length;

  const closedLeads = convertedCount + lostCount;
  const conversionRate = closedLeads > 0 ? Math.round((convertedCount / closedLeads) * 100) : 0;

  const calledLeads = all.filter((l) => l.called_at);
  const avgResponseMinutes = calledLeads.length > 0
    ? Math.round(
        calledLeads.reduce((s, l) => {
          const diff = (new Date(l.called_at!).getTime() - new Date(l.created_at).getTime()) / 60000;
          return s + diff;
        }, 0) / calledLeads.length
      )
    : 0;

  return {
    total, newCount, urgentNewCount, qualifiedCount, inProgressCount,
    convertedCount, lostCount, callBackCount, conversionRate, avgResponseMinutes,
  };
}
