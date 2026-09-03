import { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Heart,
  MessageSquare,
  Send,
  User,
  X,
} from 'lucide-react';
import { familyMembers, passageRecords, familyMessages } from '@/lib/family';
import type { FamilyMessage } from '@/lib/types';

export default function FamilySpace() {
  const [selectedMember, setSelectedMember] = useState(familyMembers[0]);
  const [showMessageForm, setShowMessageForm] = useState(false);

  const passages = passageRecords.filter((p) => p.patient_id === selectedMember.patient_id);
  const messages = familyMessages.filter((m) => m.patient_name === selectedMember.patient_name);

  return (
    <div className="px-4 pt-5 pb-6 space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
          <Heart size={26} className="text-brand-500" /> Espace famille
        </h1>
        <p className="text-ink-500 dark:text-ink-300 text-sm mt-0.5">
          Suivez l'accompagnement de votre proche
        </p>
      </div>

      {/* Family member selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {familyMembers.map((fm) => (
          <button
            key={fm.id}
            onClick={() => setSelectedMember(fm)}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap tap ${
              selectedMember.id === fm.id ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-900 text-ink-600 dark:text-ink-300'
            }`}
          >
            {fm.first_name} {fm.last_name}
          </button>
        ))}
      </div>

      {/* Patient info */}
      <div className="rounded-3xl bg-white dark:bg-ink-800 p-5 border border-ink-100 dark:border-ink-700">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-brand-100 dark:bg-brand-700/30 flex items-center justify-center">
            <User size={24} className="text-brand-600 dark:text-brand-300" />
          </div>
          <div>
            <div className="text-lg font-bold text-ink-900 dark:text-white">{selectedMember.patient_name}</div>
            <div className="text-sm text-ink-500 dark:text-ink-400">Votre {selectedMember.relationship.toLowerCase()}</div>
          </div>
        </div>
      </div>

      {/* Passage tracking */}
      <div className="rounded-3xl bg-white dark:bg-ink-800 p-5 border border-ink-100 dark:border-ink-700">
        <h2 className="font-semibold text-ink-900 dark:text-white mb-4">Suivi des passages cette semaine</h2>
        <div className="grid grid-cols-7 gap-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => {
            const passage = passages.find((p) => {
              const d = new Date(p.date);
              return d.getDay() === (i + 1) % 7;
            });
            return (
              <div key={day} className="text-center">
                <div className="text-xs text-ink-400 mb-1">{day}</div>
                {passage ? (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${passage.went_well ? 'bg-brand-100 dark:bg-brand-700/30' : 'bg-warn-100 dark:bg-warn-600/30'}`}>
                    <CheckCircle2 size={18} className={passage.went_well ? 'text-brand-600 dark:text-brand-300' : 'text-warn-600 dark:text-warn-300'} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-ink-100 dark:bg-ink-900 flex items-center justify-center mx-auto">
                    <Clock size={16} className="text-ink-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {passages.length > 0 && (
          <div className="mt-4 space-y-2">
            {passages.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl bg-ink-50 dark:bg-ink-900 px-3 py-2.5">
                <CheckCircle2 size={18} className={p.went_well ? 'text-brand-500' : 'text-warn-500'} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink-900 dark:text-white">
                    {new Date(p.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </div>
                  <div className="text-xs text-ink-500 dark:text-ink-400">{p.caregiver_name}</div>
                </div>
                {p.note_shared && (
                  <span className="text-xs text-brand-600 dark:text-brand-300">Message reçu</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-500 dark:text-ink-300 uppercase tracking-wide px-1">
            Vos messages au bureau
          </h2>
          <button
            onClick={() => setShowMessageForm(true)}
            className="text-xs font-medium text-brand-600 dark:text-brand-300 tap flex items-center gap-1"
          >
            <Send size={14} /> Nouveau
          </button>
        </div>
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className="rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-brand-600 dark:text-brand-300">
                  {msg.type === 'rappel' ? 'Demande de rappel' : msg.type === 'question' ? 'Question' : 'Information'}
                </span>
                <span className="text-xs text-ink-400">{msg.status === 'nouveau' ? 'En attente' : 'Traité'}</span>
              </div>
              <p className="text-sm text-ink-700 dark:text-ink-200">{msg.content}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-ink-400 py-4 text-sm">Aucun message envoyé.</p>
        )}
      </div>

      <div className="rounded-2xl bg-ink-50 dark:bg-ink-900 p-4">
        <p className="text-xs text-ink-400">
          Cet espace vous permet de suivre les passages et d'échanger avec le bureau. Il ne donne pas accès au dossier médical de votre proche. Pour toute question médicale, contactez directement l'équipe.
        </p>
      </div>

      {showMessageForm && (
        <MessageFormModal
          memberName={`${selectedMember.first_name} ${selectedMember.last_name}`}
          patientName={selectedMember.patient_name}
          onClose={() => setShowMessageForm(false)}
        />
      )}
    </div>
  );
}

function MessageFormModal({ memberName, patientName, onClose }: { memberName: string; patientName: string; onClose: () => void }) {
  const [type, setType] = useState<FamilyMessage['type']>('question');
  const [content, setContent] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-ink-800 rounded-t-3xl sm:rounded-3xl safe-bottom">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-ink-100 dark:border-ink-700">
          <h2 className="text-xl font-bold text-ink-900 dark:text-white">Message au bureau</h2>
          <button onClick={onClose} className="p-2 rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 tap"><X size={22} /></button>
        </div>
        {sent ? (
          <div className="p-8 flex flex-col items-center text-center">
            <CheckCircle2 size={56} className="text-brand-500" />
            <h3 className="mt-4 text-lg font-semibold text-ink-900 dark:text-white">Message envoyé</h3>
            <p className="mt-2 text-ink-500 dark:text-ink-300 text-sm">Le bureau vous recontactera.</p>
            <button onClick={onClose} className="mt-6 w-full py-3 rounded-xl bg-brand-600 text-white font-semibold tap">Fermer</button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="flex gap-2">
              {[
                { key: 'rappel' as const, label: 'Être rappelé' },
                { key: 'question' as const, label: 'Question' },
                { key: 'information' as const, label: 'Signaler' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium tap ${type === key ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-900 text-ink-600 dark:text-ink-300'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Votre message…"
            />
            <button
              onClick={() => setSent(true)}
              disabled={!content.trim()}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center justify-center gap-2 tap disabled:opacity-60"
            >
              <Send size={18} /> Envoyer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
