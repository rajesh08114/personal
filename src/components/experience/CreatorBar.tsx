'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, LayoutGrid, Pencil, X } from 'lucide-react';

interface CreatorBarProps {
  label: string;
  children?: ReactNode;
  backTo?: { to: string; label: string };
}

/**
 * Discreet floating bar shown to the creator (never on shared links).
 * Can be dismissed so they can experience the page exactly as the recipient will.
 */
export function CreatorBar({ label, children, backTo }: CreatorBarProps) {
  const [hidden, setHidden] = useState(false);
  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="fixed top-[max(0.75rem,env(safe-area-inset-top))] left-1/2 z-[85] flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-black/55 p-1 pl-2 text-sm text-white shadow-2xl backdrop-blur-xl"
        >
          {backTo && (
            <Link
              href={backTo.to}
              className="inline-flex h-9 items-center gap-1 rounded-full px-2.5 font-semibold text-white/85 hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft className="size-4" aria-hidden />
              <span className="max-sm:sr-only">{backTo.label}</span>
            </Link>
          )}
          <span className="truncate px-2 text-xs font-semibold tracking-wide text-white/60 uppercase max-sm:hidden">{label}</span>
          {children}
          <button
            type="button"
            onClick={() => setHidden(true)}
            aria-label="Hide creator toolbar"
            className="inline-flex size-9 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" aria-hidden />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CreatorLink({ to, icon, children, primary }: { to: string; icon?: 'edit' | 'grid'; children: ReactNode; primary?: boolean }) {
  const Icon = icon === 'grid' ? LayoutGrid : Pencil;
  return (
    <Link
      href={to}
      className={
        primary
          ? 'inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3.5 font-semibold text-ink-900 hover:bg-white/90'
          : 'inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-semibold text-white/85 hover:bg-white/10 hover:text-white'
      }
    >
      {icon && <Icon className="size-4" aria-hidden />}
      {children}
    </Link>
  );
}
