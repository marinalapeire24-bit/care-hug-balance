import { useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Heart,
  Home,
  MapPin,
  Users,
  X,
} from 'lucide-react';
import {
  hospitalDischarges,
  dischargeSteps,
  getDischargeScoreColor,
  getDischargeScoreBg,
} from '@/lib/hospital';
import type { HospitalDischarge } from '@/lib/types';

export default function HospitalDischargePage() {
  const [selected, setSelected] = useState<HospitalDischarge | null>(null);

  if (selected) {
    return <DischargeDetail discharge={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="px-4 pt-5 pb-6 space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
          <Home size={26} className="text-brand-500" /> Hôpital → Domicile
        </h1>
        <p className="text-ink-500 dark:text-ink-300 text-sm mt-0.5">
          Coordination des retours à domicile après hospitalisation
        </p>
      </div>

      <div className="rounded-2xl bg-info-50 dark:bg-info-600/15 p-4">
        <p className="text-xs text-info-700 dark:text-info-100">
          Module de démonstration utilisant des données fictives. Aucune connexion réelle aux systèmes hospitaliers. L'objectif est de montrer le fonctionnement futur de la coordination.
        </p>
      </div>

      {/* Discharge cases */}
      <div className="space-y-3">
        {hospitalDischarges.map((hd) => (
          <button
            key={hd.id}
            onClick={() => setSelected(hd)}
            className="w-full text-left rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 p-4 tap"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-ink-900 dark:text-white">{hd.patient_name}</span>
              {hd.rupture_risk ? (
                <span className="text-xs font-bold text-danger-600 dark:text-danger-300 bg-danger-50 dark:bg-danger-700/20 px-2 py-1 rounded-full">
                  Risque de rupture
                </span>
              ) : (
                <span className="text-xs font-medium text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-700/20 px-2 py-1 rounded-full">
                  Suivi normal
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-500 dark:text-ink-400">
              <Clock size={14} />
              {new Date(hd.discharge_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
              <MapPin size={14} className="ml-2" />
              {hd.return_location.split('(')[0].trim()}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1">
                <div className="text-xs text-ink-400 mb-1">Préparation</div>
                <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-700 overflow-hidden">
                  <div className={`h-full rounded-full ${getDischargeScoreBg(hd.preparation_score)}`} style={{ width: `${hd.preparation_score}%` }} />
                </div>
              </div>
              <span className={`text-lg font-bold ${getDischargeScoreColor(hd.preparation_score)}`}>{hd.preparation_score}%</span>
            </div>
            <div className="mt-2 text-xs text-ink-400 flex items-center gap-1">
              Étape : {dischargeSteps.find((s) => s.key === hd.current_step)?.label}
              <ChevronRight size={14} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function DischargeDetail({ discharge, onBack }: { discharge: HospitalDischarge; onBack: () => void }) {
  const currentStepIdx = dischargeSteps.findIndex((s) => s.key === discharge.current_step);

  return (
    <div className="px-4 pt-5 pb-6 space-y-5 max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-ink-500 dark:text-ink-300 tap">
        <ArrowLeft size={20} /> Retour
      </button>

      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">{discharge.patient_name}</h1>
        <p className="text-ink-500 dark:text-ink-300 text-sm mt-0.5">Parcours de retour à domicile</p>
      </div>

      {/* Frise parcours */}
      <div className="rounded-3xl bg-white dark:bg-ink-800 p-5 border border-ink-100 dark:border-ink-700">
        <h2 className="font-semibold text-ink-900 dark:text-white mb-4">Parcours</h2>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {dischargeSteps.map((step, idx) => {
            const done = idx < currentStepIdx;
            const current = idx === currentStepIdx;
            return (
              <div key={step.key} className="flex items-center shrink-0">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
                    done ? 'bg-brand-500 text-white' : current ? 'bg-info-500 text-white ring-4 ring-info-100 dark:ring-info-600/30' : 'bg-ink-100 dark:bg-ink-700 text-ink-400'
                  }`}>
                    {done ? <CheckCircle2 size={16} /> : <span>{step.icon}</span>}
                  </div>
                  <span className={`mt-1.5 text-[10px] whitespace-nowrap ${current ? 'text-info-600 dark:text-info-300 font-medium' : 'text-ink-400'}`}>
                    {step.label}
                  </span>
                </div>
                {idx < dischargeSteps.length - 1 && (
                  <div className={`h-0.5 w-4 ${done ? 'bg-brand-400' : 'bg-ink-200 dark:bg-ink-700'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Score de préparation */}
      <div className="rounded-3xl bg-white dark:bg-ink-800 p-5 border border-ink-100 dark:border-ink-700">
        <h2 className="font-semibold text-ink-900 dark:text-white mb-3">Préparation du retour à domicile</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-ink-100 dark:stroke-ink-700" />
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round" className={getDischargeScoreBg(discharge.preparation_score)} strokeDasharray={`${(discharge.preparation_score / 100) * 264} 264`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xl font-bold ${getDischargeScoreColor(discharge.preparation_score)}`}>{discharge.preparation_score}%</span>
            </div>
          </div>
          <div className="flex-1 text-sm text-ink-600 dark:text-ink-300">
            Ce score mesure l'avancement de la préparation organisationnelle. Il ne constitue pas une décision médicale.
          </div>
        </div>
      </div>

      {/* Alerte rupture */}
      {discharge.rupture_risk && (
        <div className="rounded-3xl bg-danger-50 dark:bg-danger-700/20 border border-danger-100 dark:border-danger-700/30 p-5">
          <h2 className="flex items-center gap-2 font-bold text-danger-700 dark:text-danger-100 mb-2">
            <AlertCircle size={20} /> Risque de rupture de parcours
          </h2>
          <div className="space-y-1.5 mb-3">
            {discharge.rupture_reasons.map((r, i) => (
              <div key={i} className="text-sm text-danger-700 dark:text-danger-100 flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" /> {r}
              </div>
            ))}
          </div>
          <div className="text-xs font-semibold text-danger-600 dark:text-danger-300 mb-1.5">Actions recommandées</div>
          <ul className="space-y-1">
            {discharge.checklist.filter((c) => c.status === 'non_confirme').map((c) => (
              <li key={c.id} className="text-sm text-danger-700 dark:text-danger-100 flex items-start gap-2">
                <X size={14} className="mt-0.5 shrink-0" /> Confirmer : {c.label}
              </li>
            ))}
            {discharge.checklist.filter((c) => c.status === 'en_attente').map((c) => (
              <li key={c.id} className="text-sm text-warn-700 dark:text-warn-100 flex items-start gap-2">
                <Clock size={14} className="mt-0.5 shrink-0" /> Finaliser : {c.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Checklist */}
      <div className="rounded-3xl bg-white dark:bg-ink-800 p-5 border border-ink-100 dark:border-ink-700">
        <h2 className="font-semibold text-ink-900 dark:text-white mb-3">Checklist de coordination</h2>
        <div className="space-y-2">
          {discharge.checklist.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl bg-ink-50 dark:bg-ink-900 px-3 py-2.5">
              {item.status === 'confirme' ? (
                <CheckCircle2 size={18} className="text-brand-500 shrink-0" />
              ) : item.status === 'en_attente' ? (
                <Clock size={18} className="text-warn-500 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-danger-500 shrink-0" />
              )}
              <span className={`text-sm flex-1 ${item.status === 'confirme' ? 'text-ink-600 dark:text-ink-300' : 'text-ink-900 dark:text-white'}`}>
                {item.label}
              </span>
              <span className="text-xs text-ink-400">{item.category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Besoins */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-ink-500 dark:text-ink-300 uppercase tracking-wide px-1">Besoins identifiés</h2>
        {discharge.needs.map((need, i) => (
          <div key={i} className="rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 px-4 py-3 text-sm text-ink-700 dark:text-ink-200 flex items-start gap-2">
            <Heart size={16} className="text-brand-500 mt-0.5 shrink-0" /> {need}
          </div>
        ))}
      </div>

      {/* Professionnels */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-ink-500 dark:text-ink-300 uppercase tracking-wide px-1 flex items-center gap-1">
          <Users size={16} /> Professionnels à mobiliser
        </h2>
        {discharge.professionals.map((prof, i) => (
          <div key={i} className="rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-ink-900 dark:text-white">{prof.role}</div>
              <div className="text-xs text-ink-500 dark:text-ink-400">{prof.name}</div>
            </div>
            {prof.confirmed ? (
              <span className="text-xs font-bold text-brand-600 dark:text-brand-300 flex items-center gap-1">
                <CheckCircle2 size={14} /> Confirmé
              </span>
            ) : (
              <span className="text-xs font-medium text-danger-600 dark:text-danger-300 flex items-center gap-1">
                <AlertCircle size={14} /> Non confirmé
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Suivi post-sortie */}
      {discharge.current_step === 'suivi' && (
        <div className="rounded-3xl bg-white dark:bg-ink-800 p-5 border border-ink-100 dark:border-ink-700">
          <h2 className="font-semibold text-ink-900 dark:text-white mb-3 flex items-center gap-2">
            <Activity size={18} className="text-info-500" /> Suivi post-sortie
          </h2>
          <div className="space-y-2">
            {discharge.post_discharge_followup.map((f, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-ink-50 dark:bg-ink-900 px-3 py-2.5">
                {f.done ? (
                  <CheckCircle2 size={18} className="text-brand-500 shrink-0" />
                ) : (
                  <Clock size={18} className="text-ink-300 shrink-0" />
                )}
                <span className="text-sm text-ink-700 dark:text-ink-200 flex-1">{f.label}</span>
                <span className="text-xs text-ink-400">J+{f.day}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
