import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'brand' | 'secondary' | 'ghost' | 'glass' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-ink-900 text-white hover:bg-ink-700 shadow-sm',
  brand: 'bg-brand text-white hover:bg-brand-600 shadow-[0_8px_24px_-8px_rgb(184_58_100/0.6)]',
  secondary: 'bg-white text-ink-900 border border-ink-200 hover:border-ink-300 hover:bg-ink-100/60',
  ghost: 'text-ink-700 hover:bg-ink-100 hover:text-ink-900',
  glass: 'glass text-white hover:bg-white/15',
  danger: 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-13 px-7 text-base gap-2.5 rounded-2xl',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
});

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = 'ghost', size = 'md', className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl transition-colors duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        size === 'sm' ? 'size-9' : 'size-11',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
