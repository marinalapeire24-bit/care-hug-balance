import { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Gauge,
  Ghost,
  Heart,
  Loader2,
  Package,
  ShieldAlert,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  helpRequests,
  incidents,
  problemReports,
  materialItems,
  organizationalProblems,
  decisionImpacts,
  forecasts,
} from '@/lib/organization';
import { computeLeadStats } from '@/lib/leads';
import type { LeadStats } from '@/lib/types';

export default function DirectorDashboard() {
  const openHelp = helpRequests.filter((h) => h.status === 'ouvert').length;
  const openIncidents = incidents.filter((i) => i.status === 'ouvert').length;
  const newProblems = problemReports.filter((p) => p.status === 'nouveau').length;
  const urgentMaterial = materialItems.filter((m) => m.urgency === 'urgent' && m.status !== 'disponible').length;
  const riskForecasts = forecasts.filter((f) => f.level === 'risque').length;

  const [leadStats, setLeadStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stats = await computeLeadStats();
        if (!cancelled) setLeadStats(stats);
      } catch {
        // silently handled
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-6 space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
          <Gauge size={26} className="text-brand-500" /> Santé de l'activité
        </h1>
        <p className="text-ink-500 dark:text-ink-300 text-sm mt-0.5">Vue d'ensemble pour le pilotage</p>
      </div>

      {/* Ce qui mérite votre attention */}
      <div className="rounded-3xl bg-white dark:bg-ink-800 p-5 border border-ink-100 dark:border-ink-700">
        <h2 className="font-bold text-ink-900 dark:text-white mb-4">Ce qui mérite votre attention aujourd'hui</h2>
        <div className="space-y-2">
          {openIncidents > 0 && (
            <AttentionItem level="danger" icon={<ShieldAlert size={18} />} text={`${openIncidents} incident${openIncidents > 1 ? 's' : ''} en cours`} />
          )}
          {openHelp > 0 && (
            <AttentionItem level="warn" icon={<Users size={18} />} text={`${openHelp} demande${openHelp > 1 ? 's' : ''} d'aide ouverte${openHelp > 1 ? 's' : ''}`} />
          )}
          {leadStats && leadStats.urgentNewCount > 0 && (
            <AttentionItem level="warn" icon={<Bell size={18} />} text={`${leadStats.urgentNewCount} prospect${leadStats.urgentNewCount > 1 ? 's' : ''} à rappeler en priorité`} />
          )}
          {riskForecasts > 0 && (
            <AttentionItem level="warn" icon={<TrendingUp size={18} />} text={`${riskForecasts} prévision${riskForecasts > 1 ? 's' : ''} à risque cette semaine`} />
          )}
          {newProblems > 0 && (
            <AttentionItem level="warn" icon={<Package size={18} />} text={`${newProblems} problème${newProblems > 1 ? 's' : ''} signalé${newProblems > 1 ? 's' : ''} à traiter`} />
          )}
          {urgentMaterial > 0 && (
            <AttentionItem level="danger" icon={<Package size={18} />} text={`${urgentMaterial} matériel${urgentMaterial > 1 ? 's' : ''} en urgence`} />
          )}
          {openIncidents === 0 && urgentMaterial === 0 && (
            <AttentionItem level="ok" icon={<CheckCircle2 size={18} />} text="Aucun problème matériel critique" />
          )}
        </div>
      </div>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-2 gap-3">
        <KPI icon={<Gauge size={18} />} label="Charge globale" value="72%" tone="warn" />
        <KPI icon={<Heart size={18} />} label="Soutenabilité moy." value="68/100" tone="warn" />
        <KPI icon={<CheckCircle2 size={18} />} label="Interventions couvertes" value="94%" tone="ok" />
        <KPI icon={<Ghost size={18} />} label="Travail invisible" value="42 min/j" />
        <KPI icon={<Clock size={18} />} label="Retard moyen" value="11 min" />
        <KPI icon={<Users size={18} />} label="Demandes de renfort" value="7 / sem" />
        <KPI icon={<Bell size={18} />} label="Prospects nouveaux" value={`${leadStats?.newCount ?? 0}`} />
        <KPI icon={<CheckCircle2 size={18} />} label="Nouveaux clients" value={`${leadStats?.convertedCount ?? 0}`} tone="ok" />
      </div>

      {/* Problèmes d'organisation détectés */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-ink-500 dark:text-ink-300 uppercase tracking-wide px-1">
          Problèmes d'organisation détectés
        </h2>
        {organizationalProblems.slice(0, 4).map((op) => (
          <div key={op.id} className="rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-ink-900 dark:text-white text-sm">{op.title}</span>
              <TrendBadge trend={op.trend} />
            </div>
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">{op.description}</p>
            <p className="text-xs text-ink-400 mt-1.5">Cause probable : {op.cause}</p>
          </div>
        ))}
      </div>

      {/* Impact des décisions */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-ink-500 dark:text-ink-300 uppercase tracking-wide px-1">
          Impact des décisions prises
        </h2>
        {decisionImpacts.map((di) => (
          <div key={di.id} className="rounded-2xl bg-brand-50 dark:bg-brand-700/15 border border-brand-100 dark:border-brand-700/30 p-4">
            <div className="font-medium text-ink-900 dark:text-white text-sm">{di.title}</div>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="text-ink-500 dark:text-ink-300">{di.before_value}</span>
              <span className="text-brand-600 dark:text-brand-300">→</span>
              <span className="font-semibold text-brand-700 dark:text-brand-200">{di.after_value}</span>
              <span className="ml-auto text-xs text-brand-600 dark:text-brand-300 flex items-center gap-1">
                <CheckCircle2 size={14} /> Amélioration
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttentionItem({ level, icon, text }: { level: 'ok' | 'warn' | 'danger'; icon: React.ReactNode; text: string }) {
  const colors = {
    ok: 'bg-brand-50 dark:bg-brand-700/20 text-brand-700 dark:text-brand-200',
    warn: 'bg-warn-50 dark:bg-warn-600/20 text-warn-700 dark:text-warn-100',
    danger: 'bg-danger-50 dark:bg-danger-700/20 text-danger-700 dark:text-danger-100',
  };
  const dot = { ok: '🟢', warn: '🟠', danger: '🔴' };
  return (
    <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${colors[level]}`}>
      <span>{dot[level]}</span>
      <span className="text-sm font-medium flex-1">{text}</span>
      {icon}
    </div>
  );
}

function KPI({ icon, label, value, tone = 'default' }: { icon: React.ReactNode; label: string; value: string; tone?: 'default' | 'ok' | 'warn' }) {
  const color = tone === 'warn' ? 'text-warn-700 dark:text-warn-100' : tone === 'ok' ? 'text-brand-700 dark:text-brand-200' : 'text-ink-900 dark:text-white';
  return (
    <div className="rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">{icon} {label}</div>
      <div className={`mt-1 text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function TrendBadge({ trend }: { trend: 'hausse' | 'stable' | 'baisse' }) {
  const colors = {
    hausse: 'bg-danger-100 text-danger-700 dark:bg-danger-700/30 dark:text-danger-100',
    stable: 'bg-ink-100 text-ink-600 dark:bg-ink-900 dark:text-ink-300',
    baisse: 'bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200',
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[trend]}`}>{trend}</span>;
}
