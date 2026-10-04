import { useId, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, CircleCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EditorSectionProps {
  id: string;
  step: number;
  title: string;
  summary: string;
  complete?: boolean;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/** Accordion step in the builder. */
export function EditorSection({ id, step, title, summary, complete, open, onToggle, children }: EditorSectionProps) {
  const panelId = useId();
  return (
    <section id={`editor-${id}`} className="rounded-3xl border border-ink-200 bg-white shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center gap-4 rounded-3xl px-5 py-4 text-left transition-colors hover:bg-ink-100/40"
        >
          <span
            className={cn(
              'inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
              complete ? 'bg-emerald-100 text-emerald-700' : 'bg-ink-100 text-ink-600',
            )}
          >
            {complete ? <CircleCheck className="size-4.5" aria-label="Complete" /> : step}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-semibold text-ink-900">{title}</span>
            <span className="block truncate text-xs text-ink-500">{summary}</span>
          </span>
          <ChevronDown className={cn('size-5 shrink-0 text-ink-400 transition-transform duration-300', open && 'rotate-180')} aria-hidden />
        </button>
      </h2>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-ink-100 px-5 pt-5 pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** Small clickable suggestion chips used under text fields. */
export function Suggestions({ items, onPick, label = 'Suggestions' }: { items: string[]; onPick: (v: string) => void; label?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={label}>
      {items.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="max-w-full truncate rounded-full border border-ink-200 bg-paper px-3 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:border-brand/40 hover:bg-brand-soft hover:text-brand-600"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
