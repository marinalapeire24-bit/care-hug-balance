import { useState } from 'react';
import { Camera, CheckCircle2, Loader2, X } from 'lucide-react';
import type { ProblemCategory, ProblemUrgency } from '@/lib/types';

interface Props {
  onClose: () => void;
}

const CATEGORIES: { key: ProblemCategory; label: string; emoji: string }[] = [
  { key: 'materiel', label: 'Matériel', emoji: '🔧' },
  { key: 'securite', label: 'Sécurité', emoji: '🛡️' },
  { key: 'environnement', label: 'Environnement', emoji: '🏠' },
  { key: 'organisation', label: 'Organisation', emoji: '📋' },
  { key: 'autre', label: 'Autre', emoji: '❓' },
];

const URGENCIES: { key: ProblemUrgency; label: string; color: string }[] = [
  { key: 'info', label: 'Information', color: 'bg-info-100 text-info-700 dark:bg-info-600/30 dark:text-info-100' },
  { key: 'attention', label: 'Attention', color: 'bg-warn-100 text-warn-700 dark:bg-warn-600/30 dark:text-warn-100' },
  { key: 'urgent', label: 'Urgent', color: 'bg-danger-100 text-danger-700 dark:bg-danger-700/30 dark:text-danger-100' },
];

export default function ProblemReportModal({ onClose }: Props) {
  const [category, setCategory] = useState<ProblemCategory | null>(null);
  const [urgency, setUrgency] = useState<ProblemUrgency>('attention');
  const [comment, setComment] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    if (!category) return;
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-ink-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto safe-bottom">
        <div className="sticky top-0 bg-white dark:bg-ink-800 px-5 pt-5 pb-3 flex items-center justify-between border-b border-ink-100 dark:border-ink-700">
          <h2 className="text-xl font-bold text-ink-900 dark:text-white">Signaler un problème</h2>
          <button onClick={onClose} className="p-2 rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 tap" aria-label="Fermer">
            <X size={22} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 flex flex-col items-center text-center">
            <CheckCircle2 size={56} className="text-brand-500" />
            <h3 className="mt-4 text-lg font-semibold text-ink-900 dark:text-white">Problème signalé</h3>
            <p className="mt-2 text-ink-500 dark:text-ink-300 max-w-xs">
              Le bureau a reçu votre signalement et va traiter la tâche. Merci.
            </p>
            <button onClick={onClose} className="mt-6 w-full py-3 rounded-xl bg-brand-600 text-white font-semibold tap">
              Fermer
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-2">Catégorie</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(({ key, label, emoji }) => (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className={`px-3.5 py-2.5 rounded-xl text-sm font-medium tap flex items-center gap-1.5 ${
                      category === key ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-900 text-ink-700 dark:text-ink-200'
                    }`}
                  >
                    <span>{emoji}</span> {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-2">Niveau d'urgence</label>
              <div className="flex gap-2">
                {URGENCIES.map(({ key, label, color }) => (
                  <button
                    key={key}
                    onClick={() => setUrgency(key)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium tap ${
                      urgency === key ? color : 'bg-ink-100 dark:bg-ink-900 text-ink-600 dark:text-ink-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-2">Photo (facultatif)</label>
              {hasPhoto ? (
                <div className="rounded-2xl bg-brand-50 dark:bg-brand-700/20 p-4 flex items-center gap-3">
                  <CheckCircle2 size={24} className="text-brand-600 dark:text-brand-300" />
                  <span className="text-sm text-brand-700 dark:text-brand-200">Photo ajoutée</span>
                  <button onClick={() => setHasPhoto(false)} className="ml-auto text-xs text-ink-400 tap">Retirer</button>
                </div>
              ) : (
                <button
                  onClick={() => setHasPhoto(true)}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-ink-200 dark:border-ink-700 text-ink-500 dark:text-ink-300 flex items-center justify-center gap-2 tap"
                >
                  <Camera size={20} /> Prendre une photo
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">Commentaire</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Décrivez le problème…"
              />
            </div>

            <button
              onClick={submit}
              disabled={!category}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center justify-center gap-2 tap disabled:opacity-60"
            >
              Envoyer le signalement
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
