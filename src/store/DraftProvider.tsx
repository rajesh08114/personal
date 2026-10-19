import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { BirthdayConfig } from '@/types/birthday';
import { createDefaultConfig } from '@/data/defaultConfig';
import { draftStorage } from '@/data/repository';
import { accountApi } from '@/data/accounts';
import { normalizeConfig } from '@/data/normalizeConfig';
import { mapConfigMedia } from '@/data/configMedia';
import { errorMessage } from '@/utils/media';
import { useAuth } from './AuthProvider';

export type SaveStatus = 'loading' | 'saved' | 'saving' | 'error';

interface DraftContextValue {
  config: BirthdayConfig;
  ready: boolean;
  status: SaveStatus;
  saveError: string | null;
  shareId?: string;
  /** Lets this browser update or unpublish the shared link (server mode without accounts). */
  editToken?: string;
  /** True when the signed-in user's draft lives on the server, as one of their works. */
  accountMode: boolean;
  /** The work being edited (account mode). It is created on the first change. */
  workId?: string;
  setConfig: (next: BirthdayConfig | ((prev: BirthdayConfig) => BirthdayConfig)) => void;
  patch: (partial: Partial<BirthdayConfig>) => void;
  setShareId: (id: string | undefined, editToken?: string) => void;
  reset: () => void;
  /** Account mode: loads one of the user's works into the studio. Returns false if it no longer exists. */
  openWork: (id: string) => Promise<boolean>;
  /** Account mode: starts a blank birthday. It is saved as a new work once something changes. */
  newWork: (templateId?: BirthdayConfig['templateId']) => Promise<void>;
  /** Account mode: saves the latest changes, then publishes the work. Returns the public id. */
  publishWork: () => Promise<string>;
  /** Account mode: takes the public link down. The work stays. */
  unpublishWork: () => Promise<void>;
}

const DraftContext = createContext<DraftContextValue | null>(null);

const rememberKey = (userId: string) => `bs:work:${userId}`;
const remember = (userId: string, workId?: string) => {
  try {
    if (workId) localStorage.setItem(rememberKey(userId), workId);
    else localStorage.removeItem(rememberKey(userId));
  } catch {
    /* Private mode: the most recent work is opened instead. */
  }
};
const remembered = (userId: string) => {
  try {
    return localStorage.getItem(rememberKey(userId)) ?? undefined;
  } catch {
    return undefined;
  }
};

/**
 * Holds the creator's work-in-progress birthday and autosaves it.
 *  - Anonymous: to IndexedDB in this browser.
 *  - Signed in (accounts on): to the server, as one of the user's works. Photos and songs go to their
 *    library the moment they are chosen, so the work only ever holds small `/api/library` references.
 * Every page that edits or previews the draft reads from here.
 */
export function DraftProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const accountMode = !!accountApi && auth.status === 'ready' && auth.accountsEnabled && !!auth.user;
  const userId = accountMode ? auth.user!.id : null;

  const [config, setConfigState] = useState<BirthdayConfig>(createDefaultConfig);
  const [shareId, setShareIdState] = useState<string | undefined>();
  const [editToken, setEditToken] = useState<string | undefined>();
  const [workId, setWorkId] = useState<string | undefined>();
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('loading');
  const [saveError, setSaveError] = useState<string | null>(null);
  const dirty = useRef(false);

  // Account mode keeps the newest values in refs, so queued saves never use a stale closure.
  const configRef = useRef(config);
  configRef.current = config;
  const workIdRef = useRef<string | undefined>(undefined);
  const lastSaved = useRef<BirthdayConfig | null>(null);
  const storeMediaRef = useRef(auth.storeMedia);
  storeMediaRef.current = auth.storeMedia;
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const applyWork = useCallback((work: { id: string; config: unknown; shareId?: string }) => {
    const next = normalizeConfig(work.config);
    workIdRef.current = work.id;
    lastSaved.current = next;
    setConfigState(next);
    setWorkId(work.id);
    setShareIdState(work.shareId);
  }, []);

  // Load the draft: from the server for a signed-in user, from this browser otherwise.
  useEffect(() => {
    if (auth.status !== 'ready') return;
    let cancelled = false;
    setReady(false);
    setStatus('loading');
    setSaveError(null);
    dirty.current = false;
    workIdRef.current = undefined;

    const finish = (error?: unknown) => {
      if (cancelled) return;
      if (error) {
        setStatus('error');
        setSaveError(errorMessage(error));
      } else {
        setStatus('saved');
      }
      setReady(true);
    };

    if (userId && accountApi) {
      void (async () => {
        try {
          const id = remembered(userId);
          let work = id ? await accountApi.getWork(id) : null;
          if (!work) {
            const [latest] = await accountApi.listWorks();
            work = latest ? await accountApi.getWork(latest.id) : null;
          }
          if (cancelled) return;
          if (work) {
            applyWork(work);
          } else {
            const blank = createDefaultConfig();
            lastSaved.current = blank;
            setConfigState(blank);
            setWorkId(undefined);
            setShareIdState(undefined);
          }
          setEditToken(undefined);
          finish();
        } catch (err) {
          finish(err);
        }
      })();
    } else {
      draftStorage
        .load()
        .then((draft) => {
          if (cancelled) return;
          if (draft) {
            setConfigState(draft.config);
            setShareIdState(draft.shareId);
            setEditToken(draft.editToken);
          } else {
            setConfigState(createDefaultConfig());
            setShareIdState(undefined);
            setEditToken(undefined);
          }
          setWorkId(undefined);
        })
        .catch(() => {
          /* No storage (private mode etc.) — keep working in memory. */
        })
        .finally(() => finish());
    }
    return () => {
      cancelled = true;
    };
  }, [auth.status, userId, applyWork]);

  // Anonymous drafts: autosave to IndexedDB.
  useEffect(() => {
    if (accountMode || !ready || !dirty.current) return;
    setStatus('saving');
    const t = window.setTimeout(() => {
      draftStorage
        .save({ config, shareId, editToken })
        .then(() => {
          setStatus('saved');
          setSaveError(null);
        })
        .catch((err: unknown) => {
          setStatus('error');
          setSaveError(errorMessage(err));
        });
    }, 450);
    return () => window.clearTimeout(t);
  }, [config, shareId, editToken, ready, accountMode]);

  /** One save at a time, in order. Swaps pasted-in data URLs for library files, then creates or updates the work. */
  const sync = useCallback(async () => {
    if (!accountApi || !userId) return;
    const snapshot = configRef.current;
    if (snapshot === lastSaved.current && workIdRef.current) return;
    let swapped = false;
    const prepared = await mapConfigMedia(snapshot, (url) => {
      if (!url.startsWith('data:')) return url;
      swapped = true;
      return storeMediaRef.current(url);
    });
    const saved = workIdRef.current
      ? await accountApi.updateWork(workIdRef.current, prepared)
      : await accountApi.createWork(prepared);
    workIdRef.current = saved.id;
    setWorkId(saved.id);
    remember(userId, saved.id);
    if (swapped && configRef.current === snapshot) {
      lastSaved.current = prepared;
      setConfigState(prepared);
    } else {
      lastSaved.current = snapshot;
    }
  }, [userId]);

  const enqueue = useCallback(<T,>(task: () => Promise<T>): Promise<T> => {
    const run = queue.current.then(task);
    queue.current = run.catch(() => undefined);
    return run;
  }, []);

  /** Saves right now (publishing and switching works need the newest changes on the server). */
  const flush = useCallback(async () => {
    if (!accountMode) return;
    setStatus('saving');
    try {
      await enqueue(sync);
      setStatus('saved');
      setSaveError(null);
    } catch (err) {
      setStatus('error');
      setSaveError(errorMessage(err));
      throw err;
    }
  }, [accountMode, enqueue, sync]);

  // Signed-in drafts: autosave to the server.
  useEffect(() => {
    if (!accountMode || !ready || config === lastSaved.current) return;
    setStatus('saving');
    const t = window.setTimeout(() => {
      if (configRef.current === lastSaved.current) return;
      flush().catch(() => undefined);
    }, 700);
    return () => window.clearTimeout(t);
  }, [config, accountMode, ready, flush]);

  const setConfig = useCallback<DraftContextValue['setConfig']>((next) => {
    dirty.current = true;
    setConfigState((prev) => (typeof next === 'function' ? next(prev) : next));
  }, []);

  const patch = useCallback((partial: Partial<BirthdayConfig>) => setConfig((prev) => ({ ...prev, ...partial })), [setConfig]);

  const setShareId = useCallback(
    (id: string | undefined, token?: string) => {
      // With an account the server decides what is published, through publishWork.
      if (accountMode) return;
      dirty.current = true;
      setShareIdState(id);
      setEditToken(token);
    },
    [accountMode],
  );

  const reset = useCallback(() => {
    dirty.current = true;
    if (!accountMode) {
      setShareIdState(undefined);
      setEditToken(undefined);
    }
    setConfigState((prev) => ({ ...createDefaultConfig(), templateId: prev.templateId }));
  }, [accountMode]);

  const openWork = useCallback(
    async (id: string) => {
      if (!accountApi || !userId) return false;
      await flush();
      const work = await accountApi.getWork(id);
      if (!work) return false;
      applyWork(work);
      remember(userId, work.id);
      setStatus('saved');
      return true;
    },
    [userId, flush, applyWork],
  );

  const newWork = useCallback(
    async (templateId?: BirthdayConfig['templateId']) => {
      if (!userId) return;
      await flush();
      const blank = { ...createDefaultConfig(), ...(templateId ? { templateId } : {}) };
      workIdRef.current = undefined;
      lastSaved.current = blank;
      setWorkId(undefined);
      setShareIdState(undefined);
      setConfigState(blank);
      remember(userId, undefined);
      setStatus('saved');
    },
    [userId, flush],
  );

  const publishWork = useCallback(async () => {
    if (!accountApi) throw new Error('Accounts aren’t available.');
    await flush();
    const id = workIdRef.current;
    if (!id) throw new Error('Nothing to publish yet.');
    const published = await accountApi.publishWork(id);
    setShareIdState(published.shareId);
    return published.shareId;
  }, [flush]);

  const unpublishWork = useCallback(async () => {
    const id = workIdRef.current;
    if (!accountApi || !id) return;
    await accountApi.unpublishWork(id);
    setShareIdState(undefined);
  }, []);

  const value = useMemo(
    () => ({
      config,
      ready,
      status,
      saveError,
      shareId,
      editToken,
      accountMode,
      workId,
      setConfig,
      patch,
      setShareId,
      reset,
      openWork,
      newWork,
      publishWork,
      unpublishWork,
    }),
    [config, ready, status, saveError, shareId, editToken, accountMode, workId, setConfig, patch, setShareId, reset, openWork, newWork, publishWork, unpublishWork],
  );

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useDraft(): DraftContextValue {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error('useDraft must be used inside <DraftProvider>');
  return ctx;
}
