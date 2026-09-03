import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Clock, Equal, Loader2, Minus, Plus, Scale, TrendingUp } from 'lucide-react';
import { fetchTodayInterventions, type InterventionWithPatient } from '@/lib/data';
import { computeVariances, minutesToText, type VarianceItem } from '@/lib/workload';
import { difficultyLabel, formatTime } from '@/lib/format';

interface Props {
  onOpenPatient: (id: string) => void;
}

export default function PlannedVsReality({ onOpenPatient }: Props) {
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
        Impossible de charger les écarts.
      </div>
    );
  }

  if (!items) {
    return <div className="flex justify-center py-20 text-brand-500"><Loader2 className="animate-spin" size={32} /></div>;
  }

  const variances = computeVariances(items);
  const totalDelay = variances.reduce((s, v) => s + (v.durationVariance ?? 0), 0);
  const overCount = variances.filter((v) => (v.durationVariance ?? 0) > 5).length;
  const totalCount = variances.length;

  // Trend detection (simplified for demo)
  const allDifficult = variances.filter((v) => v.intervention.difficulty_level >= 4);
  const avgDiffVar = allDifficult.length > 0
    ? Math.round(allDifficult.reduce((s, v) => s + (v.durationVariance ?? 0), 0) / allDifficult.length)
    : 0;

  return (
    <div className="px-4 pt-5 pb-6 space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
          <Scale size={26} className="text-brand-500" /> Prévu / Réalité
        </h1>
        <p className="text-ink-500 dark:text-ink-300 text-sm mt-0.5">Comparaison entre le planning et ce qui s'est réellement passé</p>
      </div>

      {/* Summary */}
      {totalCount > 0 ? (
        <div className="rounded-3xl bg-white dark:bg-ink-800 p-5 border border-ink-100 dark:border-ink-700">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-ink-50 dark:bg-ink-900 py-3">
              <div className="text-xs text-ink-500 dark:text-ink-400">Interventions analysées</div>
              <div className="text-xl font-bold text-ink-900 dark:text-white mt-0.5">{totalCount}</div>
            </div>
            <div className="rounded-2xl bg-warn-50 dark:bg-warn-600/20 py-3">
              <div className="text-xs text-warn-600 dark:text-warn-300">Au-delà du prévu</div>
              <div className="text-xl font-bold text-warn-700 dark:text-warn-100 mt-0.5">{overCount}</div>
            </div>
            <div className={`rounded-2xl py-3 ${totalDelay > 0 ? 'bg-warn-50 dark:bg-warn-600/20' : 'bg-brand-50 dark:bg-brand-700/20'}`}>
              <div className={`text-xs ${totalDelay > 0 ? 'text-warn-600 dark:text-warn-300' : 'text-brand-600 dark:text-brand-300'}`}>Écart cumulé</div>
              <div className={`text-xl font-bold mt-0.5 ${totalDelay > 0 ? 'text-warn-700 dark:text-warn-100' : 'text-brand-700 dark:text-brand-200'}`}>
                {totalDelay > 0 ? '+' : ''}{totalDelay} min
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-ink-800 p-8 text-center text-ink-500 dark:text-ink-300">
          <Scale className="mx-auto mb-3 text-brand-500" size={32} />
          Aucune intervention terminée à analyser pour l'instant.
        </div>
      )}

      {/* Variance items */}
      <div className="space-y-3">
        {variances.map((v) => (
          <VarianceCard key={v.intervention.id} item={v} onOpenPatient={onOpenPatient} />
        ))}
      </div>

      {/* Trend detection */}
      {avgDiffVar > 5 && (
        <div className="rounded-3xl bg-info-50 dark:bg-info-600/15 border border-info-100 dark:border-info-600/30 p-5">
          <h2 className="flex items-center gap-2 font-semibold text-info-700 dark:text-info-100 mb-2">
            <TrendingUp size={20} /> Tendance détectée
          </h2>
          <p className="text-sm text-info-700 dark:text-info-100 mb-3">
            Les interventions difficiles durent en moyenne <strong>{avgDiffVar} minutes de plus</strong> que prévu.
          </p>
          <div className="rounded-xl bg-white dark:bg-ink-800 p-3 border border-info-100 dark:border-info-600/30">
            <p className="text-sm text-ink-700 dark:text-ink-200 mb-2">Adapter automatiquement la durée estimée des prochaines interventions difficiles ?</p>
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium tap">
                Accepter l'ajustement
              </button>
              <button className="flex-1 py-2.5 rounded-xl bg-ink-100 dark:bg-ink-900 text-ink-700 dark:text-ink-200 text-sm font-medium tap">
                Refuser
              </button>
            </div>
            <p className="text-xs text-ink-400 mt-2">La décision vous appartient toujours. L'application ne modifie jamais le planning sans votre accord.</p>
          </div>
        </div>
      )}

      {variances.length === 0 && totalCount === 0 && (
        <div className="rounded-2xl bg-ink-50 dark:bg-ink-900 p-4">
          <p className="text-xs text-ink-400">
            Les écarts apparaissent automatiquement quand vous terminez des interventions. Les données de démonstration incluent déjà des écarts fictifs.
          </p>
        </div>
      )}
    </div>
  );
}

function VarianceCard({ item, onOpenPatient }: { item: VarianceItem; onOpenPatient: (id: string) => void }) {
  const v = item;
  const i = v.intervention;
  const p = i.patient;
  const durVar = v.durationVariance;
  const trVar = v.travelVariance;
  const diffVar = v.difficultyVariance;

  return (
    <div className="rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-ink-400" />
          <span className="text-sm font-medium text-ink-900 dark:text-white">
            {p ? `${p.first_name} ${p.last_name}` : 'Patient'}
          </span>
          <span className="text-xs text-ink-400">{formatTime(i.scheduled_at)}</span>
        </div>
        {p && (
          <button onClick={() => onOpenPatient(p.id)} className="text-xs text-brand-600 dark:text-brand-300 tap">
            Voir fiche
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {/* Prévu */}
        <div className="rounded-xl bg-ink-50 dark:bg-ink-900 py-2.5">
          <div className="text-xs text-ink-400 uppercase">Prévu</div>
          <div className="font-semibold text-ink-900 dark:text-white text-sm mt-0.5">{minutesToText(i.duration_minutes)}</div>
          <div className="text-xs text-ink-400 mt-0.5">{difficultyLabel(i.difficulty_level)}</div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <ArrowRight size={16} className="text-ink-300" />
          {durVar !== null && (
            <span className={`text-xs font-bold mt-1 ${durVar > 0 ? 'text-warn-600 dark:text-warn-300' : durVar < 0 ? 'text-brand-600 dark:text-brand-300' : 'text-ink-400'}`}>
              {durVar > 0 ? '+' : ''}{durVar} min
            </span>
          )}
        </div>

        {/* Réel */}
        <div className="rounded-xl bg-ink-50 dark:bg-ink-900 py-2.5">
          <div className="text-xs text-ink-400 uppercase">Réel</div>
          <div className="font-semibold text-ink-900 dark:text-white text-sm mt-0.5">
            {i.actual_duration ? minutesToText(i.actual_duration) : '—'}
          </div>
          <div className="text-xs text-ink-400 mt-0.5">
            {i.actual_difficulty ? difficultyLabel(i.actual_difficulty) : '—'}
          </div>
        </div>
      </div>

      {/* Variances detail */}
      <div className="mt-3 flex flex-wrap gap-2">
        {durVar !== null && (
          <VarianceTag icon={durVar > 0 ? <Plus size={12} /> : durVar < 0 ? <Minus size={12} /> : <Equal size={12} />} label={`Durée : ${durVar > 0 ? '+' : ''}${durVar} min`} tone={durVar > 2 ? 'warn' : durVar < -2 ? 'ok' : 'neutral'} />
        )}
        {trVar !== null && (
          <VarianceTag icon={trVar > 0 ? <Plus size={12} /> : <Minus size={12} />} label={`Trajet : ${trVar > 0 ? '+' : ''}${trVar} min`} tone={trVar > 2 ? 'warn' : 'neutral'} />
        )}
        {diffVar !== null && diffVar !== 0 && (
          <VarianceTag icon={<TrendingUp size={12} />} label={`Difficulté : ${diffVar > 0 ? '+' : ''}${diffVar}`} tone={diffVar > 0 ? 'warn' : 'ok'} />
        )}
      </div>

      {/* Reason */}
      {v.reason && (
        <div className="mt-3 rounded-xl bg-warn-50 dark:bg-warn-600/15 px-3 py-2">
          <div className="text-xs font-semibold text-warn-600 dark:text-warn-300 mb-0.5">Pourquoi ?</div>
          <p className="text-sm text-ink-700 dark:text-ink-200">{v.reason}</p>
        </div>
      )}

      {/* Extra tasks */}
      {v.extraTasks && (
        <div className="mt-2 text-xs text-ink-500 dark:text-ink-400">
          <span className="font-medium">Tâches supplémentaires : </span>{v.extraTasks}
        </div>
      )}
    </div>
  );
}

function VarianceTag({ icon, label, tone }: { icon: React.ReactNode; label: string; tone: 'ok' | 'warn' | 'neutral' }) {
  const styles = {
    ok: 'bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200',
    warn: 'bg-warn-100 text-warn-700 dark:bg-warn-600/30 dark:text-warn-100',
    neutral: 'bg-ink-100 text-ink-600 dark:bg-ink-900 dark:text-ink-300',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${styles[tone]}`}>
      {icon} {label}
    </span>
  );
}
