import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock,
  FileText,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
  Plus,
  Stethoscope,
  User,
} from 'lucide-react';
import type { CareRequest, PathwayStep, PathwayHistoryEntry } from '@/lib/types';
import {
  fetchCareRequests,
  fetchPathwaySteps,
  fetchPathwayHistory,
  updatePathwayStep,
} from '@/lib/pathway';

interface Props {
  onOpenRequest?: (id: string) => void;
  onOpenEvaluation?: (careRequestId: string) => void;
  onOpenCarePlan?: (careRequestId: string) => void;
  onOpenTransmissions?: (patientId: string, patientName: string, careRequestId: string) => void;
  onOpenDischargeForm?: () => void;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; icon: typeof Check }> = {
  termine: { bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', label: 'Terminé', icon: Check },
  en_cours: { bg: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300', label: 'En cours', icon: Clock },
  a_venir: { bg: 'bg-ink-300 dark:bg-ink-600', text: 'text-ink-500 dark:text-ink-400', label: 'À venir', icon: Clock },
  en_attente: { bg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', label: 'En attente', icon: Clock },
  bloque: { bg: 'bg-red-500', text: 'text-red-700 dark:text-red-300', label: 'Bloqué', icon: Lock },
};

export default function CarePathway({ onOpenRequest, onOpenEvaluation, onOpenCarePlan, onOpenTransmissions, onOpenDischargeForm }: Props) {
  const [requests, setRequests] = useState<CareRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadRequests = () => {
    fetchCareRequests()
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRequests(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand-500" size={28} />
      </div>
    );
  }

  if (selectedId) {
    return (
      <PathwayDetail
        careRequestId={selectedId}
        requests={requests}
        onBack={() => { setSelectedId(null); loadRequests(); }}
        onOpenEvaluation={onOpenEvaluation}
        onOpenCarePlan={onOpenCarePlan}
        onOpenTransmissions={onOpenTransmissions}
      />
    );
  }

  return (
    <div className="px-4 pt-5 pb-6 space-y-5 max-w-2xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-brand-600 dark:text-brand-300 font-medium text-sm">Parcours CareBalance</p>
          <h1 className="text-2xl font-bold text-ink-900 dark:text-white mt-1">Suivi des parcours</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            Suivez chaque dossier depuis l'hôpital jusqu'à la mise en place complète à domicile.
          </p>
        </div>
        {onOpenDischargeForm && (
          <button
            onClick={onOpenDischargeForm}
            className="mt-1 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium tap shrink-0"
          >
            <Plus size={16} /> Nouvelle demande
          </button>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <MapPin size={40} className="mx-auto text-ink-300 dark:text-ink-600 mb-3" />
          <p className="text-ink-500 dark:text-ink-400">Aucun parcours en cours</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <RequestCard key={req.id} request={req} onClick={() => setSelectedId(req.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({ request, onClick }: { request: CareRequest; onClick: () => void }) {
  const patient = request.patient as any;
  const patientName = patient
    ? `${patient.first_name} ${patient.last_name}`
    : 'Patient';

  const statusColors: Record<string, string> = {
    a_traiter: 'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-200',
    en_cours: 'bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-200',
    acceptee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-200',
    refusee: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-200',
    terminee: 'bg-ink-100 text-ink-600 dark:bg-ink-700 dark:text-ink-300',
  };
  const statusLabels: Record<string, string> = {
    a_traiter: 'À traiter',
    en_cours: 'En cours',
    acceptee: 'Acceptée',
    refusee: 'Refusée',
    terminee: 'Terminée',
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-ink-800 rounded-2xl p-4 shadow-sm border border-ink-100 dark:border-ink-700 hover:shadow-md transition-shadow tap"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <User size={16} className="text-brand-500 shrink-0" />
            <span className="font-semibold text-ink-900 dark:text-white truncate">{patientName}</span>
          </div>
          <p className="text-sm text-ink-500 dark:text-ink-400 truncate">
            {request.hospital_name} — {request.hospital_service}
          </p>
          {request.discharge_date && (
            <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">
              Sortie prévue : {new Date(request.discharge_date).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[request.status] ?? ''}`}>
            {statusLabels[request.status] ?? request.status}
          </span>
          <ChevronRight size={18} className="text-ink-300" />
        </div>
      </div>
    </button>
  );
}

// ============================================================
// Detail view — the 15-step timeline
// ============================================================

function PathwayDetail({ careRequestId, requests, onBack, onOpenEvaluation, onOpenCarePlan, onOpenTransmissions }: {
  careRequestId: string;
  requests: CareRequest[];
  onBack: () => void;
  onOpenEvaluation?: (careRequestId: string) => void;
  onOpenCarePlan?: (careRequestId: string) => void;
  onOpenTransmissions?: (patientId: string, patientName: string, careRequestId: string) => void;
}) {
  const [steps, setSteps] = useState<PathwayStep[]>([]);
  const [history, setHistory] = useState<PathwayHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const request = requests.find((r) => r.id === careRequestId);

  useEffect(() => {
    Promise.all([
      fetchPathwaySteps(careRequestId),
      fetchPathwayHistory(careRequestId),
    ])
      .then(([s, h]) => { setSteps(s); setHistory(h); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [careRequestId]);

  const completedCount = steps.filter((s) => s.status === 'termine').length;
  const blockedCount = steps.filter((s) => s.status === 'bloque').length;
  const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  const patient = request?.patient as any;
  const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'Patient';

  async function handleStepAction(step: PathwayStep, newStatus: string) {
    setUpdating(step.id);
    try {
      const updates: any = {
        status: newStatus,
        step_number: step.step_number,
      };
      if (newStatus === 'en_cours') updates.started_at = new Date().toISOString();
      if (newStatus === 'termine') updates.completed_at = new Date().toISOString();
      await updatePathwayStep(step.id, careRequestId, updates, 'Coordinateur');
      const [s, h] = await Promise.all([
        fetchPathwaySteps(careRequestId),
        fetchPathwayHistory(careRequestId),
      ]);
      setSteps(s);
      setHistory(h);
    } catch {}
    setUpdating(null);
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
        <ArrowLeft size={20} /> Retour aux parcours
      </button>

      {/* Header */}
      <div>
        <p className="text-brand-600 dark:text-brand-300 font-medium text-sm">Parcours CareBalance</p>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white mt-1">{patientName}</h1>
        {request?.hospital_name && (
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">
            {request.hospital_name} — {request.hospital_service}
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-ink-800 rounded-2xl p-4 shadow-sm border border-ink-100 dark:border-ink-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Progression</span>
          <span className="text-sm font-bold text-brand-600 dark:text-brand-300">{progress}%</span>
        </div>
        <div className="h-3 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-ink-500 dark:text-ink-400">
          <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> {completedCount} terminées</span>
          <span>{steps.length - completedCount - blockedCount} à faire</span>
          {blockedCount > 0 && (
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <AlertTriangle size={12} /> {blockedCount} bloquées
            </span>
          )}
        </div>
      </div>

      {/* Blocked alerts */}
      {steps.filter((s) => s.status === 'bloque').map((step) => (
        <div key={step.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-300 text-sm">
                Étape {step.step_number} bloquée : {step.label}
              </p>
              {step.blocked_reason && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{step.blocked_reason}</p>
              )}
              <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                Responsable : {step.responsible_role || 'Non défini'}
                {step.blocked_since && ` — depuis ${new Date(step.blocked_since).toLocaleDateString('fr-FR')}`}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Timeline */}
      <div className="space-y-0">
        {steps.map((step, index) => {
          const config = STATUS_CONFIG[step.status] ?? STATUS_CONFIG.a_venir;
          const isLast = index === steps.length - 1;
          return (
            <div key={step.id} className="flex gap-3">
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center shrink-0 shadow-sm`}>
                  {step.status === 'termine' ? (
                    <Check size={16} className="text-white" />
                  ) : step.status === 'bloque' ? (
                    <Lock size={14} className="text-white" />
                  ) : step.status === 'en_cours' ? (
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  ) : (
                    <span className="text-xs font-bold text-white">{step.step_number}</span>
                  )}
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 min-h-[24px] ${
                    step.status === 'termine' ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-ink-200 dark:bg-ink-700'
                  }`} />
                )}
              </div>

              {/* Step content */}
              <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
                <div className="bg-white dark:bg-ink-800 rounded-xl p-3 border border-ink-100 dark:border-ink-700 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${
                        step.status === 'termine' ? 'text-ink-600 dark:text-ink-300' : 'text-ink-900 dark:text-white'
                      }`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">
                        {step.responsible_role}
                        {step.responsible_name ? ` — ${step.responsible_name}` : ''}
                      </p>
                      {step.completed_at && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                          {new Date(step.completed_at).toLocaleDateString('fr-FR')} à {new Date(step.completed_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                      {step.notes && (
                        <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">{step.notes}</p>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.text} bg-opacity-10 shrink-0`}>
                      {config.label}
                    </span>
                  </div>

                  {/* Quick actions */}
                  {step.status === 'a_venir' && (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleStepAction(step, 'en_cours')}
                        disabled={!!updating}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium tap hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50"
                      >
                        {updating === step.id ? <Loader2 size={12} className="animate-spin" /> : 'Démarrer'}
                      </button>
                    </div>
                  )}
                  {step.status === 'en_cours' && (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleStepAction(step, 'termine')}
                        disabled={!!updating}
                        className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium tap hover:bg-emerald-100 disabled:opacity-50"
                      >
                        Terminer
                      </button>
                      <button
                        onClick={() => handleStepAction(step, 'bloque')}
                        disabled={!!updating}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-medium tap hover:bg-red-100 disabled:opacity-50"
                      >
                        Signaler un blocage
                      </button>
                    </div>
                  )}
                  {step.status === 'bloque' && (
                    <div className="mt-2">
                      <button
                        onClick={() => handleStepAction(step, 'en_cours')}
                        disabled={!!updating}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium tap disabled:opacity-50"
                      >
                        Débloquer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick-access actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {onOpenEvaluation && (
          <button
            onClick={() => onOpenEvaluation(careRequestId)}
            className="flex items-center gap-3 p-4 bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 shadow-sm tap hover:shadow-md transition-shadow text-left"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
              <ClipboardCheck size={20} className="text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="font-medium text-sm text-ink-900 dark:text-white">Evaluation</p>
              <p className="text-xs text-ink-500 dark:text-ink-400">Besoins du patient</p>
            </div>
          </button>
        )}
        {onOpenCarePlan && (
          <button
            onClick={() => onOpenCarePlan(careRequestId)}
            className="flex items-center gap-3 p-4 bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 shadow-sm tap hover:shadow-md transition-shadow text-left"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
              <Stethoscope size={20} className="text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <p className="font-medium text-sm text-ink-900 dark:text-white">Plan d'aide</p>
              <p className="text-xs text-ink-500 dark:text-ink-400">Services et planning</p>
            </div>
          </button>
        )}
        {onOpenTransmissions && request?.patient_id && (
          <button
            onClick={() => onOpenTransmissions(request.patient_id, patientName, careRequestId)}
            className="flex items-center gap-3 p-4 bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 shadow-sm tap hover:shadow-md transition-shadow text-left"
          >
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
              <MessageSquare size={20} className="text-amber-600 dark:text-amber-300" />
            </div>
            <div>
              <p className="font-medium text-sm text-ink-900 dark:text-white">Transmissions</p>
              <p className="text-xs text-ink-500 dark:text-ink-400">Notes professionnelles</p>
            </div>
          </button>
        )}
      </div>

      {/* History toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 tap"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-200">
          <FileText size={16} /> Historique des actions ({history.length})
        </div>
        {showHistory ? <ChevronDown size={18} className="text-ink-400" /> : <ChevronRight size={18} className="text-ink-400" />}
      </button>

      {showHistory && (
        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-sm text-ink-500 dark:text-ink-400 text-center py-4">Aucun historique</p>
          ) : (
            history.map((entry) => (
              <div key={entry.id} className="bg-white dark:bg-ink-800 rounded-xl p-3 border border-ink-100 dark:border-ink-700 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink-900 dark:text-white">{entry.action}</p>
                    {entry.details && <p className="text-ink-500 dark:text-ink-400 mt-0.5">{entry.details}</p>}
                    <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">
                      {entry.performed_by_name} — {new Date(entry.created_at).toLocaleDateString('fr-FR')} à {new Date(entry.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {entry.step_number && (
                    <span className="text-xs bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-400 rounded-full px-2 py-0.5 shrink-0">
                      Étape {entry.step_number}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
