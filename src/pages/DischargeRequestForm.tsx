import { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronDown,
  ClipboardList,
  Loader2,
  Plus,
  User,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createCareRequest } from '@/lib/pathway';

interface Props {
  onBack: () => void;
  onCreated: (id: string) => void;
}

export default function DischargeRequestForm({ onBack, onCreated }: Props) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — Patient info
  const [patientFirstName, setPatientFirstName] = useState('');
  const [patientLastName, setPatientLastName] = useState('');
  const [patientBirthDate, setPatientBirthDate] = useState('');
  const [patientAddress, setPatientAddress] = useState('');

  // Step 2 — Hospital context
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalService, setHospitalService] = useState('');
  const [hospitalizationReason, setHospitalizationReason] = useState('');
  const [dischargeDate, setDischargeDate] = useState('');

  // Step 3 — Autonomy and needs
  const [autonomyLevel, setAutonomyLevel] = useState(3);
  const [situationSummary, setSituationSummary] = useState('');
  const [precautions, setPrecautions] = useState('');
  const [needsSummary, setNeedsSummary] = useState('');

  const totalSteps = 3;

  function canGoNext(): boolean {
    if (step === 1) return patientFirstName.trim().length >= 2 && patientLastName.trim().length >= 2;
    if (step === 2) return hospitalName.trim().length >= 2 && hospitalizationReason.trim().length >= 5;
    return true;
  }

  async function handleSubmit() {
    setError(null);
    setSaving(true);
    try {
      // Create patient first
      const { data: patient, error: pErr } = await supabase
        .from('patients')
        .insert({
          first_name: patientFirstName.trim(),
          last_name: patientLastName.trim(),
          birth_date: patientBirthDate || null,
          environment: 'domicile' as const,
          address: patientAddress.trim() || null,
          fragility_level: (6 - autonomyLevel) * 20,
          summary: situationSummary.trim(),
        })
        .select()
        .single();
      if (pErr) throw pErr;

      const req = await createCareRequest({
        patient_id: patient.id,
        hospital_name: hospitalName.trim(),
        hospital_service: hospitalService.trim(),
        hospitalization_reason: hospitalizationReason.trim(),
        discharge_date: dischargeDate || null,
        autonomy_level: autonomyLevel,
        situation_summary: situationSummary.trim(),
        precautions: precautions.trim(),
        needs_summary: needsSummary.trim(),
      });
      onCreated(req.id);
    } catch (e: any) {
      setError(e?.message || 'Erreur lors de la création de la demande');
    }
    setSaving(false);
  }

  const autonomyLabels = [
    '1 — Très dépendant',
    '2 — Dépendant',
    '3 — Partiellement autonome',
    '4 — Plutôt autonome',
    '5 — Autonome',
  ];

  return (
    <div className="px-4 pt-5 pb-6 max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-ink-500 dark:text-ink-300 tap mb-5">
        <ArrowLeft size={20} /> Retour
      </button>

      <div className="mb-6">
        <p className="text-brand-600 dark:text-brand-300 font-medium text-sm">Nouvelle demande</p>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white mt-1">Demande de sortie hôpital</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
              s < step ? 'bg-emerald-500 text-white'
              : s === step ? 'bg-brand-600 text-white'
              : 'bg-ink-200 dark:bg-ink-700 text-ink-500 dark:text-ink-400'
            }`}>
              {s < step ? <Check size={16} /> : s}
            </div>
            {s < 3 && <div className={`flex-1 h-1 rounded-full ${s < step ? 'bg-emerald-400' : 'bg-ink-200 dark:bg-ink-700'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 shadow-sm border border-ink-100 dark:border-ink-700">
        {/* Step 1 — Patient */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User size={20} className="text-brand-500" />
              <h2 className="font-semibold text-ink-900 dark:text-white">Informations patient</h2>
            </div>
            <Field label="Prénom *" value={patientFirstName} onChange={setPatientFirstName} placeholder="Marie" />
            <Field label="Nom *" value={patientLastName} onChange={setPatientLastName} placeholder="Dupont" />
            <Field label="Date de naissance" value={patientBirthDate} onChange={setPatientBirthDate} type="date" />
            <Field label="Adresse du domicile" value={patientAddress} onChange={setPatientAddress} placeholder="12 rue des Lilas, Lyon 6e" />
          </div>
        )}

        {/* Step 2 — Hospital */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={20} className="text-brand-500" />
              <h2 className="font-semibold text-ink-900 dark:text-white">Contexte hospitalier</h2>
            </div>
            <Field label="Nom de l'hôpital *" value={hospitalName} onChange={setHospitalName} placeholder="CHU de Lyon" />
            <Field label="Service" value={hospitalService} onChange={setHospitalService} placeholder="Chirurgie orthopédique" />
            <FieldArea label="Raison de l'hospitalisation *" value={hospitalizationReason} onChange={setHospitalizationReason} placeholder="Fracture du col du fémur suite à une chute à domicile" />
            <Field label="Date de sortie prévue" value={dischargeDate} onChange={setDischargeDate} type="date" />
          </div>
        )}

        {/* Step 3 — Autonomy & needs */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList size={20} className="text-brand-500" />
              <h2 className="font-semibold text-ink-900 dark:text-white">Autonomie et besoins</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-2">Niveau d'autonomie</label>
              <div className="space-y-1.5">
                {autonomyLabels.map((label, i) => (
                  <button
                    key={i}
                    onClick={() => setAutonomyLevel(i + 1)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm tap transition-colors ${
                      autonomyLevel === i + 1
                        ? 'bg-brand-50 dark:bg-brand-700/20 text-brand-700 dark:text-brand-200 border border-brand-300 dark:border-brand-600'
                        : 'bg-ink-50 dark:bg-ink-900 text-ink-700 dark:text-ink-300 border border-transparent'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <FieldArea label="Situation générale" value={situationSummary} onChange={setSituationSummary} placeholder="Décrivez la situation du patient, son contexte familial, son environnement..." rows={3} />
            <FieldArea label="Précautions" value={precautions} onChange={setPrecautions} placeholder="Risques identifiés, précautions particulières..." rows={2} />
            <FieldArea label="Besoins identifiés" value={needsSummary} onChange={setNeedsSummary} placeholder="Aide à la toilette, préparation des repas, soins infirmiers..." rows={3} />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 mt-4">
            {error}
          </p>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-ink-100 dark:border-ink-700">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="text-sm font-medium text-ink-600 dark:text-ink-300 tap">
              Précédent
            </button>
          ) : <div />}

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext()}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm tap disabled:opacity-50 flex items-center gap-2"
            >
              Suivant <ChevronDown size={16} className="rotate-[-90deg]" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm tap disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Créer la demande
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
      />
    </div>
  );
}

function FieldArea({ label, value, onChange, placeholder = '', rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
      />
    </div>
  );
}
