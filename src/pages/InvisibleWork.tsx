import { useEffect, useState } from 'react';
import { AlertCircle, Ghost, Loader2, Plus, Trash2, X } from 'lucide-react';
import { addInvisibleTask, deleteInvisibleTask, fetchTodayInvisibleTasks } from '@/lib/data';
import type { InvisibleTask, InvisibleTaskType } from '@/lib/types';
import { invisibleTypeLabels, minutesToText, summarizeInvisible } from '@/lib/workload';

const TYPES: { key: InvisibleTaskType; label: string }[] = [
  { key: 'appel', label: 'Appel' },
  { key: 'coordination', label: 'Coordination' },
  { key: 'attente', label: 'Attente' },
  { key: 'materiel', label: 'Matériel' },
  { key: 'transmission', label: 'Transmission' },
  { key: 'aide_collegue', label: 'Aide à un collègue' },
  { key: 'imprevu', label: 'Imprévu' },
  { key: 'deplacement', label: 'Déplacement' },
  { key: 'accompagnement', label: 'Accompagnement' },
  { key: 'autre', label: 'Autre' },
];

const DURATION_PRESETS = [5, 10, 15, 20, 30];

export default function InvisibleWork() {
  const [tasks, setTasks] = useState<InvisibleTask[] | null>(null);
  const [error, setError] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    reload();
  }, []);

  async function reload() {
    try {
      const data = await fetchTodayInvisibleTasks();
      setTasks(data);
    } catch {
      setError(true);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteInvisibleTask(id);
      setTasks((prev) => prev?.filter((t) => t.id !== id) ?? null);
    } catch {
      // silent
    }
  }

  if (error) {
    return (
      <div className="p-6 text-center text-ink-500 dark:text-ink-300">
        <AlertCircle className="mx-auto mb-2 text-danger-500" />
        Impossible de charger le travail invisible.
      </div>
    );
  }

  if (!tasks) {
    return <div className="flex justify-center py-20 text-brand-500"><Loader2 className="animate-spin" size={32} /></div>;
  }

  const summary = summarizeInvisible(tasks);

  return (
    <div className="px-4 pt-5 pb-6 space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
            <Ghost size={26} className="text-brand-500" /> Travail invisible
          </h1>
          <p className="text-ink-500 dark:text-ink-300 text-sm mt-0.5">Les tâches que vous faites mais qui ne sont pas dans le planning</p>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-3xl bg-brand-600 text-white p-5 shadow-lg shadow-brand-600/25">
        <div className="text-brand-100 text-sm uppercase tracking-wide font-medium">Travail invisible aujourd'hui</div>
        <div className="text-4xl font-bold mt-1">{minutesToText(summary.totalMinutes)}</div>
        {summary.byType.length > 0 && (
          <div className="mt-4 space-y-2">
            {summary.byType.map((item) => (
              <div key={item.type} className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2">
                <span className="text-sm text-brand-50">{invisibleTypeLabels[item.type] ?? item.type}</span>
                <span className="text-sm font-semibold">{minutesToText(item.minutes)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-ink-500 dark:text-ink-300 uppercase tracking-wide px-1">
          Tâches enregistrées ({tasks.length})
        </h2>
        {tasks.length === 0 ? (
          <p className="text-center text-ink-400 py-8">Aucune tâche invisible enregistrée pour l'instant.</p>
        ) : (
          tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700">
              <div className="w-10 h-10 rounded-full bg-ink-100 dark:bg-ink-900 flex items-center justify-center shrink-0">
                <Ghost size={18} className="text-ink-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink-900 dark:text-white text-sm">{invisibleTypeLabels[t.type] ?? t.type}</div>
                <div className="text-xs text-ink-500 dark:text-ink-400">
                  {minutesToText(t.duration_minutes)}
                  {t.note && ` · ${t.note}`}
                </div>
              </div>
              <button
                onClick={() => handleDelete(t.id)}
                className="p-2 rounded-full text-ink-300 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-700/20 tap"
                aria-label="Supprimer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Info box */}
      <div className="rounded-2xl bg-ink-50 dark:bg-ink-900 p-4">
        <p className="text-xs text-ink-400">
          Cette fonctionnalité sert à mieux comprendre la charge réelle du travail et à améliorer l'organisation. Elle n'est jamais utilisée pour surveiller ou évaluer la performance individuelle d'un salarié.
        </p>
      </div>

      {/* Add button */}
      <button
        onClick={() => setShowAdd(true)}
        className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg flex items-center justify-center gap-2 tap shadow-lg shadow-brand-600/25"
      >
        <Plus size={22} /> Ajouter une tâche invisible
      </button>

      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onAdded={() => { setShowAdd(false); reload(); }} />}
    </div>
  );
}

function AddTaskModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [type, setType] = useState<InvisibleTaskType | null>(null);
  const [duration, setDuration] = useState(10);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!type) return;
    setBusy(true);
    setError(null);
    try {
      await addInvisibleTask(type, duration, note);
      onAdded();
    } catch {
      setError("L'ajout a échoué. Réessayez.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-ink-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto safe-bottom">
        <div className="sticky top-0 bg-white dark:bg-ink-800 px-5 pt-5 pb-3 flex items-center justify-between border-b border-ink-100 dark:border-ink-700">
          <h2 className="text-xl font-bold text-ink-900 dark:text-white">Ajouter une tâche invisible</h2>
          <button onClick={onClose} className="p-2 rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 tap" aria-label="Fermer">
            <X size={22} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-2">Type de tâche</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium tap ${
                    type === key
                      ? 'bg-brand-600 text-white'
                      : 'bg-ink-100 dark:bg-ink-900 text-ink-700 dark:text-ink-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-2">Durée approximative : {minutesToText(duration)}</label>
            <div className="flex gap-2">
              {DURATION_PRESETS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium tap ${
                    duration === d ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-900 text-ink-700 dark:text-ink-200'
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">Commentaire (facultatif)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Ex. Recherche de matériel dans le placard"
            />
          </div>

          {error && <p className="text-sm text-danger-600 dark:text-danger-100">{error}</p>}

          <button
            onClick={submit}
            disabled={!type || busy}
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center justify-center gap-2 tap disabled:opacity-60"
          >
            {busy && <Loader2 size={18} className="animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
