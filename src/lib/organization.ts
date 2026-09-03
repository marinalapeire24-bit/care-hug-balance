import type {
  HelpRequest,
  HelpRequestType,
  ProblemReport,
  Incident,
  TeamMember,
  MaterialItem,
  Forecast,
  OrganizationalProblem,
  SimulationResult,
  DecisionImpact,
  ProposedSolution,
} from '@/lib/types';

// ============================================================
// Données fictives — organisation terrain + bureau + copilote
// ============================================================

function hoursAgo(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
}

function daysAgo(d: number): string {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt.toISOString();
}

// ============================================================
// Équipe — 10 membres (4 secteurs, rôles variés)
// ============================================================

export const teamMembers: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Sarah Mercier',
    role: 'Aide-soignante',
    skills: ['Toilette lourde', 'Aide à la mobilité', 'Prévention chutes', 'Soins palliatifs'],
    sector: 'Secteur Nord',
    today_load_percent: 82,
    today_intervention_count: 6,
    available: false,
    current_status: 'en_intervention',
  },
  {
    id: 'tm-2',
    name: 'Julie Bernard',
    role: 'Auxiliaire de vie',
    skills: ['Aide à domicile', 'Repas', 'Ménage', 'Accompagnement social', 'Courses'],
    sector: 'Secteur Sud',
    today_load_percent: 45,
    today_intervention_count: 4,
    available: true,
    current_status: 'disponible',
  },
  {
    id: 'tm-3',
    name: 'Thomas Leroy',
    role: 'Aide-soignant',
    skills: ['Toilette lourde', 'Pansements simples', 'Aide à la mobilité', 'Transfert'],
    sector: 'Secteur Nord',
    today_load_percent: 91,
    today_intervention_count: 7,
    available: false,
    current_status: 'en_intervention',
  },
  {
    id: 'tm-4',
    name: 'Nadia Cherif',
    role: 'Auxiliaire de vie',
    skills: ['Aide à domicile', 'Repas', 'Accompagnement handicap', 'Stimulation cognitive'],
    sector: 'Secteur Est',
    today_load_percent: 38,
    today_intervention_count: 3,
    available: true,
    current_status: 'disponible',
  },
  {
    id: 'tm-5',
    name: 'Karim Benali',
    role: 'Aide-soignant',
    skills: ['Toilette lourde', 'Aide à la mobilité', 'Prévention chutes', 'Gestion douleur'],
    sector: 'Secteur Sud',
    today_load_percent: 67,
    today_intervention_count: 5,
    available: false,
    current_status: 'en_pause',
  },
  {
    id: 'tm-6',
    name: 'Claire Dubois',
    role: 'Auxiliaire de vie',
    skills: ['Aide à domicile', 'Garde de nuit', 'Alzheimer', 'Accompagnement fin de vie'],
    sector: 'Secteur Ouest',
    today_load_percent: 0,
    today_intervention_count: 0,
    available: false,
    current_status: 'absent',
  },
  {
    id: 'tm-7',
    name: 'Élodie Faure',
    role: 'Aide-soignante',
    skills: ['Toilette lourde', 'Soins de plaie', 'Prévention escarres', 'Aide à la mobilité'],
    sector: 'Secteur Ouest',
    today_load_percent: 74,
    today_intervention_count: 5,
    available: false,
    current_status: 'en_intervention',
  },
  {
    id: 'tm-8',
    name: 'Mamadou Diallo',
    role: 'Aide-soignant',
    skills: ['Transfert', 'Toilette lourde', 'Aide à la mobilité', 'Manutention'],
    sector: 'Secteur Est',
    today_load_percent: 58,
    today_intervention_count: 4,
    available: true,
    current_status: 'disponible',
  },
  {
    id: 'tm-9',
    name: 'Isabelle Roux',
    role: 'Coordinatrice terrain',
    skills: ['Coordination', 'Évaluation', 'Gestion de crise', 'Formation'],
    sector: 'Tous secteurs',
    today_load_percent: 70,
    today_intervention_count: 2,
    available: true,
    current_status: 'disponible',
  },
  {
    id: 'tm-10',
    name: 'Youssef Amrani',
    role: 'Auxiliaire de vie',
    skills: ['Aide à domicile', 'Repas', 'Courses', 'Accompagnement social', 'Jardinage adapté'],
    sector: 'Secteur Nord',
    today_load_percent: 55,
    today_intervention_count: 4,
    available: false,
    current_status: 'en_intervention',
  },
];

// ============================================================
// Demandes d'aide + solutions proposées
// ============================================================

export const helpRequestTypeLabels: Record<HelpRequestType, string> = {
  intervention: "Problème avec une intervention",
  retard: 'Je suis en retard',
  surcharge: 'Je suis en surcharge',
  difficulte_personne: 'Difficulté avec une personne',
  materiel: 'Problème matériel',
  remplacement: 'Besoin de remplacement',
  renfort: 'Besoin de renfort',
  organisationnel: 'Problème organisationnel',
  autre: 'Autre',
};

const memberTravelEstimates: Record<string, number> = {
  'tm-1': 18, 'tm-2': 8, 'tm-3': 22, 'tm-4': 12, 'tm-5': 14,
  'tm-6': 30, 'tm-7': 16, 'tm-8': 10, 'tm-9': 5, 'tm-10': 20,
};

export function findSolutionsForHelp(
  _type: HelpRequestType,
  requiredSkills: string[]
): ProposedSolution[] {
  return teamMembers
    .filter((m) => m.current_status !== 'absent')
    .map((m) => {
      const skillMatch = requiredSkills.length === 0 || requiredSkills.some((s) => m.skills.includes(s));
      const loadOk = m.today_load_percent < 75;
      const reasons: string[] = [];
      const incompatibility: string[] = [];

      if (m.available) reasons.push('Disponible maintenant');
      if (skillMatch) reasons.push('Compétence adaptée');
      if (loadOk) reasons.push('Charge raisonnable');
      const travelEst = memberTravelEstimates[m.id] ?? 15;
      if (travelEst < 15) reasons.push('Trajet court');

      if (!m.available) incompatibility.push('Pas disponible actuellement');
      if (!skillMatch) incompatibility.push('Compétence non adaptée');
      if (!loadOk) incompatibility.push('Charge trop élevée');

      return {
        id: `sol-${m.id}`,
        person_name: m.name,
        available: m.available,
        skill_match: skillMatch,
        travel_minutes: memberTravelEstimates[m.id] ?? 15,
        load_percent: m.today_load_percent,
        knows_patient: Math.random() > 0.5,
        recommendation_reasons: reasons,
        incompatibility_reasons: incompatibility,
        compatible: m.available && skillMatch && loadOk,
      };
    })
    .sort((a, b) => {
      if (a.compatible !== b.compatible) return a.compatible ? -1 : 1;
      return a.load_percent - b.load_percent;
    });
}

export const helpRequests: HelpRequest[] = [
  {
    id: 'hr-1',
    caregiver_name: 'Sarah Mercier',
    type: 'remplacement',
    description: 'Je suis en retard chez Mme Martin et je ne vais pas pouvoir arriver à l\'heure chez Mme Dupont à 14h. Il faudrait quelqu\'un pour prendre le relais.',
    status: 'ouvert',
    proposed_solutions: findSolutionsForHelp('remplacement', ['Aide à domicile']),
    created_at: hoursAgo(1),
    resolved_at: null,
  },
  {
    id: 'hr-2',
    caregiver_name: 'Thomas Leroy',
    type: 'surcharge',
    description: 'Ma tournée est trop chargée aujourd\'hui, 7 interventions dont 3 difficiles. Je ne vais pas pouvoir tout faire correctement.',
    status: 'en_cours',
    proposed_solutions: findSolutionsForHelp('surcharge', ['Toilette lourde']),
    created_at: hoursAgo(2),
    resolved_at: null,
  },
  {
    id: 'hr-3',
    caregiver_name: 'Karim Benali',
    type: 'materiel',
    description: 'Le matériel de pansement n\'est pas dans le sac, je ne peux pas faire le soin prévu chez M. Petit.',
    status: 'resolu',
    proposed_solutions: [],
    created_at: hoursAgo(4),
    resolved_at: hoursAgo(3),
  },
  {
    id: 'hr-4',
    caregiver_name: 'Élodie Faure',
    type: 'renfort',
    description: 'Mme Bernard est très agitée ce matin, elle refuse de se lever. J\'ai besoin d\'une seconde personne pour le transfert en toute sécurité.',
    status: 'ouvert',
    proposed_solutions: findSolutionsForHelp('renfort', ['Transfert', 'Aide à la mobilité']),
    created_at: hoursAgo(0.5),
    resolved_at: null,
  },
  {
    id: 'hr-5',
    caregiver_name: 'Youssef Amrani',
    type: 'retard',
    description: 'Accident sur la route, je suis bloqué depuis 20 minutes. Mon prochain passage chez M. Rousseau va avoir au moins 30 min de retard.',
    status: 'en_cours',
    proposed_solutions: findSolutionsForHelp('retard', ['Aide à domicile']),
    created_at: hoursAgo(0.3),
    resolved_at: null,
  },
  {
    id: 'hr-6',
    caregiver_name: 'Mamadou Diallo',
    type: 'difficulte_personne',
    description: 'M. Girard refuse de me laisser entrer, il dit qu\'il ne me connaît pas et ne veut pas d\'aide. Il est habituellement suivi par Claire qui est absente.',
    status: 'ouvert',
    proposed_solutions: findSolutionsForHelp('difficulte_personne', ['Alzheimer', 'Accompagnement social']),
    created_at: hoursAgo(1.5),
    resolved_at: null,
  },
  {
    id: 'hr-7',
    caregiver_name: 'Julie Bernard',
    type: 'organisationnel',
    description: 'Le planning a été modifié mais je n\'ai pas reçu la mise à jour. J\'ai fait le déplacement chez Mme Lefèvre pour rien, l\'intervention était annulée.',
    status: 'resolu',
    proposed_solutions: [],
    created_at: hoursAgo(6),
    resolved_at: hoursAgo(5),
  },
];

// ============================================================
// Signalements de problèmes (avec photo)
// ============================================================

export const problemCategoryLabels: Record<string, string> = {
  materiel: 'Matériel',
  securite: 'Sécurité',
  environnement: 'Environnement',
  organisation: 'Organisation',
  autre: 'Autre',
};

export const problemUrgencyLabels: Record<string, string> = {
  info: 'Information',
  attention: 'Attention',
  urgent: 'Urgent',
};

export const problemReports: ProblemReport[] = [
  {
    id: 'pr-1',
    caregiver_name: 'Sarah Mercier',
    category: 'materiel',
    comment: 'Le lit médicalisé de Mme Martin est en panne, le moteur ne fonctionne plus. Impossible de régler la hauteur.',
    urgency: 'urgent',
    photo_url: null,
    status: 'nouveau',
    created_at: hoursAgo(1),
  },
  {
    id: 'pr-2',
    caregiver_name: 'Thomas Leroy',
    category: 'securite',
    comment: 'Le sol de la salle de bain chez M. Durand est très glissant, risque de chute important. Il faudrait un tapis antidérapant.',
    urgency: 'urgent',
    photo_url: null,
    status: 'en_cours',
    created_at: hoursAgo(3),
  },
  {
    id: 'pr-3',
    caregiver_name: 'Nadia Cherif',
    category: 'environnement',
    comment: 'L\'ascenseur de l\'immeuble de Mme Lefèvre est en panne depuis 3 jours, 4e étage sans ascenseur. Très pénible pour les interventions.',
    urgency: 'attention',
    photo_url: null,
    status: 'nouveau',
    created_at: hoursAgo(5),
  },
  {
    id: 'pr-4',
    caregiver_name: 'Julie Bernard',
    category: 'organisation',
    comment: 'Les clés de l\'appartement de M. Petit n\'étaient pas à la gardienne comme prévu. J\'ai perdu 20 min à chercher.',
    urgency: 'info',
    photo_url: null,
    status: 'resolu',
    created_at: daysAgo(1),
  },
  {
    id: 'pr-5',
    caregiver_name: 'Élodie Faure',
    category: 'securite',
    comment: 'La rampe d\'escalier chez Mme Girard est descellée. Elle bouge quand on s\'appuie dessus. Risque de chute pour la patiente.',
    urgency: 'urgent',
    photo_url: null,
    status: 'nouveau',
    created_at: hoursAgo(2),
  },
  {
    id: 'pr-6',
    caregiver_name: 'Mamadou Diallo',
    category: 'materiel',
    comment: 'Le fauteuil roulant de M. Rousseau a un frein qui ne fonctionne plus. Dangereux pour les transferts.',
    urgency: 'urgent',
    photo_url: null,
    status: 'en_cours',
    created_at: hoursAgo(4),
  },
  {
    id: 'pr-7',
    caregiver_name: 'Karim Benali',
    category: 'environnement',
    comment: 'Le chauffage ne fonctionne plus chez Mme Dupont. Il fait 16 degrés dans l\'appartement. La patiente a froid.',
    urgency: 'attention',
    photo_url: null,
    status: 'nouveau',
    created_at: hoursAgo(3),
  },
  {
    id: 'pr-8',
    caregiver_name: 'Youssef Amrani',
    category: 'organisation',
    comment: 'Deux intervenants sont arrivés en même temps chez M. Lemaire. Le planning a été mal mis à jour après le changement de mardi.',
    urgency: 'info',
    photo_url: null,
    status: 'resolu',
    created_at: daysAgo(2),
  },
];

// ============================================================
// Incidents / SOS
// ============================================================

export const incidentLevelLabels: Record<string, string> = {
  securite: 'Sécurité',
  incident: 'Incident',
  chute: 'Chute / Événement',
  materiel: 'Matériel',
  renfort: 'Besoin de renfort',
  autre: 'Autre',
};

export const incidentLevelColors: Record<string, string> = {
  securite: 'bg-danger-500',
  incident: 'bg-warn-500',
  chute: 'bg-warn-500',
  materiel: 'bg-info-500',
  renfort: 'bg-brand-500',
  autre: 'bg-ink-400',
};

export const incidents: Incident[] = [
  {
    id: 'inc-1',
    caregiver_name: 'Thomas Leroy',
    patient_name: 'Mme Durand',
    level: 'chute',
    description: 'Mme Durand a fait une chute dans la salle de bain. Elle est consciente mais a mal au genou droit. Pas de plaie ouverte visible.',
    status: 'pris_en_charge',
    created_at: hoursAgo(2),
  },
  {
    id: 'inc-2',
    caregiver_name: 'Sarah Mercier',
    patient_name: 'M. Petit',
    level: 'securite',
    description: 'La porte d\'entrée de M. Petit ne se ferme plus correctement, problème de sécurité. N\'importe qui peut entrer.',
    status: 'ouvert',
    created_at: hoursAgo(0.5),
  },
  {
    id: 'inc-3',
    caregiver_name: 'Élodie Faure',
    patient_name: 'Mme Bernard',
    level: 'incident',
    description: 'Mme Bernard a été trouvée au sol dans la chambre ce matin. Confusion importante, ne reconnaît pas son environnement. Suspicion d\'AIT.',
    status: 'pris_en_charge',
    created_at: hoursAgo(3),
  },
  {
    id: 'inc-4',
    caregiver_name: 'Mamadou Diallo',
    patient_name: 'M. Girard',
    level: 'renfort',
    description: 'M. Girard très agité, refuse les soins et se montre agressif verbalement. Besoin d\'un renfort pour gérer la situation en sécurité.',
    status: 'ouvert',
    created_at: hoursAgo(1),
  },
  {
    id: 'inc-5',
    caregiver_name: 'Karim Benali',
    patient_name: 'Mme Dupont',
    level: 'materiel',
    description: 'Le concentrateur d\'oxygène de Mme Dupont émet un bip d\'alarme en continu. La patiente est inquiète. Matériel peut-être défaillant.',
    status: 'ouvert',
    created_at: hoursAgo(1.5),
  },
];

// ============================================================
// Matériel — 10 éléments
// ============================================================

export const materialStatusLabels: Record<string, string> = {
  disponible: 'Disponible',
  manquant: 'Manquant',
  defectueux: 'Défectueux',
  en_reparation: 'En réparation',
  commande: 'Commandé',
};

export const materialItems: MaterialItem[] = [
  { id: 'mat-1', name: 'Lève-malade électrique', status: 'disponible', location: 'Bureau central', urgency: 'normal', note: 'Vérifié le 28/08', last_updated: daysAgo(2) },
  { id: 'mat-2', name: 'Matelas anti-escarres', status: 'manquant', location: 'Secteur Nord', urgency: 'urgent', note: 'Nécessaire pour Mme Martin — sortie hôpital dans 2 jours', last_updated: hoursAgo(2) },
  { id: 'mat-3', name: 'Déambulateur', status: 'defectueux', location: 'M. Durand', urgency: 'urgent', note: 'Frein gauche bloqué, risque de chute', last_updated: hoursAgo(5) },
  { id: 'mat-4', name: 'Tensiomètre', status: 'en_reparation', location: 'Atelier', urgency: 'normal', note: 'Retour prévu jeudi', last_updated: daysAgo(3) },
  { id: 'mat-5', name: 'Kit de pansements', status: 'commande', location: 'Fournisseur', urgency: 'normal', note: 'Commande passée, livraison J+3', last_updated: daysAgo(1) },
  { id: 'mat-6', name: 'Chaise percée', status: 'disponible', location: 'Bureau central', urgency: 'normal', note: '', last_updated: daysAgo(5) },
  { id: 'mat-7', name: 'Concentrateur d\'oxygène', status: 'defectueux', location: 'Mme Dupont', urgency: 'urgent', note: 'Bip d\'alarme permanent — incident signalé', last_updated: hoursAgo(1.5) },
  { id: 'mat-8', name: 'Lit médicalisé (moteur)', status: 'defectueux', location: 'Mme Martin', urgency: 'urgent', note: 'Moteur en panne, ne se relève plus. Problème signalé.', last_updated: hoursAgo(1) },
  { id: 'mat-9', name: 'Fauteuil roulant', status: 'en_reparation', location: 'Atelier', urgency: 'urgent', note: 'Frein HS — M. Rousseau. Envoyé en réparation ce matin.', last_updated: hoursAgo(4) },
  { id: 'mat-10', name: 'Ceinture de transfert', status: 'disponible', location: 'Bureau central', urgency: 'normal', note: '3 disponibles', last_updated: daysAgo(1) },
  { id: 'mat-11', name: 'Tapis antidérapant (lot de 5)', status: 'commande', location: 'Fournisseur', urgency: 'normal', note: 'Commandé suite au signalement chez M. Durand', last_updated: hoursAgo(3) },
  { id: 'mat-12', name: 'Rampe d\'appui murale', status: 'manquant', location: 'Stock épuisé', urgency: 'urgent', note: 'Demandé pour Mme Girard (rampe escalier descellée)', last_updated: hoursAgo(2) },
];

// ============================================================
// Prévisions (copilote anticipation) — 6 éléments
// ============================================================

export const forecastLevelColors: Record<string, string> = {
  info: 'bg-info-50 dark:bg-info-600/15 text-info-700 dark:text-info-100 border-info-100 dark:border-info-600/30',
  vigilance: 'bg-warn-50 dark:bg-warn-600/15 text-warn-700 dark:text-warn-100 border-warn-100 dark:border-warn-600/30',
  risque: 'bg-danger-50 dark:bg-danger-700/15 text-danger-700 dark:text-danger-100 border-danger-100 dark:border-danger-700/30',
};

export const forecasts: Forecast[] = [
  {
    id: 'fc-1',
    title: 'Risque de manque de personnel mardi matin',
    level: 'risque',
    period: 'Mardi 6 h – 10 h',
    cause: '2 absences prévues (Claire en congé, Karim en formation) sur le secteur Nord, soit 8 interventions non couvertes.',
    impact: '3 patients risquent de ne pas avoir leur passage du matin.',
    solutions: ['Appeler un intervenant en renfort', 'Décaler 2 interventions en après-midi', 'Prévenir les familles concernées'],
  },
  {
    id: 'fc-2',
    title: 'Capacité disponible passera sous 10 %',
    level: 'vigilance',
    period: 'Jeudi toute la journée',
    cause: 'Charge actuelle de l\'équipe à 82 % + 2 nouveaux patients à intégrer jeudi.',
    impact: 'Marge d\'adaptation très faible en cas d\'imprévu.',
    solutions: ['Prévoir un renfort ponctuel', 'Étaler l\'intégration des nouveaux patients sur 2 jours'],
  },
  {
    id: 'fc-3',
    title: 'Tournée secteur Nord risque de dépasser les créneaux',
    level: 'vigilance',
    period: 'Mercredi après-midi',
    cause: '5 interventions programmées en 3 h avec 42 min de trajet cumulé.',
    impact: 'Retard estimé de 20-30 min sur les 2 dernières interventions.',
    solutions: ['Réorganiser l\'ordre des passages', 'Affecter un second intervenant sur la tournée'],
  },
  {
    id: 'fc-4',
    title: '3 absences prévues simultanément vendredi',
    level: 'risque',
    period: 'Vendredi 8 h – 16 h',
    cause: 'Congés + formation + arrêt maladie prévu.',
    impact: '12 interventions à redistribuer.',
    solutions: ['Anticiper le recours à un prestataire externe', 'Réorganiser les priorités', 'Prévenir les familles'],
  },
  {
    id: 'fc-5',
    title: 'Pic de charge lundi matin (sortie hôpital Mme Martin)',
    level: 'risque',
    period: 'Lundi 7 h – 12 h',
    cause: 'Retour à domicile de Mme Martin + tournée habituelle complète sur le secteur Nord.',
    impact: 'Besoin d\'un passage supplémentaire de 45 min non planifié + vérification du matériel.',
    solutions: ['Affecter Sarah Mercier sur le premier passage', 'Demander un renfort pour couvrir la tournée restante', 'Vérifier la livraison du matelas anti-escarres'],
  },
  {
    id: 'fc-6',
    title: 'Formation obligatoire : 4 intervenants indisponibles',
    level: 'info',
    period: 'Semaine prochaine (jeudi)',
    cause: 'Session de formation annuelle « Prévention des chutes » pour 4 membres de l\'équipe.',
    impact: 'Couverture réduite de 40 % sur la journée.',
    solutions: ['Planifier les remplacements dès maintenant', 'Reporter les interventions non urgentes', 'Informer les familles à l\'avance'],
  },
];

// ============================================================
// Problèmes d'organisation détectés — 7 éléments
// ============================================================

export const organizationalProblems: OrganizationalProblem[] = [
  {
    id: 'op-1',
    title: 'Interventions de Mme Martin dépassent régulièrement leur durée',
    description: 'Sur les 12 dernières interventions, la durée moyenne est de 44 min pour 30 min prévues, soit +14 min d\'écart.',
    cause: 'L\'état de Mme Martin nécessite davantage de temps pour la toilette et l\'habillage. La durée prévue est sous-estimée.',
    trend: 'hausse',
    occurrences: 12,
    sector: 'Secteur Nord',
  },
  {
    id: 'op-2',
    title: 'Secteur Nord génère plus de temps de trajet que prévu',
    description: 'Le temps de trajet moyen sur le secteur Nord est de 28 min par intervention, contre 18 min pour les autres secteurs.',
    cause: 'La zone géographique est étendue et les interventions sont mal groupées dans la tournée.',
    trend: 'stable',
    occurrences: 45,
    sector: 'Secteur Nord',
  },
  {
    id: 'op-3',
    title: 'Les demandes de renfort augmentent après 15 h',
    description: '7 des 10 dernières demandes de renfort ont été faites après 15 h.',
    cause: 'La fatigue accumulée et les retards en cascade en deuxième partie de journée créent des situations de surcharge.',
    trend: 'hausse',
    occurrences: 10,
    sector: null,
  },
  {
    id: 'op-4',
    title: 'Changements de planning particulièrement fréquents le mardi',
    description: 'Le mardi compte 40 % de changements de planning supplémentaires par rapport aux autres jours.',
    cause: 'Le mardi concentre plusieurs interventions difficiles en matinée, créant un effet domino sur l\'après-midi.',
    trend: 'stable',
    occurrences: 18,
    sector: null,
  },
  {
    id: 'op-5',
    title: 'Matériel manquant signalé 12 fois ce mois',
    description: '12 signalements de matériel manquant ont été enregistrés ce mois-ci, principalement sur le secteur Nord.',
    cause: 'Le réassort du matériel n\'est pas fait systématiquement après chaque tournée.',
    trend: 'hausse',
    occurrences: 12,
    sector: 'Secteur Nord',
  },
  {
    id: 'op-6',
    title: 'Interventions en doublon détectées 3 fois ce mois',
    description: '3 cas où deux intervenants sont arrivés chez le même patient au même créneau.',
    cause: 'Les modifications de planning du mardi ne sont pas toujours propagées correctement à tous les intervenants.',
    trend: 'stable',
    occurrences: 3,
    sector: null,
  },
  {
    id: 'op-7',
    title: 'Temps d\'attente patient en hausse sur le secteur Ouest',
    description: 'Les patients du secteur Ouest attendent en moyenne 18 min de plus que prévu pour leur passage.',
    cause: 'Claire Dubois (référente du secteur) en absence longue, les remplaçants ne connaissent pas les parcours optimaux.',
    trend: 'hausse',
    occurrences: 22,
    sector: 'Secteur Ouest',
  },
];

// ============================================================
// Simulation de scénarios
// ============================================================

export function simulateNewClients(count: number): SimulationResult {
  const currentCapacity = 82;
  const newLoad = count * 8;
  const newCapacity = Math.min(100, currentCapacity + newLoad);
  const details: string[] = [];

  details.push(`Capacité actuelle de l'équipe : ${currentCapacity}%`);
  details.push(`Charge supplémentaire estimée : +${newLoad}% (${count} client${count > 1 ? 's' : ''} × ~8% de charge)`);
  details.push(`Capacité après intégration : ${newCapacity}%`);

  if (count >= 3) {
    details.push('Recrutement d\'au moins 1 ETP recommandé pour maintenir la qualité');
    details.push('Délai d\'intégration estimé : 2 semaines par client');
  } else if (count >= 2) {
    details.push('Un renfort ponctuel sera nécessaire aux pics de charge');
  } else {
    details.push('L\'intégration est absorbable avec l\'équipe actuelle');
  }

  const remainingCapacity = 100 - newCapacity;
  if (remainingCapacity < 10) {
    details.push(`Marge résiduelle très faible (${remainingCapacity}%) — risque en cas d'imprévu`);
  }

  if (count >= 4) {
    details.push('Impact sur la soutenabilité : les intervenants les plus chargés (Thomas, Sarah) passeraient en zone de surcharge');
  }

  const level = newCapacity >= 95 ? 'risk' : newCapacity >= 80 ? 'watch' : 'good';
  const summary =
    level === 'risk'
      ? `Accepter ${count} nouveau${count > 1 ? 'x' : ''} client${count > 1 ? 's' : ''} présente un risque important de surcharge`
      : level === 'watch'
      ? `Accepter ${count} nouveau${count > 1 ? 'x' : ''} client${count > 1 ? 's' : ''} est possible mais nécessite une vigilance`
      : `Accepter ${count} nouveau${count > 1 ? 'x' : ''} client${count > 1 ? 's' : ''} est acceptable`;

  return { acceptable: level !== 'risk', level, capacity_percent: newCapacity, summary, details };
}

// ============================================================
// Mesure de l'impact des décisions — 5 éléments
// ============================================================

export const decisionImpacts: DecisionImpact[] = [
  {
    id: 'di-1',
    title: 'Réorganisation de la tournée Secteur Nord',
    before_value: '42 min de retard cumulé',
    after_value: '11 min de retard cumulé',
    improved: true,
    date: daysAgo(3),
  },
  {
    id: 'di-2',
    title: 'Passage de la durée Mme Martin de 30 à 45 min',
    before_value: '+14 min d\'écart moyen',
    after_value: '+2 min d\'écart moyen',
    improved: true,
    date: daysAgo(7),
  },
  {
    id: 'di-3',
    title: 'Ajout d\'un renfort le mardi matin',
    before_value: '40% de changements de planning',
    after_value: '25% de changements de planning',
    improved: true,
    date: daysAgo(14),
  },
  {
    id: 'di-4',
    title: 'Mise en place du briefing avant intervention',
    before_value: '3 incidents/semaine liés au manque d\'information',
    after_value: '1 incident/semaine',
    improved: true,
    date: daysAgo(21),
  },
  {
    id: 'di-5',
    title: 'Remplacement de Claire Dubois par intérimaire secteur Ouest',
    before_value: '18 min d\'attente supplémentaire par patient',
    after_value: '12 min d\'attente supplémentaire par patient',
    improved: true,
    date: daysAgo(5),
  },
];

// ============================================================
// Briefing — génère un briefing pour une intervention
// ============================================================

export interface BriefingData {
  patient_name: string;
  time: string;
  duration: string;
  address: string;
  difficulty: number;
  key_info: string[];
  recent_changes: string[];
  vigilance_points: string[];
  instructions: string;
  required_equipment: string;
  required_skills: string;
}

export function generateBriefing(interventionId: string): BriefingData {
  const briefings: Record<string, BriefingData> = {
    'default': {
      patient_name: 'Mme Martin',
      time: '14:30',
      duration: '45 min',
      address: '12 rue des Lilas, Lyon 6e',
      difficulty: 3,
      key_info: [
        'Sortie d\'hôpital il y a 5 jours (fracture col du fémur)',
        'Aide à la toilette et à l\'habillage',
        'Préparation du repas du midi',
        'Vit seule, fille Sophie joignable au 06 12 34 56 78',
      ],
      recent_changes: [
        'Douleur au dos signalée hier par le soignant précédent',
        'Nouveau médicament ajouté : anticoagulant (attention aux chocs)',
        'Appétit en baisse depuis 2 jours',
      ],
      vigilance_points: [
        'Risque de chute — sol glissant signalé dans la salle de bain',
        'Fatigue importante ces derniers jours',
        'Lit médicalisé en panne (moteur) — signalé, en attente de réparation',
      ],
      instructions: 'Aider à la toilette, préparer le déjeuner, vérifier la prise des médicaments. Prévenir la famille si besoin.',
      required_equipment: 'Gants, tablier, savon doux',
      required_skills: 'Toilette lourde, Aide à la mobilité',
    },
    'int-2': {
      patient_name: 'M. Lemaire',
      time: '09:15',
      duration: '30 min',
      address: '2 impasse du Verger',
      difficulty: 2,
      key_info: [
        'Diabétique type 2, sous insuline',
        'Aide à la préparation du repas et prise de glycémie',
        'Chien présent au domicile (calme)',
      ],
      recent_changes: [
        'Glycémie instable cette semaine (2 pics à jeun)',
      ],
      vigilance_points: [
        'Bien refermer le portail en partant',
        'Vérifier la glycémie avant le repas',
      ],
      instructions: 'Préparation du repas adapté (diabétique). Prise de glycémie. Noter les valeurs.',
      required_equipment: 'Lecteur de glycémie',
      required_skills: 'Surveillance diabète',
    },
    'int-3': {
      patient_name: 'Mme Bernard',
      time: '10:15',
      duration: '60 min',
      address: '8 avenue de la Gare, 2e étage sans ascenseur',
      difficulty: 5,
      key_info: [
        'Mobilité très réduite, transfert lit-fauteuil nécessaire',
        'Anxiété importante le matin',
        'Incident récent : trouvée au sol, suspicion d\'AIT — suivi en cours',
      ],
      recent_changes: [
        'Confusion signalée ce matin (incident inc-3)',
        'Plus anxieuse que d\'habitude depuis deux jours',
        'Transfert plus difficile, jambes moins stables',
      ],
      vigilance_points: [
        'Ne jamais laisser debout sans surveillance',
        'Transfert à réaliser à deux personnes si possible',
        'Escalier sans ascenseur — prévoir temps de montée',
        'Rassurer, parler calmement, ne pas brusquer',
      ],
      instructions: 'Transfert lit-fauteuil, toilette complète. Rassurer. Si confusion persiste, alerter le bureau.',
      required_equipment: 'Ceinture de transfert',
      required_skills: 'Manutention, Transfert',
    },
  };
  return briefings[interventionId] ?? briefings['default'];
}

// ============================================================
// Équilibre de l'équipe — 8 résumés
// ============================================================

export interface TeamLoadSummary {
  name: string;
  role: string;
  load_percent: number;
  intervention_count: number;
  difficult_count: number;
  invisible_minutes: number;
  travel_minutes: number;
  help_requests: number;
  status: 'normal' | 'vigilance' | 'elevee';
  reason: string;
}

export const teamLoadSummaries: TeamLoadSummary[] = [
  {
    name: 'Thomas Leroy',
    role: 'Aide-soignant',
    load_percent: 91,
    intervention_count: 7,
    difficult_count: 3,
    invisible_minutes: 35,
    travel_minutes: 52,
    help_requests: 1,
    status: 'elevee',
    reason: '7 interventions dont 3 difficiles, 52 min de trajet, 1 demande d\'aide déjà émise',
  },
  {
    name: 'Sarah Mercier',
    role: 'Aide-soignante',
    load_percent: 82,
    intervention_count: 6,
    difficult_count: 2,
    invisible_minutes: 28,
    travel_minutes: 38,
    help_requests: 1,
    status: 'vigilance',
    reason: '6 interventions dont 2 difficiles, 1 demande de remplacement en cours',
  },
  {
    name: 'Élodie Faure',
    role: 'Aide-soignante',
    load_percent: 74,
    intervention_count: 5,
    difficult_count: 2,
    invisible_minutes: 20,
    travel_minutes: 32,
    help_requests: 1,
    status: 'vigilance',
    reason: '5 interventions dont 2 difficiles, 1 demande de renfort (transfert Mme Bernard)',
  },
  {
    name: 'Karim Benali',
    role: 'Aide-soignant',
    load_percent: 67,
    intervention_count: 5,
    difficult_count: 1,
    invisible_minutes: 15,
    travel_minutes: 24,
    help_requests: 0,
    status: 'normal',
    reason: 'Charge répartie correctement',
  },
  {
    name: 'Mamadou Diallo',
    role: 'Aide-soignant',
    load_percent: 58,
    intervention_count: 4,
    difficult_count: 1,
    invisible_minutes: 12,
    travel_minutes: 20,
    help_requests: 0,
    status: 'normal',
    reason: 'Charge raisonnable, disponible pour du renfort',
  },
  {
    name: 'Youssef Amrani',
    role: 'Auxiliaire de vie',
    load_percent: 55,
    intervention_count: 4,
    difficult_count: 0,
    invisible_minutes: 10,
    travel_minutes: 28,
    help_requests: 0,
    status: 'normal',
    reason: 'Charge raisonnable mais temps de trajet au-dessus de la moyenne (secteur Nord)',
  },
  {
    name: 'Julie Bernard',
    role: 'Auxiliaire de vie',
    load_percent: 45,
    intervention_count: 4,
    difficult_count: 0,
    invisible_minutes: 10,
    travel_minutes: 18,
    help_requests: 0,
    status: 'normal',
    reason: 'Journée légère, disponible pour un renfort',
  },
  {
    name: 'Nadia Cherif',
    role: 'Auxiliaire de vie',
    load_percent: 38,
    intervention_count: 3,
    difficult_count: 0,
    invisible_minutes: 8,
    travel_minutes: 15,
    help_requests: 0,
    status: 'normal',
    reason: 'Journée légère, disponible pour un renfort',
  },
];
