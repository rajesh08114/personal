import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useFocusTrap, useLockBodyScroll } from '@/hooks/useFocusTrap';
import { PhotoSlot } from './PhotoSlot';
import { cn } from '@/utils/cn';

export interface LightboxItem {
  id: string;
  src?: string;
  title: string;
  caption?: string;
}

interface LightboxProps {
  items: LightboxItem[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
  /** Extra classes for the caption typography so it matches the template. */
  captionClassName?: string;
  className?: string;
}

/**
 * Fullscreen viewer with previous/next, keyboard (← → Esc), swipe and focus trapping.
 * Shared by every template's gallery; templates skin it through class names.
 */
export function Lightbox(props: LightboxProps) {
  return createPortal(
    <AnimatePresence>{props.index !== null && props.items[props.index] && <LightboxView {...props} index={props.index} />}</AnimatePresence>,
    document.body,
  );
}

function LightboxView({ items, index, onIndexChange, captionClassName, className }: LightboxProps & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => onIndexChange(null), [onIndexChange]);
  const go = useCallback(
    (dir: 1 | -1) => onIndexChange((index + dir + items.length) % items.length),
    [index, items.length, onIndexChange],
  );
  useFocusTrap(ref, true, close);
  useLockBodyScroll(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
  };

  const item = items[index];
  const multi = items.length > 1;

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${items.length}: ${item.title}`}
      className={cn('fixed inset-0 z-[95] flex flex-col bg-black/92 text-white backdrop-blur-md', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center justify-between gap-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <span className="text-sm tabular-nums text-white/70" aria-live="polite">
          {index + 1} / {items.length}
        </span>
        <button
          type="button"
          onClick={close}
          aria-label="Close photo viewer"
          className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-20">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={item.id + index}
            className="flex h-full w-full touch-pan-y items-center justify-center py-4"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            drag={multi ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={onDragEnd}
          >
            {item.src ? (
              <PhotoSlot
                src={item.src}
                alt={item.title}
                priority
                className="max-h-full max-w-full rounded-xl"
                imgClassName="!h-auto max-h-[72dvh] !w-auto max-w-full !object-contain"
              />
            ) : (
              <PhotoSlot alt={item.title} className="aspect-[4/5] h-[60dvh] max-w-full rounded-2xl" label="Upload memory" />
            )}
          </motion.div>
        </AnimatePresence>

        {multi && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-2 inline-flex size-12 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/25 max-sm:top-auto max-sm:bottom-2 sm:left-5"
            >
              <ChevronLeft className="size-6" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-2 inline-flex size-12 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/25 max-sm:top-auto max-sm:bottom-2 sm:right-5"
            >
              <ChevronRight className="size-6" aria-hidden />
            </button>
          </>
        )}
      </div>

      <div className="px-6 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center sm:pb-8">
        <p className={cn('text-lg font-semibold', captionClassName)}>{item.title}</p>
        {item.caption && <p className={cn('mx-auto mt-1 max-w-xl text-sm text-white/70', captionClassName)}>{item.caption}</p>}
      </div>
    </motion.div>
  );
}
