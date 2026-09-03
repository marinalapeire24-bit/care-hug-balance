export type Role =
  | 'soignant'
  | 'infirmier_referent'
  | 'coordinateur'
  | 'directeur'
  | 'rh'
  | 'referent_qualite'
  | 'administrateur'
  | 'professionnel_sante'
  | 'famille';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  created_at: string;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  environment: 'domicile' | 'etablissement';
  room: string | null;
  address: string | null;
  fragility_level: number;
  summary: string;
  created_at: string;
}

export interface Intervention {
  id: string;
  patient_id: string;
  caregiver_id: string;
  scheduled_at: string;
  duration_minutes: number;
  difficulty_level: number;
  travel_minutes: number;
  address: string | null;
  room: string | null;
  instructions: string;
  required_equipment: string;
  required_skills: string;
  status: 'a_faire' | 'en_cours' | 'termine';
  created_at: string;
  actual_start: string | null;
  actual_end: string | null;
  actual_duration: number | null;
  actual_travel: number | null;
  actual_difficulty: number | null;
  variance_reason: string | null;
  extra_tasks: string | null;
}

export type InvisibleTaskType =
  | 'appel'
  | 'coordination'
  | 'attente'
  | 'materiel'
  | 'transmission'
  | 'aide_collegue'
  | 'imprevu'
  | 'deplacement'
  | 'accompagnement'
  | 'autre';

export interface InvisibleTask {
  id: string;
  caregiver_id: string;
  type: InvisibleTaskType;
  duration_minutes: number;
  note: string;
  created_at: string;
}

export type AlertLevel = 'critique' | 'attention' | 'info';

export interface PatientAlert {
  id: string;
  patient_id: string;
  level: AlertLevel;
  message: string;
  created_at: string;
}

export interface PatientChange {
  id: string;
  patient_id: string;
  category: string;
  description: string;
  occurred_at: string;
  source: string;
  created_at: string;
}

export interface DifficultyReport {
  id: string;
  caregiver_id: string;
  intervention_id: string | null;
  type: string;
  note: string;
  suggested_action: string;
  status: 'ouvert' | 'en_cours' | 'resolu';
  created_at: string;
}

// ============================================================
// Leads — already in leads.ts
// ============================================================

export type LeadRelationship = 'moi_meme' | 'parent' | 'conjoint' | 'enfant' | 'autre';
export type LeadServiceType =
  | 'aide_a_domicile'
  | 'soins_infirmiers'
  | 'accompagnement_handicap'
  | 'garde_nuit'
  | 'transport'
  | 'autre';
export type LeadUrgency = 'urgent' | 'cette_semaine' | 'ce_mois' | 'pas_presse';
export type LeadStatus = 'nouveau' | 'qualifie' | 'en_cours' | 'converti' | 'perdu' | 'a_rappeler';

export interface Lead {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  relationship: LeadRelationship;
  service_type: LeadServiceType;
  urgency: LeadUrgency;
  situation: string;
  preferred_contact_time: string | null;
  city: string | null;
  status: LeadStatus;
  priority_score: number;
  qualification_note: string;
  assigned_to: string | null;
  called_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Module organisation — terrain + bureau + copilote
// ============================================================

export type HelpRequestType =
  | 'intervention'
  | 'retard'
  | 'surcharge'
  | 'difficulte_personne'
  | 'materiel'
  | 'remplacement'
  | 'renfort'
  | 'organisationnel'
  | 'autre';

export type HelpRequestStatus = 'ouvert' | 'en_cours' | 'resolu';

export interface HelpRequest {
  id: string;
  caregiver_name: string;
  type: HelpRequestType;
  description: string;
  status: HelpRequestStatus;
  proposed_solutions: ProposedSolution[];
  created_at: string;
  resolved_at: string | null;
}

export interface ProposedSolution {
  id: string;
  person_name: string;
  available: boolean;
  skill_match: boolean;
  travel_minutes: number;
  load_percent: number;
  knows_patient: boolean;
  recommendation_reasons: string[];
  incompatibility_reasons: string[];
  compatible: boolean;
}

export type ProblemCategory = 'materiel' | 'securite' | 'environnement' | 'organisation' | 'autre';
export type ProblemUrgency = 'info' | 'attention' | 'urgent';

export interface ProblemReport {
  id: string;
  caregiver_name: string;
  category: ProblemCategory;
  comment: string;
  urgency: ProblemUrgency;
  photo_url: string | null;
  status: 'nouveau' | 'en_cours' | 'resolu';
  created_at: string;
}

export type IncidentLevel = 'securite' | 'incident' | 'chute' | 'materiel' | 'renfort' | 'autre';

export interface Incident {
  id: string;
  caregiver_name: string;
  patient_name: string | null;
  level: IncidentLevel;
  description: string;
  status: 'ouvert' | 'pris_en_charge' | 'resolu';
  created_at: string;
}

// ============================================================
// Équipe, compétences, matériel
// ============================================================

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  skills: string[];
  sector: string;
  today_load_percent: number;
  today_intervention_count: number;
  available: boolean;
  current_status: 'disponible' | 'en_intervention' | 'en_pause' | 'absent';
}

export interface MaterialItem {
  id: string;
  name: string;
  status: 'disponible' | 'manquant' | 'defectueux' | 'en_reparation' | 'commande';
  location: string;
  urgency: 'normal' | 'urgent';
  note: string;
  last_updated: string;
}

// ============================================================
// Copilote — prévisions, tendances, simulation
// ============================================================

export type ForecastLevel = 'info' | 'vigilance' | 'risque';

export interface Forecast {
  id: string;
  title: string;
  level: ForecastLevel;
  period: string;
  cause: string;
  impact: string;
  solutions: string[];
}

export interface OrganizationalProblem {
  id: string;
  title: string;
  description: string;
  cause: string;
  trend: 'hausse' | 'stable' | 'baisse';
  occurrences: number;
  sector: string | null;
}

export interface SimulationResult {
  acceptable: boolean;
  level: 'good' | 'watch' | 'risk';
  capacity_percent: number;
  summary: string;
  details: string[];
}

export interface DecisionImpact {
  id: string;
  title: string;
  before_value: string;
  after_value: string;
  improved: boolean;
  date: string;
}

// ============================================================
// Module famille
// ============================================================

export interface FamilyMember {
  id: string;
  patient_id: string;
  patient_name: string;
  first_name: string;
  last_name: string;
  relationship: string;
  phone: string;
  email: string | null;
  access_level: 'passages' | 'passages_et_infos';
  authorized: boolean;
}

export interface PassageRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  date: string;
  caregiver_name: string;
  went_well: boolean | null;
  note_shared: string | null;
}

export interface FamilyMessage {
  id: string;
  family_member_name: string;
  patient_name: string;
  type: 'rappel' | 'question' | 'information';
  content: string;
  status: 'nouveau' | 'traite';
  created_at: string;
}

// ============================================================
// Parcours hôpital → domicile
// ============================================================

export type DischargeStep = 'hopital' | 'preparation' | 'professionnels' | 'service' | 'retour' | 'famille' | 'suivi';

export interface DischargeChecklistItem {
  id: string;
  label: string;
  status: 'confirme' | 'en_attente' | 'non_confirme';
  category: string;
}

export interface HospitalDischarge {
  id: string;
  patient_name: string;
  discharge_date: string;
  return_location: string;
  preparation_score: number;
  current_step: DischargeStep;
  checklist: DischargeChecklistItem[];
  needs: string[];
  professionals: { role: string; name: string; confirmed: boolean }[];
  family_informed: boolean;
  rupture_risk: boolean;
  rupture_reasons: string[];
  post_discharge_followup: { day: number; label: string; done: boolean }[];
}

// ============================================================
// Parcours CareBalance — types pour le parcours complet
// ============================================================

export type CareRequestStatus = 'a_traiter' | 'en_cours' | 'acceptee' | 'refusee' | 'terminee';

export interface CareRequest {
  id: string;
  patient_id: string;
  created_by: string;
  hospital_name: string;
  hospital_service: string;
  hospitalization_reason: string;
  discharge_date: string | null;
  autonomy_level: number;
  situation_summary: string;
  precautions: string;
  needs_summary: string;
  status: CareRequestStatus;
  created_at: string;
  updated_at: string;
  // joined
  patient?: Patient;
  steps?: PathwayStep[];
  evaluation?: CareEvaluation | null;
  care_plan?: CarePlan | null;
}

export interface CareEvaluation {
  id: string;
  care_request_id: string;
  evaluated_by: string;
  autonomy_score: number;
  home_environment: string;
  risks: string;
  material_needs: string;
  human_needs: string;
  services_needed: string;
  frequency: string;
  duration_per_visit: number;
  evaluation_type: 'domicile' | 'distance';
  notes: string;
  validated: boolean;
  created_at: string;
}

export type CarePlanStatus = 'brouillon' | 'valide' | 'en_cours' | 'termine';

export interface CarePlanService {
  name: string;
  frequency: string;
  duration_minutes: number;
  description: string;
}

export interface CarePlan {
  id: string;
  care_request_id: string;
  evaluation_id: string | null;
  created_by: string;
  title: string;
  services: CarePlanService[];
  professionals_needed: { role: string; count: number }[];
  material_needed: { item: string; status: string }[];
  schedule_summary: string;
  status: CarePlanStatus;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
}

export type PathwayStepStatus = 'a_venir' | 'en_cours' | 'termine' | 'en_attente' | 'bloque';

export const PATHWAY_STEP_KEYS = [
  'demande_sortie',
  'demande_recue',
  'dossier_etudie',
  'evaluation_besoins',
  'plan_aide_defini',
  'professionnels_recherches',
  'materiel_identifie',
  'intervenants_affectes',
  'planning_organise',
  'documents_transmis',
  'retour_programme',
  'retour_effectue',
  'premiere_intervention',
  'prise_en_charge',
  'suivi_post_retour',
] as const;

export type PathwayStepKey = typeof PATHWAY_STEP_KEYS[number];

export interface PathwayStep {
  id: string;
  care_request_id: string;
  step_number: number;
  step_key: string;
  label: string;
  status: PathwayStepStatus;
  responsible_name: string;
  responsible_role: string;
  started_at: string | null;
  completed_at: string | null;
  blocked_reason: string | null;
  blocked_since: string | null;
  notes: string;
}

export interface PathwayHistoryEntry {
  id: string;
  care_request_id: string;
  step_number: number | null;
  action: string;
  performed_by: string | null;
  performed_by_name: string;
  details: string;
  created_at: string;
}

export type TransmissionCategory = 'observation' | 'alerte' | 'evolution' | 'consigne' | 'information';
export type TransmissionPriority = 'normale' | 'importante' | 'urgente';

export interface Transmission {
  id: string;
  patient_id: string;
  care_request_id: string | null;
  author_id: string;
  author_name: string;
  content: string;
  category: TransmissionCategory;
  priority: TransmissionPriority;
  target_role: string | null;
  read_by: string[];
  created_at: string;
}

export type FamilyNotificationType = 'passage_effectue' | 'passage_en_cours' | 'passage_non_effectue' | 'passage_reprogramme' | 'information';

export interface FamilyNotification {
  id: string;
  patient_id: string;
  family_member_id: string;
  type: FamilyNotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export type DocumentCategory = 'cr_hospitalier' | 'ordonnance' | 'evaluation' | 'plan_aide' | 'administratif' | 'autre';

export interface CareDocument {
  id: string;
  patient_id: string;
  care_request_id: string | null;
  uploaded_by: string;
  name: string;
  category: DocumentCategory;
  description: string;
  file_url: string | null;
  created_at: string;
}
