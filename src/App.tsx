import { useEffect, useState, useCallback } from 'react';
import {
  Activity,
  Bell,
  CalendarDays,
  Ghost,
  Grid3x3,
  HeartPulse,
  Home,
  LogOut,
  Moon,
  Scale,
  SlidersHorizontal,
  Sun,
  TrendingUp,
  Users,
  X,
  ArrowRight,
  Loader2,
  ShieldAlert,
  AlertTriangle,
  Camera,
  Check,
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import AuthScreen from '@/components/AuthScreen';
import Dashboard from '@/pages/Dashboard';
import PatientsList from '@/pages/PatientsList';
import PatientDetail from '@/pages/PatientDetail';
import DayStatus from '@/pages/DayStatus';
import InvisibleWork from '@/pages/InvisibleWork';
import PlannedVsReality from '@/pages/PlannedVsReality';
import LeadCapture from '@/pages/LeadCapture';
import LeadAlerts from '@/pages/LeadAlerts';
import Briefing from '@/pages/Briefing';
import Bureau from '@/pages/Bureau';
import DirectorDashboard from '@/pages/DirectorDashboard';
import TeamBalance from '@/pages/TeamBalance';
import Forecasts from '@/pages/Forecasts';
import Simulation from '@/pages/Simulation';
import FamilySpace from '@/pages/FamilySpace';
import HospitalDischarge from '@/pages/HospitalDischarge';
import CarePathway from '@/pages/CarePathway';
import DischargeRequestForm from '@/pages/DischargeRequestForm';
import TransmissionsPage from '@/pages/TransmissionsPage';
import EvaluationPage from '@/pages/EvaluationPage';
import CarePlanPage from '@/pages/CarePlanPage';
import LegalPages from '@/pages/LegalPages';
import DifficultyModal from '@/components/DifficultyModal';
import HelpRequestModal from '@/components/HelpRequestModal';
import ProblemReportModal from '@/components/ProblemReportModal';
import IncidentModal from '@/components/IncidentModal';
import { fetchNotifications, fetchUnreadCount, markNotificationRead, markAllRead, type Notification } from '@/lib/notifications';

type Tab = 'dashboard' | 'day_status' | 'invisible' | 'reality' | 'patients' | 'leads' | 'bureau' | 'director' | 'team' | 'forecasts' | 'simulation' | 'family' | 'hospital' | 'pathway';
type View =
  | { tab: Tab }
  | { tab: 'patient_detail'; patientId: string }
  | { tab: 'briefing'; interventionId: string }
  | { tab: 'discharge_form' }
  | { tab: 'transmissions'; patientId: string; patientName: string; careRequestId?: string }
  | { tab: 'evaluation'; careRequestId: string }
  | { tab: 'care_plan'; careRequestId: string }
  | { tab: 'legal'; page: 'mentions_legales' | 'cgv' | 'cgu' | 'confidentialite' };

type TabDef = { key: Tab; label: string; icon: typeof Home; roles?: string[] };

const FIELD_TABS: TabDef[] = [
  { key: 'dashboard', label: 'Journée', icon: CalendarDays, roles: ['soignant', 'infirmier_referent', 'coordinateur', 'directeur', 'administrateur'] },
  { key: 'day_status', label: 'État', icon: TrendingUp, roles: ['soignant', 'infirmier_referent', 'coordinateur', 'directeur', 'administrateur'] },
  { key: 'patients', label: 'Patients', icon: Home, roles: ['soignant', 'infirmier_referent', 'coordinateur', 'directeur', 'administrateur', 'professionnel_sante'] },
  { key: 'invisible', label: 'Invisible', icon: Ghost, roles: ['soignant', 'infirmier_referent', 'coordinateur'] },
  { key: 'reality', label: 'Prévu/Réalité', icon: Scale, roles: ['soignant', 'infirmier_referent', 'coordinateur', 'directeur'] },
];

const BUREAU_TABS: TabDef[] = [
  { key: 'bureau', label: 'Bureau', icon: Bell, roles: ['coordinateur', 'directeur', 'administrateur', 'rh'] },
  { key: 'leads', label: 'Demandes', icon: Users, roles: ['coordinateur', 'directeur', 'administrateur'] },
  { key: 'director', label: 'Activité', icon: Activity, roles: ['directeur', 'administrateur'] },
  { key: 'team', label: 'Équipe', icon: Users, roles: ['coordinateur', 'directeur', 'administrateur', 'rh'] },
  { key: 'forecasts', label: 'Prévisions', icon: TrendingUp, roles: ['coordinateur', 'directeur', 'administrateur'] },
  { key: 'simulation', label: 'Simuler', icon: SlidersHorizontal, roles: ['directeur', 'administrateur'] },
];

const OTHER_PAGES: TabDef[] = [
  { key: 'pathway', label: 'Parcours CareBalance', icon: Activity, roles: ['coordinateur', 'directeur', 'administrateur', 'professionnel_sante'] },
  { key: 'family', label: 'Espace famille', icon: HeartPulse, roles: ['famille'] },
  { key: 'hospital', label: 'Hôpital → Domicile', icon: Home, roles: ['coordinateur', 'directeur', 'administrateur', 'professionnel_sante'] },
];

function filterByRole(tabs: TabDef[], role: string | undefined): TabDef[] {
  if (!role) return tabs;
  return tabs.filter(t => !t.roles || t.roles.includes(role));
}

function MainApp() {
  const { session, profile, loading, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [view, setView] = useState<View>({ tab: 'dashboard' });
  const [initialRedirectDone, setInitialRedirectDone] = useState(false);

  if (!initialRedirectDone && profile) {
    setInitialRedirectDone(true);
    if (profile.role === 'famille') setView({ tab: 'family' });
  }
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showProblem, setShowProblem] = useState(false);
  const [showIncident, setShowIncident] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [publicMode, setPublicMode] = useState<'auth' | 'lead'>('auth');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = useCallback(async () => {
    try {
      const [count, notifs] = await Promise.all([fetchUnreadCount(), fetchNotifications()]);
      setUnreadCount(count);
      setNotifications(notifs);
    } catch {}
  }, []);

  useEffect(() => {
    if (session) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session, loadNotifications]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-brand-500">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!session) {
    if (publicMode === 'lead') {
      return (
        <div>
          <LeadCapture />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-ink-800/95 backdrop-blur-md border-t border-ink-100 dark:border-ink-700 safe-bottom">
            <div className="max-w-lg mx-auto px-5 py-3 flex items-center justify-between">
              <span className="text-xs text-ink-500 dark:text-ink-400">Vous êtes du personnel ?</span>
              <button onClick={() => setPublicMode('auth')} className="text-sm font-medium text-brand-600 dark:text-brand-300 tap">
                Se connecter
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="relative">
        <AuthScreen />
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-ink-50 to-transparent dark:from-ink-900 pt-10 pb-4">
          <div className="max-w-md mx-auto px-5">
            <button onClick={() => setPublicMode('lead')} className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center justify-center gap-2 tap shadow-lg shadow-brand-600/25">
              <HeartPulse size={22} /> Je souhaite être accompagné
              <ArrowRight size={18} />
            </button>
            <p className="mt-2 text-center text-xs text-ink-400">
              Vous êtes un particulier ? Décrivez votre situation, nous vous rappelons.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentTab: Tab =
    view.tab === 'patient_detail' ? 'patients'
    : view.tab === 'briefing' ? 'dashboard'
    : view.tab;

  const openPatient = (id: string) => setView({ tab: 'patient_detail', patientId: id });
  const backFromPatient = () => setView({ tab: 'patients' });
  const openBriefing = (id: string) => setView({ tab: 'briefing', interventionId: id });
  const backFromBriefing = () => setView({ tab: 'dashboard' });

  const userRole = profile?.role;
  const visibleFieldTabs = filterByRole(FIELD_TABS, userRole);
  const visibleBureauTabs = filterByRole(BUREAU_TABS, userRole);
  const visibleOtherPages = filterByRole(OTHER_PAGES, userRole);

  const isBureauArea = ['bureau', 'leads', 'director', 'team', 'forecasts', 'simulation'].includes(currentTab);
  const bottomTabs = isBureauArea ? visibleBureauTabs : visibleFieldTabs;

  async function handleMarkRead(id: string) {
    await markNotificationRead(id);
    loadNotifications();
  }

  async function handleMarkAllRead() {
    await markAllRead();
    loadNotifications();
  }

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-900 flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-ink-800/90 backdrop-blur-md border-b border-ink-100 dark:border-ink-700">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CB</span>
            </div>
            <span className="font-semibold text-ink-900 dark:text-white text-sm hidden sm:block">CareBalance</span>
          </div>
          <div className="flex items-center gap-2">
            {profile && (
              <span className="text-xs text-ink-500 dark:text-ink-400 hidden sm:block max-w-[120px] truncate">
                {profile.full_name}
              </span>
            )}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 rounded-full text-ink-500 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700 tap"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-danger-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowMenu(true)}
              className="p-2 rounded-full text-ink-500 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700 tap"
              aria-label="Menu"
            >
              <Grid3x3 size={18} />
            </button>
            <button onClick={toggle} className="p-2 rounded-full text-ink-500 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700 tap" aria-label="Changer de thème">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={signOut} className="p-2 rounded-full text-ink-500 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700 tap" aria-label="Se déconnecter">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20">
        {view.tab === 'dashboard' && (
          <Dashboard
            onOpenPatient={openPatient}
            onReportDifficulty={() => setShowDifficulty(true)}
            onOpenBriefing={openBriefing}
            onShowActions={() => setShowActions(true)}
          />
        )}
        {view.tab === 'briefing' && (
          <Briefing interventionId={view.interventionId} onBack={backFromBriefing} onOpenPatient={openPatient} />
        )}
        {view.tab === 'day_status' && (
          <DayStatus onReportDifficulty={() => setShowDifficulty(true)} />
        )}
        {view.tab === 'patients' && <PatientsList onOpenPatient={openPatient} />}
        {view.tab === 'patient_detail' && (
          <PatientDetail patientId={view.patientId} onBack={backFromPatient} />
        )}
        {view.tab === 'invisible' && <InvisibleWork />}
        {view.tab === 'reality' && <PlannedVsReality onOpenPatient={openPatient} />}
        {view.tab === 'leads' && <LeadAlerts />}
        {view.tab === 'bureau' && <Bureau />}
        {view.tab === 'director' && <DirectorDashboard />}
        {view.tab === 'team' && <TeamBalance />}
        {view.tab === 'forecasts' && <Forecasts />}
        {view.tab === 'simulation' && <Simulation />}
        {view.tab === 'family' && <FamilySpace />}
        {view.tab === 'hospital' && <HospitalDischarge />}
        {view.tab === 'pathway' && (
          <CarePathway
            onOpenEvaluation={(id) => setView({ tab: 'evaluation', careRequestId: id })}
            onOpenCarePlan={(id) => setView({ tab: 'care_plan', careRequestId: id })}
            onOpenTransmissions={(patientId, patientName, crId) => setView({ tab: 'transmissions', patientId, patientName, careRequestId: crId })}
            onOpenDischargeForm={() => setView({ tab: 'discharge_form' })}
          />
        )}
        {view.tab === 'discharge_form' && (
          <DischargeRequestForm
            onBack={() => setView({ tab: 'pathway' })}
            onCreated={() => setView({ tab: 'pathway' })}
          />
        )}
        {view.tab === 'transmissions' && (
          <TransmissionsPage
            patientId={view.patientId}
            patientName={view.patientName}
            careRequestId={view.careRequestId}
            onBack={() => setView({ tab: 'pathway' })}
          />
        )}
        {view.tab === 'evaluation' && (
          <EvaluationPage
            careRequestId={view.careRequestId}
            onBack={() => setView({ tab: 'pathway' })}
            onComplete={() => setView({ tab: 'pathway' })}
          />
        )}
        {view.tab === 'care_plan' && (
          <CarePlanPage
            careRequestId={view.careRequestId}
            onBack={() => setView({ tab: 'pathway' })}
            onComplete={() => setView({ tab: 'pathway' })}
          />
        )}
        {view.tab === 'legal' && (
          <LegalPages
            page={view.page}
            onBack={() => setView({ tab: 'dashboard' })}
          />
        )}
      </main>

      {!isBureauArea && currentTab !== 'family' && currentTab !== 'hospital' && (
        <button
          onClick={() => setShowActions(true)}
          className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 flex items-center justify-center tap"
          aria-label="Actions rapides"
        >
          <ShieldAlert size={24} />
        </button>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-ink-800/95 backdrop-blur-md border-t border-ink-100 dark:border-ink-700 safe-bottom">
        <div className="max-w-2xl mx-auto flex items-center justify-around px-1 py-1.5 overflow-x-auto">
          {bottomTabs.map(({ key, label, icon: Icon }) => {
            const active = currentTab === key;
            return (
              <button
                key={key}
                onClick={() => setView({ tab: key })}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl tap min-w-[52px] ${
                  active ? 'text-brand-600 dark:text-brand-300' : 'text-ink-400 dark:text-ink-500'
                }`}
              >
                <Icon size={22} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {showMenu && (
        <MenuDrawer
          currentTab={currentTab}
          groups={[
            { title: 'Terrain', tabs: visibleFieldTabs },
            { title: 'Bureau & direction', tabs: visibleBureauTabs },
            { title: 'Autres espaces', tabs: visibleOtherPages },
          ].filter(g => g.tabs.length > 0)}
          onNavigate={(tab) => { setView({ tab }); setShowMenu(false); }}
          onOpenLegal={(page) => { setView({ tab: 'legal', page }); setShowMenu(false); }}
          onClose={() => setShowMenu(false)}
        />
      )}

      {showNotifications && (
        <NotificationDrawer
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          onNavigate={(tab) => { setView({ tab: tab as Tab }); setShowNotifications(false); }}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {showActions && (
        <ActionsDrawer
          onClose={() => setShowActions(false)}
          onHelp={() => { setShowActions(false); setShowHelp(true); }}
          onDifficulty={() => { setShowActions(false); setShowDifficulty(true); }}
          onProblem={() => { setShowActions(false); setShowProblem(true); }}
          onIncident={() => { setShowActions(false); setShowIncident(true); }}
        />
      )}

      {showDifficulty && <DifficultyModal onClose={() => setShowDifficulty(false)} />}
      {showHelp && <HelpRequestModal onClose={() => setShowHelp(false)} />}
      {showProblem && <ProblemReportModal onClose={() => setShowProblem(false)} />}
      {showIncident && <IncidentModal onClose={() => setShowIncident(false)} />}
    </div>
  );
}

function NotificationDrawer({ notifications, onMarkRead, onMarkAllRead, onNavigate, onClose }: {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (tab: string) => void;
  onClose: () => void;
}) {
  const unread = notifications.filter(n => !n.read);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white dark:bg-ink-800 rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto safe-bottom">
        <div className="sticky top-0 bg-white dark:bg-ink-800 px-5 pt-5 pb-3 flex items-center justify-between border-b border-ink-100 dark:border-ink-700">
          <h2 className="text-xl font-bold text-ink-900 dark:text-white">
            Notifications {unread.length > 0 && <span className="text-sm font-normal text-ink-500">({unread.length} non lues)</span>}
          </h2>
          <div className="flex items-center gap-2">
            {unread.length > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs text-brand-600 dark:text-brand-300 font-medium tap"
              >
                Tout marquer lu
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 tap"><X size={22} /></button>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {notifications.length === 0 ? (
            <p className="text-center text-sm text-ink-500 dark:text-ink-400 py-8">Aucune notification</p>
          ) : notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                if (!n.read) onMarkRead(n.id);
                if (n.link_tab) onNavigate(n.link_tab);
                else onClose();
              }}
              className={`w-full text-left p-3 rounded-xl tap transition-colors ${
                n.read
                  ? 'bg-ink-50 dark:bg-ink-900'
                  : 'bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!n.read && <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
                    <p className={`text-sm font-medium truncate ${n.read ? 'text-ink-700 dark:text-ink-200' : 'text-ink-900 dark:text-white'}`}>
                      {n.title}
                    </p>
                  </div>
                  {n.message && (
                    <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 line-clamp-2">{n.message}</p>
                  )}
                  <p className="text-[10px] text-ink-400 dark:text-ink-500 mt-1">
                    {new Date(n.created_at).toLocaleDateString('fr-FR')} à {new Date(n.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {n.read && <Check size={14} className="text-ink-300 shrink-0 mt-1" />}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MenuDrawer({ currentTab, groups, onNavigate, onOpenLegal, onClose }: { currentTab: Tab; groups: { title: string; tabs: TabDef[] }[]; onNavigate: (tab: Tab) => void; onOpenLegal: (page: 'mentions_legales' | 'cgv' | 'cgu' | 'confidentialite') => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white dark:bg-ink-800 rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto safe-bottom">
        <div className="sticky top-0 bg-white dark:bg-ink-800 px-5 pt-5 pb-3 flex items-center justify-between border-b border-ink-100 dark:border-ink-700">
          <h2 className="text-xl font-bold text-ink-900 dark:text-white">Navigation</h2>
          <button onClick={onClose} className="p-2 rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 tap"><X size={22} /></button>
        </div>
        <div className="p-5 space-y-5">
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">{group.title}</h3>
              <div className="grid grid-cols-2 gap-2">
                {group.tabs.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => onNavigate(key)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-left tap ${
                      currentTab === key ? 'bg-brand-50 dark:bg-brand-700/20 text-brand-700 dark:text-brand-200' : 'bg-ink-50 dark:bg-ink-900 text-ink-700 dark:text-ink-200'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="border-t border-ink-100 dark:border-ink-700 pt-4 mt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">Informations légales</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {([
                ['mentions_legales', 'Mentions légales'],
                ['cgu', 'CGU'],
                ['cgv', 'CGV'],
                ['confidentialite', 'Confidentialité'],
              ] as const).map(([key, label]) => (
                <button key={key} onClick={() => onOpenLegal(key)} className="text-xs text-ink-500 dark:text-ink-400 hover:text-brand-600 dark:hover:text-brand-300 tap py-1">
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionsDrawer({ onClose, onHelp, onDifficulty, onProblem, onIncident }: {
  onClose: () => void;
  onHelp: () => void;
  onDifficulty: () => void;
  onProblem: () => void;
  onIncident: () => void;
}) {
  const actions = [
    { label: "J'ai besoin d'aide", desc: 'Demander un renfort ou un remplacement', icon: Users, color: 'text-brand-600 dark:text-brand-300', onClick: onHelp },
    { label: 'Je suis en difficulté', desc: 'Signaler une difficulté avec une intervention', icon: AlertTriangle, color: 'text-warn-600 dark:text-warn-300', onClick: onDifficulty },
    { label: 'Signaler un problème', desc: 'Avec photo, catégorie et urgence', icon: Camera, color: 'text-info-600 dark:text-info-300', onClick: onProblem },
    { label: 'Incident / SOS', desc: 'Alerte immédiate au bureau', icon: ShieldAlert, color: 'text-danger-600 dark:text-danger-300', onClick: onIncident },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white dark:bg-ink-800 rounded-t-3xl sm:rounded-3xl safe-bottom">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-ink-100 dark:border-ink-700">
          <h2 className="text-xl font-bold text-ink-900 dark:text-white">Actions rapides</h2>
          <button onClick={onClose} className="p-2 rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 tap"><X size={22} /></button>
        </div>
        <div className="p-4 space-y-2">
          {actions.map(({ label, desc, icon: Icon, color, onClick }) => (
            <button key={label} onClick={onClick} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-ink-50 dark:bg-ink-900 text-left tap hover:bg-ink-100 dark:hover:bg-ink-700">
              <div className={`w-10 h-10 rounded-full bg-white dark:bg-ink-800 flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-ink-900 dark:text-white text-sm">{label}</div>
                <div className="text-xs text-ink-500 dark:text-ink-400">{desc}</div>
              </div>
              <ArrowRight size={18} className="text-ink-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
