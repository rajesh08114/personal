import { useState } from 'react';
import { Expand } from 'lucide-react';
import { useExperience } from '@/components/experience/ExperienceContext';
import { getMemories, toLightboxItems } from '@/components/experience/content';
import { Lightbox } from '@/components/experience/Lightbox';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Reveal, TextReveal } from '@/components/experience/Motion';
import { TiltCard } from '@/components/effects/Interactive';
import { cn } from '@/utils/cn';

const ASPECTS = ['aspect-[4/5]', 'aspect-square', 'aspect-[3/4]', 'aspect-[4/3]', 'aspect-[4/5]', 'aspect-[5/6]'];

export function PhotoGallery() {
  const { config } = useExperience();
  const memories = getMemories(config);
  const [index, setIndex] = useState<number | null>(null);

  return (
    <section aria-labelledby="aurora-gallery-title" className="relative px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-xs font-bold tracking-[0.3em] text-[var(--bd-accent)] uppercase">The memories</p>
        <TextReveal
          id="aurora-gallery-title"
          as="h2"
          text="Some moments worth remembering…"
          className="mt-3 text-center font-display text-4xl font-light text-white italic sm:text-6xl"
        />
        <ul className="mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>li]:mb-5">
          {memories.map((m, i) => (
            <Reveal as="li" key={m.id} kind="up" delay={(i % 3) * 0.08} className="break-inside-avoid">
              <TiltCard className="rounded-3xl" max={7}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Open memory: ${m.titleText}`}
                  className="group relative block w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-left shadow-[0_20px_50px_-20px_rgb(0_0_0/0.6)] transition-shadow duration-500 hover:shadow-[0_30px_70px_-20px_rgb(var(--bd-primary-rgb)/0.55)]"
                >
                  <PhotoSlot
                    src={m.image}
                    alt={m.titleText}
                    label={m.slotLabel}
                    className={cn('w-full', ASPECTS[i % ASPECTS.length])}
                    imgClassName="transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 pt-16 opacity-90 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="font-display text-xl text-white">{m.titleText}</p>
                    <p className="mt-1 max-h-0 overflow-hidden text-sm text-white/75 transition-all duration-500 group-hover:max-h-20 group-focus-visible:max-h-20">
                      {m.captionText}
                    </p>
                  </div>
                  <span className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                    <Expand className="size-4" aria-hidden />
                  </span>
                </button>
              </TiltCard>
            </Reveal>
          ))}
        </ul>
      </div>
      <Lightbox items={toLightboxItems(memories)} index={index} onIndexChange={setIndex} captionClassName="font-display" />
    </section>
  );
}
