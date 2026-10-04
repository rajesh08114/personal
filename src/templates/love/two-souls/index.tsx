import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { X } from 'lucide-react';
import { useBirthdayText, useExperience } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, type ResolvedMemory } from '@/components/experience/content';
import { PointerTrail } from '@/components/effects/PointerTrail';
import { MorphParticles, type MorphTarget } from '@/components/effects/MorphParticles';
import { heartPoints, textPoints } from '@/components/effects/shapes';
import { useFinePointer } from '@/hooks/useMediaQuery';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';

const syne = 'font-t-display';

/** A small paper lantern with a candle inside: warm at the bottom, glowing softly into the dark. */
function Orb({ size = 28, className }: { color?: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`block rounded-[42%] bg-[#f6e3c0] ${className ?? ''}`}
      style={{
        width: size,
        height: size * 1.25,
        boxShadow: `0 0 ${size}px ${size / 3}px rgb(var(--bd-primary-rgb) / 0.4), inset 0 -${size / 4}px ${size / 2}px rgb(var(--bd-primary-rgb) / 0.75)`,
      }}
    />
  );
}

export default function TwoSouls() {
  const { opened, theme } = useExperience();
  return (
    <div className="relative min-h-dvh bg-[#0b0d12] text-[#f1e7d6]">
      <AnimatePresence>{!opened && <Meeting key="m" />}</AnimatePresence>
      {opened && (
        <main className="relative z-10">
          <PointerTrail colors={[theme.primary, theme.accent]} size={2} rate={1} />
          <You />
          <Me />
          <Us />
          <Words />
          <Finale />
        </main>
      )}
    </div>
  );
}

function Meeting() {
  const { config, open, reducedMotion } = useExperience();
  const [met, setMet] = useState(reducedMotion);
  useEffect(() => {
    if (met) return;
    const t = window.setTimeout(() => setMet(true), 4600);
    return () => window.clearTimeout(t);
  }, [met]);
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#0b0d12] px-6" exit={{ opacity: 0, transition: { duration: 1.2 } }}>
      <motion.div className="absolute top-1/2 flex -translate-y-1/2 flex-col items-center gap-4" initial={{ left: '12%' }} animate={{ left: met ? 'calc(50% - 22px)' : '38%' }} transition={{ duration: met ? 1.2 : 4.5, ease: EASE.inOut }}>
        <Orb color="var(--bd-primary)" />
        <motion.span animate={{ opacity: met ? 0 : 1 }} className={`${syne} text-xs tracking-[0.5em]`}>
          YOU
        </motion.span>
      </motion.div>
      <motion.div className="absolute top-1/2 flex -translate-y-1/2 flex-col items-center gap-4" initial={{ right: '12%' }} animate={{ right: met ? 'calc(50% - 22px)' : '38%' }} transition={{ duration: met ? 1.2 : 4.5, ease: EASE.inOut }}>
        <Orb color="var(--bd-accent)" />
        <motion.span animate={{ opacity: met ? 0 : 1 }} className={`${syne} text-xs tracking-[0.5em]`}>
          ME
        </motion.span>
      </motion.div>
      <AnimatePresence>
        {met && (
          <motion.div key="us" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1.4 }} className="relative mt-48 flex flex-col items-center text-center">
            <span className="absolute -top-52 size-6 rounded-full bg-[#fff4dc] shadow-[0_0_24px_6px_rgb(var(--bd-primary-rgb)/0.5)]" aria-hidden />
            <p className={`${syne} text-5xl font-bold tracking-[0.4em]`}>US</p>
            <p className="mt-4 max-w-sm text-white/60">{config.messages.intro.trim() || 'Some lights are meant to find each other.'}</p>
            <button type="button" onClick={open} className={`${syne} mt-10 h-12 rounded-full border border-white/30 px-8 text-xs tracking-[0.4em] transition-colors hover:border-white hover:bg-white hover:text-[#0b0d12]`}>
              ENTER OUR WORLD
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {!met && (
        <button type="button" onClick={() => setMet(true)} className="absolute bottom-8 h-11 text-xs tracking-[0.3em] text-white/40 hover:text-white">
          SKIP
        </button>
      )}
    </motion.div>
  );
}

function You() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  return (
    <section aria-labelledby="ts-you" className="flex min-h-dvh flex-col items-center justify-center px-6 py-20 text-center">
      <p className={`${syne} text-xs tracking-[0.6em] text-[var(--bd-primary)]`}>YOU</p>
      <motion.div initial={{ scale: 0.4, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: EASE.out }} className="relative mt-10 size-64 sm:size-80">
        <div className="relative h-full w-full overflow-hidden rounded-full ring-1 ring-[#f1e7d6]/40 shadow-[0_20px_50px_-20px_rgb(var(--bd-primary-rgb)/0.6)]">
          <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add your hero photo" priority className="h-full w-full" />
        </div>
      </motion.div>
      <h1 id="ts-you" className={`${syne} mt-12 text-5xl font-bold sm:text-7xl`}>
        <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
      </h1>
      <p className="mt-4 max-w-md text-lg text-white/65">The light that walked into my life and made everything glow.</p>
    </section>
  );
}

function Me() {
  const { config } = useExperience();
  return (
    <section aria-labelledby="ts-me" className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
      <motion.span initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className={`${syne} text-7xl font-light text-white/40`} aria-hidden>
        +
      </motion.span>
      <p className={`${syne} mt-10 text-xs tracking-[0.6em] text-[var(--bd-accent)]`}>ME</p>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.4 }} className="mt-8">
        <Orb color="var(--bd-accent)" size={36} className="mx-auto" />
      </motion.div>
      <h2 id="ts-me" className={`${syne} mt-10 text-4xl font-bold sm:text-6xl`}>
        <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
      </h2>
      <p className="mt-4 max-w-md text-lg text-white/65">Lucky enough to notice. Luckier still that you stayed.</p>
      <span className={`${syne} mt-20 text-7xl font-light text-white/40`} aria-hidden>
        =
      </span>
    </section>
  );
}

function Us() {
  const { config } = useExperience();
  const memories = getMemories(config).slice(0, 10);
  const fine = useFinePointer();
  const [open, setOpen] = useState<ResolvedMemory | null>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 40, damping: 15 });
  const sy = useSpring(py, { stiffness: 40, damping: 15 });
  const count = memories.length;
  const nodes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + 0.3;
        const r = 30 + (i % 3) * 8;
        return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r * 0.82, depth: 0.4 + (i % 4) * 0.25 };
      }),
    [count],
  );

  return (
    <section
      aria-labelledby="ts-us"
      className="relative px-4 py-20"
      onPointerMove={(e) => {
        if (!fine) return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set(((e.clientX - r.left) / r.width - 0.5) * 40);
        py.set(((e.clientY - r.top) / r.height - 0.5) * 40);
      }}
    >
      <h2 id="ts-us" className={`${syne} text-center text-6xl font-bold tracking-[0.3em] sm:text-8xl`}>
        US
      </h2>
      <p className="mt-3 text-center text-white/60">Every light here is a moment we made. Touch one.</p>
      <div className="relative mx-auto mt-10 aspect-square w-full max-w-3xl sm:aspect-[4/3]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          {nodes.map((n, i) => {
            const m = nodes[(i + 1) % nodes.length];
            return (
              <motion.line
                key={i}
                x1={n.x}
                y1={n.y}
                x2={m.x}
                y2={m.y}
                stroke="url(#ts-grad)"
                strokeWidth={0.25}
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: i * 0.15 }}
              />
            );
          })}
          {nodes.map((n, i) => (
            <line key={`c${i}`} x1={50} y1={50} x2={n.x} y2={n.y} stroke="#ffffff" strokeOpacity={0.06} strokeWidth={0.2} vectorEffect="non-scaling-stroke" />
          ))}
          <defs>
            <linearGradient id="ts-grad">
              <stop offset="0%" stopColor="var(--bd-primary)" />
              <stop offset="100%" stopColor="var(--bd-accent)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden>
          <Orb color="#ffffff" size={18} />
        </div>
        {memories.map((m, i) => (
          <motion.button
            key={m.id}
            type="button"
            onClick={() => setOpen(m)}
            aria-label={`Open memory: ${m.titleText}`}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${nodes[i].x}%`, top: `${nodes[i].y}%`, x: sx, y: sy, scale: nodes[i].depth + 0.4 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <Orb color={i % 2 ? 'var(--bd-accent)' : 'var(--bd-primary)'} size={16} className="transition-transform duration-300 group-hover:scale-150" />
            <span className="pointer-events-none absolute top-6 left-1/2 w-32 -translate-x-1/2 text-center text-xs text-white/0 transition-colors group-hover:text-white/85 group-focus-visible:text-white/85">
              {m.titleText}
            </span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={open.titleText}
            className="fixed inset-0 z-[85] flex items-center justify-center bg-[#0b0d12]/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.6, ease: EASE.out }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md overflow-hidden rounded-sm bg-[#16181f] p-4">
              <button type="button" onClick={() => setOpen(null)} aria-label="Close memory" autoFocus className="absolute top-6 right-6 z-10 inline-flex size-10 items-center justify-center rounded-full bg-black/40">
                <X className="size-4" aria-hidden />
              </button>
              <PhotoSlot src={open.image} alt={open.titleText} label={open.slotLabel} className="aspect-[4/5] w-full" />
              <div className="p-3 pt-5">
                {(open.date || open.place) && <p className="text-xs tracking-[0.3em] text-[var(--bd-primary)] uppercase">{[open.date, open.place].filter(Boolean).join(' · ')}</p>}
                <h3 className={`${syne} mt-2 text-2xl font-bold`}>{open.titleText}</h3>
                <p className="mt-1 text-white/70">{open.captionText}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Words() {
  const { config } = useExperience();
  return (
    <section aria-label="A message for you" className="px-6 py-24">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 1.6 }} className="mx-auto max-w-2xl text-center">
        <Paragraphs value={config.messages.main} placeholder={PLACEHOLDER.message} className="space-y-8 text-2xl leading-relaxed font-light sm:text-3xl" />
        <p className={`${syne} mt-10 text-xs tracking-[0.5em] text-[var(--bd-accent)]`}>
          — <Fill value={config.senderName.toUpperCase()} placeholder={PLACEHOLDER.sender} />
        </p>
      </motion.div>
    </section>
  );
}

function Finale() {
  const { config, theme, restart } = useExperience();
  const { name } = useBirthdayText();
  const [phase, setPhase] = useState<'idle' | 'heart' | 'name' | 'birthday'>('idle');
  const [targets, setTargets] = useState<{ heart: MorphTarget; name: MorphTarget | null; birthday: MorphTarget | null }>(() => ({
    heart: { points: heartPoints(900), aspect: 1, fill: 0.62 },
    name: null,
    birthday: null,
  }));
  const timers = useRef<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      textPoints(name, { fontFamily: "'Syne', sans-serif", weight: 700 }),
      textPoints('HAPPY\nBIRTHDAY', { fontFamily: "'Syne', sans-serif", weight: 700 }),
    ]).then(([n, b]) => {
      if (!cancelled) setTargets((t) => ({ ...t, name: { ...n, fill: 0.86 }, birthday: { ...b, fill: 0.8 } }));
    });
    return () => {
      cancelled = true;
    };
  }, [name]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const begin = () => {
    setPhase('heart');
    timers.current.push(window.setTimeout(() => setPhase('name'), 4200));
    timers.current.push(window.setTimeout(() => setPhase('birthday'), 8400));
  };

  const target = phase === 'idle' ? null : phase === 'heart' ? targets.heart : phase === 'name' ? targets.name ?? targets.heart : targets.birthday ?? targets.heart;

  return (
    <section aria-labelledby="ts-final" className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
      <div className="absolute inset-0">
        <MorphParticles target={target} colors={[theme.primary, theme.accent, '#ffffff']} count={1100} size={1.6} />
      </div>
      <h2 id="ts-final" className="sr-only">
        Happy birthday, {name}
      </h2>
      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.button key="b" type="button" onClick={begin} exit={{ opacity: 0 }} className={`${syne} relative z-10 h-14 rounded-full border border-white/30 bg-black/30 px-10 text-xs tracking-[0.4em] hover:bg-white hover:text-[#0b0d12]`}>
            BRING THE LIGHT TOGETHER
          </motion.button>
        )}
        {phase === 'birthday' && (
          <motion.div key="end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8, duration: 1.4 }} className="relative z-10 mt-[62vh] max-w-xl" role="status">
            <p className="text-xl leading-relaxed text-white/85">
              <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
            </p>
            <button type="button" onClick={restart} className={`${syne} mt-8 h-11 text-xs tracking-[0.4em] text-white/50 hover:text-white`}>
              FIND EACH OTHER AGAIN
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
