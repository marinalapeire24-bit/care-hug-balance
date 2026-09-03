import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Loader2,
  MapPin,
  Navigation,
  PackageX,
  ShieldAlert,
  Users,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { findSolutionsForHelp, helpRequestTypeLabels } from '@/lib/organization';
import type { HelpRequestType, ProposedSolution } from '@/lib/types';

interface Props {
  onClose: () => void;
}

const TYPES: { key: HelpRequestType; label: string; icon: typeof Clock }[] = [
  { key: 'intervention', label: "Problème avec une intervention", icon: Wrench },
  { key: 'retard', label: 'Je suis en retard', icon: Clock },
  { key: 'surcharge', label: 'Je suis en surcharge', icon: AlertTriangle },
  { key: 'difficulte_personne', label: 'Difficulté avec une personne', icon: HeartHandshake },
  { key: 'materiel', label: 'Problème matériel', icon: PackageX },
  { key: 'remplacement', label: 'Besoin de remplacement', icon: Users },
  { key: 'renfort', label: 'Besoin de renfort', icon: Zap },
  { key: 'organisationnel', label: 'Problème organisationnel', icon: AlertTriangle },
  { key: 'autre', label: 'Autre', icon: AlertTriangle },
];

export default function HelpRequestModal({ onClose }: Props) {
  const [selected, setSelected] = useState<HelpRequestType | null>(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const solutions: ProposedSolution[] = selected
    ? findSolutionsForHelp(selected, [])
    : [];

  function submit() {
    if (!selected) return;
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-ink-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto safe-bottom">
        <div className="sticky top-0 bg-white dark:bg-ink-800 px-5 pt-5 pb-3 flex items-center justify-between border-b border-ink-100 dark:border-ink-700">
          <div>
            <h2 className="text-xl font-bold text-ink-900 dark:text-white">J'ai besoin d'aide</h2>
            <p className="text-sm text-ink-500 dark:text-ink-300">Le bureau reçoit votre demande et cherche des solutions.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 tap" aria-label="Fermer">
            <X size={22} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 flex flex-col items-center text-center">
            <CheckCircle2 size={56} className="text-brand-500" />
            <h3 className="mt-4 text-lg font-semibold text-ink-900 dark:text-white">Demande envoyée</h3>
            <p className="mt-2 text-ink-500 dark:text-ink-300 max-w-xs">
              Le bureau a été alerté et recherchera la meilleure solution pour vous. Un coordinateur vous recontactera.
            </p>
            <button onClick={onClose} className="mt-6 w-full py-3 rounded-xl bg-brand-600 text-white font-semibold tap">
              Fermer
            </button>
          </div>
        ) : (
          <div className="p-5">
            <p className="text-sm font-medium text-ink-700 dark:text-ink-200 mb-3">Quel type d'aide ?</p>
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
                    <Icon size={22} className={active ? 'text-brand-600 dark:text-brand-300' : 'text-ink-500'} />
                    <span className={`text-sm font-medium ${active ? 'text-brand-700 dark:text-brand-200' : 'text-ink-700 dark:text-ink-100'}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {selected && (
              <div className="mt-5 space-y-4">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Décrivez la situation (ex. Je suis en retard chez Mme Martin et je ne vais pas pouvoir arriver à l'heure chez Mme Dupont.)"
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />

                {solutions.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-2 flex items-center gap-2">
                      <Users size={18} className="text-brand-500" /> Solutions possibles
                    </p>
                    <div className="space-y-2">
                      {solutions.slice(0, 3).map((sol) => (
                        <SolutionCard key={sol.id} solution={sol} />
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-ink-400">
                      Le bureau valide toujours la décision finale. Aucune modification automatique du planning.
                    </p>
                  </div>
                )}

                <button
                  onClick={submit}
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center justify-center gap-2 tap"
                >
                  <ShieldAlert size={18} /> Envoyer la demande
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SolutionCard({ solution }: { solution: ProposedSolution }) {
  const compatible = solution.compatible;
  return (
    <div className={`rounded-2xl border p-4 ${compatible ? 'border-brand-200 dark:border-brand-700/40 bg-brand-50 dark:bg-brand-700/10' : 'border-ink-100 dark:border-ink-700 bg-ink-50 dark:bg-ink-900'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-ink-900 dark:text-white text-sm">{solution.person_name}</span>
        {compatible ? (
          <span className="text-xs font-bold text-brand-600 dark:text-brand-300 flex items-center gap-1">
            <Check size={14} /> Compatible
          </span>
        ) : (
          <span className="text-xs font-medium text-ink-400">Non compatible</span>
        )}
      </div>
      {compatible ? (
        <div className="space-y-1">
          {solution.recommendation_reasons.map((r, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-brand-700 dark:text-brand-200">
              <Check size={12} /> {r}
            </div>
          ))}
          <div className="flex items-center gap-3 mt-2 text-xs text-ink-500">
            <span className="flex items-center gap-1"><Navigation size={12} /> {solution.travel_minutes} min</span>
            <span>Charge {solution.load_percent}%</span>
            {solution.knows_patient && <span>Connaît le patient</span>}
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {solution.incompatibility_reasons.map((r, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-ink-400">
              <X size={12} /> {r}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
