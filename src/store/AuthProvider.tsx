'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { accountApi } from '@/data/accounts';
import type { AccountUser, Session } from '@/data/api/accountApi';
import { parseDataUrl } from '@/data/configMedia';

interface AuthContextValue {
  /** `loading` until the server has said whether anyone is signed in. */
  status: 'loading' | 'ready';
  /** True when this server has accounts switched on. Without them the app works as before, with no login. */
  accountsEnabled: boolean;
  registrationOpen: boolean;
  /** True when the server can email people: password reset and address confirmation need it. */
  emailEnabled: boolean;
  user: AccountUser | null;
  limits?: Session['limits'];
  login(email: string, password: string): Promise<void>;
  register(email: string, password: string, name: string): Promise<void>;
  /** Signs out and goes to the home page. */
  logout(): Promise<void>;
  /** Deletes the account (the password confirms it) and goes to the home page. */
  deleteAccount(password: string): Promise<void>;
  /** True from the moment of logging out or deleting until the home page has opened. */
  signingOut: boolean;
  /** After the account itself was removed or its password changed elsewhere. */
  refresh(): Promise<void>;
  /**
   * Stores a photo or song (a data URL) in the signed-in user's library and returns its `/api/library` URL.
   * Anything else is returned unchanged, and so is everything when nobody is signed in.
   */
  storeMedia(url: string, name?: string): Promise<string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const EMPTY: Session = { accountsEnabled: false, registrationOpen: false, user: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ status: 'loading' | 'ready'; session: Session }>({
    status: accountApi ? 'loading' : 'ready',
    session: EMPTY,
  });

  const refresh = useCallback(async () => {
    if (!accountApi) return;
    try {
      setState({ status: 'ready', session: await accountApi.session() });
    } catch {
      // The server is unreachable right now: carry on without accounts rather than blocking the app.
      setState({ status: 'ready', session: EMPTY });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      await accountApi!.login(email, password);
      await refresh();
    },
    [refresh],
  );
  const register = useCallback(
    async (email: string, password: string, name: string) => {
      await accountApi!.register(email, password, name);
      await refresh();
    },
    [refresh],
  );
  // Leaving an account page must land on the home page, not bounce through the login page it would
  // otherwise redirect a signed-out visitor to. `signingOut` tells those pages to stand still.
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);
  useEffect(() => setSigningOut(false), [pathname]);

  const leave = useCallback(
    async (action: () => Promise<unknown>) => {
      setSigningOut(true);
      try {
        await action();
        router.replace('/');
        await refresh();
      } catch (err) {
        setSigningOut(false);
        throw err;
      }
    },
    [refresh, router],
  );
  const logout = useCallback(() => leave(() => accountApi!.logout()), [leave]);
  const deleteAccount = useCallback((password: string) => leave(() => accountApi!.deleteAccount(password)), [leave]);

  const signedIn = !!state.session.user;
  const storeMedia = useCallback(
    async (url: string, name = 'Upload') => {
      const media = signedIn && accountApi && url.startsWith('data:') ? parseDataUrl(url) : null;
      if (!media || !accountApi) return url;
      return (await accountApi.uploadToLibrary(media.bytes, media.type, name)).url;
    },
    [signedIn],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status: state.status,
      accountsEnabled: state.session.accountsEnabled,
      registrationOpen: state.session.registrationOpen,
      emailEnabled: !!state.session.emailEnabled,
      user: state.session.user,
      limits: state.session.limits,
      login,
      register,
      logout,
      deleteAccount,
      signingOut,
      refresh,
      storeMedia,
    }),
    [state, login, register, logout, deleteAccount, signingOut, refresh, storeMedia],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/**
 * For pages that belong to signed-in users: sends everyone else to the login page (and back afterwards),
 * and says whether to keep showing the loading screen instead of the page.
 */
export function useRequireLogin(next: string): boolean {
  const auth = useAuth();
  const router = useRouter();
  const needsLogin = auth.status === 'ready' && auth.accountsEnabled && !auth.user;
  useEffect(() => {
    if (needsLogin && !auth.signingOut) router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [needsLogin, auth.signingOut, next, router]);
  return auth.status === 'loading' || needsLogin;
}
