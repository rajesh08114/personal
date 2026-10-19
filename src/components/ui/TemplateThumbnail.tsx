'use client';

import { Suspense, useState } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/utils/cn';

/**
 * A template's preview card image, loaded when near viewport.
 * Displays the dedicated .webp preview artwork with smooth loading and
 * hover animation, falling back to the animated component if needed.
 */
export function TemplateThumbnail({
  template,
  className,
}: {
  template: BirthdayTemplate;
  className?: string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>('400px');
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const swatch = (
    <div
      aria-hidden
      className="h-full w-full"
      style={{
        background: template.tone === 'dark' ? template.palette.secondary : template.palette.accent,
        opacity: 0.35,
      }}
    />
  );

  const previewSrc = template.previewImage || `/templates/${template.id}.webp`;

  return (
    <div ref={ref} className={cn('relative h-full w-full overflow-hidden bg-[#e4dccd]', className)}>
      {inView ? (
        !imageError ? (
          <>
            {!imageLoaded && swatch}
            <img
              src={previewSrc}
              alt={template.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={cn(
                'h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105',
                imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0',
              )}
            />
          </>
        ) : (
          <Suspense fallback={swatch}>
            <template.Thumbnail />
          </Suspense>
        )
      ) : (
        swatch
      )}
    </div>
  );
}

/** Starts downloading a template's experience chunk ahead of a likely click (hover, focus, touch). */
export function prefetchTemplate(template: BirthdayTemplate): void {
  void template.load().catch(() => undefined);
}
