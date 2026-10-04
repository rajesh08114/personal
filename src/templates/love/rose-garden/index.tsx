import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, type ResolvedMemory } from '@/components/experience/content';
import { useFocusTrap, useLockBodyScroll } from '@/hooks/useFocusTrap';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';
import './rose.css';

const serif = 'font-t-display';
const RINGS = [
  { n: 5, r: 26, rx: 22, ry: 26, color: '#7a0f24' },
  { n: 5, r: 18, rx: 18, ry: 22, color: '#9b1730' },
  { n: 4, r: 11, rx: 14, ry: 17, color: 'var(--bd-primary)' },
  { n: 3, r: 5, rx: 10, ry: 12, color: '#c9324f' },
];

/** Layered SVG rose; `bloom` 0 = tight bud, 1 = fully open. */
export function Rose({ bloom, size = 120, className, delay = 0 }: { bloom: number; size?: number; className?: string; delay?: number }) {
  return (
    <svg viewBox="-60 -60 120 120" width={size} height={size} className={className} aria-hidden>
      <defs>
        <radialGradient id="rg-glow">
          <stop offset="0%" stopColor="#ff8aa1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ff8aa1" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="58" fill="url(#rg-glow)" opacity={bloom} />
      {RINGS.map((ring, ri) =>
        Array.from({ length: ring.n }, (_, k) => {
          const a = (k / ring.n) * 360 + ri * 23;
          const t = { duration: 2.2, delay: delay + (RINGS.length - ri) * 0.15, ease: EASE.out };
          return (
            <g key={`${ri}-${k}`} transform={`rotate(${a})`}>
              <motion.ellipse
                cx={0}
                fill={ring.color}
                stroke="#4a0716"
                strokeWidth={0.8}
                initial={false}
                animate={{ cy: -ring.r * (0.25 + bloom * 0.75), rx: ring.rx * (0.35 + bloom * 0.65), ry: ring.ry * (0.4 + bloom * 0.6) }}
                transition={t}
              />
            </g>
          );
        }),
      )}
      <circle r={4} fill="#5a0a1c" />
    </svg>
  );
}

export default function RoseGarden() {
  const { opened } = useExperience();
  const [allBloom, setAllBloom] = useState(false);
  return (
    <div className="relative min-h-dvh bg-[#1c050b] text-[#f3e3d3]">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgb(179_32_63/0.35),transparent_60%),radial-gradient(ellipse_at_50%_100%,rgb(61_107_58/0.25),transparent_55%)]" />
      <Petals />
      <AnimatePresence>{!opened && <FirstRose key="r" />}</AnimatePresence>
      {opened && (
        <main className="relative z-10">
          <Hero />
          <Garden allBloom={allBloom} />
          <Letter />
          <Finale onBloom={() => setAllBloom(true)} bloomed={allBloom} />
        </main>
      )}
    </div>
  );
}

function Petals() {
  const { reducedMotion } = useExperience();
  if (reducedMotion) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {Array.from({ length: 14 }, (_, i) => (
        <span key={i} className="rg-petal" style={{ top: `${(i * 37) % 90}%`, animationDuration: `${12 + (i % 6) * 2.5}s`, animationDelay: `${-i * 1.7}s`, scale: `${0.6 + (i % 3) * 0.3}` }} />
      ))}
    </div>
  );
}

function FirstRose() {
  const { config, open } = useExperience();
  const [bloom, setBloom] = useState(0);
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1c050b] px-6 text-center" exit={{ opacity: 0, transition: { duration: 1.4 } }}>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6 }} onAnimationComplete={() => setBloom(1)}>
        <Rose bloom={bloom} size={220} />
        <span className="mx-auto block h-24 w-1.5 rounded-full bg-gradient-to-b from-[#3d6b3a] to-[#1f3a1d]" aria-hidden />
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: bloom ? 1 : 0 }} transition={{ delay: 1.8, duration: 1.8 }} className={`${serif} mt-10 max-w-xl text-3xl leading-snug italic sm:text-4xl`}>
        {config.messages.intro.trim() || 'Some people make life more beautiful simply by being in it.'}
      </motion.p>
      <motion.button
        type="button"
        onClick={open}
        initial={{ opacity: 0 }}
        animate={{ opacity: bloom ? 1 : 0 }}
        transition={{ delay: 3.4 }}
        className="mt-12 h-13 border-y border-[#f3e3d3]/40 px-10 text-sm tracking-[0.4em] uppercase transition-colors hover:border-[#f3e3d3]"
      >
        Walk into the garden
      </motion.button>
    </motion.div>
  );
}

function Hero() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  return (
    <section aria-label="Happy birthday" className="flex min-h-dvh flex-col items-center justify-center px-6 py-20 text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6, ease: EASE.out }} className="relative">
        <div className="relative aspect-[3/4] w-[min(70vw,20rem)] overflow-hidden rounded-t-full border border-[#f3e3d3]/30 p-2">
          <div className="h-full w-full overflow-hidden rounded-t-full">
            <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add your hero photo" priority className="h-full w-full" />
          </div>
        </div>
        <Rose bloom={1} size={110} className="absolute -bottom-10 -left-12" delay={0.6} />
        <Rose bloom={1} size={80} className="absolute -right-8 -bottom-6" delay={0.9} />
      </motion.div>
      <h1 className={`${serif} mt-16 text-5xl leading-tight italic sm:text-7xl`}>
        Happy Birthday,
        <br />
        <span className="not-italic text-[#ff8aa1]">
          <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
        </span>
      </h1>
    </section>
  );
}

function Garden({ allBloom }: { allBloom: boolean }) {
  const { config } = useExperience();
  const memories = getMemories(config);
  const [opened, setOpened] = useState<string[]>([]);
  const [card, setCard] = useState<ResolvedMemory | null>(null);
  return (
    <section aria-labelledby="rg-garden" className="relative px-4 py-20">
      <h2 id="rg-garden" className={`${serif} text-center text-4xl italic sm:text-6xl`}>
        A garden of us
      </h2>
      <p className="mt-3 text-center text-[#f3e3d3]/60">Each rose is a memory. Touch one to let it bloom.</p>
      <ul className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">
        {memories.map((m, i) => {
          const bloom = allBloom || opened.includes(m.id) ? 1 : 0;
          return (
            <li key={m.id} className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  setOpened((o) => (o.includes(m.id) ? o : [...o, m.id]));
                  window.setTimeout(() => setCard(m), opened.includes(m.id) ? 0 : 900);
                }}
                aria-label={`Let rose ${i + 1} bloom: ${m.titleText}`}
                className="rg-sway flex flex-col items-center"
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                <Rose bloom={bloom} size={130} />
                <svg viewBox="0 0 40 120" className="-mt-4 h-28 w-10" aria-hidden>
                  <path d="M20 0 C 22 40, 16 70, 20 120" stroke="#3d6b3a" strokeWidth={4} fill="none" />
                  <path d="M20 55 C 6 50, 2 40, 6 34 C 14 38, 19 46, 20 55 Z" fill="#4f8a4a" />
                  <path d="M20 80 C 34 74, 38 64, 34 58 C 26 62, 21 70, 20 80 Z" fill="#4f8a4a" />
                </svg>
              </button>
              <p className={cn('mt-2 max-w-[10rem] text-center text-sm transition-opacity duration-700', bloom ? 'opacity-100' : 'opacity-0')}>{m.titleText}</p>
            </li>
          );
        })}
      </ul>
      {card && <MemoryCard memory={card} onClose={() => setCard(null)} />}
    </section>
  );
}

function MemoryCard({ memory, onClose }: { memory: ResolvedMemory; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onClose);
  useLockBodyScroll(true);
  return createPortal(
    <motion.div className="fixed inset-0 z-[85] flex items-center justify-center bg-[#1c050b]/80 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={memory.titleText}
        initial={{ scale: 0.85, opacity: 0, rotate: -3 }}
        animate={{ scale: 1, opacity: 1, rotate: -1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="paper-grain relative w-full max-w-md bg-[#f6ead9] p-5 pb-7 text-[#3a0d17] shadow-2xl"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute top-3 right-3 z-10 inline-flex size-10 items-center justify-center rounded-full bg-[#3a0d17]/10 hover:bg-[#3a0d17]/20">
          <X className="size-4" aria-hidden />
        </button>
        <PhotoSlot src={memory.image} alt={memory.titleText} label={memory.slotLabel} tone="light" className="aspect-[4/5] w-full" imgClassName="sepia-[0.15]" />
        {(memory.date || memory.place) && <p className="mt-4 text-xs tracking-[0.35em] text-[#9b1730] uppercase">{[memory.date, memory.place].filter(Boolean).join(' · ')}</p>}
        <h3 className={`${serif} mt-2 text-3xl italic`}>{memory.titleText}</h3>
        <p className="mt-2 text-lg">{memory.captionText}</p>
        <Rose bloom={1} size={70} className="absolute -right-6 -bottom-6 rotate-12" />
      </motion.div>
    </motion.div>,
    document.body,
  );
}

function Letter() {
  const { config } = useExperience();
  return (
    <section aria-labelledby="rg-letter" className="px-5 py-24">
      <motion.article initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 1.4 }} className="paper-grain relative mx-auto max-w-2xl bg-[#f6ead9] p-8 text-[#3a0d17] shadow-[0_40px_80px_-30px_black] sm:p-14">
        <Rose bloom={1} size={90} className="absolute -top-10 -left-8 -rotate-12" />
        <h2 id="rg-letter" className={`${serif} text-3xl italic sm:text-4xl`}>
          For you, always
        </h2>
        <Paragraphs value={config.messages.main} placeholder={PLACEHOLDER.message} className="mt-6 space-y-5 text-lg leading-relaxed sm:text-xl" />
        <p className={`${serif} mt-8 text-right text-2xl italic`}>
          <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
        </p>
      </motion.article>
    </section>
  );
}

function Finale({ onBloom, bloomed }: { onBloom: () => void; bloomed: boolean }) {
  const { config, fx, restart } = useExperience();
  const colors = useThemeColors(['#7a0f24', '#ff8aa1']);
  return (
    <section aria-labelledby="rg-final" className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div className="flex items-end justify-center gap-2 sm:gap-6" aria-hidden>
        {[0.7, 0.9, 1.15, 0.9, 0.7].map((s, i) => (
          <div key={i} className="flex flex-col items-center" style={{ transform: `scale(${s})` }}>
            <Rose bloom={bloomed ? 1 : 0} size={110} delay={i * 0.2} />
            <span className="-mt-3 block h-24 w-1.5 bg-[#3d6b3a]" />
          </div>
        ))}
      </div>
      {!bloomed ? (
        <button
          type="button"
          onClick={() => {
            onBloom();
            fx.rain({ colors, shapes: ['petal'], count: 240, size: 16, duration: 5 });
          }}
          className="mt-14 h-13 border-y border-[#f3e3d3]/40 px-10 text-sm tracking-[0.4em] uppercase hover:border-[#f3e3d3]"
        >
          Let the whole garden bloom
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2, duration: 1.6 }} role="status">
          <h2 id="rg-final" className={`${serif} mt-14 text-4xl leading-tight italic sm:text-6xl`}>
            And my favorite flower
            <br />
            will always be you.
          </h2>
          <p className={`${serif} mt-8 text-2xl text-[#ff8aa1]`}>
            Happy Birthday, <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
          </p>
          <p className="mx-auto mt-6 max-w-lg text-[#f3e3d3]/80 italic">
            <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
          </p>
          <button type="button" onClick={restart} className="mt-10 h-11 text-xs tracking-[0.4em] text-[#f3e3d3]/50 uppercase hover:text-[#f3e3d3]">
            Return to the first rose
          </button>
        </motion.div>
      )}
    </section>
  );
}
