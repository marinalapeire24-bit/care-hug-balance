import { useEffect, useState } from 'react';
import { AlertCircle, ChevronRight, Home, Loader2, Search, ShieldAlert } from 'lucide-react';
import { fetchPatients } from '@/lib/data';
import type { Patient } from '@/lib/types';
import { age, fragilityBand } from '@/lib/format';

interface Props {
  onOpenPatient: (id: string) => void;
}

const bandTone: Record<string, string> = {
  high: 'bg-danger-100 text-danger-700 dark:bg-danger-700/30 dark:text-danger-100',
  mid: 'bg-warn-100 text-warn-700 dark:bg-warn-600/30 dark:text-warn-100',
  low: 'bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200',
};

export default function PatientsList({ onOpenPatient }: Props) {
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    fetchPatients()
      .then((data) => active && setPatients(data))
      .catch(() => active && setError(true));
    return () => { active = false; };
  }, []);

  if (error) {
    return (
      <div className="p-6 text-center text-ink-500 dark:text-ink-300">
        <AlertCircle className="mx-auto mb-2 text-danger-500" />
        Impossible de charger vos patients.
      </div>
    );
  }

  if (!patients) {
    return (
      <div className="flex justify-center py-20 text-brand-500">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  const filtered = patients.filter((p) =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="px-4 pt-5 pb-6 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Mes patients</h1>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un patient"
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((p) => {
          const band = fragilityBand(p.fragility_level);
          const a = age(p.birth_date);
          return (
            <button
              key={p.id}
              onClick={() => onOpenPatient(p.id)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 text-left tap"
            >
              <div className="w-11 h-11 rounded-full bg-brand-100 dark:bg-brand-700/30 flex items-center justify-center text-brand-700 dark:text-brand-200 font-bold shrink-0">
                {p.first_name[0]}{p.last_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink-900 dark:text-white truncate">
                  {p.first_name} {p.last_name}{a !== null && <span className="text-ink-400 font-normal"> · {a} ans</span>}
                </div>
                <div className="flex items-center gap-1 text-sm text-ink-500 dark:text-ink-300 truncate">
                  <Home size={14} /> {p.address || 'Domicile'}
                </div>
                <div className="mt-1.5">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${bandTone[band.tone]}`}>
                    <ShieldAlert size={12} /> {band.label}
                  </span>
                </div>
              </div>
              <ChevronRight size={20} className="text-ink-300 shrink-0" />
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-ink-400 py-10">Aucun patient trouvé.</p>
        )}
      </div>
    </div>
  );
}
