import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Filter,
  Loader2,
  MessageCircle,
  Plus,
  Send,
  X,
} from 'lucide-react';
import type { Transmission, TransmissionCategory, TransmissionPriority } from '@/lib/types';
import { fetchTransmissions, createTransmission } from '@/lib/pathway';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Props {
  patientId: string;
  patientName: string;
  careRequestId?: string | null;
  onBack: () => void;
}

const CATEGORY_LABELS: Record<TransmissionCategory, string> = {
  observation: 'Observation',
  alerte: 'Alerte',
  evolution: 'Évolution',
  consigne: 'Consigne',
  information: 'Information',
};

const CATEGORY_COLORS: Record<TransmissionCategory, string> = {
  observation: 'bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-200',
  alerte: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-200',
  evolution: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-200',
  consigne: 'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-200',
  information: 'bg-ink-100 text-ink-600 dark:bg-ink-700 dark:text-ink-300',
};

const PRIORITY_LABELS: Record<TransmissionPriority, string> = {
  normale: 'Normale',
  importante: 'Importante',
  urgente: 'Urgente',
};

export default function TransmissionsPage({ patientId, patientName, careRequestId, onBack }: Props) {
  const { profile } = useAuth();
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<TransmissionCategory | 'all'>('all');

  useEffect(() => {
    fetchTransmissions(patientId)
      .then(setTransmissions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [patientId]);

  const filtered = filter === 'all' ? transmissions : transmissions.filter((t) => t.category === filter);

  async function handleCreate(content: string, category: TransmissionCategory, priority: TransmissionPriority) {
    const t = await createTransmission({
      patient_id: patientId,
      care_request_id: careRequestId,
      author_name: profile?.full_name ?? 'Utilisateur',
      content,
      category,
      priority,
    });
    setTransmissions((prev) => [t, ...prev]);
    setShowForm(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand-500" size={28} />
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-6 space-y-5 max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-ink-500 dark:text-ink-300 tap">
        <ArrowLeft size={20} /> Retour
      </button>

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-brand-600 dark:text-brand-300 font-medium text-sm">Transmissions</p>
          <h1 className="text-2xl font-bold text-ink-900 dark:text-white mt-1">{patientName}</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm flex items-center gap-2 tap shrink-0"
        >
          <Plus size={16} /> Nouvelle
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip label="Toutes" active={filter === 'all'} onClick={() => setFilter('all')} />
        {(Object.keys(CATEGORY_LABELS) as TransmissionCategory[]).map((cat) => (
          <FilterChip key={cat} label={CATEGORY_LABELS[cat]} active={filter === cat} onClick={() => setFilter(cat)} />
        ))}
      </div>

      {/* Transmission list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle size={40} className="mx-auto text-ink-300 dark:text-ink-600 mb-3" />
          <p className="text-ink-500 dark:text-ink-400">Aucune transmission</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={t.id} className="bg-white dark:bg-ink-800 rounded-2xl p-4 shadow-sm border border-ink-100 dark:border-ink-700">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[t.category as TransmissionCategory] ?? ''}`}>
                    {CATEGORY_LABELS[t.category as TransmissionCategory] ?? t.category}
                  </span>
                  {t.priority !== 'normale' && (
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      t.priority === 'urgente' ? 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-200' : 'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-200'
                    }`}>
                      {PRIORITY_LABELS[t.priority as TransmissionPriority] ?? t.priority}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-ink-800 dark:text-ink-100 leading-relaxed">{t.content}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-ink-400 dark:text-ink-500">
                <span>{t.author_name}</span>
                <span>{new Date(t.created_at).toLocaleDateString('fr-FR')} à {new Date(t.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <TransmissionForm
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap tap transition-colors ${
        active
          ? 'bg-brand-600 text-white'
          : 'bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-600'
      }`}
    >
      {label}
    </button>
  );
}

function TransmissionForm({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (content: string, category: TransmissionCategory, priority: TransmissionPriority) => Promise<void>;
}) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<TransmissionCategory>('information');
  const [priority, setPriority] = useState<TransmissionPriority>('normale');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    try {
      await onSubmit(content.trim(), category, priority);
    } catch {}
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-ink-800 rounded-t-3xl sm:rounded-3xl safe-bottom overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-ink-100 dark:border-ink-700">
          <h2 className="text-lg font-bold text-ink-900 dark:text-white">Nouvelle transmission</h2>
          <button onClick={onClose} className="p-2 rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 tap">
            <X size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">Catégorie</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_LABELS) as TransmissionCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full tap transition-colors ${
                    category === cat ? CATEGORY_COLORS[cat] + ' ring-2 ring-offset-1 ring-brand-400' : 'bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">Priorité</label>
            <div className="flex gap-2">
              {(Object.keys(PRIORITY_LABELS) as TransmissionPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full tap transition-colors ${
                    priority === p ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300'
                  }`}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">Contenu</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Écrivez votre transmission..."
              className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !content.trim()}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center justify-center gap-2 tap disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Envoyer la transmission
          </button>
        </form>
      </div>
    </div>
  );
}
