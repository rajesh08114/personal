import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { useBirthdayText, useExperience } from '@/components/experience/ExperienceContext';
import { Fill, splitParagraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, getTimeline } from '@/components/experience/content';
import { PLACEHOLDER } from '@/data/placeholders';
import { cn } from '@/utils/cn';

const tenor = 'font-t-display';

interface SceneData {
  slate: string;
  image?: string;
  alt: string;
  line: string;
  meta?: string;
}

function useScenes(): SceneData[] {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  const t = getTimeline(config);
  const m = getMemories(config);
  const paras = splitParagraphs(config.messages.main);
  const meta = (x?: { date?: string; place?: string }) => [x?.date, x?.place].filter(Boolean).join(' · ') || undefined;
  return [
    { slate: 'The Day We Met', image: t[0]?.image, alt: t[0]?.titleText ?? 'The day we met', line: t[0]?.captionText ?? PLACEHOLDER.timelineCaption, meta: meta(t[0]) },
    { slate: 'The Day I Realized', image: m[3]?.image ?? m[0]?.image, alt: m[3]?.titleText ?? 'The day I realized', line: paras[0] ?? PLACEHOLDER.message, meta: meta(m[3]) },
    { slate: 'Every Day Since', image: m[1]?.image, alt: m[1]?.titleText ?? 'Every day since', line: paras[1] ?? m[1]?.captionText ?? PLACEHOLDER.memoryCaption, meta: meta(m[1]) },
    { slate: 'Today', image: config.heroImage, alt: `${name}, today`, line: paras[2] ?? config.messages.final, meta: undefined },
  ];
}

export default function ForeverLetterbox() {
  const { opened } = useExperience();
  return (
    <div className="film-grain relative min-h-dvh bg-black text-[#f1e6d2]">
      <AnimatePresence>{!opened && <ColdOpen key="c" />}</AnimatePresence>
      {opened && <Film />}
    </div>
  );
}

function ColdOpen() {
  const { config, open } = useExperience();
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black px-4" exit={{ opacity: 0, transition: { duration: 1.4 } }}>
      <div className="relative flex aspect-[2.39/1] w-full max-w-6xl flex-col items-center justify-center bg-[#050505] text-center ring-1 ring-white/5">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.4 }} className={`${tenor} text-xs tracking-[0.5em] text-[#f1e6d2]/60 sm:text-sm`}>
          {config.messages.intro.trim() || 'A FILM IN FOUR SCENES'}
        </motion.p>
        <motion.h1 initial={{ opacity: 0, letterSpacing: '0.6em' }} animate={{ opacity: 1, letterSpacing: '0.25em' }} transition={{ delay: 1, duration: 2.6 }} className={`${tenor} mt-4 text-2xl sm:text-5xl`}>
          <Fill value={config.birthdayPerson.toUpperCase()} placeholder={PLACEHOLDER.name} /> & <Fill value={config.senderName.toUpperCase()} placeholder={PLACEHOLDER.sender} />
        </motion.h1>
        <motion.button type="button" onClick={open} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} className={`${tenor} mt-8 h-11 border-b border-[#f1e6d2]/40 px-1 text-xs tracking-[0.5em] hover:border-[#f1e6d2] sm:mt-12`}>
          ROLL CAMERA
        </motion.button>
      </div>
    </motion.div>
  );
}

function Film() {
  const { reducedMotion, restart } = useExperience();
  const scenes = useScenes();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const total = scenes.length + 1; // + the closing card
  const [idx, setIdx] = useState(0);
  const [local, setLocal] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const pos = Math.min(total - 0.0001, v * total);
    setIdx(Math.floor(pos));
    setLocal(pos - Math.floor(pos));
  });
  const pan = useTransform(scrollYProgress, (v) => {
    const pos = v * total;
    return `${(pos - Math.floor(pos) - 0.5) * -8}%`;
  });

  const dip = local < 0.12 ? local / 0.12 : local > 0.88 ? (1 - local) / 0.12 : 1;
  const textOn = local > 0.22 && local < 0.84;
  const closing = idx >= scenes.length;

  if (reducedMotion) {
    return (
      <main className="space-y-16 px-4 py-16">
        {scenes.map((s, i) => (
          <figure key={i} className="mx-auto max-w-6xl">
            <PhotoSlot src={s.image} alt={s.alt} label="Add a photo" className="aspect-[2.39/1] w-full" />
            <figcaption className="mt-4 text-center">
              <span className={`${tenor} text-xs tracking-[0.4em]`}>SCENE {String(i + 1).padStart(2, '0')} — {s.slate.toUpperCase()}</span>
              <p className="mt-2 text-xl italic">{s.line}</p>
            </figcaption>
          </figure>
        ))}
        <Closing />
      </main>
    );
  }

  return (
    <main>
      <div ref={ref} style={{ height: `${total * 120}vh` }} className="relative">
        <div className="sticky top-0 flex h-dvh items-center justify-center overflow-hidden px-0">
          <div className="relative aspect-[3/4] max-h-[86dvh] w-full overflow-hidden bg-[#050505] sm:aspect-[2.39/1] sm:max-h-none sm:max-w-[min(100vw,calc(100dvh*2.39))]">
            <AnimatePresence initial={false}>
              {!closing && (
                <motion.div key={idx} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <motion.div className="absolute inset-[-6%]" style={{ x: pan }}>
                    <PhotoSlot src={scenes[idx].image} alt={scenes[idx].alt} label="Add a scene photo" className="h-full w-full" imgClassName="brightness-[0.75] saturate-[0.85]" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-150" style={{ opacity: closing ? 0.92 : 1 - dip }} />
            {!closing && (
              <>
                <p className={cn(`${tenor} absolute top-[6%] left-[4%] text-[0.6rem] tracking-[0.45em] transition-opacity duration-700 sm:text-sm`, textOn ? 'opacity-90' : 'opacity-0')}>
                  SCENE {String(idx + 1).padStart(2, '0')} — {scenes[idx].slate.toUpperCase()}
                </p>
                <div className={cn('absolute inset-x-[8%] bottom-[8%] text-center transition-all duration-700', textOn ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0')} aria-live="polite">
                  <p className="text-base leading-snug italic drop-shadow-[0_2px_8px_black] sm:text-2xl">{scenes[idx].line}</p>
                  {scenes[idx].meta && <p className={`${tenor} mt-2 text-[0.55rem] tracking-[0.4em] text-[#f1e6d2]/70 sm:text-xs`}>{scenes[idx].meta?.toUpperCase()}</p>}
                </div>
              </>
            )}
            {closing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className={`${tenor} text-sm tracking-[0.5em] sm:text-2xl`}>To be continued…</p>
              </motion.div>
            )}
          </div>
          <p className={`${tenor} absolute bottom-[3%] left-1/2 -translate-x-1/2 text-[0.6rem] tracking-[0.4em] text-white/40`}>
            {closing ? 'FIN' : `${String(idx + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')} · SCROLL`}
          </p>
        </div>
      </div>
      <Closing />
      <div className="pb-20 text-center">
        <button type="button" onClick={restart} className={`${tenor} h-11 text-xs tracking-[0.4em] text-white/40 hover:text-white`}>
          WATCH AGAIN
        </button>
      </div>
    </main>
  );
}

function Closing() {
  const { config } = useExperience();
  return (
    <section aria-labelledby="fl-final" className="flex min-h-[80dvh] flex-col items-center justify-center px-6 text-center">
      <motion.h2 id="fl-final" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.8 }} transition={{ duration: 2.4 }} className="text-4xl font-light italic sm:text-6xl">
        Happy Birthday, My Love.
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.2, duration: 2 }} className="mt-8 max-w-xl text-lg text-[#f1e6d2]/70">
        <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
      </motion.p>
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 2, duration: 2 }} className={`${tenor} mt-8 text-xs tracking-[0.5em] text-[var(--bd-accent)]`}>
        — <Fill value={config.senderName.toUpperCase()} placeholder={PLACEHOLDER.sender} />
      </motion.p>
    </section>
  );
}
