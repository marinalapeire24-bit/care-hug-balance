import { useState } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  Navigation,
  Package,
  ShieldAlert,
  TrendingUp,
  User,
} from 'lucide-react';
import { generateBriefing, type BriefingData } from '@/lib/organization';
import { difficultyLabel } from '@/lib/format';

interface Props {
  interventionId: string;
  onBack: () => void;
  onOpenPatient: (id: string) => void;
}

export default function Briefing({ interventionId, onBack, onOpenPatient }: Props) {
  const [briefing] = useState<BriefingData>(() => generateBriefing(interventionId));

  return (
    <div className="px-4 pt-5 pb-6 space-y-5 max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-ink-500 dark:text-ink-300 tap">
        <ArrowLeft size={20} /> Retour
      </button>

      <div>
        <p className="text-brand-600 dark:text-brand-300 font-medium text-sm">Briefing avant intervention</p>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white mt-1">{briefing.patient_name}</h1>
      </div>

      {/* Essentials */}
      <div className="rounded-3xl bg-brand-600 text-white p-5 shadow-lg shadow-brand-600/25">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white/10 py-3">
            <Clock size={18} className="mx-auto text-brand-200 mb-1" />
            <div className="text-xs text-brand-100">Heure</div>
            <div className="font-bold text-lg">{briefing.time}</div>
          </div>
          <div className="rounded-2xl bg-white/10 py-3">
            <Clock size={18} className="mx-auto text-brand-200 mb-1" />
            <div className="text-xs text-brand-100">Durée prévue</div>
            <div className="font-bold text-lg">{briefing.duration}</div>
          </div>
          <div className="rounded-2xl bg-white/10 py-3">
            <Navigation size={18} className="mx-auto text-brand-200 mb-1" />
            <div className="text-xs text-brand-100">Difficulté</div>
            <div className="font-bold text-lg">{difficultyLabel(briefing.difficulty)}</div>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-2 text-brand-50">
          <MapPin size={18} className="shrink-0 mt-0.5" />
          <span className="text-sm">{briefing.address}</span>
        </div>
      </div>

      {/* Key info */}
      {briefing.key_info.length > 0 && (
        <Section title="Informations importantes" icon={<FileText size={18} className="text-info-500" />}>
          {briefing.key_info.map((info, i) => (
            <InfoRow key={i} text={info} />
          ))}
        </Section>
      )}

      {/* Recent changes */}
      {briefing.recent_changes.length > 0 && (
        <Section title="Changements récents" icon={<TrendingUp size={18} className="text-warn-500" />}>
          {briefing.recent_changes.map((change, i) => (
            <div key={i} className="rounded-2xl bg-warn-50 dark:bg-warn-600/15 border-l-4 border-warn-500 px-4 py-3">
              <p className="text-sm text-warn-700 dark:text-warn-100">{change}</p>
            </div>
          ))}
        </Section>
      )}

      {/* Vigilance points */}
      {briefing.vigilance_points.length > 0 && (
        <Section title="Points de vigilance" icon={<AlertTriangle size={18} className="text-danger-500" />}>
          {briefing.vigilance_points.map((point, i) => (
            <div key={i} className="rounded-2xl bg-danger-50 dark:bg-danger-700/15 border-l-4 border-danger-500 px-4 py-3">
              <p className="text-sm text-danger-700 dark:text-danger-100">{point}</p>
            </div>
          ))}
        </Section>
      )}

      {/* Instructions */}
      {briefing.instructions && (
        <Section title="Consignes" icon={<FileText size={18} className="text-ink-400" />}>
          <div className="rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 px-4 py-3">
            <p className="text-sm text-ink-700 dark:text-ink-200">{briefing.instructions}</p>
          </div>
        </Section>
      )}

      {/* Equipment & skills */}
      <div className="flex flex-wrap gap-2">
        {briefing.required_equipment && (
          <span className="inline-flex items-center gap-1.5 text-sm bg-ink-100 dark:bg-ink-900 text-ink-600 dark:text-ink-300 rounded-full px-3 py-1.5">
            <Package size={14} /> {briefing.required_equipment}
          </span>
        )}
        {briefing.required_skills && (
          <span className="inline-flex items-center gap-1.5 text-sm bg-ink-100 dark:bg-ink-900 text-ink-600 dark:text-ink-300 rounded-full px-3 py-1.5">
            <ShieldAlert size={14} /> {briefing.required_skills}
          </span>
        )}
      </div>

      <button
        onClick={() => onOpenPatient(interventionId)}
        className="w-full py-3.5 rounded-xl bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-brand-600 dark:text-brand-300 font-semibold flex items-center justify-center gap-2 tap"
      >
        <User size={18} /> Voir le dossier complet <ChevronRight size={18} />
      </button>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-500 dark:text-ink-300 uppercase tracking-wide px-1">
        {icon} {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 px-4 py-3 flex items-start gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-info-500 mt-2 shrink-0" />
      <p className="text-sm text-ink-700 dark:text-ink-200">{text}</p>
    </div>
  );
}
