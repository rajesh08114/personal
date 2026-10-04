import { useState, type ReactNode } from 'react';
import { ImageOff, ImagePlus } from 'lucide-react';
import type { PhotoFraming } from '@/types/birthday';
import { cn } from '@/utils/cn';
import { framingStyle, useFraming } from './photoFraming';

interface PhotoSlotProps {
  src?: string;
  alt: string;
  /** Text shown when no photo has been uploaded yet. */
  label?: string;
  sublabel?: string;
  className?: string;
  imgClassName?: string;
  /** Visual style of the empty state. */
  tone?: 'dark' | 'light';
  priority?: boolean;
  icon?: ReactNode;
  /**
   * Framing to apply. Defaults to the creator's saved framing for this photo
   * (looked up by src); pass `false` to show the photo untouched (e.g. a lightbox).
   */
  framing?: PhotoFraming | false;
}

/**
 * Lazy-loaded photo with a soft fade-in, an attractive "upload a photo" placeholder
 * and a graceful fallback if the image fails to load. Never shows a broken image.
 */
export function PhotoSlot({
  src,
  alt,
  label = 'Upload a photo here',
  sublabel,
  className,
  imgClassName,
  tone = 'dark',
  priority = false,
  icon,
  framing,
}: PhotoSlotProps) {
  const saved = useFraming(src);
  const applied = framing === false ? undefined : (framing ?? saved);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = Boolean(src) && failedSrc === src;
  const loaded = Boolean(src) && loadedSrc === src;
  const dark = tone === 'dark';

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={failed ? `${alt} (image unavailable)` : `${label} — placeholder`}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2 overflow-hidden p-4 text-center',
          dark
            ? 'bg-[linear-gradient(135deg,rgb(255_255_255/0.08),rgb(255_255_255/0.02))] text-white/75'
            : 'bg-[linear-gradient(135deg,rgb(0_0_0/0.05),rgb(0_0_0/0.02))] text-black/55',
          className,
        )}
      >
        <div
          className={cn(
            'pointer-events-none absolute inset-2 rounded-[inherit] border border-dashed',
            dark ? 'border-white/25' : 'border-black/20',
          )}
        />
        {icon ??
          (failed ? (
            <ImageOff className="size-6 opacity-70" aria-hidden />
          ) : (
            <ImagePlus className="size-6 opacity-70" aria-hidden />
          ))}
        <span className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase">
          {failed ? 'Photo unavailable' : label}
        </span>
        {sublabel && !failed && <span className="text-[0.7rem] opacity-70">{sublabel}</span>}
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {!loaded && (
        <div
          aria-hidden
          className={cn(
            'absolute inset-0 animate-shimmer bg-[length:200%_100%]',
            dark
              ? 'bg-[linear-gradient(90deg,rgb(255_255_255/0.04),rgb(255_255_255/0.12),rgb(255_255_255/0.04))]'
              : 'bg-[linear-gradient(90deg,rgb(0_0_0/0.04),rgb(0_0_0/0.09),rgb(0_0_0/0.04))]',
          )}
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onLoad={() => setLoadedSrc(src)}
        onError={() => setFailedSrc(src)}
        style={framingStyle(applied)}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-700',
          loaded ? 'opacity-100' : 'opacity-0',
          imgClassName,
        )}
      />
    </div>
  );
}
