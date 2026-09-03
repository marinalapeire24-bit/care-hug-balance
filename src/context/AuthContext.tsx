import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

interface AuthCtx {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Identifiants incorrects. Vérifiez votre email et votre mot de passe.';
  if (m.includes('user already registered')) return 'Un compte existe déjà avec cet email.';
  if (m.includes('password should be at least')) return 'Le mot de passe doit contenir au moins 6 caractères.';
  if (m.includes('signup is disabled')) return 'La création de compte est désactivée.';
  if (m.includes('email not confirmed')) return "Votre email n'est pas encore confirmé.";
  if (m.includes('email rate limit')) return 'Trop de tentatives. Veuillez patienter quelques minutes.';
  if (m.includes('network') || m.includes('fetch')) return 'Problème de connexion au serveur. Vérifiez votre connexion internet.';
  if (m.includes('email')) return "L'adresse email semble invalide.";
  return `Erreur : ${message}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (data) setProfile(data as Profile);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      (async () => {
        if (newSession) {
          await loadProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      })();
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? friendlyError(error.message) : null };
    } catch (e) {
      return { error: friendlyError(e instanceof Error ? e.message : 'Erreur inconnue') };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role: role || 'soignant' } },
      });
      if (error) return { error: friendlyError(error.message) };
      if (data.user && !data.session) {
        return { error: 'Compte créé ! Vérifiez votre boîte email pour confirmer votre inscription.' };
      }
      return { error: null };
    } catch (e) {
      return { error: friendlyError(e instanceof Error ? e.message : 'Erreur inconnue') };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { error: friendlyError(error.message) };
      return { error: null };
    } catch (e) {
      return { error: friendlyError(e instanceof Error ? e.message : 'Erreur inconnue') };
    }
  };

  return (
    <Ctx.Provider value={{ session, profile, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
