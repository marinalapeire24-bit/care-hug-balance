import type { InterventionWithPatient } from '@/lib/data';
import type { InvisibleTask } from '@/lib/types';

const WORKDAY_MINUTES = 420; // 7 h de temps de soin disponible
const PAUSE_MINUTES = 45;

export interface DayLoad {
  count: number;
  careMinutes: number;
  travelMinutes: number;
  weightedMinutes: number;
  loadPercent: number;
  availableMinutes: number;
  pauseMinutes: number;
  band: 'calme' | 'soutenue' | 'chargee' | 'surcharge';
  bandLabel: string;
  delayRisk: boolean;
  avgDifficulty: number;
}

export function computeDayLoad(interventions: InterventionWithPatient[]): DayLoad {
  const count = interventions.length;
  const careMinutes = interventions.reduce((s, i) => s + i.duration_minutes, 0);
  const travelMinutes = interventions.reduce((s, i) => s + i.travel_minutes, 0);
  const weightedCare = interventions.reduce(
    (s, i) => s + i.duration_minutes * (1 + (i.difficulty_level - 1) * 0.15),
    0
  );
  const weightedMinutes = Math.round(weightedCare + travelMinutes);
  const loadPercent = Math.min(100, Math.round((weightedMinutes / WORKDAY_MINUTES) * 100));
  const availableMinutes = Math.max(0, WORKDAY_MINUTES - weightedMinutes - PAUSE_MINUTES);
  const avgDifficulty = count ? interventions.reduce((s, i) => s + i.difficulty_level, 0) / count : 0;

  let band: DayLoad['band'] = 'calme';
  let bandLabel = 'Journée calme';
  if (loadPercent >= 90) { band = 'surcharge'; bandLabel = 'Risque de surcharge'; }
  else if (loadPercent >= 70) { band = 'chargee'; bandLabel = 'Journée fortement chargée'; }
  else if (loadPercent >= 45) { band = 'soutenue'; bandLabel = 'Journée soutenue'; }

  const delayRisk = weightedMinutes + PAUSE_MINUTES > WORKDAY_MINUTES;

  return {
    count,
    careMinutes,
    travelMinutes,
    weightedMinutes,
    loadPercent,
    availableMinutes,
    pauseMinutes: PAUSE_MINUTES,
    band,
    bandLabel,
    delayRisk,
    avgDifficulty,
  };
}

export function minutesToText(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h} h ${m.toString().padStart(2, '0')}`;
  if (h) return `${h} h`;
  return `${m} min`;
}

// ============================================================
// PHASE 1.5 — Analyse avancée de la journée
// ============================================================

export interface DayEvent {
  time: string;
  label: string;
  isCurrent: boolean;
  done: boolean;
}

export interface DayChange {
  type: 'delay' | 'longer' | 'help' | 'more_time' | 'extra_travel' | 'less_pause' | 'added_task';
  label: string;
  minutes?: number;
}

export interface DayRisk {
  label: string;
  marginMinutes: number;
  solutions: DaySolution[];
}

export interface DaySolution {
  label: string;
  impact: string;
  icon: string;
}

export interface OverloadAnalysis {
  level: 'normal' | 'vigilance' | 'surcharge';
  levelLabel: string;
  cumulativeDelayMinutes: number;
  reasons: string[];
  solutions: DaySolution[];
}

export interface SustainabilityScore {
  score: number;
  level: 'good' | 'watch' | 'risk';
  levelLabel: string;
  positives: string[];
  negatives: string[];
}

export interface DayAnalysis {
  events: DayEvent[];
  changes: DayChange[];
  risk: DayRisk | null;
  overload: OverloadAnalysis;
  sustainability: SustainabilityScore;
  completedCount: number;
  remainingCount: number;
  plannedCareMinutes: number;
  actualCareMinutes: number;
  plannedTravelMinutes: number;
  actualTravelMinutes: number;
  remainingMinutes: number;
  delayMinutes: number;
  pausePlanned: number;
  pauseRemaining: number;
  difficultCount: number;
  helpRequests: number;
  unplannedTasks: number;
  invisibleMinutes: number;
}

function actualOrPlanned(i: InterventionWithPatient, field: 'duration' | 'travel' | 'difficulty'): number {
  if (field === 'duration') return i.actual_duration ?? i.duration_minutes;
  if (field === 'travel') return i.actual_travel ?? i.travel_minutes;
  return i.actual_difficulty ?? i.difficulty_level;
}

export function analyzeDay(
  interventions: InterventionWithPatient[],
  invisibleTasks: InvisibleTask[]
): DayAnalysis {
  const sorted = [...interventions].sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  );

  const completed = sorted.filter((i) => i.status === 'termine');
  const remaining = sorted.filter((i) => i.status !== 'termine');
  const difficult = sorted.filter((i) => actualOrPlanned(i, 'difficulty') >= 4);

  const plannedCare = sorted.reduce((s, i) => s + i.duration_minutes, 0);
  const actualCare = sorted.reduce((s, i) => s + actualOrPlanned(i, 'duration'), 0);
  const plannedTravel = sorted.reduce((s, i) => s + i.travel_minutes, 0);
  const actualTravel = sorted.reduce((s, i) => s + actualOrPlanned(i, 'travel'), 0);
  const invisibleMinutes = invisibleTasks.reduce((s, t) => s + t.duration_minutes, 0);

  // Cumulative delay from completed interventions
  let delayMinutes = 0;
  for (const i of completed) {
    if (i.actual_duration) delayMinutes += i.actual_duration - i.duration_minutes;
    if (i.actual_travel) delayMinutes += i.actual_travel - i.travel_minutes;
  }
  delayMinutes = Math.max(0, delayMinutes);

  const totalActual = actualCare + actualTravel + invisibleMinutes;
  const remainingMinutes = Math.max(0, WORKDAY_MINUTES - totalActual - PAUSE_MINUTES);
  const pauseRemaining = Math.max(0, PAUSE_MINUTES - Math.min(PAUSE_MINUTES, delayMinutes > 20 ? 20 : 0));

  // Timeline events
  const now = Date.now();
  const events: DayEvent[] = sorted.map((i) => {
    const time = new Date(i.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const eventTime = new Date(i.scheduled_at).getTime();
    const endTime = eventTime + actualOrPlanned(i, 'duration') * 60000;
    return {
      time,
      label: i.patient ? `${i.patient.first_name} ${i.patient.last_name}` : 'Patient',
      isCurrent: now >= eventTime && now <= endTime + 30 * 60000,
      done: i.status === 'termine',
    };
  });

  // Changes today
  const changes: DayChange[] = [];
  if (delayMinutes > 0) changes.push({ type: 'delay', label: `+${delayMinutes} min de retard cumulé`, minutes: delayMinutes });
  for (const i of completed) {
    if (i.actual_duration && i.actual_duration > i.duration_minutes + 3) {
      changes.push({ type: 'longer', label: `${i.patient?.first_name ?? 'Intervention'} a duré ${i.actual_duration - i.duration_minutes} min de plus`, minutes: i.actual_duration - i.duration_minutes });
    }
  }
  if (invisibleTasks.length > 0) changes.push({ type: 'added_task', label: `${invisibleTasks.length} tâche${invisibleTasks.length > 1 ? 's' : ''} non planifiée${invisibleTasks.length > 1 ? 's' : ''} (${invisibleMinutes} min)` });
  for (const i of completed) {
    if (i.actual_travel && i.actual_travel > i.travel_minutes + 3) {
      changes.push({ type: 'extra_travel', label: `Déplacement supplémentaire vers ${i.patient?.first_name ?? 'patient'}`, minutes: i.actual_travel - i.travel_minutes });
    }
  }
  if (delayMinutes > 20) changes.push({ type: 'less_pause', label: 'Pause réduite par le retard accumulé' });

  // Risk for next interventions
  let risk: DayRisk | null = null;
  if (remaining.length >= 2) {
    const next = remaining[0];
    const after = remaining[1];
    const nextEnd = new Date(next.scheduled_at).getTime() + actualOrPlanned(next, 'duration') * 60000;
    const afterStart = new Date(after.scheduled_at).getTime();
    const margin = Math.round((afterStart - nextEnd) / 60000);
    if (margin < 15) {
      risk = {
        label: `Votre prochaine intervention laisse seulement ${Math.max(0, margin)} minutes de marge avant la suivante.`,
        marginMinutes: margin,
        solutions: [
          { label: 'Demander un renfort', impact: 'Un collègue peut prendre en charge une intervention et vous libérer ~30 min.', icon: 'users' },
          { label: "Déplacer l'intervention suivante", impact: `Décaler ${after.patient?.first_name ?? 'l\'intervention'} de 15 min récupère la marge nécessaire.`, icon: 'calendar' },
          { label: 'Prévenir le coordinateur', impact: 'Le coordinateur peut réorganiser la fin de votre tournée.', icon: 'phone' },
          { label: 'Maintenir le planning', impact: 'Garder le planning actuel et accepter le risque de retard.', icon: 'check' },
        ],
      };
    }
  }

  // Overload analysis
  const overloadReasons: string[] = [];
  const longInterventions = completed.filter((i) => i.actual_duration && i.actual_duration > i.duration_minutes + 5);
  if (longInterventions.length > 0) overloadReasons.push(`${longInterventions.length} intervention${longInterventions.length > 1 ? 's' : ''} ont dépassé leur durée prévue`);
  const extraTravel = completed.filter((i) => i.actual_travel && i.actual_travel > i.travel_minutes + 3);
  if (extraTravel.length > 0) overloadReasons.push(`${extraTravel.length} déplacement${extraTravel.length > 1 ? 's' : ''} supplémentaire${extraTravel.length > 1 ? 's' : ''}`);
  const transmissionTasks = invisibleTasks.filter((t) => t.type === 'transmission');
  if (transmissionTasks.length > 0) {
    const tmin = transmissionTasks.reduce((s, t) => s + t.duration_minutes, 0);
    overloadReasons.push(`${tmin} minutes de transmission non prévues`);
  }

  let overloadLevel: OverloadAnalysis['level'] = 'normal';
  let overloadLabel = 'Situation normale';
  if (delayMinutes >= 30 || (delayMinutes >= 15 && invisibleMinutes >= 30)) {
    overloadLevel = 'surcharge';
    overloadLabel = 'Surcharge potentielle';
  } else if (delayMinutes >= 15 || invisibleMinutes >= 20) {
    overloadLevel = 'vigilance';
    overloadLabel = 'Vigilance';
  }

  const overloadSolutions: DaySolution[] = [
    { label: 'Demander un renfort', impact: 'Un collègue peut absorber ~30-45 min de charge.', icon: 'users' },
    { label: 'Réorganiser la prochaine intervention', impact: 'Réorganiser peut récupérer environ 20 minutes de marge.', icon: 'calendar' },
    { label: 'Prévenir le coordinateur', impact: 'Le coordinateur peut ajuster la tournée avec vous.', icon: 'phone' },
    { label: 'Maintenir le planning actuel', impact: 'Accepter le retard et continuer selon le plan.', icon: 'check' },
  ];

  // Sustainability score
  const positives: string[] = [];
  const negatives: string[] = [];

  // Geographic spread (simplified: check if travel < 25% of care)
  if (plannedCare > 0 && plannedTravel / plannedCare < 0.3) positives.push('Bonne répartition géographique');
  else negatives.push('Temps de trajet important');

  // Pause
  if (pauseRemaining >= PAUSE_MINUTES * 0.7) positives.push('Pause prévue et préservée');
  else negatives.push('Pause réduite par le retard');

  // Margin
  if (remainingMinutes > 60) positives.push('Marge suffisante dans la journée');
  else if (remainingMinutes < 30) negatives.push('Marge restante très faible');

  // Difficult interventions consecutive
  let consecutiveDifficult = 0;
  let maxConsecutive = 0;
  for (const i of sorted) {
    if (actualOrPlanned(i, 'difficulty') >= 4) {
      consecutiveDifficult++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveDifficult);
    } else {
      consecutiveDifficult = 0;
    }
  }
  if (maxConsecutive >= 2) negatives.push(`${maxConsecutive} interventions difficiles consécutives`);

  // Delay
  if (delayMinutes > 0) negatives.push(`${delayMinutes} minutes de retard accumulé`);

  // Invisible work
  if (invisibleMinutes > 40) negatives.push(`${invisibleMinutes} min de travail non planifié`);
  else if (invisibleMinutes > 0) positives.push(`Peu de travail imprévu (${invisibleMinutes} min)`);

  // Compute score
  let score = 100;
  score -= Math.min(25, delayMinutes * 0.8);
  score -= Math.min(15, Math.max(0, invisibleMinutes - 20) * 0.3);
  if (maxConsecutive >= 2) score -= 10;
  if (maxConsecutive >= 3) score -= 8;
  if (remainingMinutes < 30) score -= 15;
  if (pauseRemaining < PAUSE_MINUTES * 0.5) score -= 10;
  if (plannedCare > 0 && plannedTravel / plannedCare >= 0.3) score -= 8;
  if (difficult.length > 3) score -= 8;
  // Bonus for completed without issues
  if (delayMinutes === 0 && invisibleMinutes < 15) score += 5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  let sustainLevel: SustainabilityScore['level'] = 'good';
  let sustainLabel = 'Journée actuellement soutenable';
  if (score < 50) { sustainLevel = 'risk'; sustainLabel = 'Risque de surcharge organisationnelle'; }
  else if (score < 75) { sustainLevel = 'watch'; sustainLabel = 'Journée nécessitant une vigilance'; }

  return {
    events,
    changes,
    risk,
    overload: {
      level: overloadLevel,
      levelLabel: overloadLabel,
      cumulativeDelayMinutes: delayMinutes,
      reasons: overloadReasons,
      solutions: overloadSolutions,
    },
    sustainability: {
      score,
      level: sustainLevel,
      levelLabel: sustainLabel,
      positives,
      negatives,
    },
    completedCount: completed.length,
    remainingCount: remaining.length,
    plannedCareMinutes: plannedCare,
    actualCareMinutes: actualCare,
    plannedTravelMinutes: plannedTravel,
    actualTravelMinutes: actualTravel,
    remainingMinutes,
    delayMinutes,
    pausePlanned: PAUSE_MINUTES,
    pauseRemaining,
    difficultCount: difficult.length,
    helpRequests: 0, // Will be connected to difficulty_reports in future phase
    unplannedTasks: invisibleTasks.length,
    invisibleMinutes,
  };
}

export interface VarianceItem {
  intervention: InterventionWithPatient;
  durationVariance: number | null;
  travelVariance: number | null;
  difficultyVariance: number | null;
  hasVariance: boolean;
  reason: string | null;
  extraTasks: string | null;
}

export function computeVariances(interventions: InterventionWithPatient[]): VarianceItem[] {
  return interventions
    .filter((i) => i.status === 'termine' && (i.actual_duration !== null || i.actual_travel !== null))
    .map((i) => {
      const durVar = i.actual_duration !== null ? i.actual_duration - i.duration_minutes : null;
      const trVar = i.actual_travel !== null ? i.actual_travel - i.travel_minutes : null;
      const diffVar = i.actual_difficulty !== null ? i.actual_difficulty - i.difficulty_level : null;
      const hasVar = (durVar !== null && Math.abs(durVar) > 2) || (trVar !== null && Math.abs(trVar) > 2) || (diffVar !== null && diffVar !== 0);
      return {
        intervention: i,
        durationVariance: durVar,
        travelVariance: trVar,
        difficultyVariance: diffVar,
        hasVariance: hasVar,
        reason: i.variance_reason,
        extraTasks: i.extra_tasks,
      };
    });
}

export interface InvisibleSummary {
  totalMinutes: number;
  byType: { type: string; minutes: number; count: number }[];
}

export function summarizeInvisible(tasks: InvisibleTask[]): InvisibleSummary {
  const totalMinutes = tasks.reduce((s, t) => s + t.duration_minutes, 0);
  const typeMap = new Map<string, { minutes: number; count: number }>();
  for (const t of tasks) {
    const existing = typeMap.get(t.type) ?? { minutes: 0, count: 0 };
    existing.minutes += t.duration_minutes;
    existing.count += 1;
    typeMap.set(t.type, existing);
  }
  const byType = Array.from(typeMap.entries())
    .map(([type, v]) => ({ type, minutes: v.minutes, count: v.count }))
    .sort((a, b) => b.minutes - a.minutes);
  return { totalMinutes, byType };
}

export const invisibleTypeLabels: Record<string, string> = {
  appel: 'Appel téléphonique',
  coordination: 'Coordination',
  attente: 'Attente',
  materiel: 'Recherche de matériel',
  transmission: 'Transmission',
  aide_collegue: 'Aide à un collègue',
  imprevu: 'Imprévu',
  deplacement: 'Déplacement supplémentaire',
  accompagnement: 'Accompagnement relationnel',
  autre: 'Autre',
};
