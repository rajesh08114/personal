import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { CakeSlice } from 'lucide-react';
import { useExperience } from '@/components/experience/ExperienceContext';
import { getTimeline } from '@/components/experience/content';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { TextReveal } from '@/components/experience/Motion';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';

export function MemoryTimeline() {
  const { config } = useExperience();
  const items = getTimeline(config);
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });

  return (
    <section aria-labelledby="aurora-timeline-title" className="relative px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <TextReveal
          id="aurora-timeline-title"
          as="h2"
          text="Our little story…"
          className="text-center font-display text-4xl font-light text-white italic sm:text-6xl"
        />
        <ol ref={ref} className="relative mt-16">
          <div aria-hidden className="absolute top-0 bottom-0 left-5 w-px bg-white/10 md:left-1/2" />
          <motion.div
            aria-hidden
            style={{ scaleY: progress }}
            className="absolute top-0 bottom-0 left-5 w-px origin-top bg-gradient-to-b from-[var(--bd-accent)] via-[var(--bd-primary)] to-[var(--bd-secondary)] md:left-1/2"
          />
          {items.map((item, i) => {
            const left = i % 2 === 0;
            const isLast = i === items.length - 1;
            return (
              <li key={item.id} className="relative mb-14 pl-14 last:mb-0 md:grid md:grid-cols-2 md:gap-16 md:pl-0">
                <motion.span
                  aria-hidden
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="absolute top-6 left-5 z-10 size-4 -translate-x-1/2 rounded-full bg-[var(--bd-accent)] shadow-[0_0_0_6px_rgb(var(--bd-accent-rgb)/0.18),0_0_24px_rgb(var(--bd-accent-rgb)/0.8)] md:left-1/2"
                />
                <motion.div
                  initial={{ opacity: 0, x: left ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.9, ease: EASE.out }}
                  className={cn('glass overflow-hidden rounded-3xl', left ? 'md:col-start-1' : 'md:col-start-2')}
                >
                  {isLast && !item.image ? (
                    <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-[rgb(var(--bd-primary-rgb)/0.35)] to-[rgb(var(--bd-secondary-rgb)/0.35)]">
                      <CakeSlice className="size-16 text-white/90" aria-hidden />
                    </div>
                  ) : (
                    <PhotoSlot src={item.image} alt={item.titleText} label="Add a photo" className="aspect-[16/9] w-full" />
                  )}
                  <div className="p-6">
                    <p className="text-xs font-bold tracking-[0.25em] text-[var(--bd-accent)] uppercase">
                      Chapter {String(i + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-2 font-display text-2xl text-white">{item.titleText}</h3>
                    <p className="mt-2 text-white/70">{item.captionText}</p>
                  </div>
                </motion.div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
