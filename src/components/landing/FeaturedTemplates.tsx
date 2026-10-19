'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TEMPLATES } from '@/templates/registry';
import { prefetchTemplate, TemplateThumbnail } from '@/components/ui/TemplateThumbnail';

const FEATURED = ['birthday-edition', 'starry-night', 'time-capsule', 'cinematic-film', 'polaroid-memories', 'love-letter'];

/** A taste of the catalogue, straight from the registry: the live thumbnails people will actually get. */
export function FeaturedTemplates() {
  const picks = FEATURED.map((id) => TEMPLATES.find((t) => t.id === id)).filter((t) => !!t);
  return (
    <section aria-labelledby="featured" className="border-t border-[#24201b]/20 py-16 sm:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-[#8a7f70] uppercase">The catalogue</p>
          <h2 id="featured" className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
            {TEMPLATES.length} ways to say it.
          </h2>
        </div>
        <Link href="/templates" className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-4">
          See all {TEMPLATES.length} <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {picks.map((t) => (
          <li key={t.id}>
            <Link
              href={`/templates/${t.id}`}
              onPointerEnter={() => prefetchTemplate(t)}
              onFocus={() => prefetchTemplate(t)}
              className="group block"
              aria-label={`Preview ${t.name}`}
            >
              <span className="relative block aspect-[16/11] overflow-hidden rounded-sm bg-[#e4dccd]">
                <TemplateThumbnail template={t} />
              </span>
              <span className="mt-3 block border-t border-[#24201b]/20 pt-3 font-display text-xl leading-tight group-hover:underline">{t.name}</span>
              <span className="mt-1 block text-sm text-[#5b5348]">{t.tagline}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
