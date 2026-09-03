import { useEffect, useState } from 'react';
import { AlertCircle, Clock, Coffee, Gauge, Heart, Loader2, Navigation, Plus, Route, ShieldAlert, TriangleAlert, Zap } from 'lucide-react';
import { fetchTodayInterventions, fetchTodayInvisibleTasks, type InterventionWithPatient } from '@/lib/data';
import type { InvisibleTask } from '@/lib/types';
import { analyzeDay, minutesToText as fmt, type DaySolution } from '@/lib/workload';

interface Props {
  onReportDifficulty: () => void;
}

const solutionIcons: Record<string, React.ReactNode> = {
  users: <Plus size={18} />,
  calendar: <Clock size={18} />,
  phone: <AlertCircle size={18} />,
  check: <ShieldAlert size={18} />,
};

const overloadStyles = {
  normal: { bg: 'bg-brand-50 dark:bg-brand-700/20', text: 'text-brand-700 dark:text-brand-200', dot: 'bg-brand-500', label: 'Situation normale' },
  vigilance: { bg: 'bg-warn-50 dark:bg-warn-600/20', text: 'text-warn-700 dark:text-warn-100', dot: 'bg-warn-500', label: 'Vigilance' },
  surcharge: { bg: 'bg-danger-50 dark:bg-danger-700/20', text: 'text-danger-700 dark:text-danger-100', dot: 'bg-danger-500', label: 'Surcharge potentielle' },
};

const sustainStyles = {
  good: { ring: 'text-brand-500', bg: 'bg-brand-500', label: 'Journée soutenable' },
  watch: { ring: 'text-warn-500', bg: 'bg-warn-500', label: 'Vigilance nécessaire' },
  risk: { ring: 'text-danger-500', bg: 'bg-danger-500', label: 'Risque de surcharge' },
};

export default function DayStatus({ onReportDifficulty }: Props) {
  const [items, setItems] = useState<InterventionWithPatient[] | null>(null);
  const [invisible, setInvisible] = useState<InvisibleTask[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([fetchTodayInterventions(), fetchTodayInvisibleTasks()])
      .then(([i, t]) => { if (active) { setItems(i); setInvisible(t); } })
      .catch(() => active && setError(true));
    return () => { active = false; };
  }, []);

  if (error) {
    return (
      <div className="p-6 text-center text-ink-500 dark:text-ink-300">
        <AlertCircle className="mx-auto mb-2 text-danger-500" />
        Impossible de charger l'analyse de votre journée.
      </div>
    );
  }

  if (!items || !invisible) {
    return <div className="flex justify-center py-20 text-brand-500"><Loader2 className="animate-spin" size={32} /></div>;
  }

  const analysis = analyzeDay(items, invisible);
  const ov = overloadStyles[analysis.overload.level];
  const sus = sustainStyles[analysis.sustainability.level];

  return (
    <div className="px-4 pt-5 pb-6 space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Mon état de journée</h1>
        <p className="text-ink-500 dark:text-ink-300 text-sm mt-0.5">Vision dynamique de votre journée, basée sur la réalité du terrain</p>
      </div>

      {/* Timeline */}
      <div className="rounded-3xl bg-white dark:bg-ink-800 p-5 border border-ink-100 dark:border-ink-700">
        <h2 className="flex items-center gap-2 font-semibold text-ink-900 dark:text-white mb-4">
          <Route size={20} className="text-brand-500" /> Déroulé de la journée
        </h2>
        {analysis.events.length > 0 ? (
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {analysis.events.map((e, idx) => (
              <div key={idx} className="flex items-center shrink-0">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${e.done ? 'bg-brand-500' : e.isCurrent ? 'bg-info-500 ring-4 ring-info-100 dark:ring-info-600/30' : 'bg-ink-200 dark:bg-ink-700'}`} />
                  <span className={`mt-1.5 text-xs font-medium whitespace-nowrap ${e.isCurrent ? 'text-info-600 dark:text-info-300' : 'text-ink-500 dark:text-ink-400'}`}>
                    {e.time}
                  </span>
                  <span className="text-xs text-ink-400 dark:text-ink-500 whitespace-nowrap max-w-[80px] truncate">
                    {e.label}
                  </span>
                </div>
                {idx < analysis.events.length - 1 && (
                  <div className={`h-0.5 w-6 sm:w-10 ${e.done ? 'bg-brand-400' : 'bg-ink-200 dark:bg-ink-700'}`} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-400">Aucune intervention aujourd'hui.</p>
        )}
      </div>

      {/* Situation actuelle */}
      <div className="rounded-3xl bg-white dark:bg-ink-800 p-5 border border-ink-100 dark:border-ink-700">
        <h2 className="font-semibold text-ink-900 dark:text-white mb-3">Situation actuelle</h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Prévues" value={`${analysis.completedCount + analysis.remainingCount}`} />
          <Stat label="Réalisées" value={`${analysis.completedCount}`} tone="ok" />
          <Stat label="Restantes" value={`${analysis.remainingCount}`} />
          <Stat label="Temps de soin prévu" value={fmt(analysis.plannedCareMinutes)} />
          <Stat label="Temps de soin réel" value={fmt(analysis.actualCareMinutes)} tone={analysis.actualCareMinutes > analysis.plannedCareMinutes ? 'warn' : 'default'} />
          <Stat label="Trajet prévu" value={fmt(analysis.plannedTravelMinutes)} icon={<Navigation size={14} />} />
          <Stat label="Trajet réel" value={fmt(analysis.actualTravelMinutes)} icon={<Navigation size={14} />} tone={analysis.actualTravelMinutes > analysis.plannedTravelMinutes ? 'warn' : 'default'} />
          <Stat label="Temps restant" value={fmt(analysis.remainingMinutes)} />
          <Stat label="Retard" value={analysis.delayMinutes > 0 ? `+${analysis.delayMinutes} min` : 'Aucun'} tone={analysis.delayMinutes > 0 ? 'warn' : 'ok'} />
          <Stat label="Pause restante" value={fmt(analysis.pauseRemaining)} icon={<Coffee size={14} />} />
          <Stat label="Interventions difficiles" value={`${analysis.difficultCount}`} tone={analysis.difficultCount > 2 ? 'warn' : 'default'} />
          <Stat label="Tâches imprévues" value={`${analysis.unplannedTasks}`} />
        </div>
      </div>

      {/* Ce qui change aujourd'hui */}
      {analysis.changes.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-ink-800 p-5 border border-ink-100 dark:border-ink-700">
          <h2 className="flex items-center gap-2 font-semibold text-ink-900 dark:text-white mb-3">
            <Zap size={20} className="text-warn-500" /> Ce qui change aujourd'hui
          </h2>
          <div className="space-y-2">
            {analysis.changes.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-200 bg-warn-50 dark:bg-warn-600/15 rounded-xl px-3 py-2">
                <TriangleAlert size={16} className="text-warn-500 shrink-0" />
                {c.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risque pour la suite */}
      {analysis.risk && (
        <div className="rounded-3xl bg-warn-50 dark:bg-warn-600/15 border border-warn-100 dark:border-warn-600/30 p-5">
          <h2 className="flex items-center gap-2 font-semibold text-warn-700 dark:text-warn-100 mb-2">
            <TriangleAlert size={20} /> Risque pour la suite
          </h2>
          <p className="text-sm text-warn-700 dark:text-warn-100 mb-4">{analysis.risk.label}</p>
          <div className="space-y-2">
            {analysis.risk.solutions.map((s, idx) => (
              <SolutionButton key={idx} solution={s} />
            ))}
          </div>
        </div>
      )}

      {/* Alerte surcharge */}
      <div className={`rounded-3xl p-5 border border-ink-100 dark:border-ink-700 ${ov.bg}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-3 h-3 rounded-full ${ov.dot}`} />
          <h2 className={`font-bold text-lg ${ov.text}`}>{ov.label}</h2>
        </div>
        {analysis.overload.cumulativeDelayMinutes > 0 && (
          <p className={`text-sm mb-3 ${ov.text}`}>
            Votre journée présente actuellement {analysis.overload.cumulativeDelayMinutes} minutes de retard cumulé.
          </p>
        )}
        {analysis.overload.reasons.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400 mb-1.5">Pourquoi ?</p>
            <ul className="space-y-1">
              {analysis.overload.reasons.map((r, idx) => (
                <li key={idx} className={`text-sm ${ov.text} flex items-start gap-2`}>
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400 mb-1.5">Solutions possibles</p>
          <div className="space-y-2">
            {analysis.overload.solutions.map((s, idx) => (
              <SolutionButton key={idx} solution={s} />
            ))}
          </div>
        </div>
      </div>

      {/* Score de soutenabilité */}
      <div className="rounded-3xl bg-white dark:bg-ink-800 p-5 border border-ink-100 dark:border-ink-700">
        <h2 className="flex items-center gap-2 font-semibold text-ink-900 dark:text-white mb-4">
          <Heart size={20} className="text-brand-500" /> Score de soutenabilité
        </h2>
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-ink-100 dark:stroke-ink-700" />
              <circle
                cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round"
                className={sus.ring}
                strokeDasharray={`${(analysis.sustainability.score / 100) * 264} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${sus.ring}`}>{analysis.sustainability.score}</span>
              <span className="text-xs text-ink-400">/ 100</span>
            </div>
          </div>
          <div className="flex-1">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${analysis.sustainability.level === 'good' ? 'bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200' : analysis.sustainability.level === 'watch' ? 'bg-warn-100 text-warn-700 dark:bg-warn-600/30 dark:text-warn-100' : 'bg-danger-100 text-danger-700 dark:bg-danger-700/30 dark:text-danger-100'}`}>
              <div className={`w-2 h-2 rounded-full ${sus.bg}`} /> {sus.label}
            </div>
            <p className="mt-2 text-xs text-ink-400">Mesure si l'organisation de la journée est soutenable. Ce n'est pas un score de performance.</p>
          </div>
        </div>

        {(analysis.sustainability.positives.length > 0 || analysis.sustainability.negatives.length > 0) && (
          <div className="mt-4 space-y-3">
            {analysis.sustainability.positives.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-300 mb-1.5">Points favorables</p>
                <ul className="space-y-1">
                  {analysis.sustainability.positives.map((p, idx) => (
                    <li key={idx} className="text-sm text-ink-600 dark:text-ink-300 flex items-start gap-2">
                      <span className="text-brand-500 shrink-0">+</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.sustainability.negatives.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-warn-600 dark:text-warn-300 mb-1.5">Points de vigilance</p>
                <ul className="space-y-1">
                  {analysis.sustainability.negatives.map((n, idx) => (
                    <li key={idx} className="text-sm text-ink-600 dark:text-ink-300 flex items-start gap-2">
                      <span className="text-warn-500 shrink-0">-</span> {n}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 p-3 rounded-xl bg-ink-50 dark:bg-ink-900">
          <p className="text-xs text-ink-400">
            Ce score analyse uniquement les contraintes organisationnelles observables. Il ne constitue pas un diagnostic médical ou psychologique et n'évalue pas la valeur professionnelle d'un salarié.
          </p>
        </div>
      </div>

      <button
        onClick={onReportDifficulty}
        className="w-full py-4 rounded-2xl bg-danger-600 hover:bg-danger-700 text-white font-bold text-lg flex items-center justify-center gap-2 tap shadow-lg shadow-danger-600/25"
      >
        <TriangleAlert size={22} /> Je suis en difficulté
      </button>
    </div>
  );
}

function Stat({ label, value, tone = 'default', icon }: { label: string; value: string; tone?: 'default' | 'ok' | 'warn'; icon?: React.ReactNode }) {
  const valueColor = tone === 'warn' ? 'text-warn-700 dark:text-warn-100' : tone === 'ok' ? 'text-brand-600 dark:text-brand-300' : 'text-ink-900 dark:text-white';
  return (
    <div className="rounded-2xl bg-ink-50 dark:bg-ink-900 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">{icon} {label}</div>
      <div className={`mt-0.5 font-bold ${valueColor}`}>{value}</div>
    </div>
  );
}

function SolutionButton({ solution }: { solution: DaySolution }) {
  return (
    <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 text-left tap hover:border-brand-300 dark:hover:border-brand-700">
      <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-700/30 flex items-center justify-center text-brand-600 dark:text-brand-300 shrink-0">
        {solutionIcons[solution.icon] ?? <Gauge size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ink-900 dark:text-white">{solution.label}</div>
        <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{solution.impact}</div>
      </div>
    </button>
  );
}
