import { MapPin, Clock, Navigation, Package, GraduationCap, ChevronRight } from 'lucide-react';
import type { InterventionWithPatient } from '@/lib/data';
import { formatTime, difficultyLabel } from '@/lib/format';
import { minutesToText } from '@/lib/workload';

function difficultyTone(level: number): string {
  if (level >= 4) return 'bg-danger-100 text-danger-700 dark:bg-danger-700/30 dark:text-danger-100';
  if (level === 3) return 'bg-warn-100 text-warn-700 dark:bg-warn-600/30 dark:text-warn-100';
  return 'bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200';
}

export function DifficultyBadge({ level }: { level: number }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${difficultyTone(level)}`}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`w-1 h-3 rounded-full ${n <= level ? 'bg-current' : 'bg-current/25'}`} />
        ))}
      </span>
      {difficultyLabel(level)}
    </span>
  );
}

export function NextInterventionCard({
  intervention,
  onOpenPatient,
}: {
  intervention: InterventionWithPatient;
  onOpenPatient: (id: string) => void;
}) {
  const p = intervention.patient;
  return (
    <div className="rounded-3xl bg-brand-600 text-white p-5 shadow-lg shadow-brand-600/25">
      <div className="flex items-center justify-between">
        <span className="text-brand-100 text-sm font-medium uppercase tracking-wide">Prochaine intervention</span>
        <span className="flex items-center gap-1.5 text-2xl font-bold">
          <Clock size={22} className="text-brand-200" />
          {formatTime(intervention.scheduled_at)}
        </span>
      </div>

      <h2 className="mt-3 text-3xl font-bold leading-tight">
        {p ? `${p.first_name} ${p.last_name}` : 'Patient'}
      </h2>

      <div className="mt-2 flex items-start gap-2 text-brand-50">
        <MapPin size={18} className="shrink-0 mt-0.5" />
        <span>{intervention.address || p?.address || 'Adresse non renseignée'}</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-white/10 py-2.5">
          <div className="text-xs text-brand-100">Durée</div>
          <div className="font-semibold">{minutesToText(intervention.duration_minutes)}</div>
        </div>
        <div className="rounded-2xl bg-white/10 py-2.5">
          <div className="text-xs text-brand-100">Trajet</div>
          <div className="font-semibold flex items-center justify-center gap-1">
            <Navigation size={14} />
            {intervention.travel_minutes} min
          </div>
        </div>
        <div className="rounded-2xl bg-white/10 py-2.5">
          <div className="text-xs text-brand-100">Difficulté</div>
          <div className="font-semibold">{difficultyLabel(intervention.difficulty_level)}</div>
        </div>
      </div>

      {intervention.instructions && (
        <p className="mt-4 text-sm text-brand-50 bg-white/10 rounded-2xl px-4 py-3">{intervention.instructions}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {intervention.required_equipment && (
          <span className="inline-flex items-center gap-1.5 text-xs bg-white/10 rounded-full px-3 py-1.5">
            <Package size={14} /> {intervention.required_equipment}
          </span>
        )}
        {intervention.required_skills && (
          <span className="inline-flex items-center gap-1.5 text-xs bg-white/10 rounded-full px-3 py-1.5">
            <GraduationCap size={14} /> {intervention.required_skills}
          </span>
        )}
      </div>

      {p && (
        <button
          onClick={() => onOpenPatient(p.id)}
          className="mt-4 w-full py-3 rounded-xl bg-white text-brand-700 font-semibold flex items-center justify-center gap-1 tap"
        >
          Voir la fiche patient <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}

export function InterventionRow({
  intervention,
  onClick,
}: {
  intervention: InterventionWithPatient;
  onClick: () => void;
}) {
  const p = intervention.patient;
  const done = intervention.status === 'termine';
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 text-left tap"
    >
      <div className="flex flex-col items-center justify-center w-14 shrink-0">
        <span className="text-lg font-bold text-ink-900 dark:text-white">{formatTime(intervention.scheduled_at)}</span>
        <span className="text-xs text-ink-400">{minutesToText(intervention.duration_minutes)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-semibold truncate ${done ? 'line-through text-ink-400' : 'text-ink-900 dark:text-white'}`}>
          {p ? `${p.first_name} ${p.last_name}` : 'Patient'}
        </div>
        <div className="text-sm text-ink-500 dark:text-ink-300 truncate">{intervention.address || p?.address}</div>
        <div className="mt-1.5">
          <DifficultyBadge level={intervention.difficulty_level} />
        </div>
      </div>
      <ChevronRight size={20} className="text-ink-300 shrink-0" />
    </button>
  );
}
