import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, type ResolvedMemory } from '@/components/experience/content';
import { Particles } from '@/components/effects/Particles';
import { textPoints, type Pt } from '@/components/effects/shapes';
import { useFocusTrap, useLockBodyScroll } from '@/hooks/useFocusTrap';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';

const cinzel = 'font-t-display';
const W = 1000;
const H = 620;
const MINOR = 150;

/** A gentle winding path for the memory stars. */
function memoryPositions(n: number, mobile: boolean): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    if (mobile) return [W * (0.22 + 0.56 * ((Math.sin(i * 2.1) + 1) / 2)), H * 1.4 * (0.06 + t * 0.88)];
    return [W * (0.08 + t * 0.84), H * (0.5 + Math.sin(t * Math.PI * 2.2 + 0.4) * 0.28)];
  });
}

const minorStars: Pt[] = Array.from({ length: MINOR }, (_, i) => [((Math.sin(i * 91.7) + 1) / 2) * W, ((Math.cos(i * 47.3) + 1) / 2) * H]);

export default function ConstellationOfUs() {
  const { opened, theme } = useExperience();
  return (
    <div className="relative min-h-dvh bg-[#01020a] text-[#e3e9ff]">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_120%,#0f1c4a,transparent_60%)]">
        <Particles variant="stars" density={9} colors={['#ffffff', theme.primary]} />
      </div>
      <AnimatePresence>{!opened && <FirstStars key="s" />}</AnimatePresence>
      {opened && <Sky />}
    </div>
  );
}

function FirstStars() {
  const { config, open } = useExperience();
  const pts: Pt[] = [
    [20, 55],
    [35, 30],
    [50, 48],
    [66, 26],
    [82, 50],
  ];
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#01020a]/90 px-6 text-center" exit={{ opacity: 0, transition: { duration: 1.4 } }}>
      <svg viewBox="0 0 100 70" className="w-[min(90vw,40rem)]" aria-hidden>
        <motion.polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="var(--bd-primary)" strokeWidth={0.3} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.6, duration: 2.2, ease: 'easeInOut' }} />
        {pts.map(([x, y], i) => (
          <motion.circle key={i} cx={x} cy={y} r={1.2} fill="#fff" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.45, duration: 0.6 }} style={{ filter: 'drop-shadow(0 0 2px #fff)' }} />
        ))}
      </svg>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4.4, duration: 1.6 }} className="mt-8 max-w-xl text-2xl italic sm:text-3xl">
        {config.messages.intro.trim() || 'Somehow, the universe brought us together.'}
      </motion.p>
      <motion.button type="button" onClick={open} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5.4 }} className={`${cinzel} mt-12 h-12 border-b border-[var(--bd-primary)]/60 px-2 text-sm tracking-[0.4em] hover:border-[var(--bd-primary)]`}>
        Look closer
      </motion.button>
    </motion.div>
  );
}

function Sky() {
  const { config, fx, restart, reducedMotion } = useExperience();
  const { name, sender } = useBirthdayText();
  const colors = useThemeColors(['#ffffff']);
  const mobile = useMediaQuery('(max-width: 639px)');
  const memories = getMemories(config).slice(0, 12);
  const positions = useMemo(() => memoryPositions(memories.length, mobile), [memories.length, mobile]);
  const [open, setOpen] = useState<ResolvedMemory | null>(null);
  const [seen, setSeen] = useState<string[]>([]);
  const [names, setNames] = useState<Pt[] | null>(null);
  const [phase, setPhase] = useState<'map' | 'names' | 'story'>('map');

  useEffect(() => {
    let cancelled = false;
    textPoints(`${name}\n&\n${sender}`, { fontFamily: "'Cinzel', serif", weight: 600, count: MINOR + memories.length }).then(({ points, aspect }) => {
      if (cancelled) return;
      let bw = W * 0.86;
      let bh = bw / aspect;
      if (bh > H * 0.86) {
        bh = H * 0.86;
        bw = bh * aspect;
      }
      setNames(points.map(([x, y]) => [(W - bw) / 2 + x * bw, (H - bh) / 2 + y * bh] as Pt));
    });
    return () => {
      cancelled = true;
    };
  }, [name, sender, memories.length]);

  const rearrange = () => {
    setPhase('names');
    window.setTimeout(() => {
      setPhase('story');
      fx.rain({ colors, shapes: ['star'], count: 60, size: 8, duration: 4 });
    }, 4200);
  };

  const viewH = mobile ? H * 1.4 : H;
  const target = (i: number): Pt | null => {
    if (phase === 'map' || !names?.length) return null;
    const [x, y] = names[i % names.length];
    return [x, y + (viewH - H) / 2];
  };

  return (
    <main className="relative z-10">
      <section aria-labelledby="cu-title" className="px-4 pt-16 pb-6 text-center">
        <p className={`${cinzel} text-xs tracking-[0.5em] text-[var(--bd-primary)]`}>A constellation named</p>
        <h1 id="cu-title" className={`${cinzel} mt-3 text-4xl sm:text-6xl`}>
          <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
        </h1>
        <p className="mt-3 text-lg text-[#e3e9ff]/60 italic" aria-live="polite">
          {phase === 'map' ? `Touch a star to read its story · ${seen.length}/${memories.length} discovered` : 'The stars are rearranging…'}
        </p>
      </section>

      <div className="relative mx-auto w-full max-w-6xl px-2">
        <svg viewBox={`0 0 ${W} ${mobile ? viewH : H}`} className="w-full" role="group" aria-label="Constellation of memories">
          <motion.polyline
            points={positions.map((p) => p.join(',')).join(' ')}
            fill="none"
            stroke="var(--bd-primary)"
            strokeOpacity={0.5}
            strokeWidth={1.2}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, opacity: phase === 'map' ? 1 : 0 }}
            transition={{ pathLength: { duration: 3, ease: 'easeInOut' }, opacity: { duration: 0.8 } }}
          />
          {minorStars.map(([x, y], i) => {
            const t = target(memories.length + i);
            return (
              <motion.circle
                key={`m${i}`}
                r={phase === 'map' ? 1.1 : 2.2}
                fill={phase === 'map' ? '#ffffff' : 'var(--bd-accent)'}
                initial={false}
                animate={{ cx: t ? t[0] : x, cy: t ? t[1] : mobile ? y * 1.4 : y, opacity: phase === 'map' ? 0.45 : 1 }}
                transition={{ duration: reducedMotion ? 0 : 2.6 + (i % 10) * 0.12, ease: EASE.inOut }}
              />
            );
          })}
          {memories.map((m, i) => {
            const [x, y] = positions[i];
            const t = target(i);
            return (
              <motion.g
                key={m.id}
                role="button"
                tabIndex={phase === 'map' ? 0 : -1}
                aria-label={`Star ${i + 1}: ${m.titleText}`}
                onClick={() => {
                  if (phase !== 'map') return;
                  setOpen(m);
                  setSeen((s) => (s.includes(m.id) ? s : [...s, m.id]));
                }}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && phase === 'map') {
                    e.preventDefault();
                    setOpen(m);
                    setSeen((s) => (s.includes(m.id) ? s : [...s, m.id]));
                  }
                }}
                className="cursor-pointer outline-none focus-visible:[&>circle:nth-child(2)]:stroke-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.25 }}
              >
                <motion.circle initial={false} animate={{ cx: t ? t[0] : x, cy: t ? t[1] : y, r: phase === 'map' ? 22 : 0 }} fill="url(#cu-halo)" transition={{ duration: 2.4, ease: EASE.inOut }} />
                <motion.circle
                  initial={false}
                  animate={{ cx: t ? t[0] : x, cy: t ? t[1] : y, r: phase === 'map' ? 5 : 2.4 }}
                  fill={seen.includes(m.id) ? 'var(--bd-accent)' : '#ffffff'}
                  stroke="transparent"
                  strokeWidth={3}
                  transition={{ duration: 2.4, ease: EASE.inOut }}
                />
                {phase === 'map' && (
                  <text x={x} y={y + 30} textAnchor="middle" fontSize={14} fill="#e3e9ff" opacity={0.7} className="pointer-events-none select-none" style={{ fontFamily: 'var(--font-display-t)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </text>
                )}
              </motion.g>
            );
          })}
          <defs>
            <radialGradient id="cu-halo">
              <stop offset="0%" stopColor="var(--bd-primary)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--bd-primary)" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <section aria-labelledby="cu-final" className="px-6 pt-6 pb-28 text-center">
        <AnimatePresence mode="wait">
          {phase === 'map' && (
            <motion.button key="b" type="button" exit={{ opacity: 0 }} onClick={rearrange} className={`${cinzel} h-13 rounded-full border border-[var(--bd-primary)]/60 px-9 text-sm tracking-[0.35em] transition-colors hover:bg-[var(--bd-primary)] hover:text-[#01020a]`}>
              Rearrange the stars
            </motion.button>
          )}
          {phase === 'story' && (
            <motion.div key="s" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6 }} role="status" className="mx-auto max-w-2xl">
              <h2 id="cu-final" className={`${cinzel} text-4xl tracking-[0.4em] text-[var(--bd-accent)] sm:text-6xl`}>
                Our Story
              </h2>
              <Paragraphs value={config.messages.main} placeholder={PLACEHOLDER.message} className="mt-8 space-y-5 text-xl leading-relaxed italic" />
              <p className="mt-8 text-lg">
                <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
              </p>
              <p className={`${cinzel} mt-6 text-sm tracking-[0.3em] text-[var(--bd-primary)]`}>
                Happy birthday · <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
              </p>
              <button type="button" onClick={restart} className={`${cinzel} mt-10 h-11 text-xs tracking-[0.35em] text-white/50 hover:text-white`}>
                Watch the stars again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      <AnimatePresence>{open && <StarDrawer key={open.id} memory={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </main>
  );
}

function StarDrawer({ memory, onClose }: { memory: ResolvedMemory; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onClose);
  useLockBodyScroll(true);
  return createPortal(
    <motion.div className="fixed inset-0 z-[85]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-[#01020a]/60" onClick={onClose} aria-hidden />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={memory.titleText}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 220, damping: 30 }}
        className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l border-[var(--bd-primary)]/25 bg-[#050a1f]/95 p-6 max-sm:top-auto max-sm:h-[85dvh] max-sm:rounded-t-3xl max-sm:border-t max-sm:border-l-0"
      >
        <button type="button" onClick={onClose} aria-label="Back to the sky" className="ml-auto flex size-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
          <X className="size-4" aria-hidden />
        </button>
        <p className={`${cinzel} mt-2 text-xs tracking-[0.4em] text-[var(--bd-primary)]`}>Star {String(memory.index + 1).padStart(2, '0')}</p>
        <h3 className={`${cinzel} mt-2 text-3xl`}>{memory.titleText}</h3>
        {(memory.date || memory.place) && <p className="mt-2 text-sm tracking-widest text-[#e3e9ff]/55 uppercase">{[memory.date, memory.place].filter(Boolean).join(' · ')}</p>}
        <PhotoSlot src={memory.image} alt={memory.titleText} label={memory.slotLabel} className="mt-6 aspect-[4/5] w-full rounded-2xl" />
        <p className="mt-6 text-xl leading-relaxed italic">{memory.captionText}</p>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
