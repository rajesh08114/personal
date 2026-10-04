import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { Aperture, Camera, RotateCw } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, splitParagraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, getTimeline } from '@/components/experience/content';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';

const display = 'font-t-display uppercase';
type Frame = { id: string; kind: 'photo' | 'text' | 'final'; src?: string; title: string; caption: string; label?: string };

export default function FilmRoll() {
  const { opened } = useExperience();
  const [flash, setFlash] = useState(0);
  return (
    <div className="relative min-h-dvh bg-[#0f0d0c] text-[#efe7dc]">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_85%_10%,rgb(var(--bd-primary-rgb)/0.22),transparent_50%)]" />
      <AnimatePresence>{!opened && <LoadFilm key="load" />}</AnimatePresence>
      {opened && (
        <>
          <Viewfinder />
          <main className="relative z-10">
            <Hero />
            <Strip onShot={() => setFlash((f) => f + 1)} />
            <FinalPrint />
          </main>
        </>
      )}
      <AnimatePresence>
        {flash > 0 && (
          <motion.div key={flash} aria-hidden className="pointer-events-none fixed inset-0 z-[90] bg-white" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadFilm() {
  const { config, open } = useExperience();
  const [firing, setFiring] = useState(false);
  const fire = () => {
    setFiring(true);
    window.setTimeout(open, 900);
  };
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f0d0c] px-6 text-center" exit={{ opacity: 0, transition: { duration: 0.3 } }}>
      <p className="text-xs tracking-[0.4em] text-[#ff6b5e]">● {config.messages.intro.trim() || 'ONE ROLL. EVERY MEMORY.'}</p>
      <motion.button
        type="button"
        onClick={fire}
        disabled={firing}
        aria-label="Load the film and take the first shot"
        whileHover={{ scale: 1.05 }}
        className="relative mt-10 flex size-40 items-center justify-center overflow-hidden rounded-full border-[6px] border-[#2b2521] bg-[#1b1714] shadow-[inset_0_0_30px_black] sm:size-52"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute top-1/2 left-1/2 h-[60%] w-[60%] origin-top-left bg-[#3a322c]"
            style={{ rotate: i * 60, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
            animate={firing ? { x: ['0%', '-48%', '0%'], y: ['0%', '-48%', '0%'] } : { x: '0%', y: '0%' }}
            transition={{ duration: 0.6, times: [0, 0.5, 1] }}
          />
        ))}
        <Aperture className="relative size-10 text-[#efe7dc]/70" aria-hidden />
      </motion.button>
      <p className={`${display} mt-10 text-2xl tracking-wide`}>Load the film</p>
      <p className="mt-2 text-sm text-[#efe7dc]/50">Tap the lens</p>
      <AnimatePresence>{firing && <motion.div className="fixed inset-0 bg-white" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.7, delay: 0.3 }} />}</AnimatePresence>
    </motion.div>
  );
}

function Viewfinder() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-3 z-40 text-[0.65rem] tracking-[0.2em] text-[#efe7dc]/60 sm:inset-6">
      {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2', 'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map((c) => (
        <span key={c} className={cn('absolute size-6 border-[#efe7dc]/50', c)} />
      ))}
      <span className="absolute top-2 left-9 max-sm:hidden">ISO 400 · f/2.8 · 1/125</span>
      <span className="absolute right-9 bottom-2 text-[#ff6b5e]">● REC</span>
    </div>
  );
}

function Hero() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  return (
    <section aria-label="Happy birthday" className="flex min-h-dvh flex-col items-center justify-center px-6 py-20 text-center">
      <motion.div
        initial={{ filter: 'invert(1) hue-rotate(180deg) sepia(0.6) blur(4px)', opacity: 0.4 }}
        animate={{ filter: 'invert(0) hue-rotate(0deg) sepia(0) blur(0px)', opacity: 1 }}
        transition={{ duration: 3.2, ease: 'easeInOut', delay: 0.4 }}
        className="w-[min(80vw,24rem)] bg-[#f5efe6] p-3 pb-14 shadow-2xl"
      >
        <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add your hero photo" tone="light" priority className="aspect-square w-full" />
      </motion.div>
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4, duration: 1 }} className={`${display} mt-10 text-4xl leading-none sm:text-6xl`}>
        Happy Birthday,
        <br />
        <span className="text-[var(--bd-accent)]">
          <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
        </span>
      </motion.h1>
      <p className="mt-6 text-sm text-[#efe7dc]/60">Scroll to advance the roll →</p>
    </section>
  );
}

function FrameCard({ frame, active, index, total }: { frame: Frame; active: boolean; index: number; total: number }) {
  return (
    <figure className="relative w-[78vw] shrink-0 bg-[#1b1714] px-3 py-7 sm:w-[30rem]">
      <div className="absolute inset-x-2 top-1.5 flex justify-between" aria-hidden>
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="h-3 w-4 rounded-[2px] bg-[#0f0d0c]" />
        ))}
      </div>
      <div className="absolute inset-x-2 bottom-1.5 flex justify-between" aria-hidden>
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="h-3 w-4 rounded-[2px] bg-[#0f0d0c]" />
        ))}
      </div>
      <div
        className="relative aspect-[4/3] overflow-hidden transition-[filter] duration-[1.4s] ease-out"
        style={{ filter: active ? 'none' : 'invert(1) hue-rotate(180deg) sepia(0.5) contrast(0.9)' }}
      >
        {frame.kind === 'text' ? (
          <div className="flex h-full items-center justify-center bg-[#f5efe6] p-6 text-[#2b2521] sm:p-8">
            <p className="text-sm leading-relaxed sm:text-base">{frame.caption}</p>
          </div>
        ) : (
          <PhotoSlot src={frame.src} alt={frame.title} label={frame.label ?? 'Add a photo'} className="h-full w-full" />
        )}
        {frame.kind === 'final' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 text-center">
            <p className={`${display} text-4xl text-white drop-shadow sm:text-5xl`}>Happy</p>
            <p className={`${display} text-4xl text-[var(--bd-accent)] drop-shadow sm:text-5xl`}>Birthday</p>
          </div>
        )}
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between gap-3 text-xs">
        <span className="truncate font-bold tracking-wide text-[var(--bd-accent)]">{frame.title}</span>
        <span className="shrink-0 text-[#efe7dc]/40">
          {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
        </span>
      </figcaption>
      {frame.kind !== 'text' && <p className="mt-1 truncate text-xs text-[#efe7dc]/60">{frame.caption}</p>}
    </figure>
  );
}

function Strip({ onShot }: { onShot: () => void }) {
  const { config, reducedMotion } = useExperience();
  const memories = getMemories(config);
  const timeline = getTimeline(config);
  const notes = splitParagraphs(config.messages.main);
  const frames: Frame[] = [
    ...(notes.length ? notes : [PLACEHOLDER.message]).slice(0, 3).map((n, i) => ({ id: `t${i}`, kind: 'text' as const, title: i === 0 ? 'A message just for you' : 'continued…', caption: n })),
    ...memories.map((m) => ({ id: m.id, kind: 'photo' as const, src: m.image, title: m.titleText, caption: m.captionText, label: m.slotLabel })),
    ...timeline.map((t) => ({ id: `tl-${t.id}`, kind: 'photo' as const, src: t.image, title: t.titleText, caption: t.captionText })),
    { id: 'final', kind: 'final', src: config.finalImage ?? config.heroImage, title: 'The last frame', caption: config.messages.wish },
  ];
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, (v) => -v * dist);

  useLayoutEffect(() => {
    const measure = () => setDist(Math.max(0, (trackRef.current?.scrollWidth ?? 0) - window.innerWidth));
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [frames.length]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => setActive(Math.round(v * (frames.length - 1))));

  const shoot = () => {
    onShot();
    const el = sectionRef.current;
    if (!el) return;
    const next = Math.min(frames.length - 1, active + 1);
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (range * next) / (frames.length - 1), behavior: 'smooth' });
  };

  if (reducedMotion) {
    return (
      <section aria-label="The film roll" className="space-y-10 px-4 py-16">
        {frames.map((f, i) => (
          <div key={f.id} className="flex justify-center">
            <FrameCard frame={f} active index={i} total={frames.length} />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section ref={sectionRef} aria-label="The film roll" style={{ height: `${frames.length * 60 + 40}vh` }} className="relative">
      <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden">
        <div className="mb-6 flex items-center justify-between px-6 sm:px-12">
          <p className={`${display} text-sm tracking-widest text-[#efe7dc]/70`}>Some moments worth remembering</p>
          <p className="text-sm tabular-nums text-[var(--bd-primary)]" aria-live="polite">
            FRAME {String(active + 1).padStart(2, '0')}/{String(frames.length).padStart(2, '0')}
          </p>
        </div>
        <motion.div ref={trackRef} style={{ x }} className="flex w-max gap-1 px-[11vw] sm:px-[calc(50vw-15rem)]">
          {frames.map((f, i) => (
            <FrameCard key={f.id} frame={f} active={i === active} index={i} total={frames.length} />
          ))}
        </motion.div>
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={shoot}
            aria-label="Take a shot and advance to the next frame"
            className="group inline-flex size-16 items-center justify-center rounded-full border-4 border-[#efe7dc]/80 transition-transform active:scale-90"
          >
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-[var(--bd-primary)] transition-transform group-hover:scale-110">
              <Camera className="size-5 text-white" aria-hidden />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

function FlipCard({ front, back }: { front: ReactNode; back: ReactNode }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="w-[min(86vw,26rem)]" style={{ perspective: 1200 }}>
      <motion.button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? 'Turn the print back over' : 'Turn the print over to read the back'}
        aria-pressed={flipped}
        className="relative block aspect-[4/5] w-full text-left"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.9, ease: EASE.inOut }}
      >
        <span className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
          {front}
        </span>
        <span className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          {back}
        </span>
      </motion.button>
    </div>
  );
}

function FinalPrint() {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(['#ffffff']);
  const fired = useRef(false);
  return (
    <section aria-labelledby="fr-final" className="flex min-h-dvh flex-col items-center justify-center px-6 py-24 text-center">
      <motion.h2
        id="fr-final"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        onViewportEnter={() => {
          if (fired.current) return;
          fired.current = true;
          fx.confetti({ x: 0.5, y: 0.3, colors, count: 120, spread: 140, angle: 270, velocity: 300 });
        }}
        className={`${display} text-4xl sm:text-6xl`}
      >
        Developed.
      </motion.h2>
      <p className="mt-3 text-sm text-[#efe7dc]/60">Tap the print to read the back.</p>
      <div className="mt-10">
        <FlipCard
          front={
            <span className="flex h-full flex-col bg-[#f5efe6] p-3 pb-6 shadow-2xl">
              <PhotoSlot src={config.finalImage ?? config.heroImage} alt={`A final photo for ${name}`} label="Add a final photo" tone="light" className="w-full flex-1" />
              <span className={`${display} mt-4 block text-center text-2xl text-[#2b2521]`}>
                Happy Birthday, <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
              </span>
            </span>
          }
          back={
            <span className="flex h-full flex-col justify-center bg-[#ebe2d4] p-8 text-[#2b2521] shadow-2xl">
              <span className="block text-xs tracking-[0.3em] text-[#2b2521]/60">ON THE BACK, IN PEN:</span>
              <span className="mt-4 block text-lg leading-relaxed italic">
                <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
              </span>
              <span className="mt-6 block text-sm">
                — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
              </span>
            </span>
          }
        />
      </div>
      <p className="mt-10 max-w-md text-[#efe7dc]/70">{config.messages.final}</p>
      <button type="button" onClick={restart} className="mt-8 inline-flex h-11 items-center gap-2 text-sm text-[#efe7dc]/50 hover:text-[#efe7dc]">
        <RotateCw className="size-4" aria-hidden /> Rewind the roll
      </button>
    </section>
  );
}
