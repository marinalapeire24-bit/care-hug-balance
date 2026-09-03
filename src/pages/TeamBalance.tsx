import { Users } from 'lucide-react';
import { teamLoadSummaries } from '@/lib/organization';

export default function TeamBalance() {
  return (
    <div className="px-4 pt-5 pb-6 space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
          <Users size={26} className="text-brand-500" /> Équilibre de l'équipe
        </h1>
        <p className="text-ink-500 dark:text-ink-300 text-sm mt-0.5">
          Analyse de la charge organisationnelle — pas un score de performance
        </p>
      </div>

      <div className="rounded-2xl bg-ink-50 dark:bg-ink-900 p-4">
        <p className="text-xs text-ink-500 dark:text-ink-400">
          Cet indicateur analyse la répartition de la charge (interventions, trajets, difficultés, imprévus) pour identifier les déséquilibres organisationnels. Il ne mesure pas la valeur professionnelle d'un salarié.
        </p>
      </div>

      <div className="space-y-3">
        {teamLoadSummaries.map((m) => {
          const statusColor = m.status === 'elevee' ? 'border-l-danger-500' : m.status === 'vigilance' ? 'border-l-warn-500' : 'border-l-brand-500';
          const statusBg = m.status === 'elevee' ? 'bg-danger-50 dark:bg-danger-700/15' : m.status === 'vigilance' ? 'bg-warn-50 dark:bg-warn-600/15' : 'bg-white dark:bg-ink-800';
          const statusLabel = m.status === 'elevee' ? 'Charge élevée' : m.status === 'vigilance' ? 'Vigilance' : 'Normal';
          const statusTextColor = m.status === 'elevee' ? 'text-danger-700 dark:text-danger-100' : m.status === 'vigilance' ? 'text-warn-700 dark:text-warn-100' : 'text-brand-700 dark:text-brand-200';
          const barColor = m.status === 'elevee' ? 'bg-danger-500' : m.status === 'vigilance' ? 'bg-warn-500' : 'bg-brand-500';

          return (
            <div key={m.name} className={`rounded-2xl border border-l-4 border-ink-100 dark:border-ink-700 p-4 ${statusColor} ${statusBg}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-ink-900 dark:text-white">{m.name}</span>
                  <span className="text-xs text-ink-400 ml-2">{m.role}</span>
                </div>
                <span className={`text-xs font-bold ${statusTextColor}`}>{statusLabel}</span>
              </div>
              <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-700 overflow-hidden mb-3">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${m.load_percent}%` }} />
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <Metric label="Interv." value={`${m.intervention_count}`} />
                <Metric label="Difficiles" value={`${m.difficult_count}`} />
                <Metric label="Trajet" value={`${m.travel_minutes} min`} />
                <Metric label="Aides" value={`${m.help_requests}`} />
              </div>
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-2">{m.reason}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink-100 dark:bg-ink-900 py-1.5">
      <div className="text-ink-400">{label}</div>
      <div className="font-semibold text-ink-900 dark:text-white">{value}</div>
    </div>
  );
}
