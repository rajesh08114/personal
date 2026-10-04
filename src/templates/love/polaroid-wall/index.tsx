import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Expand, RotateCcw, RotateCw } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Lightbox } from '@/components/experience/Lightbox';
import { getMemories, getTimeline, toLightboxItems, type ResolvedMemory } from '@/components/experience/content';
import { heartOutline } from '@/components/effects/shapes';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { PLACEHOLDER } from '@/data/placeholders';
import { cn } from '@/utils/cn';

const hand = 'font-t-display';

export default function PolaroidWall() {
  const { opened } = useExperience();
  return (
    <div className="relative min-h-dvh overflow-x-clip bg-[#e9dccb] text-[#4a3628]">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgb(255_215_150/0.55),transparent_60%),radial-gradient(ellipse_at_50%_120%,rgb(90_60_40/0.35),transparent_60%)]" />
      <AnimatePresence>{!opened && <Flash key="f" />}</AnimatePresence>
      {opened && (
        <main className="relative z-10">
          <StringLights />
          <Wall />
        </main>
      )}
    </div>
  );
}

function StringLights() {
  return (
    <div aria-hidden className="pointer-events-none sticky top-0 z-30 h-16">
      <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M0 6 Q100 34 200 10 T400 6" stroke="#5b4434" strokeWidth={1} fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
      {Array.from({ length: 14 }, (_, i) => {
        const x = (i + 0.5) / 14;
        const y = x < 0.5 ? 10 + Math.sin(x * 2 * Math.PI) * 45 : 18 + Math.sin((x - 0.5) * 2 * Math.PI) * 18;
        return (
          <span
            key={i}
            className="absolute block h-3.5 w-2.5 -translate-x-1/2 animate-twinkle rounded-b-full bg-[#ffd27a] shadow-[0_0_14px_4px_rgb(255_210_122/0.7)]"
            style={{ left: `${x * 100}%`, top: `${Math.max(8, y)}%`, animationDelay: `${i * 0.3}s` }}
          />
        );
      })}
    </div>
  );
}

function Flash() {
  const { config, open } = useExperience();
  const [ready, setReady] = useState(false);
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#2a1f18] px-6 text-center text-[#f6ead9]" exit={{ opacity: 0, transition: { duration: 0.8 } }}>
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-white" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ delay: 0.6, duration: 0.9, times: [0, 0.1, 1] }} onAnimationComplete={() => setReady(true)} />
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 1.4 }} className={`${hand} text-7xl sm:text-8xl`}>
        {config.messages.intro.trim() || 'Look at us…'}
      </motion.p>
      <motion.button type="button" onClick={open} initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ delay: 1.2 }} className="mt-10 h-12 rounded-full bg-[#f6ead9] px-8 font-bold text-[#2a1f18] transition-transform hover:-rotate-2">
        Walk up to the wall
      </motion.button>
    </motion.div>
  );
}

type Item = { kind: 'photo'; m: ResolvedMemory; secret: boolean } | { kind: 'note'; id: string; title: string; text: string; date?: string };

function layout(n: number, mobile: boolean) {
  const cols = mobile ? 2 : 4;
  return Array.from({ length: n }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const j = (k: number) => (Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1;
    return { left: (col / cols) * 100 + 3 + Math.abs(j(1)) * (mobile ? 4 : 6), top: row * (mobile ? 270 : 300) + 30 + Math.abs(j(2)) * 40, rotate: j(3) * 12 };
  });
}

function Wall() {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(['#ffffff']);
  const mobile = useMediaQuery('(max-width: 639px)');
  const memories = getMemories(config);
  const items: Item[] = useMemo(() => {
    const memories = getMemories(config);
    const timeline = getTimeline(config);
    const list: Item[] = memories.map((m, i) => ({ kind: 'photo', m, secret: i % 2 === 0 }));
    timeline.slice(0, 3).forEach((t, i) => list.splice(Math.min(list.length, 2 + i * 3), 0, { kind: 'note', id: t.id, title: t.titleText, text: t.captionText, date: t.date }));
    return list;
  }, [config]);
  const base = useMemo(() => layout(items.length, mobile), [items.length, mobile]);
  const rows = Math.ceil(items.length / (mobile ? 2 : 4));
  const wallH = rows * (mobile ? 270 : 300) + 120;
  const wallRef = useRef<HTMLDivElement>(null);
  const [rot, setRot] = useState<Record<string, number>>({});
  const [flipped, setFlipped] = useState<string[]>([]);
  const [top, setTop] = useState<string[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const [heart, setHeart] = useState(false);
  const heartPts = useMemo(() => heartOutline(items.length), [items.length]);

  const keyOf = (it: Item) => (it.kind === 'photo' ? it.m.id : it.id);

  const zoomOut = () => {
    setHeart(true);
    setFlipped([]);
    window.scrollTo({ top: (wallRef.current?.offsetTop ?? 0) - 40, behavior: 'smooth' });
    window.setTimeout(() => fx.burst({ x: window.innerWidth / 2, y: window.innerHeight / 2, shape: 'heart', count: 40, colors, speed: 380, size: 16 }), 1800);
  };

  return (
    <>
      <section aria-labelledby="pw-title" className="px-5 pt-6 pb-10 text-center">
        <h1 id="pw-title" className={`${hand} text-6xl sm:text-8xl`}>
          Happy Birthday, <span className="text-[var(--bd-primary)]"><Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /></span>
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-[#6b5444]">Drag the photos around. Turn them with the arrows. Tap one to see what’s written on the back.</p>
      </section>

      <motion.div
        ref={wallRef}
        className="relative mx-auto max-w-6xl"
        animate={{ height: heart ? (mobile ? 520 : 720) : wallH, scale: heart ? 0.96 : 1 }}
        transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
        aria-label="The photo wall"
      >
        {items.map((it, i) => {
          const k = keyOf(it);
          const pos = heart
            ? { left: heartPts[i][0] * (mobile ? 80 : 70) + (mobile ? 2 : 10), top: heartPts[i][1] * (mobile ? 440 : 640), rotate: (i % 2 ? 1 : -1) * 6 }
            : base[i];
          const r = (rot[k] ?? 0) + pos.rotate;
          const isFlipped = flipped.includes(k);
          return (
            <motion.div
              key={`${k}-${heart ? 'h' : 'w'}`}
              drag={!heart}
              dragConstraints={wallRef}
              dragMomentum={false}
              dragElastic={0.1}
              onDragStart={() => setTop((t) => [...t.filter((x) => x !== k), k])}
              initial={heart ? false : { opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0, left: `${pos.left}%`, top: pos.top, rotate: r, scale: heart ? (mobile ? 0.45 : 0.55) : 1 }}
              transition={{ type: 'spring', stiffness: 70, damping: 14, delay: heart ? i * 0.05 : (i % 4) * 0.08 }}
              className="group absolute w-[42%] cursor-grab touch-none active:cursor-grabbing sm:w-[20%]"
              style={{ zIndex: top.indexOf(k) + 2, transformOrigin: 'center' }}
            >
              <span aria-hidden className="absolute -top-2 left-1/2 z-10 size-3.5 -translate-x-1/2 rounded-full bg-[var(--bd-primary)] shadow-[0_2px_3px_rgb(0_0_0/0.3)]" />
              {it.kind === 'photo' ? (
                <div style={{ perspective: 900 }}>
                  <motion.div
                    className="relative"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.7 }}
                    onTap={() => !heart && setFlipped((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]))}
                  >
                    <figure className="bg-[#fffdf8] p-2.5 pb-2 shadow-[0_14px_24px_-10px_rgb(74_54_40/0.55)]" style={{ backfaceVisibility: 'hidden' }}>
                      <PhotoSlot src={it.m.image} alt={it.m.titleText} label={it.m.slotLabel} tone="light" className="pointer-events-none aspect-square w-full" />
                      <figcaption className={`${hand} pt-1 text-center text-2xl leading-tight`}>{it.m.titleText}</figcaption>
                    </figure>
                    <div className="absolute inset-0 flex flex-col justify-center bg-[#f7efe1] p-4 text-center shadow-[0_14px_24px_-10px_rgb(74_54_40/0.55)]" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                      {it.secret && <p className={`${hand} text-2xl text-[var(--bd-primary)]`}>I remember this day…</p>}
                      <p className={`${hand} mt-1 text-2xl leading-tight`}>{it.m.captionText}</p>
                      {(it.m.date || it.m.place) && <p className="mt-2 text-[0.65rem] tracking-widest text-[#6b5444] uppercase">{[it.m.date, it.m.place].filter(Boolean).join(' · ')}</p>}
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="bg-[#fff3a8] p-4 shadow-[0_10px_18px_-8px_rgb(74_54_40/0.5)]">
                  {it.date && <p className="text-[0.65rem] tracking-widest text-[#6b5444] uppercase">{it.date}</p>}
                  <p className={`${hand} text-3xl leading-none`}>{it.title}</p>
                  <p className={`${hand} mt-1 text-2xl leading-tight`}>{it.text}</p>
                </div>
              )}
              {!heart && (
                <div className="absolute -bottom-12 left-1/2 flex -translate-x-1/2 gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100">
                  <button type="button" onClick={() => setRot((r0) => ({ ...r0, [k]: (r0[k] ?? 0) - 15 }))} aria-label="Rotate left" className="inline-flex size-9 items-center justify-center rounded-full bg-[#4a3628] text-white">
                    <RotateCcw className="size-4" aria-hidden />
                  </button>
                  <button type="button" onClick={() => setRot((r0) => ({ ...r0, [k]: (r0[k] ?? 0) + 15 }))} aria-label="Rotate right" className="inline-flex size-9 items-center justify-center rounded-full bg-[#4a3628] text-white">
                    <RotateCw className="size-4" aria-hidden />
                  </button>
                  {it.kind === 'photo' && (
                    <>
                      <button type="button" onClick={() => setFlipped((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]))} aria-label={`Flip ${it.m.titleText}`} aria-pressed={isFlipped} className="inline-flex h-9 items-center rounded-full bg-[#4a3628] px-3 text-xs font-bold text-white">
                        Flip
                      </button>
                      <button type="button" onClick={() => setIndex(it.m.index)} aria-label={`Open ${it.m.titleText}`} className="inline-flex size-9 items-center justify-center rounded-full bg-[#4a3628] text-white">
                        <Expand className="size-4" aria-hidden />
                      </button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
        <AnimatePresence>
          {heart && (
            <motion.div key="center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.6, duration: 1 }} className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className={`${hand} text-5xl text-[var(--bd-primary)] sm:text-7xl`}>every picture,</p>
              <p className={`${hand} text-5xl sm:text-7xl`}>a piece of us</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <section aria-labelledby="pw-note" className="px-5 py-20">
        <div className="relative mx-auto max-w-2xl -rotate-1 bg-[#fffdf6] p-8 shadow-[0_20px_40px_-20px_rgb(74_54_40/0.5)] sm:p-12">
          <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-2" aria-hidden />
          <h2 id="pw-note" className={`${hand} text-5xl text-[var(--bd-primary)]`}>
            the note pinned in the middle
          </h2>
          <Paragraphs value={config.messages.main} placeholder={PLACEHOLDER.message} className={`${hand} mt-4 space-y-4 text-3xl leading-snug`} />
          <p className={`${hand} mt-6 text-right text-3xl`}>
            — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
          </p>
        </div>
      </section>

      <section aria-labelledby="pw-final" className="px-5 pb-28 text-center">
        {!heart ? (
          <button type="button" onClick={zoomOut} className="h-14 rounded-full bg-[var(--bd-primary)] px-9 text-lg font-bold text-white shadow-lg transition-transform hover:-rotate-1">
            Step back and look at the wall
          </button>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} role="status">
            <h2 id="pw-final" className={`${hand} text-6xl`}>
              Happy birthday, <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /> ♡
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-lg">
              <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
            </p>
            <div className="mx-auto mt-8 w-64 rotate-2 bg-white p-2.5 pb-8 shadow-lg">
              <PhotoSlot src={config.finalImage ?? config.heroImage} alt={`A final photo of ${name}`} label="Add a final photo" tone="light" className="aspect-square w-full" />
            </div>
            <button type="button" onClick={restart} className={cn(hand, 'mt-8 h-11 text-3xl underline underline-offset-4')}>
              take it all down & start over
            </button>
          </motion.div>
        )}
      </section>
      <Lightbox items={toLightboxItems(memories)} index={index} onIndexChange={setIndex} captionClassName={`${hand} text-3xl`} />
    </>
  );
}
