import type { HospitalDischarge, DischargeStep } from '@/lib/types';

// ============================================================
// Données fictives — parcours hôpital → domicile
// ============================================================

export const dischargeSteps: { key: DischargeStep; label: string; icon: string }[] = [
  { key: 'hopital', label: 'Hôpital', icon: '🏥' },
  { key: 'preparation', label: 'Préparation', icon: '📋' },
  { key: 'professionnels', label: 'Professionnels', icon: '💉' },
  { key: 'service', label: 'Service à domicile', icon: '👩‍⚕️' },
  { key: 'retour', label: 'Retour à domicile', icon: '🏠' },
  { key: 'famille', label: 'Famille', icon: '👨‍👩‍👧' },
  { key: 'suivi', label: 'Suivi post-sortie', icon: '📊' },
];

export const hospitalDischarges: HospitalDischarge[] = [
  {
    id: 'hd-1',
    patient_name: 'Mme Martin',
    discharge_date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    return_location: '12 rue des Lilas, Lyon 6e (domicile)',
    preparation_score: 67,
    current_step: 'preparation',
    checklist: [
      { id: 'ck-1', label: 'Famille informée de la sortie', status: 'confirme', category: 'Famille' },
      { id: 'ck-2', label: 'Aide à domicile confirmée (Sarah Mercier, mercredi matin)', status: 'confirme', category: 'Service' },
      { id: 'ck-3', label: 'IDEL identifié et disponible', status: 'non_confirme', category: 'Professionnels' },
      { id: 'ck-4', label: 'Matériel médical livré (matelas anti-escarres)', status: 'non_confirme', category: 'Matériel' },
      { id: 'ck-5', label: 'Déambulateur vérifié et disponible', status: 'en_attente', category: 'Matériel' },
      { id: 'ck-6', label: 'Premier passage confirmé', status: 'non_confirme', category: 'Service' },
      { id: 'ck-7', label: 'Ordonnance et plan de soin transmis', status: 'confirme', category: 'Médical' },
      { id: 'ck-8', label: 'Transport retour domicile organisé', status: 'confirme', category: 'Logistique' },
      { id: 'ck-9', label: 'Domicile adapté vérifié (barres d\'appui, tapis antidérapants)', status: 'en_attente', category: 'Logistique' },
      { id: 'ck-10', label: 'Kinésithérapeute identifié', status: 'non_confirme', category: 'Professionnels' },
    ],
    needs: [
      'Aide à la toilette matinale (45 min, 5j/7)',
      'Préparation des repas (30 min, 5j/7)',
      'Aide à la mobilité (déambulateur)',
      'Surveillance du traitement anticoagulant',
      'Soins infirmiers : vérification des constantes, suivi post-opératoire',
      'Rééducation à la marche (kinésithérapeute)',
    ],
    professionals: [
      { role: 'IDEL (infirmière libérale)', name: 'Mme Fournier', confirmed: false },
      { role: 'Aide à domicile', name: 'Sarah Mercier', confirmed: true },
      { role: 'Kinésithérapeute', name: 'À identifier', confirmed: false },
      { role: 'Médecin traitant', name: 'Dr. Lambert', confirmed: true },
    ],
    family_informed: true,
    rupture_risk: true,
    rupture_reasons: [
      'IDEL non confirmé à 2 jours de la sortie',
      'Matériel non livré (matelas anti-escarres manquant en stock)',
      'Premier passage non confirmé',
      'Kinésithérapeute non identifié — risque de retard dans la rééducation',
      'Adaptation du domicile non vérifiée',
    ],
    post_discharge_followup: [
      { day: 1, label: 'Premier passage aide à domicile réalisé', done: false },
      { day: 1, label: 'Passage IDEL (constantes, pansement)', done: false },
      { day: 1, label: 'Famille contactée (retour ok ?)', done: false },
      { day: 1, label: 'Problème signalé ?', done: false },
      { day: 3, label: 'Point avec le médecin traitant', done: false },
      { day: 3, label: 'Analyse des événements J+3', done: false },
      { day: 7, label: 'Bilan du retour à domicile', done: false },
      { day: 7, label: 'Début rééducation (kiné)', done: false },
      { day: 14, label: 'Réévaluation des besoins', done: false },
    ],
  },
  {
    id: 'hd-2',
    patient_name: 'M. Petit',
    discharge_date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    return_location: '8 avenue Jean Jaurès, Villeurbanne (domicile)',
    preparation_score: 92,
    current_step: 'suivi',
    checklist: [
      { id: 'ck-11', label: 'Famille informée de la sortie', status: 'confirme', category: 'Famille' },
      { id: 'ck-12', label: 'Aide à domicile confirmée (Karim Benali)', status: 'confirme', category: 'Service' },
      { id: 'ck-13', label: 'IDEL identifié et disponible (Mme Fournier)', status: 'confirme', category: 'Professionnels' },
      { id: 'ck-14', label: 'Matériel livré et installé', status: 'confirme', category: 'Matériel' },
      { id: 'ck-15', label: 'Premier passage confirmé et réalisé', status: 'confirme', category: 'Service' },
      { id: 'ck-16', label: 'Ordonnance et plan de soin transmis', status: 'confirme', category: 'Médical' },
      { id: 'ck-17', label: 'Transport retour organisé et réalisé', status: 'confirme', category: 'Logistique' },
    ],
    needs: [
      'Soins infirmiers quotidiens (pansement, 15 min)',
      'Aide à la toilette (30 min, 3j/7)',
    ],
    professionals: [
      { role: 'IDEL (infirmière libérale)', name: 'Mme Fournier', confirmed: true },
      { role: 'Aide à domicile', name: 'Karim Benali', confirmed: true },
    ],
    family_informed: true,
    rupture_risk: false,
    rupture_reasons: [],
    post_discharge_followup: [
      { day: 1, label: 'Premier passage IDEL réalisé', done: true },
      { day: 1, label: 'Aide à domicile réalisée', done: true },
      { day: 1, label: 'Problème signalé ?', done: true },
      { day: 3, label: 'Analyse des événements J+3', done: true },
      { day: 7, label: 'Bilan du retour à domicile', done: false },
    ],
  },
  {
    id: 'hd-3',
    patient_name: 'Mme Bernard',
    discharge_date: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    return_location: '8 avenue de la Gare, 2e étage sans ascenseur',
    preparation_score: 35,
    current_step: 'hopital',
    checklist: [
      { id: 'ck-18', label: 'Famille informée de la sortie', status: 'en_attente', category: 'Famille' },
      { id: 'ck-19', label: 'Aide à domicile confirmée', status: 'non_confirme', category: 'Service' },
      { id: 'ck-20', label: 'IDEL identifié et disponible', status: 'non_confirme', category: 'Professionnels' },
      { id: 'ck-21', label: 'Matériel médical identifié', status: 'non_confirme', category: 'Matériel' },
      { id: 'ck-22', label: 'Évaluation de l\'accessibilité du domicile (2e étage sans ascenseur)', status: 'non_confirme', category: 'Logistique' },
      { id: 'ck-23', label: 'Premier passage confirmé', status: 'non_confirme', category: 'Service' },
      { id: 'ck-24', label: 'Ordonnance et plan de soin transmis', status: 'en_attente', category: 'Médical' },
      { id: 'ck-25', label: 'Transport retour organisé (brancard, 2e étage)', status: 'non_confirme', category: 'Logistique' },
    ],
    needs: [
      'Aide à la toilette et habillage (60 min, 7j/7)',
      'Transfert lit-fauteuil (2 personnes requises)',
      'Surveillance neurologique post-AIT',
      'Stimulation cognitive',
      'Accompagnement anxiété',
      'Évaluation de l\'accessibilité du logement (escalier sans ascenseur)',
    ],
    professionals: [
      { role: 'IDEL (infirmière libérale)', name: 'À identifier', confirmed: false },
      { role: 'Aide à domicile (binôme transfert)', name: 'Élodie Faure + Mamadou Diallo', confirmed: false },
      { role: 'Neuropsychologue', name: 'À identifier', confirmed: false },
      { role: 'Médecin traitant', name: 'Dr. Moreau', confirmed: true },
    ],
    family_informed: false,
    rupture_risk: true,
    rupture_reasons: [
      'Score de préparation très bas (35%) — la plupart des éléments ne sont pas confirmés',
      'Famille non encore informée de la date de sortie',
      'Domicile au 2e étage sans ascenseur — accessibilité non évaluée pour une patiente à mobilité très réduite',
      'Besoin de 2 intervenants simultanés pour les transferts — non planifié',
      'Suspicion d\'AIT récente — surveillance neurologique à organiser',
      'Aucun professionnel de santé confirmé à J-5',
    ],
    post_discharge_followup: [
      { day: 1, label: 'Premier passage binôme réalisé', done: false },
      { day: 1, label: 'Passage IDEL (surveillance neuro)', done: false },
      { day: 1, label: 'Famille contactée', done: false },
      { day: 1, label: 'Évaluation accessibilité escalier', done: false },
      { day: 3, label: 'Point médecin traitant', done: false },
      { day: 3, label: 'Bilan cognitif préliminaire', done: false },
      { day: 7, label: 'Bilan complet du retour à domicile', done: false },
      { day: 14, label: 'Réévaluation des besoins et de l\'accessibilité', done: false },
    ],
  },
];

// ============================================================
// Fonctions utilitaires
// ============================================================

export function getDischargeScoreColor(score: number): string {
  if (score >= 80) return 'text-brand-600 dark:text-brand-300';
  if (score >= 50) return 'text-warn-600 dark:text-warn-300';
  return 'text-danger-600 dark:text-danger-300';
}

export function getDischargeScoreBg(score: number): string {
  if (score >= 80) return 'bg-brand-500';
  if (score >= 50) return 'bg-warn-500';
  return 'bg-danger-500';
}
