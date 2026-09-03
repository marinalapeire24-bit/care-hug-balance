import { useState } from 'react';
import { HeartPulse, Loader2, Moon, Sun, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const SIGNUP_ROLES = [
  { value: 'soignant', label: 'Intervenant terrain' },
  { value: 'coordinateur', label: 'Coordinateur' },
  { value: 'directeur', label: 'Directeur' },
  { value: 'professionnel_sante', label: 'Professionnel de santé' },
  { value: 'famille', label: 'Proche / Famille' },
] as const;

export default function AuthScreen() {
  const { signIn, signUp, resetPassword } = useAuth();
  const { theme, toggle } = useTheme();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('soignant');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function switchMode(next: 'signin' | 'signup' | 'reset') {
    setMode(next);
    setError(null);
    setInfo(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === 'reset') {
      if (!email.trim()) { setError('Veuillez saisir votre adresse email.'); return; }
      setBusy(true);
      const res = await resetPassword(email.trim());
      if (res.error) setError(res.error);
      else setInfo('Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.');
      setBusy(false);
      return;
    }

    if (mode === 'signup' && fullName.trim().length < 2) {
      setError('Merci d\'indiquer votre nom (au moins 2 caractères).');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signin') {
        const res = await signIn(email.trim(), password);
        if (res.error) setError(res.error);
      } else {
        const res = await signUp(email.trim(), password, fullName.trim(), role);
        if (res.error) {
          if (res.error.startsWith('Compte créé')) setInfo(res.error);
          else setError(res.error);
        }
      }
    } catch {
      setError('Une erreur inattendue est survenue.');
    }
    setBusy(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-ink-50 dark:bg-ink-900">
      <div className="flex justify-end p-4">
        <button
          onClick={toggle}
          className="p-3 rounded-full bg-white dark:bg-ink-800 shadow-sm text-ink-600 dark:text-ink-200 tap"
          aria-label="Changer de thème"
        >
          {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 pb-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <HeartPulse size={34} className="text-white" />
            </div>
            <h1 className="mt-4 text-3xl font-bold text-ink-900 dark:text-white">CareBalance</h1>
            <p className="mt-1 text-ink-500 dark:text-ink-300 text-center">
              Plateforme de coordination d'aide à domicile
            </p>
          </div>

          <div className="bg-white dark:bg-ink-800 rounded-3xl shadow-xl p-6">
            {mode === 'reset' ? (
              <>
                <button
                  onClick={() => switchMode('signin')}
                  className="flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-300 mb-4 tap"
                >
                  <ArrowLeft size={16} /> Retour à la connexion
                </button>
                <h2 className="text-lg font-bold text-ink-900 dark:text-white mb-1">
                  Mot de passe oublié
                </h2>
                <p className="text-sm text-ink-500 dark:text-ink-400 mb-4">
                  Saisissez votre email pour recevoir un lien de réinitialisation.
                </p>
              </>
            ) : (
              <div className="flex bg-ink-100 dark:bg-ink-900 rounded-2xl p-1 mb-6">
                <button
                  onClick={() => switchMode('signin')}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    mode === 'signin' ? 'bg-white dark:bg-ink-700 text-brand-600 dark:text-brand-300 shadow-sm' : 'text-ink-500 dark:text-ink-300'
                  }`}
                >
                  Se connecter
                </button>
                <button
                  onClick={() => switchMode('signup')}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    mode === 'signup' ? 'bg-white dark:bg-ink-700 text-brand-600 dark:text-brand-300 shadow-sm' : 'text-ink-500 dark:text-ink-300'
                  }`}
                >
                  Créer un compte
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">Nom complet</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Camille Martin"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="vous@exemple.fr"
                />
              </div>
              {mode !== 'reset' && (
                <div>
                  <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">Mot de passe</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Au moins 6 caractères"
                  />
                </div>
              )}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">Votre rôle</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {SIGNUP_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-ink-400 dark:text-ink-500">
                    Votre rôle détermine les fonctionnalités accessibles.
                  </p>
                </div>
              )}

              {mode === 'signin' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="text-sm text-brand-600 dark:text-brand-300 hover:underline tap"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              {error && (
                <p className="text-sm text-danger-600 dark:text-danger-100 bg-danger-50 dark:bg-danger-700/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              {info && (
                <div className="flex items-start gap-2 text-sm text-brand-700 dark:text-brand-200 bg-brand-50 dark:bg-brand-700/20 rounded-xl px-4 py-3">
                  <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <span>{info}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center justify-center gap-2 tap disabled:opacity-60"
              >
                {busy && <Loader2 size={18} className="animate-spin" />}
                {mode === 'signin' ? 'Entrer' : mode === 'signup' ? 'Créer mon compte' : 'Envoyer le lien'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-ink-400 dark:text-ink-400 px-4">
            Environnement de démonstration. Toutes les données patients sont fictives.
          </p>
        </div>
      </div>
    </div>
  );
}
