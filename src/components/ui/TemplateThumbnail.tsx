import { Suspense } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/utils/cn';

/**
 * A template's animated thumbnail, loaded only when it scrolls near the viewport.
 * Until then (and while its chunk downloads) it shows a flat swatch in the template's own colours,
 * so the grid never jumps.
 */
export function TemplateThumbnail({
  template,
  className,
}: {
  template: BirthdayTemplate;
  className?: string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>('400px');
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
  return (
    <div ref={ref} className={cn('relative h-full w-full', className)}>
      {inView ? (
        <Suspense fallback={swatch}>
          <template.Thumbnail />
        </Suspense>
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
