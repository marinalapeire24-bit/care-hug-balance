import { useEffect, useState } from 'react';
import { AlertCircle, CalendarDays, ClipboardList, Coffee, Gauge, Loader2, ShieldAlert, TimerReset, TriangleAlert } from 'lucide-react';
import { fetchTodayInterventions, type InterventionWithPatient } from '@/lib/data';
import { computeDayLoad, minutesToText } from '@/lib/workload';
import { NextInterventionCard, InterventionRow } from '@/components/InterventionCard';
import { useAuth } from '@/context/AuthContext';

interface Props {
  onOpenPatient: (id: string) => void;
  onReportDifficulty: () => void;
  onOpenBriefing: (interventionId: string) => void;
  onShowActions: () => void;
}

const loadBarColor: Record<string, string> = {
  calme: 'bg-brand-500',
  soutenue: 'bg-brand-500',
  chargee: 'bg-warn-500',
  surcharge: 'bg-danger-500',
};

export default function Dashboard({ onOpenPatient, onReportDifficulty, onOpenBriefing, onShowActions }: Props) {
  const { profile } = useAuth();
  const [items, setItems] = useState<InterventionWithPatient[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetchTodayInterventions()
      .then((data) => active && setItems(data))
      .catch(() => active && setError(true));
    return () => { active = false; };
  }, []);

  if (error) {
    return (
      <div className="p-6 text-center text-ink-500 dark:text-ink-300">
        <AlertCircle className="mx-auto mb-2 text-danger-500" />
        Impossible de charger votre journée. Vérifiez votre connexion.
      </div>
    );
  }

  if (!items) {
    return (
      <div className="flex justify-center py-20 text-brand-500">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  const load = computeDayLoad(items);
  const next = items.find((i) => i.status !== 'termine') ?? items[0];
  const rest = items.filter((i) => i.id !== next?.id);
  const firstName = profile?.full_name?.split(' ')[0] || '';

  return (
    <div className="px-4 pt-5 pb-6 space-y-5 max-w-2xl mx-auto">
      <div>
        <p className="text-ink-500 dark:text-ink-300">Bonjour{firstName ? `, ${firstName}` : ''}</p>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Ma journée</h1>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-ink-800 p-8 text-center text-ink-500 dark:text-ink-300">
          <CalendarDays className="mx-auto mb-3 text-brand-500" size={32} />
          Aucune intervention prévue aujourd'hui.
        </div>
      ) : (
        <>
          <div className="rounded-3xl bg-white dark:bg-ink-800 p-5 border border-ink-100 dark:border-ink-700">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 font-semibold text-ink-900 dark:text-white">
                <Gauge size={20} className="text-brand-500" /> Charge de la journée
              </span>
              <span className="text-2xl font-bold text-ink-900 dark:text-white">{load.loadPercent}%</span>
            </div>
            <div className="h-3 rounded-full bg-ink-100 dark:bg-ink-900 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${loadBarColor[load.band]}`}
                style={{ width: `${load.loadPercent}%` }}
              />
            </div>
            {(load.band === 'chargee' || load.band === 'surcharge') && (
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-warn-700 dark:text-warn-100 bg-warn-50 dark:bg-warn-600/20 rounded-xl px-3 py-2">
                <TriangleAlert size={16} /> {load.bandLabel}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric icon={<CalendarDays size={16} />} label="Interventions" value={`${load.count}`} />
              <Metric icon={<TimerReset size={16} />} label="Temps disponible" value={minutesToText(load.availableMinutes)} />
              <Metric icon={<Coffee size={16} />} label="Pause prévue" value={minutesToText(load.pauseMinutes)} />
              <Metric
                icon={<AlertCircle size={16} />}
                label="Risque de retard"
                value={load.delayRisk ? 'Oui' : 'Faible'}
                tone={load.delayRisk ? 'warn' : 'ok'}
              />
            </div>
          </div>

          {next && (
            <div className="space-y-2">
              <NextInterventionCard intervention={next} onOpenPatient={onOpenPatient} />
              <button
                onClick={() => onOpenBriefing(next.id)}
                className="w-full py-3 rounded-xl bg-white dark:bg-ink-800 border border-brand-200 dark:border-brand-700/40 text-brand-600 dark:text-brand-300 font-semibold flex items-center justify-center gap-2 tap"
              >
                <ClipboardList size={18} /> Voir le briefing
              </button>
            </div>
          )}

          {rest.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-ink-500 dark:text-ink-300 uppercase tracking-wide px-1">
                La suite de la tournée
              </h2>
              {rest.map((i) => (
                <InterventionRow key={i.id} intervention={i} onClick={() => i.patient && onOpenPatient(i.patient.id)} />
              ))}
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onShowActions}
          className="py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center justify-center gap-2 tap shadow-lg shadow-brand-600/25"
        >
          <ShieldAlert size={22} /> J'ai besoin d'aide
        </button>
        <button
          onClick={onReportDifficulty}
          className="py-4 rounded-2xl bg-danger-600 hover:bg-danger-700 text-white font-bold flex items-center justify-center gap-2 tap shadow-lg shadow-danger-600/25"
        >
          <TriangleAlert size={22} /> En difficulté
        </button>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'default' | 'ok' | 'warn';
}) {
  const valueColor =
    tone === 'warn' ? 'text-warn-700 dark:text-warn-100' : tone === 'ok' ? 'text-brand-600 dark:text-brand-300' : 'text-ink-900 dark:text-white';
  return (
    <div className="rounded-2xl bg-ink-50 dark:bg-ink-900 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
        {icon} {label}
      </div>
      <div className={`mt-0.5 font-bold ${valueColor}`}>{value}</div>
    </div>
  );
}
