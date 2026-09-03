import type { FamilyMember, PassageRecord, FamilyMessage } from '@/lib/types';

// ============================================================
// Données fictives — module famille
// ============================================================

function daysAgo(d: number, hour = 10): string {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  dt.setHours(hour, 0, 0, 0);
  return dt.toISOString();
}

// ============================================================
// Membres de famille autorisés — 5 membres pour 3 patients
// ============================================================

export const familyMembers: FamilyMember[] = [
  {
    id: 'fm-1',
    patient_id: 'p-1',
    patient_name: 'Mme Martin',
    first_name: 'Sophie',
    last_name: 'Renaud',
    relationship: 'Fille',
    phone: '06 12 34 56 78',
    email: 'sophie.renaud@email.fr',
    access_level: 'passages_et_infos',
    authorized: true,
  },
  {
    id: 'fm-2',
    patient_id: 'p-2',
    patient_name: 'M. Durand',
    first_name: 'Pierre',
    last_name: 'Durand',
    relationship: 'Fils',
    phone: '07 88 12 34 56',
    email: 'pierre.durand@email.fr',
    access_level: 'passages',
    authorized: true,
  },
  {
    id: 'fm-3',
    patient_id: 'p-3',
    patient_name: 'Mme Lefèvre',
    first_name: 'Marie',
    last_name: 'Lefèvre',
    relationship: 'Fille',
    phone: '06 45 67 89 01',
    email: null,
    access_level: 'passages',
    authorized: true,
  },
  {
    id: 'fm-4',
    patient_id: 'p-1',
    patient_name: 'Mme Martin',
    first_name: 'Jean-Paul',
    last_name: 'Martin',
    relationship: 'Fils',
    phone: '06 78 90 12 34',
    email: 'jp.martin@email.fr',
    access_level: 'passages',
    authorized: true,
  },
  {
    id: 'fm-5',
    patient_id: 'p-4',
    patient_name: 'M. Rousseau',
    first_name: 'Catherine',
    last_name: 'Rousseau',
    relationship: 'Épouse',
    phone: '06 33 22 11 00',
    email: 'catherine.rousseau@email.fr',
    access_level: 'passages_et_infos',
    authorized: true,
  },
];

// ============================================================
// Enregistrements de passages — 2 semaines de données
// ============================================================

export const passageRecords: PassageRecord[] = [
  // Mme Martin — passages réguliers (5j/7)
  { id: 'pg-1', patient_id: 'p-1', patient_name: 'Mme Martin', date: daysAgo(0, 8), caregiver_name: 'Sarah Mercier', went_well: true, note_shared: 'Le passage s\'est bien déroulé. Mme Martin était en forme ce matin.' },
  { id: 'pg-2', patient_id: 'p-1', patient_name: 'Mme Martin', date: daysAgo(1, 8), caregiver_name: 'Karim Benali', went_well: true, note_shared: 'Passage réalisé normalement. Léger mal de dos signalé.' },
  { id: 'pg-3', patient_id: 'p-1', patient_name: 'Mme Martin', date: daysAgo(2, 8), caregiver_name: 'Sarah Mercier', went_well: true, note_shared: null },
  { id: 'pg-4', patient_id: 'p-1', patient_name: 'Mme Martin', date: daysAgo(3, 8), caregiver_name: 'Julie Bernard', went_well: true, note_shared: 'Tout s\'est bien passé. Repas préparé et médicaments vérifiés.' },
  { id: 'pg-5', patient_id: 'p-1', patient_name: 'Mme Martin', date: daysAgo(4, 8), caregiver_name: 'Sarah Mercier', went_well: false, note_shared: 'Mme Martin était fatiguée et a peu mangé. Le bureau est informé.' },
  { id: 'pg-6', patient_id: 'p-1', patient_name: 'Mme Martin', date: daysAgo(7, 8), caregiver_name: 'Sarah Mercier', went_well: true, note_shared: 'Passage normal.' },
  { id: 'pg-7', patient_id: 'p-1', patient_name: 'Mme Martin', date: daysAgo(8, 8), caregiver_name: 'Karim Benali', went_well: true, note_shared: null },
  { id: 'pg-8', patient_id: 'p-1', patient_name: 'Mme Martin', date: daysAgo(9, 8), caregiver_name: 'Sarah Mercier', went_well: true, note_shared: 'Bonne forme.' },
  { id: 'pg-9', patient_id: 'p-1', patient_name: 'Mme Martin', date: daysAgo(10, 8), caregiver_name: 'Julie Bernard', went_well: true, note_shared: null },
  { id: 'pg-10', patient_id: 'p-1', patient_name: 'Mme Martin', date: daysAgo(11, 8), caregiver_name: 'Sarah Mercier', went_well: true, note_shared: 'Tout s\'est bien passé.' },

  // M. Durand — passages 3j/7
  { id: 'pg-11', patient_id: 'p-2', patient_name: 'M. Durand', date: daysAgo(0, 9), caregiver_name: 'Thomas Leroy', went_well: true, note_shared: 'Le passage s\'est bien déroulé.' },
  { id: 'pg-12', patient_id: 'p-2', patient_name: 'M. Durand', date: daysAgo(1, 9), caregiver_name: 'Thomas Leroy', went_well: true, note_shared: null },
  { id: 'pg-13', patient_id: 'p-2', patient_name: 'M. Durand', date: daysAgo(2, 9), caregiver_name: 'Nadia Cherif', went_well: true, note_shared: null },
  { id: 'pg-14', patient_id: 'p-2', patient_name: 'M. Durand', date: daysAgo(5, 9), caregiver_name: 'Thomas Leroy', went_well: true, note_shared: 'Passage normal, M. Durand de bonne humeur.' },
  { id: 'pg-15', patient_id: 'p-2', patient_name: 'M. Durand', date: daysAgo(7, 9), caregiver_name: 'Thomas Leroy', went_well: false, note_shared: 'M. Durand s\'est plaint de vertiges. Signalé au bureau.' },
  { id: 'pg-16', patient_id: 'p-2', patient_name: 'M. Durand', date: daysAgo(9, 9), caregiver_name: 'Nadia Cherif', went_well: true, note_shared: null },

  // Mme Lefèvre — passages 2j/7
  { id: 'pg-17', patient_id: 'p-3', patient_name: 'Mme Lefèvre', date: daysAgo(0, 14), caregiver_name: 'Nadia Cherif', went_well: true, note_shared: 'Passage de l\'après-midi. Tout s\'est bien passé.' },
  { id: 'pg-18', patient_id: 'p-3', patient_name: 'Mme Lefèvre', date: daysAgo(3, 14), caregiver_name: 'Nadia Cherif', went_well: true, note_shared: null },
  { id: 'pg-19', patient_id: 'p-3', patient_name: 'Mme Lefèvre', date: daysAgo(7, 14), caregiver_name: 'Nadia Cherif', went_well: true, note_shared: 'Bonne forme malgré la panne d\'ascenseur.' },

  // M. Rousseau — passages 5j/7
  { id: 'pg-20', patient_id: 'p-4', patient_name: 'M. Rousseau', date: daysAgo(0, 11), caregiver_name: 'Karim Benali', went_well: true, note_shared: 'Pansement refait. Bonne cicatrisation.' },
  { id: 'pg-21', patient_id: 'p-4', patient_name: 'M. Rousseau', date: daysAgo(1, 11), caregiver_name: 'Karim Benali', went_well: true, note_shared: 'Pansement vérifié. Rien à signaler.' },
  { id: 'pg-22', patient_id: 'p-4', patient_name: 'M. Rousseau', date: daysAgo(2, 11), caregiver_name: 'Mamadou Diallo', went_well: true, note_shared: null },
  { id: 'pg-23', patient_id: 'p-4', patient_name: 'M. Rousseau', date: daysAgo(3, 11), caregiver_name: 'Karim Benali', went_well: true, note_shared: 'Bonne évolution.' },
  { id: 'pg-24', patient_id: 'p-4', patient_name: 'M. Rousseau', date: daysAgo(4, 11), caregiver_name: 'Karim Benali', went_well: true, note_shared: null },
];

// ============================================================
// Messages famille → bureau — 8 messages variés
// ============================================================

export const familyMessages: FamilyMessage[] = [
  {
    id: 'msg-1',
    family_member_name: 'Sophie Renaud',
    patient_name: 'Mme Martin',
    type: 'question',
    content: 'Est-ce que ma mère a bien pris ses nouveaux médicaments hier ? Je n\'ai pas eu de retour.',
    status: 'nouveau',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'msg-2',
    family_member_name: 'Pierre Durand',
    patient_name: 'M. Durand',
    type: 'rappel',
    content: 'Pourriez-vous me rappeler pour discuter de l\'évolution de mon père ? Il se plaint de vertiges depuis la semaine dernière.',
    status: 'nouveau',
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'msg-3',
    family_member_name: 'Marie Lefèvre',
    patient_name: 'Mme Lefèvre',
    type: 'information',
    content: 'Ma mère a rendez-vous chez le cardiologue jeudi à 15h, il faudrait adapter l\'horaire du passage de l\'après-midi.',
    status: 'traite',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'msg-4',
    family_member_name: 'Sophie Renaud',
    patient_name: 'Mme Martin',
    type: 'information',
    content: 'Je passerai voir ma mère dimanche matin. Si l\'intervenante peut venir l\'après-midi plutôt, ce serait idéal.',
    status: 'traite',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'msg-5',
    family_member_name: 'Jean-Paul Martin',
    patient_name: 'Mme Martin',
    type: 'question',
    content: 'Le lit médicalisé de ma mère est en panne d\'après ce que j\'ai compris. Quand sera-t-il réparé ?',
    status: 'nouveau',
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'msg-6',
    family_member_name: 'Catherine Rousseau',
    patient_name: 'M. Rousseau',
    type: 'information',
    content: 'Mon mari a reçu de nouvelles compresses de la pharmacie. Elles sont sur la table de la cuisine.',
    status: 'traite',
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    id: 'msg-7',
    family_member_name: 'Pierre Durand',
    patient_name: 'M. Durand',
    type: 'rappel',
    content: 'Je n\'ai toujours pas eu de nouvelles concernant les vertiges de mon père. Merci de me rappeler.',
    status: 'nouveau',
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
  {
    id: 'msg-8',
    family_member_name: 'Catherine Rousseau',
    patient_name: 'M. Rousseau',
    type: 'question',
    content: 'Le fauteuil roulant de mon mari est en réparation. Savez-vous quand il sera de retour ?',
    status: 'nouveau',
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
];

// ============================================================
// Fonctions utilitaires
// ============================================================

export function getPassagesForPatient(patientId: string): PassageRecord[] {
  return passageRecords.filter((p) => p.patient_id === patientId);
}

export function getPassagesForFamily(familyMemberId: string): PassageRecord[] {
  const fm = familyMembers.find((f) => f.id === familyMemberId);
  if (!fm) return [];
  return passageRecords.filter((p) => p.patient_id === fm.patient_id);
}
