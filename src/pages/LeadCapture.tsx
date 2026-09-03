import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  HeartPulse,
  Loader2,
  MapPin,
  Phone,
  User,
  X,
} from 'lucide-react';
import {
  createLead,
  qualifyLead,
  relationshipLabels,
  serviceTypeLabels,
  urgencyLabels,
  urgencyColors,
  type NewLeadInput,
} from '@/lib/leads';
import type { LeadRelationship, LeadServiceType, LeadUrgency } from '@/lib/types';

const RELATIONSHIPS = Object.entries(relationshipLabels) as [LeadRelationship, string][];
const SERVICES = Object.entries(serviceTypeLabels) as [LeadServiceType, string][];
const URGENCIES = Object.entries(urgencyLabels) as [LeadUrgency, string][];

export default function LeadCapture() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [busy, setBusy] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState<LeadRelationship | null>(null);
  const [serviceType, setServiceType] = useState<LeadServiceType | null>(null);
  const [urgency, setUrgency] = useState<LeadUrgency | null>(null);
  const [situation, setSituation] = useState('');
  const [preferredContactTime, setPreferredContactTime] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState<string | null>(null);

  function canAdvance(s: number): boolean {
    if (s === 1) return fullName.trim().length >= 2 && phone.trim().length >= 6;
    if (s === 2) return relationship !== null && serviceType !== null;
    if (s === 3) return urgency !== null;
    return false;
  }

  async function handleSubmit() {
    if (!relationship || !serviceType || !urgency) return;
    setBusy(true);
    setError(null);
    try {
      const input: NewLeadInput = {
        full_name: fullName,
        phone,
        email: email || null,
        relationship,
        service_type: serviceType,
        urgency,
        situation,
        preferred_contact_time: preferredContactTime || null,
        city: city || null,
      };
      const q = qualifyLead(urgency, serviceType, situation);
      const lead = await createLead(input);
      setFinalScore(lead.priority_score);
      setSubmitted(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer ou nous appeler directement.");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white dark:from-ink-900 dark:to-ink-800 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-700/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-brand-600 dark:text-brand-300" />
            </div>
            <h1 className="text-2xl font-bold text-ink-900 dark:text-white mb-3">
              Merci {fullName.split(' ')[0]}, votre demande a bien été reçue
            </h1>
            <p className="text-ink-600 dark:text-ink-300 mb-6">
              Notre équipe vous rappelle très bientôt au <strong>{phone}</strong>.
              {urgency === 'urgent' && (
                <span className="block mt-2 text-danger-600 dark:text-danger-100 font-medium">
                  Votre demande est prioritaire — nous vous rappelons sous 2 h.
                </span>
              )}
            </p>

            <div className="rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 p-5 text-left mb-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-3">
                Ce que nous avons retenu
              </p>
              <div className="space-y-2.5 text-sm">
                <InfoRow icon={<User size={16} />} label="Demandeur" value={fullName} />
                <InfoRow icon={<HeartPulse size={16} />} label="Service" value={serviceType ? serviceTypeLabels[serviceType] : ''} />
                <InfoRow icon={<Clock size={16} />} label="Délai souhaité" value={urgency ? urgencyLabels[urgency] : ''} />
                {city && <InfoRow icon={<MapPin size={16} />} label="Commune" value={city} />}
                {preferredContactTime && (
                  <InfoRow icon={<Phone size={16} />} label="Créneau de rappel" value={preferredContactTime} />
                )}
              </div>
            </div>

            <p className="text-xs text-ink-400">
              Référence : {finalScore >= 70 ? 'Priorité élevée' : 'Priorité standard'} — CareBalance
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white dark:from-ink-900 dark:to-ink-800">
      {/* Header */}
      <header className="px-5 pt-8 pb-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">CB</span>
          </div>
          <span className="font-semibold text-ink-900 dark:text-white">CareBalance</span>
        </div>
        <h1 className="text-3xl font-bold text-ink-900 dark:text-white leading-tight">
          Je souhaite être accompagné
        </h1>
        <p className="mt-2 text-ink-600 dark:text-ink-300">
          Décrivez votre situation en quelques clics. Notre équipe vous rappelle rapidement.
        </p>
      </header>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              s === step ? 'w-8 bg-brand-500' : s < step ? 'w-2 bg-brand-400' : 'w-2 bg-ink-200 dark:bg-ink-700'
            }`}
          />
        ))}
      </div>

      {/* Form card */}
      <div className="px-5 pb-10 max-w-lg mx-auto">
        <div className="bg-white dark:bg-ink-800 rounded-3xl shadow-xl p-6 border border-ink-100 dark:border-ink-700">
          {step === 1 && (
            <div className="space-y-5">
              <StepTitle num="1" title="Vos coordonnées" subtitle="Pour que nous puissions vous rappeler" />
              <div>
                <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
                  Nom complet <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Camille Martin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
                  Téléphone <span className="text-danger-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
                  Email <span className="text-ink-400 text-xs">(facultatif)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="vous@exemple.fr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
                  Commune <span className="text-ink-400 text-xs">(facultatif)</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Lyon, Villeurbanne…"
                />
              </div>
              <NextButton enabled={canAdvance(1)} onClick={() => setStep(2)} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <StepTitle num="2" title="Votre besoin" subtitle="Pour orienter au mieux votre demande" />

              <div>
                <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-2">
                  Pour qui est l'accompagnement ? <span className="text-danger-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {RELATIONSHIPS.map(([key, label]) => (
                    <SelectCard
                      key={key}
                      selected={relationship === key}
                      onClick={() => setRelationship(key)}
                      label={label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-2">
                  Type d'aide recherchée <span className="text-danger-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {SERVICES.map(([key, label]) => (
                    <SelectCard
                      key={key}
                      selected={serviceType === key}
                      onClick={() => setServiceType(key)}
                      label={label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <BackButton onClick={() => setStep(1)} />
                <NextButton enabled={canAdvance(2)} onClick={() => setStep(3)} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <StepTitle num="3" title="Délai et situation" subtitle="Les derniers détails pour bien vous aider" />

              <div>
                <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-2">
                  Dans quel délai souhaitez-vous être aidé ? <span className="text-danger-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {URGENCIES.map(([key, label]) => (
                    <SelectCard
                      key={key}
                      selected={urgency === key}
                      onClick={() => setUrgency(key)}
                      label={label}
                      badge={urgencyColors[key]}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
                  Décrivez votre situation <span className="text-ink-400 text-xs">(facultatif mais utile)</span>
                </label>
                <textarea
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  placeholder="Ex. Ma mère de 84 ans sort de l'hôpital et a besoin d'aide pour la toilette et les repas…"
                />
                <p className="mt-1 text-xs text-ink-400">
                  {situation.trim().length >= 20
                    ? "Merci — une description aide notre équipe à mieux préparer le rappel."
                    : "20 caractères minimum pour aider la qualification."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
                  Créneau de rappel préféré <span className="text-ink-400 text-xs">(facultatif)</span>
                </label>
                <input
                  type="text"
                  value={preferredContactTime}
                  onChange={(e) => setPreferredContactTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Ex. Matin avant 10 h, ou soir après 19 h"
                />
              </div>

              {error && (
                <p className="text-sm text-danger-600 dark:text-danger-100 bg-danger-50 dark:bg-danger-700/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <BackButton onClick={() => setStep(2)} />
                <button
                  onClick={handleSubmit}
                  disabled={!canAdvance(3) || busy}
                  className="flex-1 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center justify-center gap-2 tap disabled:opacity-60"
                >
                  {busy ? <Loader2 size={18} className="animate-spin" /> : <HeartPulse size={18} />}
                  Envoyer ma demande
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-ink-400 px-4">
          Vos informations restent confidentielles et servent uniquement à préparer votre rappel.
        </p>
      </div>
    </div>
  );
}

function StepTitle({ num, title, subtitle }: { num: string; title: string; subtitle: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-700/30 text-brand-600 dark:text-brand-300 text-xs font-bold flex items-center justify-center">
          {num}
        </span>
        <h2 className="text-lg font-bold text-ink-900 dark:text-white">{title}</h2>
      </div>
      <p className="text-sm text-ink-500 dark:text-ink-400 ml-8">{subtitle}</p>
    </div>
  );
}

function SelectCard({
  selected,
  onClick,
  label,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left tap transition-colors ${
        selected
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-700/20'
          : 'border-ink-100 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 hover:border-brand-300'
      }`}
    >
      <span className={`text-sm font-medium ${selected ? 'text-brand-700 dark:text-brand-200' : 'text-ink-700 dark:text-ink-200'}`}>
        {label}
      </span>
      {badge && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge}`}>•</span>}
      {selected && <CheckCircle2 size={18} className="text-brand-600 dark:text-brand-300 shrink-0" />}
    </button>
  );
}

function NextButton({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center justify-center gap-2 tap disabled:opacity-40"
    >
      Continuer <ArrowRight size={18} />
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-3.5 rounded-xl bg-ink-100 dark:bg-ink-900 text-ink-600 dark:text-ink-300 font-medium tap"
    >
      Retour
    </button>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-ink-100 dark:bg-ink-900 flex items-center justify-center text-ink-400 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-ink-400">{label}</div>
        <div className="text-sm font-medium text-ink-900 dark:text-white truncate">{value}</div>
      </div>
    </div>
  );
}
