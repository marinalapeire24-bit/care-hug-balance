import { useState } from 'react';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronRight,
  
  Package,
  ShieldAlert,
  TriangleAlert,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import {
  helpRequests,
  helpRequestTypeLabels,
  incidents,
  incidentLevelLabels,
  incidentLevelColors,
  problemReports,
  problemCategoryLabels,
  problemUrgencyLabels,
  materialItems,
  materialStatusLabels,
} from '@/lib/organization';
import type { HelpRequest, Incident, ProblemReport, MaterialItem } from '@/lib/types';

type SubTab = 'alertes' | 'aides' | 'incidents' | 'problemes' | 'materiel';

const SUB_TABS: { key: SubTab; label: string; icon: typeof Bell }[] = [
  { key: 'alertes', label: 'Vue d\'ensemble', icon: Bell },
  { key: 'aides', label: 'Demandes d\'aide', icon: Users },
  { key: 'incidents', label: 'Incidents', icon: ShieldAlert },
  { key: 'problemes', label: 'Problèmes', icon: Wrench },
  { key: 'materiel', label: 'Matériel', icon: Package },
];

export default function Bureau() {
  const [sub, setSub] = useState<SubTab>('alertes');
  const [detail, setDetail] = useState<{ type: string; id: string } | null>(null);

  const openHelp = helpRequests.filter((h) => h.status === 'ouvert').length;
  const openIncidents = incidents.filter((i) => i.status === 'ouvert').length;
  const newProblems = problemReports.filter((p) => p.status === 'nouveau').length;
  const urgentMaterial = materialItems.filter((m) => m.urgency === 'urgent' && m.status !== 'disponible').length;

  return (
    <div className="px-4 pt-5 pb-6 space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
          <Bell size={26} className="text-brand-500" /> Bureau
        </h1>
        <p className="text-ink-500 dark:text-ink-300 text-sm mt-0.5">Coordination et gestion du terrain</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SUB_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setSub(key); setDetail(null); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap tap ${
              sub === key ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-900 text-ink-600 dark:text-ink-300'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {sub === 'alertes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <AlertCard count={openHelp} label="Demandes d'aide ouvertes" icon={<Users size={20} />} tone={openHelp > 0 ? 'warn' : 'ok'} onClick={() => setSub('aides')} />
            <AlertCard count={openIncidents} label="Incidents en cours" icon={<ShieldAlert size={20} />} tone={openIncidents > 0 ? 'danger' : 'ok'} onClick={() => setSub('incidents')} />
            <AlertCard count={newProblems} label="Problèmes nouveaux" icon={<Wrench size={20} />} tone={newProblems > 0 ? 'warn' : 'ok'} onClick={() => setSub('problemes')} />
            <AlertCard count={urgentMaterial} label="Matériel urgent" icon={<Package size={20} />} tone={urgentMaterial > 0 ? 'danger' : 'ok'} onClick={() => setSub('materiel')} />
          </div>

          {/* Recent help requests */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-ink-500 dark:text-ink-300 uppercase tracking-wide px-1">Demandes récentes</h2>
            {helpRequests.slice(0, 3).map((hr) => (
              <HelpRequestCard key={hr.id} hr={hr} onClick={() => { setSub('aides'); setDetail({ type: 'help', id: hr.id }); }} />
            ))}
          </div>

          {/* Recent incidents */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-ink-500 dark:text-ink-300 uppercase tracking-wide px-1">Incidents récents</h2>
            {incidents.map((inc) => (
              <IncidentCard key={inc.id} inc={inc} onClick={() => { setSub('incidents'); setDetail({ type: 'incident', id: inc.id }); }} />
            ))}
          </div>
        </div>
      )}

      {sub === 'aides' && (
        <div className="space-y-3">
          {helpRequests.map((hr) => (
            <HelpRequestCard key={hr.id} hr={hr} onClick={() => setDetail({ type: 'help', id: hr.id })} />
          ))}
          {detail?.type === 'help' && (() => {
            const hr = helpRequests.find((h) => h.id === detail.id);
            return hr ? <HelpDetailModal hr={hr} onClose={() => setDetail(null)} /> : null;
          })()}
        </div>
      )}

      {sub === 'incidents' && (
        <div className="space-y-3">
          {incidents.map((inc) => (
            <IncidentCard key={inc.id} inc={inc} onClick={() => setDetail({ type: 'incident', id: inc.id })} />
          ))}
          {incidents.length === 0 && <EmptyState icon={<ShieldAlert size={32} />} text="Aucun incident signalé." />}
          {detail?.type === 'incident' && (() => {
            const inc = incidents.find((i) => i.id === detail.id);
            return inc ? <IncidentDetailModal inc={inc} onClose={() => setDetail(null)} /> : null;
          })()}
        </div>
      )}

      {sub === 'problemes' && (
        <div className="space-y-3">
          {problemReports.map((pr) => (
            <ProblemCard key={pr.id} pr={pr} onClick={() => setDetail({ type: 'problem', id: pr.id })} />
          ))}
          {detail?.type === 'problem' && (() => {
            const pr = problemReports.find((p) => p.id === detail.id);
            return pr ? <ProblemDetailModal pr={pr} onClose={() => setDetail(null)} /> : null;
          })()}
        </div>
      )}

      {sub === 'materiel' && (
        <div className="space-y-3">
          {materialItems.map((mat) => (
            <MaterialCard key={mat.id} mat={mat} />
          ))}
        </div>
      )}
    </div>
  );
}

function AlertCard({ count, label, icon, tone, onClick }: { count: number; label: string; icon: React.ReactNode; tone: 'ok' | 'warn' | 'danger'; onClick: () => void }) {
  const colors = {
    ok: 'bg-brand-50 dark:bg-brand-700/20 text-brand-700 dark:text-brand-200',
    warn: 'bg-warn-50 dark:bg-warn-600/20 text-warn-700 dark:text-warn-100',
    danger: 'bg-danger-50 dark:bg-danger-700/20 text-danger-700 dark:text-danger-100',
  };
  return (
    <button onClick={onClick} className={`rounded-2xl p-4 text-left tap ${colors[tone]}`}>
      <div className="flex items-center justify-between">
        {icon}
        <span className="text-2xl font-bold">{count}</span>
      </div>
      <div className="text-sm font-medium mt-1">{label}</div>
    </button>
  );
}

function HelpRequestCard({ hr, onClick }: { hr: HelpRequest; onClick: () => void }) {
  const tone = hr.status === 'ouvert' ? 'bg-danger-100 text-danger-700 dark:bg-danger-700/30 dark:text-danger-100' : hr.status === 'en_cours' ? 'bg-warn-100 text-warn-700 dark:bg-warn-600/30 dark:text-warn-100' : 'bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200';
  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 p-4 tap">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-semibold text-ink-900 dark:text-white text-sm">{hr.caregiver_name}</span>
          <span className="text-xs text-ink-400 ml-2">{helpRequestTypeLabels[hr.type]}</span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tone}`}>{hr.status}</span>
      </div>
      <p className="text-sm text-ink-600 dark:text-ink-300 line-clamp-2">{hr.description}</p>
      {hr.proposed_solutions.length > 0 && (
        <div className="mt-2 text-xs text-brand-600 dark:text-brand-300 flex items-center gap-1">
          <CheckCircle2 size={12} /> {hr.proposed_solutions.filter(s => s.compatible).length} solution(s) compatible(s)
        </div>
      )}
    </button>
  );
}

function IncidentCard({ inc, onClick }: { inc: Incident; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 p-4 tap">
      <div className="flex items-start gap-3">
        <div className={`w-3 h-3 rounded-full ${incidentLevelColors[inc.level]} mt-1.5 shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-ink-900 dark:text-white text-sm">{incidentLevelLabels[inc.level]}</span>
            <span className="text-xs text-ink-400">{inc.caregiver_name}</span>
          </div>
          <p className="text-sm text-ink-600 dark:text-ink-300 mt-1 line-clamp-2">{inc.description}</p>
        </div>
      </div>
    </button>
  );
}

function ProblemCard({ pr, onClick }: { pr: ProblemReport; onClick: () => void }) {
  const urgencyTone = pr.urgency === 'urgent' ? 'border-l-danger-500' : pr.urgency === 'attention' ? 'border-l-warn-500' : 'border-l-info-500';
  return (
    <button onClick={onClick} className={`w-full text-left rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 border-l-4 p-4 tap ${urgencyTone}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-ink-900 dark:text-white text-sm">{problemCategoryLabels[pr.category]}</span>
        <span className="text-xs text-ink-400">{pr.caregiver_name}</span>
      </div>
      <p className="text-sm text-ink-600 dark:text-ink-300 line-clamp-2">{pr.comment}</p>
      <span className="text-xs text-ink-400 mt-1 inline-block">{problemUrgencyLabels[pr.urgency]}</span>
    </button>
  );
}

function MaterialCard({ mat }: { mat: MaterialItem }) {
  const statusColor = mat.status === 'disponible' ? 'bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200' : mat.status === 'manquant' || mat.status === 'defectueux' ? 'bg-danger-100 text-danger-700 dark:bg-danger-700/30 dark:text-danger-100' : 'bg-warn-100 text-warn-700 dark:bg-warn-600/30 dark:text-warn-100';
  return (
    <div className="rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 p-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-ink-900 dark:text-white text-sm">{mat.name}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>{materialStatusLabels[mat.status]}</span>
      </div>
      <div className="text-xs text-ink-500 dark:text-ink-400 mt-1">{mat.location}</div>
      {mat.note && <div className="text-xs text-ink-400 mt-1">{mat.note}</div>}
    </div>
  );
}

function HelpDetailModal({ hr, onClose }: { hr: HelpRequest; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-ink-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto safe-bottom">
        <div className="sticky top-0 bg-white dark:bg-ink-800 px-5 pt-5 pb-3 flex items-center justify-between border-b border-ink-100 dark:border-ink-700">
          <h2 className="text-xl font-bold text-ink-900 dark:text-white">Demande d'aide</h2>
          <button onClick={onClose} className="p-2 rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 tap"><X size={22} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="text-xs text-ink-400">Demandeur</div>
            <div className="font-semibold text-ink-900 dark:text-white">{hr.caregiver_name}</div>
          </div>
          <div>
            <div className="text-xs text-ink-400">Type</div>
            <div className="font-medium text-ink-700 dark:text-ink-200">{helpRequestTypeLabels[hr.type]}</div>
          </div>
          <div>
            <div className="text-xs text-ink-400 mb-1">Description</div>
            <p className="text-sm text-ink-700 dark:text-ink-200 bg-ink-50 dark:bg-ink-900 rounded-2xl p-4">{hr.description}</p>
          </div>
          {hr.proposed_solutions.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">Solutions proposées par CareBalance</div>
              <div className="space-y-2">
                {hr.proposed_solutions.map((sol) => (
                  <div key={sol.id} className={`rounded-2xl border p-4 ${sol.compatible ? 'border-brand-200 dark:border-brand-700/40 bg-brand-50 dark:bg-brand-700/10' : 'border-ink-100 dark:border-ink-700'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-ink-900 dark:text-white text-sm">{sol.person_name}</span>
                      <span className={`text-xs font-bold ${sol.compatible ? 'text-brand-600 dark:text-brand-300' : 'text-ink-400'}`}>{sol.compatible ? 'Compatible' : 'Non compatible'}</span>
                    </div>
                    {sol.compatible ? (
                      <div className="space-y-0.5">
                        {sol.recommendation_reasons.map((r, i) => (
                          <div key={i} className="text-xs text-brand-700 dark:text-brand-200 flex items-center gap-1"><CheckCircle2 size={10} /> {r}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {sol.incompatibility_reasons.map((r, i) => (
                          <div key={i} className="text-xs text-ink-400 flex items-center gap-1"><X size={10} /> {r}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-400 mt-2">La validation finale vous appartient. Le planning n'est jamais modifié automatiquement.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IncidentDetailModal({ inc, onClose }: { inc: Incident; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-ink-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto safe-bottom">
        <div className="sticky top-0 bg-white dark:bg-ink-800 px-5 pt-5 pb-3 flex items-center justify-between border-b border-ink-100 dark:border-ink-700">
          <h2 className="text-xl font-bold text-ink-900 dark:text-white">Détail incident</h2>
          <button onClick={onClose} className="p-2 rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 tap"><X size={22} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${incidentLevelColors[inc.level]}`} />
            <span className="font-semibold text-ink-900 dark:text-white">{incidentLevelLabels[inc.level]}</span>
          </div>
          <div className="text-sm text-ink-700 dark:text-ink-200 bg-ink-50 dark:bg-ink-900 rounded-2xl p-4">{inc.description}</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-xs text-ink-400">Signalé par</div><div className="font-medium">{inc.caregiver_name}</div></div>
            {inc.patient_name && <div><div className="text-xs text-ink-400">Patient</div><div className="font-medium">{inc.patient_name}</div></div>}
          </div>
          <p className="text-xs text-ink-400">En cas d'urgence vitale, appelez le 15 (SAMU), le 18 (pompiers) ou le 112. CareBalance ne remplace jamais les services d'urgence.</p>
        </div>
      </div>
    </div>
  );
}

function ProblemDetailModal({ pr, onClose }: { pr: ProblemReport; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-ink-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto safe-bottom">
        <div className="sticky top-0 bg-white dark:bg-ink-800 px-5 pt-5 pb-3 flex items-center justify-between border-b border-ink-100 dark:border-ink-700">
          <h2 className="text-xl font-bold text-ink-900 dark:text-white">Détail du problème</h2>
          <button onClick={onClose} className="p-2 rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 tap"><X size={22} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-ink-900 dark:text-white">{problemCategoryLabels[pr.category]}</span>
            <span className="text-sm text-ink-500">{problemUrgencyLabels[pr.urgency]}</span>
          </div>
          <p className="text-sm text-ink-700 dark:text-ink-200 bg-ink-50 dark:bg-ink-900 rounded-2xl p-4">{pr.comment}</p>
          <div className="text-sm"><span className="text-xs text-ink-400">Signalé par</span> <span className="font-medium">{pr.caregiver_name}</span></div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="rounded-3xl bg-white dark:bg-ink-800 p-8 text-center text-ink-500 dark:text-ink-300 border border-ink-100 dark:border-ink-700">
      <div className="flex justify-center mb-3 text-ink-300">{icon}</div>
      {text}
    </div>
  );
}
