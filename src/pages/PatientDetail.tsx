import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, Clock, Home, History, RefreshCw, ShieldAlert, TrendingUp } from 'lucide-react';
import { fetchPatientDetail, sortAlerts, type PatientDetailData } from '@/lib/data';
import { alertMeta, age, formatRelative } from '@/lib/format';
import { formatTime } from '@/lib/format';

interface Props {
  patientId: string;
  onBack: () => void;
}

export default function PatientDetail({ patientId, onBack }: Props) {
  const [data, setData] = useState<PatientDetailData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetchPatientDetail(patientId)
      .then((d) => active && setData(d))
      .catch(() => active && setError(true));
    return () => { active = false; };
  }, [patientId]);

  if (error) {
    return (
      <div className="p-6 text-center text-ink-500 dark:text-ink-300">
        <AlertCircle className="mx-auto mb-2 text-danger-500" />
        Impossible de charger ce dossier patient.
      </div>
    );
  }

  if (!data) {
    return <div className="flex justify-center py-20 text-brand-500"><RefreshCw className="animate-spin" size={32} /></div>;
  }

  const { patient, alerts, changes } = data;
  const sortedAlerts = sortAlerts(alerts);
  const criticalAlerts = sortedAlerts.filter((a) => a.level === 'critique');
  const attentionAlerts = sortedAlerts.filter((a) => a.level === 'attention');
  const recentChanges = changes.slice(0, 5);

  return (
    <div className="px-4 pt-5 pb-6 space-y-5 max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-ink-500 dark:text-ink-300 tap">
        <ArrowLeft size={20} /> Retour
      </button>

      <div className="rounded-3xl bg-white dark:bg-ink-800 p-5 border border-ink-100 dark:border-ink-700">
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">
          {patient.first_name} {patient.last_name}
        </h1>
        <div className="mt-1 text-ink-500 dark:text-ink-300">
          {age(patient.birth_date) !== null && `${age(patient.birth_date)} ans · `}
          {patient.environment === 'domicile' ? 'À domicile' : 'En établissement'}
        </div>
        <div className="mt-2 flex items-start gap-2 text-sm text-ink-500 dark:text-ink-300">
          <Home size={16} className="shrink-0 mt-0.5" />
          {patient.address || patient.room || 'Adresse non renseignée'}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <ShieldAlert size={16} className="text-warn-500" />
          <span className="text-sm font-medium text-ink-700 dark:text-ink-200">
            Indice de fragilité : {patient.fragility_level}/100
          </span>
        </div>
        {patient.summary && (
          <p className="mt-3 text-sm text-ink-600 dark:text-ink-300 bg-ink-50 dark:bg-ink-900 rounded-2xl px-4 py-3">
            {patient.summary}
          </p>
        )}
      </div>

      {criticalAlerts.length > 0 && (
        <Section title="Alertes critiques" icon={<AlertCircle size={18} className="text-danger-500" />}>
          {criticalAlerts.map((a) => (
            <div key={a.id} className={`rounded-2xl border-l-4 px-4 py-3 ${alertMeta.critique.bg} ${alertMeta.critique.border}`}>
              <p className={`text-sm font-medium ${alertMeta.critique.text}`}>{a.message}</p>
            </div>
          ))}
        </Section>
      )}

      {attentionAlerts.length > 0 && (
        <Section title="À surveiller" icon={<ShieldAlert size={18} className="text-warn-500" />}>
          {attentionAlerts.map((a) => (
            <div key={a.id} className={`rounded-2xl border-l-4 px-4 py-3 ${alertMeta.attention.bg} ${alertMeta.attention.border}`}>
              <p className={`text-sm ${alertMeta.attention.text}`}>{a.message}</p>
            </div>
          ))}
        </Section>
      )}

      {recentChanges.length > 0 && (
        <Section title="Ce qui a changé" icon={<TrendingUp size={18} className="text-info-500" />}>
          {recentChanges.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink-900 dark:text-white">{c.category}</span>
                <span className="text-xs text-ink-400">{formatRelative(c.occurred_at)}</span>
              </div>
              <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{c.description}</p>
              {c.source && <p className="mt-1 text-xs text-ink-400">Source : {c.source}</p>}
            </div>
          ))}
        </Section>
      )}

      {data.interventions.length > 0 && (
        <Section title="Historique" icon={<History size={18} className="text-ink-400" />}>
          {data.interventions.slice(0, 5).map((i) => (
            <div key={i.id} className="flex items-center gap-3 rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 px-4 py-3">
              <Clock size={16} className="text-ink-400 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium text-ink-900 dark:text-white">
                  {new Date(i.scheduled_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à {formatTime(i.scheduled_at)}
                </div>
                <div className="text-xs text-ink-400">
                  {i.duration_minutes} min · {i.status === 'termine' ? 'Terminé' : i.status === 'en_cours' ? 'En cours' : 'À faire'}
                </div>
              </div>
            </div>
          ))}
        </Section>
      )}
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
