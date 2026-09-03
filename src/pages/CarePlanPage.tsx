import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  Plus,
  Stethoscope,
  Users,
  X,
} from 'lucide-react';
import type {
  CarePlan,
  CarePlanService,
  CareEvaluation,
  CareRequest,
  PathwayStep,
} from '@/lib/types';
import {
  fetchCareRequestWithDetails,
  fetchEvaluation,
  fetchCarePlan,
  createCarePlan,
  updatePathwayStep,
  fetchPathwaySteps,
} from '@/lib/pathway';

interface Props {
  careRequestId: string;
  onBack: () => void;
  onComplete: () => void;
}

const MATERIAL_STATUS_OPTIONS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'en_commande', label: 'En commande' },
  { value: 'a_installer', label: 'À installer' },
  { value: 'non_disponible', label: 'Non disponible' },
];

const MATERIAL_STATUS_COLORS: Record<string, string> = {
  disponible: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  en_commande: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  a_installer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  non_disponible: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

function emptyService(): CarePlanService {
  return { name: '', frequency: '', duration_minutes: 30, description: '' };
}

export default function CarePlanPage({ careRequestId, onBack, onComplete }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [careRequest, setCareRequest] = useState<CareRequest | null>(null);
  const [evaluation, setEvaluation] = useState<CareEvaluation | null>(null);
  const [existingPlan, setExistingPlan] = useState<CarePlan | null>(null);
  const [steps, setSteps] = useState<PathwayStep[]>([]);

  const [title, setTitle] = useState('');
  const [services, setServices] = useState<CarePlanService[]>([emptyService()]);
  const [professionals, setProfessionals] = useState<{ role: string; count: number }[]>([
    { role: '', count: 1 },
  ]);
  const [materials, setMaterials] = useState<{ item: string; status: string }[]>([
    { item: '', status: 'disponible' },
  ]);
  const [scheduleSummary, setScheduleSummary] = useState('');

  useEffect(() => {
    Promise.all([
      fetchCareRequestWithDetails(careRequestId),
      fetchEvaluation(careRequestId),
      fetchCarePlan(careRequestId),
      fetchPathwaySteps(careRequestId),
    ])
      .then(([cr, ev, plan, st]) => {
        setCareRequest(cr);
        setEvaluation(ev);
        setSteps(st);

        if (plan && plan.status === 'valide') {
          setExistingPlan(plan);
          return;
        }

        const patientName = cr?.patient
          ? `${cr.patient.first_name} ${cr.patient.last_name}`
          : '';
        const reason = cr?.hospitalization_reason ?? '';
        setTitle(`Plan d'aide ${patientName}${reason ? ` — ${reason}` : ''}`);

        if (ev?.services_needed) {
          const parsed = ev.services_needed
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          if (parsed.length > 0) {
            setServices(
              parsed.map((name) => ({
                name,
                frequency: '',
                duration_minutes: 30,
                description: '',
              }))
            );
          }
        }
      })
      .catch(() => setError('Impossible de charger les données.'))
      .finally(() => setLoading(false));
  }, [careRequestId]);

  const patientName = careRequest?.patient
    ? `${careRequest.patient.first_name} ${careRequest.patient.last_name}`
    : '';

  async function handleValidate() {
    setError('');
    const cleanServices = services.filter((s) => s.name.trim());
    if (cleanServices.length === 0) {
      setError('Ajoutez au moins un service.');
      return;
    }

    setSaving(true);
    try {
      await createCarePlan({
        care_request_id: careRequestId,
        evaluation_id: evaluation?.id ?? null,
        title: title.trim(),
        services: cleanServices,
        professionals_needed: professionals.filter((p) => p.role.trim()),
        material_needed: materials.filter((m) => m.item.trim()),
        schedule_summary: scheduleSummary.trim(),
      });

      const step5 = steps.find((s) => s.step_key === 'plan_aide_defini');
      const step6 = steps.find((s) => s.step_key === 'professionnels_recherches');

      if (step5) {
        await updatePathwayStep(step5.id, careRequestId, {
          status: 'termine',
          step_number: step5.step_number,
          completed_at: new Date().toISOString(),
        }, 'Coordinateur');
      }
      if (step6) {
        await updatePathwayStep(step6.id, careRequestId, {
          status: 'en_cours',
          step_number: step6.step_number,
          started_at: new Date().toISOString(),
        }, 'Coordinateur');
      }

      onComplete();
    } catch {
      setError('Erreur lors de la validation du plan. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  }

  function updateService(index: number, field: keyof CarePlanService, value: string | number) {
    setServices((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  function removeService(index: number) {
    setServices((prev) => prev.filter((_, i) => i !== index));
  }

  function updateProfessional(index: number, field: 'role' | 'count', value: string | number) {
    setProfessionals((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  }

  function removeProfessional(index: number) {
    setProfessionals((prev) => prev.filter((_, i) => i !== index));
  }

  function updateMaterial(index: number, field: 'item' | 'status', value: string) {
    setMaterials((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  }

  function removeMaterial(index: number) {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand-500" size={28} />
      </div>
    );
  }

  if (existingPlan) {
    return (
      <div className="px-4 pt-5 pb-6 space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="tap p-2 -ml-2 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-700">
            <ArrowLeft size={20} className="text-ink-600 dark:text-ink-300" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-ink-900 dark:text-white truncate">
              {existingPlan.title}
            </h1>
            {patientName && (
              <p className="text-sm text-ink-500 dark:text-ink-400">{patientName}</p>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle2 size={14} />
            Plan validé
          </span>
        </div>

        <div className="bg-white dark:bg-ink-800 rounded-2xl p-4 shadow-sm border border-ink-100 dark:border-ink-700 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-ink-900 dark:text-white flex items-center gap-2 mb-3">
              <Stethoscope size={16} className="text-brand-500" />
              Services
            </h2>
            <div className="space-y-2">
              {existingPlan.services.map((s, i) => (
                <div
                  key={i}
                  className="bg-ink-50 dark:bg-ink-900 rounded-xl p-3 space-y-1"
                >
                  <p className="text-sm font-medium text-ink-900 dark:text-white">{s.name}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-ink-500 dark:text-ink-400">
                    {s.frequency && (
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} /> {s.frequency}
                      </span>
                    )}
                    {s.duration_minutes > 0 && <span>{s.duration_minutes} min</span>}
                  </div>
                  {s.description && (
                    <p className="text-xs text-ink-600 dark:text-ink-300">{s.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {existingPlan.professionals_needed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-ink-900 dark:text-white flex items-center gap-2 mb-2">
                <Users size={16} className="text-brand-500" />
                Professionnels nécessaires
              </h2>
              <div className="flex flex-wrap gap-2">
                {existingPlan.professionals_needed.map((p, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium"
                  >
                    {p.role} ×{p.count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {existingPlan.material_needed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-ink-900 dark:text-white flex items-center gap-2 mb-2">
                <Package size={16} className="text-brand-500" />
                Matériel nécessaire
              </h2>
              <div className="flex flex-wrap gap-2">
                {existingPlan.material_needed.map((m, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${MATERIAL_STATUS_COLORS[m.status] ?? 'bg-ink-100 text-ink-600 dark:bg-ink-700 dark:text-ink-300'}`}
                  >
                    {m.item}
                    <span className="opacity-70">
                      ({MATERIAL_STATUS_OPTIONS.find((o) => o.value === m.status)?.label ?? m.status})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {existingPlan.schedule_summary && (
            <div>
              <h2 className="text-sm font-semibold text-ink-900 dark:text-white mb-1.5">
                Résumé du planning
              </h2>
              <p className="text-sm text-ink-700 dark:text-ink-300 whitespace-pre-line">
                {existingPlan.schedule_summary}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-6 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="tap p-2 -ml-2 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-700">
          <ArrowLeft size={20} className="text-ink-600 dark:text-ink-300" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-ink-900 dark:text-white truncate">
            Plan d'aide personnalisé
          </h1>
          {patientName && (
            <p className="text-sm text-ink-500 dark:text-ink-400">{patientName}</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-ink-800 rounded-2xl p-4 shadow-sm border border-ink-100 dark:border-ink-700">
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
          Titre du plan
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-ink-200 dark:border-ink-600 bg-ink-50 dark:bg-ink-900 px-3 py-2.5 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
          placeholder="Plan d'aide..."
        />
      </div>

      <div className="bg-white dark:bg-ink-800 rounded-2xl p-4 shadow-sm border border-ink-100 dark:border-ink-700 space-y-3">
        <h2 className="text-sm font-semibold text-ink-900 dark:text-white flex items-center gap-2">
          <Stethoscope size={16} className="text-brand-500" />
          Services
        </h2>
        {services.map((service, index) => (
          <div key={index} className="bg-ink-50 dark:bg-ink-900 rounded-xl p-3 space-y-2.5 relative">
            {services.length > 1 && (
              <button
                type="button"
                onClick={() => removeService(index)}
                className="absolute top-2 right-2 p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <X size={14} />
              </button>
            )}
            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
                Nom du service
              </label>
              <input
                type="text"
                value={service.name}
                onChange={(e) => updateService(index, 'name', e.target.value)}
                className="w-full rounded-xl border border-ink-200 dark:border-ink-600 bg-ink-50 dark:bg-ink-900 px-3 py-2.5 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                placeholder="Aide à la toilette"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
                  Fréquence
                </label>
                <input
                  type="text"
                  value={service.frequency}
                  onChange={(e) => updateService(index, 'frequency', e.target.value)}
                  className="w-full rounded-xl border border-ink-200 dark:border-ink-600 bg-ink-50 dark:bg-ink-900 px-3 py-2.5 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  placeholder="5j/7 matin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
                  Durée (min)
                </label>
                <input
                  type="number"
                  min={0}
                  value={service.duration_minutes}
                  onChange={(e) => updateService(index, 'duration_minutes', Number(e.target.value))}
                  className="w-full rounded-xl border border-ink-200 dark:border-ink-600 bg-ink-50 dark:bg-ink-900 px-3 py-2.5 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={service.description}
                onChange={(e) => updateService(index, 'description', e.target.value)}
                className="w-full rounded-xl border border-ink-200 dark:border-ink-600 bg-ink-50 dark:bg-ink-900 px-3 py-2.5 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                placeholder="Détails du service..."
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setServices((prev) => [...prev, emptyService()])}
          className="text-sm text-brand-600 dark:text-brand-300 font-medium flex items-center gap-1.5"
        >
          <Plus size={16} />
          Ajouter un service
        </button>
      </div>

      <div className="bg-white dark:bg-ink-800 rounded-2xl p-4 shadow-sm border border-ink-100 dark:border-ink-700 space-y-3">
        <h2 className="text-sm font-semibold text-ink-900 dark:text-white flex items-center gap-2">
          <Users size={16} className="text-brand-500" />
          Professionnels nécessaires
        </h2>
        {professionals.map((prof, index) => (
          <div key={index} className="bg-ink-50 dark:bg-ink-900 rounded-xl p-3 flex items-end gap-2.5">
            <div className="flex-1">
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
                Rôle
              </label>
              <input
                type="text"
                value={prof.role}
                onChange={(e) => updateProfessional(index, 'role', e.target.value)}
                className="w-full rounded-xl border border-ink-200 dark:border-ink-600 bg-ink-50 dark:bg-ink-900 px-3 py-2.5 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                placeholder="Aide-soignante"
              />
            </div>
            <div className="w-20">
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
                Nombre
              </label>
              <input
                type="number"
                min={1}
                value={prof.count}
                onChange={(e) => updateProfessional(index, 'count', Number(e.target.value))}
                className="w-full rounded-xl border border-ink-200 dark:border-ink-600 bg-ink-50 dark:bg-ink-900 px-3 py-2.5 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              />
            </div>
            {professionals.length > 1 && (
              <button
                type="button"
                onClick={() => removeProfessional(index)}
                className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 mb-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setProfessionals((prev) => [...prev, { role: '', count: 1 }])}
          className="text-sm text-brand-600 dark:text-brand-300 font-medium flex items-center gap-1.5"
        >
          <Plus size={16} />
          Ajouter un professionnel
        </button>
      </div>

      <div className="bg-white dark:bg-ink-800 rounded-2xl p-4 shadow-sm border border-ink-100 dark:border-ink-700 space-y-3">
        <h2 className="text-sm font-semibold text-ink-900 dark:text-white flex items-center gap-2">
          <Package size={16} className="text-brand-500" />
          Matériel nécessaire
        </h2>
        {materials.map((mat, index) => (
          <div key={index} className="bg-ink-50 dark:bg-ink-900 rounded-xl p-3 flex items-end gap-2.5">
            <div className="flex-1">
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
                Matériel
              </label>
              <input
                type="text"
                value={mat.item}
                onChange={(e) => updateMaterial(index, 'item', e.target.value)}
                className="w-full rounded-xl border border-ink-200 dark:border-ink-600 bg-ink-50 dark:bg-ink-900 px-3 py-2.5 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                placeholder="Lit médicalisé"
              />
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
                Statut
              </label>
              <select
                value={mat.status}
                onChange={(e) => updateMaterial(index, 'status', e.target.value)}
                className="w-full rounded-xl border border-ink-200 dark:border-ink-600 bg-ink-50 dark:bg-ink-900 px-3 py-2.5 text-sm text-ink-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              >
                {MATERIAL_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {materials.length > 1 && (
              <button
                type="button"
                onClick={() => removeMaterial(index)}
                className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 mb-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setMaterials((prev) => [...prev, { item: '', status: 'disponible' }])}
          className="text-sm text-brand-600 dark:text-brand-300 font-medium flex items-center gap-1.5"
        >
          <Plus size={16} />
          Ajouter du matériel
        </button>
      </div>

      <div className="bg-white dark:bg-ink-800 rounded-2xl p-4 shadow-sm border border-ink-100 dark:border-ink-700">
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
          Résumé du planning
        </label>
        <textarea
          rows={4}
          value={scheduleSummary}
          onChange={(e) => setScheduleSummary(e.target.value)}
          className="w-full rounded-xl border border-ink-200 dark:border-ink-600 bg-ink-50 dark:bg-ink-900 px-3 py-2.5 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none"
          placeholder="Lundi-vendredi : toilette 8h + repas 12h. IDE 3x/sem. Kiné 3x/sem."
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleValidate}
        disabled={saving}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        {saving ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Validation en cours...
          </>
        ) : (
          <>
            <CheckCircle2 size={18} />
            Valider le plan d'aide
          </>
        )}
      </button>
    </div>
  );
}
