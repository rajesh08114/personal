import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useFocusTrap, useLockBodyScroll } from '@/hooks/useFocusTrap';
import { cn } from '@/utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  return createPortal(
    <AnimatePresence>{open && <ModalBody {...{ onClose, title, description, className }}>{children}</ModalBody>}</AnimatePresence>,
    document.body,
  );
}

function ModalBody({ onClose, title, description, children, className }: Omit<ModalProps, 'open'>) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onClose);
  useLockBodyScroll(true);
  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
    >
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 28, stiffness: 320 } }}
        exit={{ opacity: 0, y: 16, transition: { duration: 0.15 } }}
        className={cn(
          'relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-paper p-6 text-ink-900 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-8',
          className,
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="font-display text-2xl font-semibold tracking-tight">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-2 -mt-1 inline-flex size-10 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
