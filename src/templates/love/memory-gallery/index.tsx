import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useSpring, type PanInfo } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useExperience } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories } from '@/components/experience/content';
import { useFinePointer } from '@/hooks/useMediaQuery';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';

const serif = 'font-t-display';
const label = 'text-[0.65rem] tracking-[0.4em] uppercase';

export default function MemoryGallery() {
  const { opened } = useExperience();
  return (
    <div className="film-grain relative min-h-dvh bg-black text-[#e8e2d6]">
      <AnimatePresence>{!opened && <Entrance key="e" />}</AnimatePresence>
      {opened && (
        <main>
          <Exhibit />
          <CuratorNote />
          <Collage />
        </main>
      )}
    </div>
  );
}

function Entrance() {
  const { config, open } = useExperience();
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black px-6 text-center" exit={{ opacity: 0, transition: { duration: 1.2 } }}>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6 }} className={`${label} text-[#c9a96e]`}>
        A private exhibition
      </motion.p>
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1.6, ease: EASE.out }} className={`${serif} mt-6 max-w-3xl text-4xl leading-tight sm:text-6xl`}>
        {config.messages.intro.trim() || 'A collection of moments I never want to forget.'}
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="mt-6 text-white/55">
        Curated for <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /> by <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
      </motion.p>
      <motion.button
        type="button"
        onClick={open}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4 }}
        className={`${label} group mt-16 inline-flex h-12 items-center gap-4 border-b border-white/30 pb-1 transition-colors hover:border-white`}
      >
        Enter the gallery <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
      </motion.button>
    </motion.div>
  );
}

function Exhibit() {
  const { config, reducedMotion } = useExperience();
  const works = getMemories(config);
  const fine = useFinePointer();
  const [i, setI] = useState(0);
  const [flash, setFlash] = useState(0);
  const turbulence = useRef<SVGFEDisplacementMapElement>(null);
  const distort = useMotionValue(0);
  const px = useSpring(useMotionValue(0), { stiffness: 50, damping: 18 });
  const py = useSpring(useMotionValue(0), { stiffness: 50, damping: 18 });

  useEffect(() => distort.on('change', (v) => turbulence.current?.setAttribute('scale', String(v))), [distort]);

  const go = useCallback(
    (dir: 1 | -1) => {
      setI((v) => (v + dir + works.length) % works.length);
      setFlash((f) => f + 1);
      if (!reducedMotion) animate(distort, [0, 70, 0], { duration: 1.1, ease: 'easeInOut' });
    },
    [works.length, distort, reducedMotion],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const w = works[i];
  return (
    <section
      aria-roledescription="gallery"
      aria-label="The exhibition"
      className="relative flex min-h-dvh flex-col px-4 pt-16 pb-8 sm:px-10"
      onPointerMove={(e) => {
        if (!fine) return;
        px.set((e.clientX / window.innerWidth - 0.5) * -24);
        py.set((e.clientY / window.innerHeight - 0.5) * -16);
      }}
    >
      <svg aria-hidden className="absolute size-0">
        <filter id="mg-distort">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves={2} seed={3} />
          <feDisplacementMap ref={turbulence} in="SourceGraphic" scale={0} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="flex items-baseline justify-between">
        <p className={label}>The exhibition</p>
        <p className={`${label} tabular-nums text-[#c9a96e]`} aria-live="polite">
          {String(i + 1).padStart(2, '0')} / {String(works.length).padStart(2, '0')}
        </p>
      </div>
      <div className="relative mt-6 flex flex-1 items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={w.id}
            className="relative h-[62dvh] w-full max-w-5xl overflow-hidden"
            style={{ filter: 'url(#mg-distort)' }}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: EASE.out }}
            drag={works.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={(_: unknown, info: PanInfo) => {
              if (info.offset.x < -60) go(1);
              else if (info.offset.x > 60) go(-1);
            }}
          >
            <motion.div className="h-full w-full" style={{ x: px, y: py, scale: 1.08 }}>
              <motion.div className="h-full w-full" initial={{ scale: 1 }} animate={{ scale: reducedMotion ? 1 : 1.12 }} transition={{ duration: 14, ease: 'linear' }}>
                <PhotoSlot src={w.image} alt={w.titleText} label={w.slotLabel} priority className="h-full w-full" imgClassName="saturate-[0.9]" />
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {flash > 0 && <motion.span key={flash} aria-hidden className="pointer-events-none absolute inset-0 bg-white" initial={{ opacity: 0.55 }} animate={{ opacity: 0 }} transition={{ duration: 0.45 }} />}
        </AnimatePresence>
      </div>
      <div className="mx-auto mt-6 grid w-full max-w-5xl gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
        <AnimatePresence mode="wait">
          <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="border-l border-[#c9a96e] pl-5">
            <p className={`${label} text-[#c9a96e]`}>No. {String(i + 1).padStart(2, '0')}</p>
            <h2 className={`${serif} mt-2 text-3xl sm:text-4xl`}>{w.titleText}</h2>
            <dl className="mt-3 grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-1 text-sm text-white/70">
              <dt className={`${label} self-center text-white/40`}>Date</dt>
              <dd>{w.date ?? '—'}</dd>
              <dt className={`${label} self-center text-white/40`}>Place</dt>
              <dd>{w.place ?? '—'}</dd>
              <dt className={`${label} self-center text-white/40`}>Memory</dt>
              <dd className="italic">{w.captionText}</dd>
            </dl>
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-2">
          <button type="button" onClick={() => go(-1)} aria-label="Previous photograph" className="inline-flex size-12 items-center justify-center border border-white/25 transition-colors hover:bg-white hover:text-black">
            <ArrowLeft className="size-5" aria-hidden />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next photograph" className="inline-flex size-12 items-center justify-center border border-white/25 transition-colors hover:bg-white hover:text-black">
            <ArrowRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}

function CuratorNote() {
  const { config } = useExperience();
  return (
    <section aria-labelledby="mg-note" className="flex min-h-[80dvh] items-center justify-center px-6 py-24">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 1.8 }} className="mx-auto max-w-2xl">
        <p className={`${label} text-[#c9a96e]`}>Curator’s note</p>
        <h2 id="mg-note" className="sr-only">
          Curator’s note
        </h2>
        <Paragraphs value={config.messages.main} placeholder={PLACEHOLDER.message} className={`${serif} mt-8 space-y-8 text-2xl leading-relaxed sm:text-3xl`} />
        <p className={`${label} mt-12 text-white/50`}>
          — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
        </p>
      </motion.div>
    </section>
  );
}

function Collage() {
  const { config, restart } = useExperience();
  const works = getMemories(config);
  const tiles = [...works, ...works].slice(0, Math.max(9, works.length));
  return (
    <section aria-labelledby="mg-final" className="relative overflow-hidden px-3 pt-20 pb-28">
      <div className="mx-auto grid max-w-6xl auto-rows-[7rem] grid-cols-3 gap-2 sm:auto-rows-[11rem] sm:grid-cols-4">
        {tiles.map((t, k) => (
          <motion.div
            key={`${t.id}-${k}`}
            className={k % 7 === 0 ? 'col-span-2 row-span-2' : k % 5 === 3 ? 'row-span-2' : ''}
            initial={{ opacity: 0, scale: 0.6, rotate: (k % 2 ? 1 : -1) * 6 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.2, delay: (k % 6) * 0.08, ease: EASE.out }}
          >
            <PhotoSlot src={t.image} alt={t.titleText} label="Photo" className="h-full w-full" imgClassName="grayscale-[0.25]" />
          </motion.div>
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(0_0_0/0.25),rgb(0_0_0/0.85)_75%)]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 1.8, delay: 0.8 }} className={`${serif} max-w-3xl text-3xl leading-tight sm:text-6xl`}>
          “My favorite place is wherever I am with you.”
        </motion.p>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 2.2, duration: 1.4 }} className="mt-8">
          <h2 id="mg-final" className={`${label} text-[#c9a96e]`}>
            Happy birthday, <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/75">
            <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
          </p>
          <button type="button" onClick={restart} className={`${label} mt-8 h-11 text-white/50 hover:text-white`}>
            Walk the gallery again
          </button>
        </motion.div>
      </div>
    </section>
  );
}
