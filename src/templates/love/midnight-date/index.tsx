import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { MapPin, X } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories } from '@/components/experience/content';
import { Particles } from '@/components/effects/Particles';
import { useFocusTrap, useLockBodyScroll } from '@/hooks/useFocusTrap';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';

const serif = 'font-t-display';

/** 5×7 dot-matrix glyphs for the window message. */
const GLYPHS: Record<string, string[]> = {
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  ' ': ['...', '...', '...', '...', '...', '...', '...'],
};

function messageMatrix(text: string): boolean[][] {
  const rows: boolean[][] = Array.from({ length: 7 }, () => []);
  [...text].forEach((ch, i) => {
    const g = GLYPHS[ch] ?? GLYPHS[' '];
    g.forEach((line, r) => {
      rows[r].push(...[...line].map((c) => c === '#'));
      if (i < text.length - 1) rows[r].push(false);
    });
  });
  return rows.map((r) => [false, ...r, false]);
}

type Spot = { id: string; x: number; y: number; label: string; kind: 'memory' | 'note'; memoryIndex?: number };
const SPOTS: Array<Omit<Spot, 'id' | 'kind' | 'memoryIndex'>> = [
  { x: 14, y: 52, label: 'The rooftop' },
  { x: 33, y: 64, label: 'The little café' },
  { x: 52, y: 44, label: 'The clock tower' },
  { x: 69, y: 70, label: 'The bridge' },
  { x: 86, y: 56, label: 'The park bench' },
  { x: 43, y: 80, label: 'The bookshop' },
];

export default function MidnightDate() {
  const { opened } = useExperience();
  return (
    <div className="relative min-h-dvh bg-[#050a1f] text-[#eef3ff]">
      <Sky />
      <AnimatePresence>{!opened && <Midnight key="m" />}</AnimatePresence>
      {opened && (
        <main className="relative z-10">
          <Welcome />
          <City />
          <Note />
          <LightsOn />
        </main>
      )}
    </div>
  );
}

function Sky() {
  const { scrollYProgress } = useScroll();
  const mx = useTransform(scrollYProgress, [0, 1], ['78vw', '8vw']);
  const my = useTransform(scrollYProgress, [0, 0.5, 1], ['10vh', '4vh', '14vh']);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0">
      <div className="absolute inset-0 bg-gradient-to-b from-[#030716] via-[#0a1436] to-[#162657]" />
      <Particles variant="stars" density={10} colors={['#ffffff', '#cfe0ff']} />
      <motion.div style={{ left: mx, top: my }} className="absolute size-24 rounded-full bg-[radial-gradient(circle_at_40%_40%,#fffdf3,#efe6c8_60%,#d9cfae)] shadow-[0_0_80px_20px_rgb(253_246_227/0.25)] sm:size-32" />
    </div>
  );
}

function Midnight() {
  const { config, open } = useExperience();
  const [time, setTime] = useState('11:59');
  useEffect(() => {
    const t = window.setTimeout(() => setTime('12:00'), 3200);
    return () => window.clearTimeout(t);
  }, []);
  const midnight = time === '12:00';
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030716]/85 px-6 text-center backdrop-blur-[2px]" exit={{ opacity: 0, transition: { duration: 1.2 } }}>
      <motion.p key={time} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-6xl tracking-widest text-[var(--bd-primary)] tabular-nums sm:text-8xl" aria-live="polite">
        {time}
      </motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1.6 }} className={`${serif} mt-10 text-4xl sm:text-5xl`}>
        {config.messages.intro.trim() || 'Meet me at midnight…'}
      </motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: midnight ? 1 : 0 }} transition={{ duration: 1.4 }} className="mt-4 text-lg text-white/70 italic">
        I have something to tell you.
      </motion.p>
      <motion.button
        type="button"
        onClick={open}
        initial={{ opacity: 0 }}
        animate={{ opacity: midnight ? 1 : 0.15 }}
        transition={{ delay: midnight ? 1 : 0 }}
        className={`${serif} mt-12 h-13 rounded-full border border-[var(--bd-primary)]/70 px-9 tracking-[0.2em] text-[var(--bd-primary)] transition-colors hover:bg-[var(--bd-primary)] hover:text-[#050a1f]`}
      >
        I’m here
      </motion.button>
    </motion.div>
  );
}

function Welcome() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  return (
    <section aria-label="Welcome" className="flex min-h-[90dvh] flex-col items-center justify-center px-6 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, ease: EASE.out }} className="relative size-48 overflow-hidden rounded-full ring-2 ring-[var(--bd-primary)]/50 shadow-[0_0_60px_rgb(255_210_122/0.25)] sm:size-60">
        <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add your hero photo" priority className="h-full w-full" />
      </motion.div>
      <h1 className={`${serif} mt-10 text-5xl sm:text-7xl`}>
        Tonight, the city is yours, <span className="text-[var(--bd-primary)]"><Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /></span>
      </h1>
      <p className="mt-5 max-w-md text-white/65">Every light below holds something I want you to see. Wander. Take your time.</p>
    </section>
  );
}

function Skyline({ windows = true }: { windows?: boolean }) {
  const buildings = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const w = 50 + ((i * 37) % 40);
        const h = 140 + ((i * 71) % 220);
        return { x: i * 76 - 10, w, h };
      }),
    [],
  );
  return (
    <svg viewBox="0 0 1200 500" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={500 - b.h} width={b.w} height={b.h} fill={i % 2 ? '#0a1330' : '#0c1738'} />
          {windows &&
            Array.from({ length: Math.floor(b.h / 22) }, (_, r) =>
              Array.from({ length: Math.floor(b.w / 16) }, (_, c) => {
                const lit = (i * 7 + r * 3 + c * 5) % 4 === 0;
                return <rect key={`${r}-${c}`} x={b.x + 6 + c * 16} y={500 - b.h + 10 + r * 22} width={8} height={11} rx={1} fill={lit ? '#ffd27a' : '#16244d'} opacity={lit ? 0.85 : 1} className={lit && (r + c) % 5 === 0 ? 'animate-twinkle' : undefined} />;
              }),
            )}
        </g>
      ))}
      <rect x="0" y="470" width="1200" height="30" fill="#060c22" />
    </svg>
  );
}

function City() {
  const { config } = useExperience();
  const memories = getMemories(config);
  const [open, setOpen] = useState<Spot | null>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const spots: Spot[] = SPOTS.slice(0, Math.min(SPOTS.length, memories.length + 1)).map((s, i) => ({
    ...s,
    id: `spot-${i}`,
    kind: i === 2 ? 'note' : 'memory',
    memoryIndex: i < 2 ? i : i - 1,
  }));

  return (
    <section aria-labelledby="md-city" className="relative">
      <div className="px-6 text-center">
        <h2 id="md-city" className={`${serif} text-4xl sm:text-5xl`}>
          Our city, after dark
        </h2>
        <p className="mt-2 text-white/60" aria-live="polite">
          {visited.length} of {spots.length} places visited
        </p>
      </div>
      <div className="relative mt-8 h-[78dvh] min-h-[30rem] overflow-hidden">
        <Particles variant="fireflies" density={3} colors={['#ffe9a8', '#ffd27a']} followPointer />
        <Skyline />
        {spots.map((s, i) => (
          <motion.button
            key={s.id}
            type="button"
            onClick={() => {
              setOpen(s);
              setVisited((v) => (v.includes(s.id) ? v : [...v, s.id]));
            }}
            aria-label={`Visit ${s.label}`}
            className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.15, type: 'spring' }}
          >
            <span className="relative flex size-11 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--bd-primary)]/40" />
              <span className={cn('relative size-4 rounded-full shadow-[0_0_20px_6px_rgb(255_210_122/0.6)]', visited.includes(s.id) ? 'bg-[var(--bd-accent)]' : 'bg-[var(--bd-primary)]')} />
            </span>
            <span className="mt-1 rounded-full bg-[#050a1f]/70 px-3 py-1 text-xs whitespace-nowrap backdrop-blur transition-transform group-hover:-translate-y-1">{s.label}</span>
          </motion.button>
        ))}
        <Lanterns />
      </div>
      {open && <SpotCard spot={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

function Lanterns() {
  const { reducedMotion } = useExperience();
  if (reducedMotion) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {[12, 38, 61, 80].map((x, i) => (
        <motion.span
          key={x}
          className="absolute bottom-0 block h-8 w-6 rounded-t-[40%] rounded-b-md bg-gradient-to-b from-[#ffcf7a] to-[#ff8a3d] shadow-[0_0_24px_8px_rgb(255_170_80/0.4)]"
          style={{ left: `${x}%` }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: '-85vh', opacity: [0, 1, 1, 0], x: [0, 14, -10, 6] }}
          transition={{ duration: 18 + i * 3, repeat: Infinity, delay: i * 4.5, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

function SpotCard({ spot, onClose }: { spot: Spot; onClose: () => void }) {
  const { config } = useExperience();
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onClose);
  useLockBodyScroll(true);
  const m = spot.kind === 'memory' ? getMemories(config)[spot.memoryIndex ?? 0] : null;
  return createPortal(
    <motion.div className="fixed inset-0 z-[85] flex items-center justify-center bg-[#030716]/75 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={spot.label}
        initial={{ y: 40, opacity: 0, rotate: -2 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[1.75rem] border border-white/15 bg-[#0b1638]/95 p-5 text-left shadow-[0_0_80px_rgb(255_210_122/0.15)]"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
          <X className="size-4" aria-hidden />
        </button>
        <p className="inline-flex items-center gap-1.5 text-xs tracking-[0.3em] text-[var(--bd-primary)] uppercase">
          <MapPin className="size-3.5" aria-hidden /> {spot.label}
        </p>
        {m ? (
          <>
            <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} className="mt-4 aspect-[4/3] w-full rounded-2xl" />
            <h3 className={`${serif} mt-4 text-2xl`}>{m.titleText}</h3>
            {(m.date || m.place) && <p className="mt-1 text-xs tracking-widest text-white/50 uppercase">{[m.date, m.place].filter(Boolean).join(' · ')}</p>}
            <p className="mt-2 text-white/75">{m.captionText}</p>
          </>
        ) : (
          <div className="mt-4 rounded-2xl bg-[#fdf6e3] p-6 text-[#1b2240]">
            <p className={`${serif} text-xl`}>A note, left under the clock:</p>
            <p className="mt-3 text-lg leading-relaxed italic">
              <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  );
}

function Note() {
  const { config } = useExperience();
  return (
    <section aria-labelledby="md-note" className="px-6 py-24">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 1.2 }} className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-[#0b1638]/70 p-8 backdrop-blur sm:p-12">
        <h2 id="md-note" className={`${serif} text-3xl text-[var(--bd-primary)]`}>
          What I came to tell you
        </h2>
        <Paragraphs value={config.messages.main} placeholder={PLACEHOLDER.message} className="mt-6 space-y-5 text-lg leading-relaxed text-white/85 sm:text-xl" />
        <p className={`${serif} mt-8 text-right text-xl`}>
          — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
        </p>
      </motion.div>
    </section>
  );
}

function LightsOn() {
  const { config, fx, restart, reducedMotion } = useExperience();
  const colors = useThemeColors(['#ffffff']);
  const [on, setOn] = useState(false);
  const matrix = useMemo(() => messageMatrix('I LOVE YOU'), []);
  const cols = matrix[0].length;
  const rows = [false, ...matrix.map(() => true), false];

  return (
    <section aria-labelledby="md-final" className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-3 py-20 text-center">
      <p className="text-xs tracking-[0.4em] text-white/50 uppercase">The last thing</p>
      <div className="mt-8 w-full max-w-5xl rounded-t-xl bg-[#081028] p-2 shadow-[0_-20px_80px_rgb(255_210_122/0.08)] sm:p-4" role="img" aria-label={on ? 'The city windows light up to spell: I love you' : 'A dark building'}>
        <div className="grid gap-[3px] sm:gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {rows.flatMap((isRow, r) =>
            Array.from({ length: cols }, (_, c) => {
              const lit = isRow && matrix[r - 1][c];
              return (
                <motion.span
                  key={`${r}-${c}`}
                  className="aspect-[3/4] rounded-[2px]"
                  initial={false}
                  animate={{ backgroundColor: on && lit ? '#ffd27a' : '#16244d', boxShadow: on && lit ? '0 0 10px #ffd27a' : '0 0 0px transparent' }}
                  transition={{ duration: reducedMotion ? 0 : 0.4, delay: on ? (c * 0.025 + r * 0.04) : 0 }}
                />
              );
            }),
          )}
        </div>
      </div>
      {!on ? (
        <button
          type="button"
          onClick={() => {
            setOn(true);
            window.setTimeout(() => fx.fireworks({ colors, duration: 5, rockets: 10 }), 2200);
          }}
          className={`${serif} mt-12 h-13 rounded-full bg-[var(--bd-primary)] px-9 tracking-[0.15em] text-[#050a1f] shadow-[0_0_40px_rgb(255_210_122/0.5)]`}
        >
          Light up the city
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.6, duration: 1.4 }} role="status">
          <h2 id="md-final" className={`${serif} mt-12 text-5xl sm:text-7xl`}>
            Happy Birthday, <span className="text-[var(--bd-primary)]"><Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /></span>
          </h2>
          <p className="mt-4 text-lg text-white/70 italic">{config.messages.final}</p>
          <button type="button" onClick={restart} className="mt-8 h-11 text-sm tracking-[0.3em] text-white/50 uppercase hover:text-white">
            Back to midnight
          </button>
        </motion.div>
      )}
    </section>
  );
}
