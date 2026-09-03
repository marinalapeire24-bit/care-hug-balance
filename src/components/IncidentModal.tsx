import { useState } from 'react';
import { CheckCircle2, Phone, ShieldAlert, X } from 'lucide-react';
import type { IncidentLevel } from '@/lib/types';

interface Props {
  onClose: () => void;
}

const LEVELS: { key: IncidentLevel; label: string; emoji: string; desc: string; color: string }[] = [
  { key: 'securite', label: 'Sécurité', emoji: '🔴', desc: 'Menace immédiate pour la sécurité', color: 'border-danger-500 bg-danger-50 dark:bg-danger-700/20' },
  { key: 'incident', label: 'Incident', emoji: '🟠', desc: 'Événement perturbateur', color: 'border-warn-500 bg-warn-50 dark:bg-warn-600/20' },
  { key: 'chute', label: 'Chute / Événement', emoji: '🟡', desc: 'Chute, malaise, événement de santé', color: 'border-warn-500 bg-warn-50 dark:bg-warn-600/20' },
  { key: 'materiel', label: 'Matériel', emoji: '🔵', desc: 'Défaillance de matériel critique', color: 'border-info-500 bg-info-50 dark:bg-info-600/20' },
  { key: 'renfort', label: 'Besoin de renfort', emoji: '🟣', desc: 'Assistance immédiate nécessaire', color: 'border-brand-500 bg-brand-50 dark:bg-brand-700/20' },
  { key: 'autre', label: 'Autre', emoji: '⚪', desc: 'Autre situation', color: 'border-ink-300 bg-ink-50 dark:bg-ink-900' },
];

export default function IncidentModal({ onClose }: Props) {
  const [selected, setSelected] = useState<IncidentLevel | null>(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
            <h2 className="text-xl font-bold text-danger-600 dark:text-danger-300 flex items-center gap-2">
              <ShieldAlert size={22} /> Incident / SOS
            </h2>
            <p className="text-sm text-ink-500 dark:text-ink-300">Le bureau est alerté immédiatement. Cela ne remplace pas les services d'urgence (15, 18, 112).</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 tap" aria-label="Fermer">
            <X size={22} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 flex flex-col items-center text-center">
            <CheckCircle2 size={56} className="text-danger-500" />
            <h3 className="mt-4 text-lg font-semibold text-ink-900 dark:text-white">Alerte envoyée au bureau</h3>
            <p className="mt-2 text-ink-500 dark:text-ink-300 max-w-xs">
              Le bureau a été notifié immédiatement. Un coordinateur va vous recontacter.
            </p>
            <a
              href="tel:15"
              className="mt-4 w-full py-3.5 rounded-xl bg-danger-600 text-white font-semibold flex items-center justify-center gap-2 tap"
            >
              <Phone size={18} /> Appeler le SAMU (15)
            </a>
            <button onClick={onClose} className="mt-2 w-full py-3 rounded-xl bg-ink-100 dark:bg-ink-900 text-ink-600 dark:text-ink-300 font-medium tap">
              Fermer
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              {LEVELS.map(({ key, label, emoji, desc, color }) => (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left tap transition-colors ${
                    selected === key ? color : 'border-ink-100 dark:border-ink-700 bg-ink-50 dark:bg-ink-900'
                  }`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <div className="font-semibold text-ink-900 dark:text-white text-sm">{label}</div>
                    <div className="text-xs text-ink-500 dark:text-ink-400">{desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {selected && (
              <div className="space-y-4">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Décrivez ce qui s'est passé…"
                />
                <button
                  onClick={submit}
                  className="w-full py-3.5 rounded-xl bg-danger-600 hover:bg-danger-700 text-white font-semibold flex items-center justify-center gap-2 tap"
                >
                  <ShieldAlert size={18} /> Envoyer l'alerte
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
