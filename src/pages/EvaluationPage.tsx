import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Home,
  Loader2,
  ShieldAlert,
  Stethoscope,
  Users,
} from 'lucide-react';
import type { CareRequest, CareEvaluation, PathwayStep } from '@/lib/types';
import {
  fetchCareRequestWithDetails,
  fetchEvaluation,
  createEvaluation,
  updatePathwayStep,
  fetchPathwaySteps,
} from '@/lib/pathway';

interface Props {
  careRequestId: string;
  onBack: () => void;
  onComplete: () => void;
}

const AUTONOMY_LEVELS: { label: string; color: string; bg: string; ring: string }[] = [
  { label: 'Très dépendant', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-500', ring: 'ring-red-500' },
  { label: 'Dépendant', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-400', ring: 'ring-red-400' },
  { label: 'Aide partielle', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-500', ring: 'ring-amber-500' },
  { label: 'Aide ponctuelle', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-400', ring: 'ring-amber-400' },
  { label: 'Quasi-autonome', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-500', ring: 'ring-emerald-500' },
  { label: 'Autonome', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-400', ring: 'ring-emerald-400' },
];

export default function EvaluationPage({ careRequestId, onBack, onComplete }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [careRequest, setCareRequest] = useState<CareRequest | null>(null);
  const [existing, setExisting] = useState<CareEvaluation | null>(null);
  const [steps, setSteps] = useState<PathwayStep[]>([]);

  const [evaluationType, setEvaluationType] = useState<'domicile' | 'distance'>('domicile');
  const [autonomyScore, setAutonomyScore] = useState(3);
  const [homeEnvironment, setHomeEnvironment] = useState('');
  const [risks, setRisks] = useState('');
  const [materialNeeds, setMaterialNeeds] = useState('');
  const [humanNeeds, setHumanNeeds] = useState('');
  const [servicesNeeded, setServicesNeeded] = useState('');
  const [frequency, setFrequency] = useState('');
  const [durationPerVisit, setDurationPerVisit] = useState(30);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [cr, ev, st] = await Promise.all([
          fetchCareRequestWithDetails(careRequestId),
          fetchEvaluation(careRequestId),
          fetchPathwaySteps(careRequestId),
        ]);
        setCareRequest(cr);
        setSteps(st);
        if (ev) {
          setExisting(ev);
          setEvaluationType(ev.evaluation_type);
          setAutonomyScore(ev.autonomy_score);
          setHomeEnvironment(ev.home_environment);
          setRisks(ev.risks);
          setMaterialNeeds(ev.material_needs);
          setHumanNeeds(ev.human_needs);
          setServicesNeeded(ev.services_needed);
          setFrequency(ev.frequency);
          setDurationPerVisit(ev.duration_per_visit);
          setNotes(ev.notes);
        } else if (cr) {
          setAutonomyScore(cr.autonomy_level || 3);
          setRisks(cr.precautions || '');
          setServicesNeeded(cr.needs_summary || '');
        }
      } catch {
        setError('Impossible de charger les données');
      }
      setLoading(false);
    }
    load();
  }, [careRequestId]);

  const readOnly = !!existing?.validated;
  const patientName = careRequest?.patient
    ? `${careRequest.patient.first_name} ${careRequest.patient.last_name}`
    : '';

  async function handleValidate() {
    setError(null);
    setSaving(true);
    try {
      await createEvaluation({
        care_request_id: careRequestId,
        autonomy_score: autonomyScore,
        home_environment: homeEnvironment.trim(),
        risks: risks.trim(),
        material_needs: materialNeeds.trim(),
        human_needs: humanNeeds.trim(),
        services_needed: servicesNeeded.trim(),
        frequency: frequency.trim(),
        duration_per_visit: durationPerVisit,
        evaluation_type: evaluationType,
        notes: notes.trim(),
        validated: true,
      });

      const evalStep = steps.find((s) => s.step_key === 'evaluation_besoins');
      const planStep = steps.find((s) => s.step_key === 'plan_aide_defini');
      if (evalStep) {
        await updatePathwayStep(evalStep.id, careRequestId, {
          status: 'termine',
          step_number: evalStep.step_number,
          completed_at: new Date().toISOString(),
        }, 'Coordinateur');
      }
      if (planStep) {
        await updatePathwayStep(planStep.id, careRequestId, {
          status: 'en_cours',
          step_number: planStep.step_number,
          started_at: new Date().toISOString(),
        }, 'Coordinateur');
      }

      onComplete();
    } catch (e: any) {
      setError(e?.message || "Erreur lors de l'enregistrement de l'évaluation");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-6 space-y-4 max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-ink-500 dark:text-ink-300 tap">
        <ArrowLeft size={20} /> Retour
      </button>

      <div>
        <p className="text-brand-600 dark:text-brand-300 font-medium text-sm">
          {careRequest?.hospital_name}
          {careRequest?.hospital_service ? ` · ${careRequest.hospital_service}` : ''}
        </p>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white mt-1">
          Évaluation des besoins
        </h1>
        {patientName && (
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-0.5">{patientName}</p>
        )}
      </div>

      {readOnly && (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-2xl px-4 py-3 text-sm font-medium">
          <CheckCircle2 size={18} />
          Évaluation validée
        </div>
      )}

      <Card icon={<ClipboardCheck size={20} className="text-brand-500" />} title="Type d'évaluation">
        {readOnly ? (
          <ReadOnlyValue value={evaluationType === 'domicile' ? 'À domicile' : 'À distance'} />
        ) : (
          <div className="flex gap-3">
            {(['domicile', 'distance'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setEvaluationType(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium tap transition-colors ${
                  evaluationType === t
                    ? 'bg-brand-50 dark:bg-brand-700/20 text-brand-700 dark:text-brand-200 border border-brand-300 dark:border-brand-600'
                    : 'bg-ink-50 dark:bg-ink-900 text-ink-600 dark:text-ink-300 border border-ink-200 dark:border-ink-600'
                }`}
              >
                {t === 'domicile' ? 'À domicile' : 'À distance'}
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card icon={<Stethoscope size={20} className="text-brand-500" />} title="Score d'autonomie">
        {readOnly ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              {AUTONOMY_LEVELS.map((lvl, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                    autonomyScore === i + 1
                      ? `${lvl.bg} text-white`
                      : 'bg-ink-100 dark:bg-ink-700 text-ink-400 dark:text-ink-500'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <p className={`text-sm font-medium ${AUTONOMY_LEVELS[autonomyScore - 1].color}`}>
              {AUTONOMY_LEVELS[autonomyScore - 1].label}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              {AUTONOMY_LEVELS.map((lvl, i) => (
                <button
                  key={i}
                  onClick={() => setAutonomyScore(i + 1)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold tap transition-all ${
                    autonomyScore === i + 1
                      ? `${lvl.bg} text-white ring-2 ${lvl.ring} ring-offset-2 ring-offset-white dark:ring-offset-ink-800`
                      : 'bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-400 hover:bg-ink-200 dark:hover:bg-ink-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p className={`text-sm font-medium ${AUTONOMY_LEVELS[autonomyScore - 1].color}`}>
              {autonomyScore} — {AUTONOMY_LEVELS[autonomyScore - 1].label}
            </p>
          </div>
        )}
      </Card>

      <Card icon={<Home size={20} className="text-brand-500" />} title="Environnement du domicile">
        {readOnly ? (
          <ReadOnlyValue value={homeEnvironment} />
        ) : (
          <TextArea
            value={homeEnvironment}
            onChange={setHomeEnvironment}
            placeholder="Accessibilité, aménagement, escaliers, risques identifiés..."
          />
        )}
      </Card>

      <Card icon={<ShieldAlert size={20} className="text-brand-500" />} title="Risques identifiés">
        {readOnly ? (
          <ReadOnlyValue value={risks} />
        ) : (
          <TextArea
            value={risks}
            onChange={setRisks}
            placeholder="Risque de chute, gestion des médicaments, isolement social..."
          />
        )}
      </Card>

      <Card icon={<Building2 size={20} className="text-brand-500" />} title="Besoins matériels">
        {readOnly ? (
          <ReadOnlyValue value={materialNeeds} />
        ) : (
          <TextArea
            value={materialNeeds}
            onChange={setMaterialNeeds}
            placeholder="Lit médicalisé, déambulateur, barres d'appui, fauteuil roulant..."
          />
        )}
      </Card>

      <Card icon={<Users size={20} className="text-brand-500" />} title="Besoins humains">
        {readOnly ? (
          <ReadOnlyValue value={humanNeeds} />
        ) : (
          <TextArea
            value={humanNeeds}
            onChange={setHumanNeeds}
            placeholder="Aide-soignante, infirmière, kinésithérapeute, auxiliaire de vie..."
          />
        )}
      </Card>

      <Card icon={<ClipboardCheck size={20} className="text-brand-500" />} title="Services nécessaires">
        {readOnly ? (
          <ReadOnlyValue value={servicesNeeded} />
        ) : (
          <TextArea
            value={servicesNeeded}
            onChange={setServicesNeeded}
            placeholder="Aide à la toilette, préparation des repas, soins infirmiers, accompagnement..."
          />
        )}
      </Card>

      <Card icon={<Stethoscope size={20} className="text-brand-500" />} title="Fréquence">
        {readOnly ? (
          <ReadOnlyValue value={frequency} />
        ) : (
          <input
            type="text"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            placeholder="5j/7 matin + 3j/7 après-midi"
            className="w-full rounded-xl border border-ink-200 dark:border-ink-600 bg-ink-50 dark:bg-ink-900 px-3 py-2.5 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
          />
        )}
      </Card>

      <Card icon={<Stethoscope size={20} className="text-brand-500" />} title="Durée par visite (minutes)">
        {readOnly ? (
          <ReadOnlyValue value={`${durationPerVisit} min`} />
        ) : (
          <input
            type="number"
            min={5}
            max={480}
            value={durationPerVisit}
            onChange={(e) => setDurationPerVisit(Number(e.target.value) || 0)}
            className="w-full rounded-xl border border-ink-200 dark:border-ink-600 bg-ink-50 dark:bg-ink-900 px-3 py-2.5 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
          />
        )}
      </Card>

      <Card icon={<ClipboardCheck size={20} className="text-brand-500" />} title="Notes">
        {readOnly ? (
          <ReadOnlyValue value={notes} empty="Aucune note" />
        ) : (
          <TextArea
            value={notes}
            onChange={setNotes}
            placeholder="Observations complémentaires..."
          />
        )}
      </Card>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {!readOnly && (
        <button
          onClick={handleValidate}
          disabled={saving}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-xl tap disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              Valider l'évaluation
            </>
          )}
        </button>
      )}
    </div>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-ink-800 rounded-2xl p-4 shadow-sm border border-ink-100 dark:border-ink-700">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-sm font-medium text-ink-700 dark:text-ink-200">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function TextArea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full min-h-[80px] resize-none rounded-xl border border-ink-200 dark:border-ink-600 bg-ink-50 dark:bg-ink-900 px-3 py-2.5 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
    />
  );
}

function ReadOnlyValue({ value, empty = 'Non renseigné' }: { value: string; empty?: string }) {
  return (
    <p className={`text-sm ${value ? 'text-ink-900 dark:text-white' : 'text-ink-400 dark:text-ink-500 italic'}`}>
      {value || empty}
    </p>
  );
}
