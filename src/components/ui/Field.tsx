import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface FieldShellProps {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string | null;
  counter?: string;
  children: ReactNode;
  className?: string;
}

function FieldShell({ id, label, hint, error, counter, children, className }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink-800">
          {label}
        </label>
        {counter && <span className="text-xs tabular-nums text-ink-500">{counter}</span>}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-rose-700" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const control =
  'w-full rounded-xl border border-ink-200 bg-white px-3.5 text-[15px] text-ink-900 placeholder:text-ink-400 shadow-[inset_0_1px_2px_rgb(0_0_0/0.04)] transition-[border-color,box-shadow] duration-200 hover:border-ink-300 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 aria-[invalid=true]:border-rose-400';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  showCount?: boolean;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, showCount, wrapperClassName, className, maxLength, value, ...rest },
  ref,
) {
  const id = useId();
  const length = typeof value === 'string' ? value.length : 0;
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      counter={showCount && maxLength ? `${length}/${maxLength}` : undefined}
      className={wrapperClassName}
    >
      <input
        ref={ref}
        id={id}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(control, 'h-11', className)}
        {...rest}
      />
    </FieldShell>
  );
});

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  showCount?: boolean;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, showCount, wrapperClassName, className, maxLength, value, rows = 4, ...rest },
  ref,
) {
  const id = useId();
  const length = typeof value === 'string' ? value.length : 0;
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      counter={showCount && maxLength ? `${length}/${maxLength}` : undefined}
      className={wrapperClassName}
    >
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(control, 'resize-y py-3 leading-relaxed', className)}
        {...rest}
      />
    </FieldShell>
  );
});

export function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-ink-800">
          {label}
        </label>
        {description && <p className="text-xs text-ink-500">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200',
          checked ? 'bg-brand' : 'bg-ink-300',
        )}
      >
        <span
          className={cn(
            'inline-block size-5 rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  );
}
