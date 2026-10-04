import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Orbit, Rocket, Satellite, X } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, getTimeline, type ResolvedMemory } from '@/components/experience/content';
import { Particles } from '@/components/effects/Particles';
import { useFocusTrap, useLockBodyScroll } from '@/hooks/useFocusTrap';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';
import './cosmic.css';

const orb = 'font-t-display';
const PLANETS = [
  ['#7dd3fc', '#1d4ed8'],
  ['#fca5a5', '#be123c'],
  ['#86efac', '#15803d'],
  ['#fde68a', '#b45309'],
  ['#c4b5fd', '#6d28d9'],
  ['#f9a8d4', '#be185d'],
  ['#99f6e4', '#0f766e'],
  ['#fdba74', '#c2410c'],
];
const planetBg = (i: number) => `radial-gradient(circle at 30% 30%, ${PLANETS[i % PLANETS.length][0]}, ${PLANETS[i % PLANETS.length][1]} 70%, #0b0b1a)`;

export default function CosmicJourney() {
  const { opened, reducedMotion } = useExperience();
  const [warp, setWarpCount] = useState(0);
  const triggerWarp = useCallback(() => {
    if (!reducedMotion) setWarpCount((w) => w + 1);
  }, [reducedMotion]);
  return (
    <div className="relative min-h-dvh bg-[#03040c] text-[#e6ecff]">
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgb(var(--bd-secondary-rgb)/0.35),transparent_55%),radial-gradient(ellipse_at_85%_75%,rgb(14_77_110/0.45),transparent_55%)]" />
        <Particles variant="stars" density={14} colors={['#ffffff', '#c7d2fe', '#fde68a']} />
      </div>
      <AnimatePresence>{warp > 0 && <Warp key={warp} />}</AnimatePresence>
      <AnimatePresence>{!opened && <Launch key="launch" onWarp={triggerWarp} />}</AnimatePresence>
      {opened && (
        <main className="relative z-10">
          <OrbitMap onWarp={triggerWarp} />
          <Transmission />
          <MissionLog />
          <Alignment />
        </main>
      )}
    </div>
  );
}

/** Star-streak hyperspace flash. */
function Warp() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    const cx = c.width / 2;
    const cy = c.height / 2;
    const stars = Array.from({ length: 220 }, () => ({ a: Math.random() * Math.PI * 2, d: Math.random() * 60, v: 6 + Math.random() * 18 }));
    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      const t = (now - start) / 900;
      ctx.fillStyle = 'rgba(3,4,12,0.35)';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.strokeStyle = '#dbeafe';
      ctx.lineWidth = 1.5;
      for (const s of stars) {
        const d0 = s.d;
        s.d += s.v * (1 + t * 4);
        ctx.globalAlpha = Math.min(1, s.d / 200);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(s.a) * d0, cy + Math.sin(s.a) * d0);
        ctx.lineTo(cx + Math.cos(s.a) * s.d, cy + Math.sin(s.a) * s.d);
        ctx.stroke();
      }
      if (t < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <motion.canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[88]" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 0.7, duration: 0.5 }} />;
}

function Launch({ onWarp }: { onWarp: () => void }) {
  const { config, open, reducedMotion } = useExperience();
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    if (count === null) return;
    if (count === 0) {
      onWarp();
      const t = window.setTimeout(open, 500);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setCount((c) => (c ?? 1) - 1), 700);
    return () => window.clearTimeout(t);
  }, [count, open, onWarp]);
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center" exit={{ opacity: 0, scale: 1.4, transition: { duration: 0.6 } }}>
      <p className={`${orb} text-xs tracking-[0.5em] text-[var(--bd-primary)]`}>MISSION CONTROL</p>
      <h1 className="mt-6 max-w-xl text-3xl font-light sm:text-5xl">
        {config.messages.intro.trim() || (
          <>
            Destination: <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />’s birthday
          </>
        )}
      </h1>
      <div className="mt-12 h-24" aria-live="assertive">
        {count === null ? (
          <motion.button
            type="button"
            onClick={() => setCount(reducedMotion ? 0 : 3)}
            whileHover={{ scale: 1.05 }}
            className={`${orb} inline-flex h-16 items-center gap-3 rounded-full bg-[var(--bd-primary)] px-10 text-sm font-bold tracking-[0.25em] text-[#03040c] shadow-[0_0_40px_rgb(var(--bd-primary-rgb)/0.6)]`}
          >
            <Rocket className="size-5" aria-hidden /> INITIATE LAUNCH
          </motion.button>
        ) : (
          <motion.p key={count} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${orb} text-7xl font-black text-[var(--bd-accent)]`}>
            {count === 0 ? 'LIFTOFF' : `T-${count}`}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

function OrbitMap({ onWarp }: { onWarp: () => void }) {
  const { config, reducedMotion } = useExperience();
  const { name } = useBirthdayText();
  const memories = getMemories(config).slice(0, 8);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [t, setT] = useState(0);

  useEffect(() => {
    if (reducedMotion || paused || selected !== null) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      setT((v) => v + (now - last) / 1000);
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, selected, reducedMotion]);

  return (
    <section aria-labelledby="cj-orbit" className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
      <p className={`${orb} text-xs tracking-[0.4em] text-[var(--bd-primary)]`}>THE {name.toUpperCase()} SYSTEM</p>
      <h2 id="cj-orbit" className="mt-3 text-4xl font-light sm:text-6xl">
        Happy Birthday, <span className="font-semibold text-[var(--bd-accent)]"><Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /></span>
      </h2>
      <p className="mt-3 text-[#e6ecff]/60">You’re the sun. Every planet is a memory — tap one to land.</p>
      <div
        className="relative mt-10 aspect-square w-[min(94vw,46rem)]"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {memories.map((_, i) => {
          const r = 22 + (i / Math.max(1, memories.length - 1)) * 26;
          return <span key={i} aria-hidden className="absolute top-1/2 left-1/2 rounded-full border border-white/10" style={{ width: `${r * 2}%`, height: `${r * 2 * 0.62}%`, transform: 'translate(-50%,-50%)' }} />;
        })}
        <div className="absolute top-1/2 left-1/2 size-[24%] -translate-x-1/2 -translate-y-1/2">
          <span aria-hidden className="absolute -inset-6 animate-pulse rounded-full bg-[radial-gradient(circle,rgb(251_191_36/0.6),transparent_65%)]" />
          <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-[#fbbf24] shadow-[0_0_60px_#f59e0b]">
            <PhotoSlot src={config.heroImage} alt={`${name}, the sun of this system`} label="Hero photo" priority className="h-full w-full" />
          </div>
        </div>
        {memories.map((m, i) => {
          const r = 22 + (i / Math.max(1, memories.length - 1)) * 26;
          const speed = 0.35 - i * 0.025;
          const a = t * speed + (i * Math.PI * 2) / memories.length;
          const x = 50 + Math.cos(a) * r;
          const y = 50 + Math.sin(a) * r * 0.62;
          const size = 9 + (i % 3) * 2;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onWarp();
                setSelected(i);
              }}
              aria-label={`Land on planet ${i + 1}: ${m.titleText}`}
              className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-125 focus-visible:scale-125"
              style={{ left: `${x}%`, top: `${y}%`, width: `${size}%`, height: `${size}%`, background: planetBg(i), boxShadow: `0 0 24px ${PLANETS[i % PLANETS.length][0]}66`, zIndex: y > 50 ? 3 : 1 }}
            >
              <span className={`${orb} pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 text-[0.6rem] whitespace-nowrap text-white/0 transition-colors group-hover:text-white/80 group-focus-visible:text-white/80`}>{m.titleText}</span>
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <PlanetDetail
          memories={memories}
          index={selected}
          onClose={() => setSelected(null)}
          onTravel={(i) => {
            onWarp();
            setSelected(i);
          }}
        />
      )}
    </section>
  );
}

function PlanetDetail({ memories, index, onClose, onTravel }: { memories: ResolvedMemory[]; index: number; onClose: () => void; onTravel: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => onClose(), [onClose]);
  useFocusTrap(ref, true, close);
  useLockBodyScroll(true);
  const m = memories[index];
  const next = (index + 1) % memories.length;
  const prev = (index - 1 + memories.length) % memories.length;
  return createPortal(
    <motion.div ref={ref} role="dialog" aria-modal="true" aria-label={`Planet ${index + 1}: ${m.titleText}`} className="fixed inset-0 z-[85] flex items-center justify-center overflow-y-auto bg-[#03040c]/95 p-4 text-[#e6ecff]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button type="button" onClick={close} aria-label="Back to orbit" className="absolute top-4 right-4 inline-flex size-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
        <X className="size-5" aria-hidden />
      </button>
      <AnimatePresence mode="wait">
        <motion.div key={index} initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.6, opacity: 0 }} transition={{ duration: 0.6, ease: EASE.out }} className="grid w-full max-w-4xl items-center gap-8 md:grid-cols-2">
          <div className="relative mx-auto aspect-square w-[min(80vw,24rem)]">
            <span aria-hidden className="absolute inset-0 rounded-full" style={{ background: planetBg(index), boxShadow: `0 0 80px ${PLANETS[index % PLANETS.length][0]}55` }} />
            <span aria-hidden className="absolute inset-[-12%] top-[42%] h-[16%] rounded-[50%] border-2 border-white/25 [transform:rotate(-12deg)]" />
            <div className="absolute inset-[22%] overflow-hidden rounded-full border-4 border-white/70 shadow-[inset_0_0_30px_black]">
              <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} className="h-full w-full" />
            </div>
          </div>
          <div className="text-center md:text-left">
            <p className={`${orb} text-xs tracking-[0.4em] text-[var(--bd-primary)]`}>PLANET {String(index + 1).padStart(2, '0')} · LANDED</p>
            <h3 className="mt-3 text-4xl font-semibold">{m.titleText}</h3>
            <p className="mt-4 text-lg text-[#e6ecff]/75">{m.captionText}</p>
            {memories.length > 1 && (
              <div className="mt-8 flex justify-center gap-3 md:justify-start">
                <button type="button" onClick={() => onTravel(prev)} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-5 hover:bg-white/10">
                  <ChevronLeft className="size-4" aria-hidden /> Previous
                </button>
                <button type="button" onClick={() => onTravel(next)} className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--bd-primary)] px-5 font-semibold text-[#03040c]">
                  Travel to next planet <ChevronRight className="size-4" aria-hidden />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>,
    document.body,
  );
}

function Transmission() {
  const { config } = useExperience();
  return (
    <section aria-labelledby="cj-tx" className="px-5 py-20">
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 1 }} className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-[var(--bd-primary)]/30 bg-[#070a1f]/80 p-7 sm:p-12">
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 animate-[cj-scan_4s_linear_infinite] bg-gradient-to-b from-[rgb(var(--bd-primary-rgb)/0.12)] to-transparent" />
        <div className="flex items-center gap-3">
          <Satellite className="size-6 text-[var(--bd-primary)]" aria-hidden />
          <h2 id="cj-tx" className={`${orb} text-sm tracking-[0.3em] text-[var(--bd-primary)]`}>
            INCOMING TRANSMISSION
          </h2>
        </div>
        <p className="mt-1 text-sm text-[#e6ecff]/50">
          Origin: <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} /> · Signal strength: infinite
        </p>
        <Paragraphs value={config.messages.main} placeholder={PLACEHOLDER.message} className="mt-8 space-y-5 text-xl leading-relaxed font-light" />
      </motion.div>
    </section>
  );
}

function MissionLog() {
  const { config } = useExperience();
  const items = getTimeline(config);
  return (
    <section aria-labelledby="cj-log" className="px-5 py-20">
      <h2 id="cj-log" className={`${orb} text-center text-2xl tracking-[0.2em] sm:text-4xl`}>
        MISSION LOG
      </h2>
      <p className="mt-2 text-center text-[#e6ecff]/60">Our little story, waypoint by waypoint</p>
      <ol className="relative mx-auto mt-12 max-w-3xl border-l-2 border-dashed border-[var(--bd-primary)]/40 pl-8">
        {items.map((t, i) => (
          <motion.li key={t.id} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8 }} className="relative mb-10 last:mb-0">
            <span aria-hidden className="absolute top-2 -left-[2.65rem] inline-flex size-8 items-center justify-center rounded-full bg-[#03040c] ring-2 ring-[var(--bd-primary)]">
              <Orbit className="size-4 text-[var(--bd-primary)]" />
            </span>
            <p className={`${orb} text-xs tracking-[0.3em] text-[var(--bd-accent)]`}>WAYPOINT {String(i + 1).padStart(2, '0')}</p>
            <div className="mt-3 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-[12rem_1fr]">
              <PhotoSlot src={t.image} alt={t.titleText} label="Add a photo" className="aspect-[4/3] w-full rounded-xl" />
              <div>
                <h3 className="text-2xl font-semibold">{t.titleText}</h3>
                <p className="mt-1 text-[#e6ecff]/70">{t.captionText}</p>
              </div>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

function Alignment() {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(['#ffffff']);
  const [aligned, setAligned] = useState(false);
  const count = 7;
  const letters = `HAPPY BIRTHDAY`;

  return (
    <section aria-labelledby="cj-final" className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
      <p className={`${orb} text-xs tracking-[0.4em] text-[var(--bd-primary)]`}>A RARE CELESTIAL EVENT</p>
      <div className="relative mt-10 h-40 w-full max-w-4xl">
        {Array.from({ length: count }, (_, i) => {
          const scatterX = 10 + ((i * 37) % 80);
          const scatterY = 10 + ((i * 53) % 70);
          return (
            <motion.span
              key={i}
              aria-hidden
              className="absolute size-10 -translate-x-1/2 -translate-y-1/2 rounded-full sm:size-14"
              style={{ background: planetBg(i), boxShadow: `0 0 24px ${PLANETS[i % PLANETS.length][0]}88` }}
              initial={false}
              animate={aligned ? { left: `${8 + i * (84 / (count - 1))}%`, top: '50%' } : { left: `${scatterX}%`, top: `${scatterY}%` }}
              transition={{ duration: 2, ease: EASE.inOut, delay: i * 0.08 }}
            />
          );
        })}
      </div>
      {!aligned ? (
        <motion.button
          type="button"
          onClick={() => {
            setAligned(true);
            window.setTimeout(() => {
              fx.fireworks({ colors, duration: 5, rockets: 12 });
              fx.rain({ colors, shapes: ['star'], count: 120, size: 8 });
            }, 2200);
          }}
          whileHover={{ scale: 1.05 }}
          className={`${orb} mt-10 inline-flex h-16 items-center gap-3 rounded-full border border-[var(--bd-primary)] px-10 text-sm font-bold tracking-[0.25em] text-[var(--bd-primary)] hover:bg-[var(--bd-primary)] hover:text-[#03040c]`}
        >
          <Orbit className="size-5" aria-hidden /> ALIGN THE PLANETS
        </motion.button>
      ) : (
        <div className="mt-6">
          <h2 id="cj-final" className={`${orb} text-3xl font-black tracking-[0.15em] text-[var(--bd-accent)] sm:text-6xl`} aria-label={`Happy birthday, ${name}`}>
            {[...letters].map((ch, i) => (
              <motion.span key={i} aria-hidden className="inline-block whitespace-pre" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 + i * 0.06 }}>
                {ch}
              </motion.span>
            ))}
          </h2>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.4, duration: 1 }}>
            <p className={`${orb} mt-3 text-2xl sm:text-4xl`}>
              <Fill value={config.birthdayPerson.toUpperCase()} placeholder={PLACEHOLDER.name} />
            </p>
            <div className="mx-auto mt-10 grid max-w-3xl gap-6 text-left md:grid-cols-2">
              <div className="overflow-hidden rounded-3xl border border-white/15">
                <PhotoSlot src={config.finalImage ?? config.heroImage} alt={`A final photo of ${name}`} label="Add a final photo" className="aspect-square w-full" />
              </div>
              <div className="flex flex-col justify-center rounded-3xl border border-white/10 bg-white/[0.05] p-7">
                <p className="text-xl leading-relaxed">
                  <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
                </p>
                <p className="mt-4 text-[#e6ecff]/60">{config.messages.final}</p>
              </div>
            </div>
            <button type="button" onClick={restart} className={cn(orb, 'mt-10 h-11 text-xs tracking-[0.3em] text-white/50 hover:text-white')}>
              RETURN TO LAUNCHPAD
            </button>
          </motion.div>
        </div>
      )}
    </section>
  );
}
