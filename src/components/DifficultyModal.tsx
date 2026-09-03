import { useState } from 'react';
import { AlertTriangle, Clock, Wrench, HeartHandshake, PackageX, ShieldAlert, Activity, Ban, X, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { suggestedActionFor } from '@/lib/data';

interface Props {
  interventionId?: string | null;
  onClose: () => void;
}

const TYPES = [
  { key: 'retard', label: 'Je suis en retard', icon: Clock },
  { key: 'duree', label: 'Intervention plus longue', icon: Clock },
  { key: 'technique', label: 'Difficulté technique', icon: Wrench },
  { key: 'relationnel', label: 'Situation relationnelle', icon: HeartHandshake },
  { key: 'materiel', label: 'Manque de matériel', icon: PackageX },
  { key: 'securite', label: 'Risque pour ma sécurité', icon: ShieldAlert },
  { key: 'aggravation', label: 'État du patient aggravé', icon: Activity },
  { key: 'impossible', label: 'Tâche impossible à faire', icon: Ban },
];

export default function DifficultyModal({ interventionId = null, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestion = selected ? suggestedActionFor(selected) : '';

  async function submit() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.from('difficulty_reports').insert({
      intervention_id: interventionId,
      type: selected,
      note: note.trim(),
      suggested_action: suggestion,
    });
    if (err) {
      setError("Le signalement n'a pas pu être envoyé. Réessayez.");
      setBusy(false);
      return;
    }
    setDone(true);
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-ink-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto safe-bottom">
        <div className="sticky top-0 bg-white dark:bg-ink-800 px-5 pt-5 pb-3 flex items-center justify-between border-b border-ink-100 dark:border-ink-700">
          <div>
            <h2 className="text-xl font-bold text-ink-900 dark:text-white">Je suis en difficulté</h2>
            <p className="text-sm text-ink-500 dark:text-ink-300">Rapide et sans jugement. On trouve une solution.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 tap" aria-label="Fermer">
            <X size={22} />
          </button>
        </div>

        {done ? (
          <div className="p-8 flex flex-col items-center text-center">
            <CheckCircle2 size={56} className="text-brand-500" />
            <h3 className="mt-4 text-lg font-semibold text-ink-900 dark:text-white">Signalement envoyé</h3>
            <p className="mt-2 text-ink-500 dark:text-ink-300 max-w-xs">{suggestion}</p>
            <button onClick={onClose} className="mt-6 w-full py-3 rounded-xl bg-brand-600 text-white font-semibold tap">
              Fermer
            </button>
          </div>
        ) : (
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3">
              {TYPES.map(({ key, label, icon: Icon }) => {
                const active = selected === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelected(key)}
                    className={`flex flex-col items-start gap-2 p-4 rounded-2xl border text-left tap ${
                      active
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-700/20'
                        : 'border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900'
                    }`}
                  >
                    <Icon size={24} className={active ? 'text-brand-600 dark:text-brand-300' : 'text-ink-500 dark:text-ink-300'} />
                    <span className={`text-sm font-medium ${active ? 'text-brand-700 dark:text-brand-200' : 'text-ink-700 dark:text-ink-100'}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {selected && (
              <div className="mt-5 space-y-4">
                <div className="flex gap-3 p-4 rounded-2xl bg-info-50 dark:bg-info-600/15 border border-info-100 dark:border-info-600/30">
                  <AlertTriangle size={20} className="text-info-600 dark:text-info-300 shrink-0 mt-0.5" />
                  <p className="text-sm text-info-700 dark:text-info-100">{suggestion}</p>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Précision (facultatif)"
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {error && <p className="text-sm text-danger-600 dark:text-danger-100">{error}</p>}
                <button
                  onClick={submit}
                  disabled={busy}
                  className="w-full py-3.5 rounded-xl bg-danger-600 hover:bg-danger-700 text-white font-semibold flex items-center justify-center gap-2 tap disabled:opacity-60"
                >
                  {busy && <Loader2 size={18} className="animate-spin" />}
                  Envoyer le signalement
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
