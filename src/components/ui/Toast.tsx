import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CircleCheck, TriangleAlert, X } from 'lucide-react';
import { createId } from '@/utils/id';

type ToastTone = 'success' | 'error' | 'info';
interface ToastItem {
  id: string;
  tone: ToastTone;
  message: string;
}

const ToastContext = createContext<((message: string, tone?: ToastTone) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const dismiss = useCallback((id: string) => setItems((list) => list.filter((t) => t.id !== id)), []);
  const push = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = createId(6);
      setItems((list) => [...list.slice(-2), { id, tone, message }]);
      window.setTimeout(() => dismiss(id), tone === 'error' ? 6500 : 3500);
    },
    [dismiss],
  );
  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
              className="pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl border border-white/10 bg-ink-900/95 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur"
            >
              {t.tone === 'error' ? (
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-rose-300" aria-hidden />
              ) : (
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden />
              )}
              <p className="flex-1 leading-snug">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="-m-1 rounded-full p-1 text-white/60 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
                aria-label="Dismiss notification"
              >
                <X className="size-4" aria-hidden />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
