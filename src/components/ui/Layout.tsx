import type { HTMLAttributes, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8', className)} {...rest} />;
}

interface SectionProps extends HTMLAttributes<HTMLElement> {
  label?: string;
}

/** Semantic section with consistent vertical rhythm. */
export function Section({ className, label, children, ...rest }: SectionProps) {
  return (
    <section aria-label={label} className={cn('relative py-20 sm:py-28', className)} {...rest}>
      {children}
    </section>
  );
}

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-3xl border border-ink-200 bg-white p-5 shadow-sm sm:p-6', className)} {...rest} />;
}

export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <span role="status" className={cn('inline-flex items-center gap-2', className)}>
      <LoaderCircle className="size-5 animate-spin" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function LoadingScreen({ label = 'Preparing something special…', dark = true }: { label?: string; dark?: boolean }) {
  return (
    <div
      className={cn(
        'flex min-h-dvh flex-col items-center justify-center gap-5',
        dark ? 'bg-ink-950 text-ink-200' : 'bg-paper text-ink-600',
      )}
    >
      <div aria-hidden className={cn('relative h-px w-24 overflow-hidden', dark ? 'bg-white/15' : 'bg-ink-900/15')}>
        <span className={cn('absolute inset-y-0 left-0 w-1/3 animate-[loading-slide_1.4s_ease-in-out_infinite]', dark ? 'bg-ink-200' : 'bg-ink-700')} />
      </div>
      <p className="font-display text-lg italic" role="status">
        {label}
      </p>
    </div>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
  showLabels = false,
}: {
  showLabels?: boolean;
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string; icon?: ReactNode }>;
  label: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex rounded-xl bg-ink-100 p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          aria-label={o.label}
          title={o.label}
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-all duration-200',
            value === o.value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800',
          )}
        >
          {o.icon}
          <span className={showLabels ? undefined : 'max-sm:sr-only'}>{o.label}</span>
        </button>
      ))}
    </div>
  );
}
