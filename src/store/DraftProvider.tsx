import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { BirthdayConfig } from '@/types/birthday';
import { createDefaultConfig } from '@/data/defaultConfig';
import { draftStorage } from '@/data/repository';
import { errorMessage } from '@/utils/media';

export type SaveStatus = 'loading' | 'saved' | 'saving' | 'error';

interface DraftContextValue {
  config: BirthdayConfig;
  ready: boolean;
  status: SaveStatus;
  saveError: string | null;
  shareId?: string;
  setConfig: (next: BirthdayConfig | ((prev: BirthdayConfig) => BirthdayConfig)) => void;
  patch: (partial: Partial<BirthdayConfig>) => void;
  setShareId: (id: string) => void;
  reset: () => void;
}

const DraftContext = createContext<DraftContextValue | null>(null);

/**
 * Holds the creator's work-in-progress birthday and autosaves it to IndexedDB.
 * Every page that edits or previews the draft reads from here.
 */
export function DraftProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<BirthdayConfig>(createDefaultConfig);
  const [shareId, setShareIdState] = useState<string | undefined>();
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('loading');
  const [saveError, setSaveError] = useState<string | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    let cancelled = false;
    draftStorage
      .load()
      .then((draft) => {
        if (cancelled || !draft) return;
        setConfigState(draft.config);
        setShareIdState(draft.shareId);
      })
      .catch(() => {
        /* No storage (private mode etc.) — keep working in memory. */
      })
      .finally(() => {
        if (cancelled) return;
        setReady(true);
        setStatus('saved');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !dirty.current) return;
    setStatus('saving');
    const t = window.setTimeout(() => {
      draftStorage
        .save(config, shareId)
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
  }, [config, shareId, ready]);

  const setConfig = useCallback<DraftContextValue['setConfig']>((next) => {
    dirty.current = true;
    setConfigState((prev) => (typeof next === 'function' ? next(prev) : next));
  }, []);

  const patch = useCallback((partial: Partial<BirthdayConfig>) => setConfig((prev) => ({ ...prev, ...partial })), [setConfig]);

  const setShareId = useCallback((id: string) => {
    dirty.current = true;
    setShareIdState(id);
  }, []);

  const reset = useCallback(() => {
    dirty.current = true;
    setShareIdState(undefined);
    setConfigState((prev) => ({ ...createDefaultConfig(), templateId: prev.templateId }));
  }, []);

  const value = useMemo(
    () => ({ config, ready, status, saveError, shareId, setConfig, patch, setShareId, reset }),
    [config, ready, status, saveError, shareId, setConfig, patch, setShareId, reset],
  );

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useDraft(): DraftContextValue {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error('useDraft must be used inside <DraftProvider>');
  return ctx;
}
