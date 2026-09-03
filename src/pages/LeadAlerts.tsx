import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  Check,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import {
  computeLeadStats,
  fetchLeads,
  markLeadCalled,
  updateLeadStatus,
  relationshipLabels,
  serviceTypeLabels,
  urgencyLabels,
  urgencyColors,
  statusLabels,
  statusColors,
} from '@/lib/leads';
import type { Lead, LeadStats, LeadStatus, LeadUrgency } from '@/lib/types';

type Filter = 'tous' | 'nouveaux' | 'urgents' | 'en_cours' | 'convertis';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'nouveaux', label: 'Nouveaux' },
  { key: 'urgents', label: 'Urgents' },
  { key: 'en_cours', label: 'En cours' },
  { key: 'convertis', label: 'Convertis' },
  { key: 'tous', label: 'Tous' },
];

export default function LeadAlerts() {
  const [filter, setFilter] = useState<Filter>('nouveaux');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [leads, leadStats] = await Promise.all([fetchLeads(), computeLeadStats()]);
      setAllLeads(leads);
      setStats(leadStats);
    } catch {
      // silently handled
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'nouveaux':
        return allLeads.filter((l) => l.status === 'nouveau');
      case 'urgents':
        return allLeads.filter((l) => l.status === 'nouveau' && l.priority_score >= 70);
      case 'en_cours':
        return allLeads.filter((l) => l.status === 'en_cours' || l.status === 'qualifie' || l.status === 'a_rappeler');
      case 'convertis':
        return allLeads.filter((l) => l.status === 'converti');
      default:
        return allLeads;
    }
  }, [allLeads, filter]);

  async function handleStatusChange(id: string, status: LeadStatus) {
    try {
      await updateLeadStatus(id, status);
      if (selectedLead?.id === id) {
        setSelectedLead((prev) => (prev ? { ...prev, status } : null));
      }
      await loadData();
    } catch {
      // silently handled
    }
  }

  async function handleCall(id: string) {
    try {
      await markLeadCalled(id);
      if (selectedLead?.id === id) {
        setSelectedLead((prev) =>
          prev ? { ...prev, called_at: new Date().toISOString() } : null
        );
      }
      await loadData();
    } catch {
      // silently handled
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  const urgentCount = stats?.urgentNewCount ?? 0;

  return (
    <div className="px-4 pt-5 pb-6 space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
          <Bell size={26} className="text-brand-500" /> Demandes entrantes
        </h1>
        <p className="text-ink-500 dark:text-ink-300 text-sm mt-0.5">
          Les prospects qui ont demandé à être rappelés
        </p>
      </div>

      {/* Alerte urgente */}
      {urgentCount > 0 && (
        <div className="rounded-3xl bg-danger-50 dark:bg-danger-700/20 border border-danger-100 dark:border-danger-700/30 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-danger-500 flex items-center justify-center shrink-0">
            <AlertCircle size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-danger-700 dark:text-danger-100">
              {urgentCount} demande{urgentCount > 1 ? 's' : ''} prioritaire{urgentCount > 1 ? 's' : ''} à rappeler
            </p>
            <p className="text-sm text-danger-600 dark:text-danger-200">
              Rappel recommandé sous 2 h
            </p>
          </div>
          <button
            onClick={() => setFilter('urgents')}
            className="px-3 py-2 rounded-xl bg-danger-600 text-white text-sm font-medium tap"
          >
            Voir
          </button>
        </div>
      )}

      {/* Stats résumé */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Nouveaux" value={stats.newCount} tone={stats.newCount > 0 ? 'warn' : 'default'} />
          <StatCard label="Convertis" value={stats.convertedCount} tone="ok" />
          <StatCard label="Taux conv." value={`${stats.conversionRate}%`} />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap tap ${
              filter === key
                ? 'bg-brand-600 text-white'
                : 'bg-ink-100 dark:bg-ink-900 text-ink-600 dark:text-ink-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Lead list */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-ink-800 p-8 text-center text-ink-500 dark:text-ink-300 border border-ink-100 dark:border-ink-700">
          <Bell className="mx-auto mb-3 text-ink-300" size={32} />
          Aucune demande dans cette catégorie.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onOpen={() => setSelectedLead(lead)}
              onCall={() => handleCall(lead.id)}
            />
          ))}
        </div>
      )}

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusChange={(status) => handleStatusChange(selectedLead.id, status)}
          onCall={() => handleCall(selectedLead.id)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, tone = 'default' }: { label: string; value: number | string; tone?: 'default' | 'ok' | 'warn' }) {
  const color =
    tone === 'warn' ? 'text-warn-700 dark:text-warn-100' : tone === 'ok' ? 'text-brand-700 dark:text-brand-200' : 'text-ink-900 dark:text-white';
  return (
    <div className="rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 px-3 py-3 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{label}</div>
    </div>
  );
}

function LeadCard({ lead, onOpen, onCall }: { lead: Lead; onOpen: () => void; onCall: () => void }) {
  const urgencyColor = urgencyColors[lead.urgency];
  const statusColor = statusColors[lead.status];
  const timeAgo = formatTimeAgo(lead.created_at);

  return (
    <div
      className="rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 p-4 tap cursor-pointer"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-700/30 flex items-center justify-center shrink-0">
            <User size={18} className="text-brand-600 dark:text-brand-300" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-ink-900 dark:text-white truncate">{lead.full_name}</div>
            <div className="text-xs text-ink-400 flex items-center gap-1.5">
              <Clock size={12} /> {timeAgo}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
            {statusLabels[lead.status]}
          </span>
          {lead.priority_score >= 70 && (
            <span className="text-xs font-bold text-danger-600 dark:text-danger-100">
              Priorité {lead.priority_score}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs text-ink-600 dark:text-ink-300 bg-ink-100 dark:bg-ink-900 px-2 py-1 rounded-lg">
          {serviceTypeLabels[lead.service_type]}
        </span>
        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${urgencyColor}`}>
          {urgencyLabels[lead.urgency]}
        </span>
        {lead.city && (
          <span className="text-xs text-ink-500 dark:text-ink-400 flex items-center gap-1">
            <MapPin size={12} /> {lead.city}
          </span>
        )}
      </div>

      {lead.situation && (
        <p className="text-sm text-ink-600 dark:text-ink-300 line-clamp-2 mb-3">{lead.situation}</p>
      )}

      <div className="flex items-center justify-between gap-2">
        <a
          href={`tel:${lead.phone.replace(/\s/g, '')}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-300 tap"
        >
          <Phone size={14} /> {lead.phone}
        </a>
        <div className="flex items-center gap-2">
          {lead.status === 'nouveau' && (
            <button
              onClick={(e) => { e.stopPropagation(); onCall(); }}
              className="px-3 py-1.5 rounded-lg bg-brand-100 dark:bg-brand-700/30 text-brand-700 dark:text-brand-200 text-xs font-medium tap"
            >
              Marquer rappelé
            </button>
          )}
          <ArrowUpRight size={16} className="text-ink-300" />
        </div>
      </div>
    </div>
  );
}

function LeadDetailModal({
  lead,
  onClose,
  onStatusChange,
  onCall,
}: {
  lead: Lead;
  onClose: () => void;
  onStatusChange: (status: LeadStatus) => void;
  onCall: () => void;
}) {
  const statusOptions: LeadStatus[] = ['nouveau', 'qualifie', 'en_cours', 'a_rappeler', 'converti', 'perdu'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-ink-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto safe-bottom">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-ink-800 px-5 pt-5 pb-3 flex items-center justify-between border-b border-ink-100 dark:border-ink-700">
          <h2 className="text-xl font-bold text-ink-900 dark:text-white">Détail de la demande</h2>
          <button onClick={onClose} className="p-2 rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 tap" aria-label="Fermer">
            <X size={22} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Identity */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-brand-100 dark:bg-brand-700/30 flex items-center justify-center">
              <User size={24} className="text-brand-600 dark:text-brand-300" />
            </div>
            <div>
              <div className="text-lg font-bold text-ink-900 dark:text-white">{lead.full_name}</div>
              <div className="text-sm text-ink-500 dark:text-ink-400">{relationshipLabels[lead.relationship]}</div>
            </div>
            <div className="ml-auto text-right">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[lead.status]}`}>
                {statusLabels[lead.status]}
              </div>
              <div className="mt-1 text-xs text-ink-400">Priorité {lead.priority_score}/100</div>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-2xl bg-ink-50 dark:bg-ink-900 p-4 space-y-3">
            <ContactRow icon={<Phone size={16} />} label="Téléphone" value={lead.phone} href={`tel:${lead.phone.replace(/\s/g, '')}`} />
            {lead.email && <ContactRow icon={<Mail size={16} />} label="Email" value={lead.email} href={`mailto:${lead.email}`} />}
            {lead.city && <ContactRow icon={<MapPin size={16} />} label="Commune" value={lead.city} />}
            {lead.preferred_contact_time && <ContactRow icon={<Clock size={16} />} label="Créneau préféré" value={lead.preferred_contact_time} />}
          </div>

          {/* Request details */}
          <div className="space-y-2.5">
            <DetailRow label="Type de service" value={serviceTypeLabels[lead.service_type]} />
            <DetailRow label="Délai souhaité" value={urgencyLabels[lead.urgency]} badge={urgencyColors[lead.urgency]} />
            <DetailRow label="Demande reçue" value={formatDateTime(lead.created_at)} />
            {lead.called_at && <DetailRow label="Premier rappel" value={formatDateTime(lead.called_at)} />}
          </div>

          {/* Situation */}
          {lead.situation && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-1.5">Situation décrite</p>
              <div className="rounded-2xl bg-ink-50 dark:bg-ink-900 p-4">
                <p className="text-sm text-ink-700 dark:text-ink-200">{lead.situation}</p>
              </div>
            </div>
          )}

          {/* Qualification auto */}
          {lead.qualification_note && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-1.5 flex items-center gap-1">
                <TrendingUp size={14} /> Qualification automatique
              </p>
              <div className="rounded-2xl bg-info-50 dark:bg-info-600/15 p-4">
                <p className="text-sm text-info-700 dark:text-info-100">{lead.qualification_note}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-2">
            {lead.status === 'nouveau' && (
              <button
                onClick={onCall}
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center justify-center gap-2 tap"
              >
                <Phone size={18} /> Marquer comme rappelé
              </button>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">Changer le statut</p>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => onStatusChange(s)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium tap flex items-center gap-1.5 ${
                      lead.status === s
                        ? 'bg-brand-600 text-white'
                        : 'bg-ink-100 dark:bg-ink-900 text-ink-600 dark:text-ink-300'
                    }`}
                  >
                    {lead.status === s && <Check size={14} />}
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const content = (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-white dark:bg-ink-800 flex items-center justify-center text-ink-400 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-ink-400">{label}</div>
        <div className="text-sm font-medium text-ink-900 dark:text-white truncate">{value}</div>
      </div>
    </div>
  );
  if (href) {
    return <a href={href} className="block tap">{content}</a>;
  }
  return content;
}

function DetailRow({ label, value, badge }: { label: string; value: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-500 dark:text-ink-400">{label}</span>
      {badge ? (
        <span className={`text-sm font-medium px-2.5 py-1 rounded-lg ${badge}`}>{value}</span>
      ) : (
        <span className="text-sm font-medium text-ink-900 dark:text-white">{value}</span>
      )}
    </div>
  );
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days} j`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
