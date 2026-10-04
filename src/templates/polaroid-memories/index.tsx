import { useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, Shuffle, Sparkles } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Lightbox } from '@/components/experience/Lightbox';
import { Reveal } from '@/components/experience/Motion';
import { getMemories, getTimeline, toLightboxItems } from '@/components/experience/content';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';

const hand = 'font-t-display';
const INK = '#4a3729';

export default function PolaroidMemories() {
  const { opened } = useExperience();
  return (
    <div className="paper-grain relative min-h-dvh bg-[#f1e7d8] text-[#4a3729]">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgb(255_255_255/0.6),transparent_60%)]" />
      <AnimatePresence mode="wait">{!opened ? <MemoryBox key="box" /> : null}</AnimatePresence>
      {opened && (
        <main className="relative z-10">
          <Hero />
          <MemoryTable />
          <NoteCard />
          <Clothesline />
          <FlyTogether />
        </main>
      )}
    </div>
  );
}

function Polaroid({
  src,
  alt,
  caption,
  label,
  className = '',
  captionClassName = '',
}: {
  src?: string;
  alt: string;
  caption?: ReactNode;
  label?: string;
  className?: string;
  captionClassName?: string;
}) {
  return (
    <figure className={`bg-[#fffdf8] p-3 pb-2 shadow-[0_12px_30px_-12px_rgb(74_55_41/0.45)] ${className}`}>
      <PhotoSlot src={src} alt={alt} label={label ?? 'Add a photo'} tone="light" className="aspect-square w-full bg-[#e9e2d6]" />
      {caption && <figcaption className={`${hand} px-1 pt-2 text-center text-2xl leading-tight ${captionClassName}`}>{caption}</figcaption>}
    </figure>
  );
}

function MemoryBox() {
  const { config, open } = useExperience();
  const [lifting, setLifting] = useState(false);
  const go = () => {
    setLifting(true);
    window.setTimeout(open, 1100);
  };
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f1e7d8] px-6 text-center"
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className={`${hand} text-4xl sm:text-5xl`}
      >
        {config.messages.intro.trim() || 'Let’s open the memory box…'}
      </motion.p>
      <motion.button
        type="button"
        onClick={go}
        disabled={lifting}
        aria-label="Open the memory box"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 120, damping: 14 }}
        whileHover={{ rotate: -2, scale: 1.03 }}
        className="relative mt-14 h-44 w-64 [perspective:800px] sm:h-52 sm:w-80"
      >
        <span className="absolute inset-x-0 bottom-0 h-[78%] rounded-md bg-[#c99a6b] shadow-[0_25px_40px_-15px_rgb(74_55_41/0.6)]">
          <span className="absolute inset-x-6 top-1/2 h-px bg-[#a87b52]" />
          <span className={`${hand} absolute inset-x-0 bottom-4 text-2xl text-[#5b3f26]`}>
            memories of <Fill value={config.birthdayPerson} placeholder="[NAME]" />
          </span>
        </span>
        <AnimatePresence>
          {lifting &&
            [0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/3 h-20 w-16 bg-white p-1 shadow-md"
                initial={{ y: 0, x: '-50%', rotate: 0, opacity: 0 }}
                animate={{ y: -160 - i * 30, x: `${-50 + (i - 1) * 120}%`, rotate: (i - 1) * 18, opacity: 1 }}
                transition={{ delay: 0.25 + i * 0.1, duration: 0.8, ease: EASE.out }}
              >
                <span className="block h-[70%] bg-[#e9d6c2]" />
              </motion.span>
            ))}
        </AnimatePresence>
        <motion.span
          className="absolute inset-x-[-4%] top-[14%] h-[24%] origin-top rounded-md bg-[#d8ab7c] shadow-md"
          animate={lifting ? { rotateX: 110, y: -40, opacity: 0.4 } : { rotateX: 0 }}
          transition={{ duration: 0.7, ease: EASE.out }}
        />
      </motion.button>
      <p className="mt-8 text-sm tracking-widest text-[#7a6352] uppercase">Tap the box</p>
    </motion.div>
  );
}

function Doodle({ className, d }: { className: string; d: string }) {
  return (
    <svg viewBox="0 0 60 60" className={`pointer-events-none absolute ${className}`} aria-hidden>
      <motion.path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, delay: 0.8 }}
      />
    </svg>
  );
}

function Hero() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  return (
    <section aria-label="Happy birthday" className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-20">
      <div className="grid w-full max-w-5xl items-center gap-12 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: -200, rotate: -25 }}
          animate={{ opacity: 1, y: 0, rotate: -5 }}
          transition={{ type: 'spring', stiffness: 70, damping: 12 }}
          className="relative mx-auto w-[min(80vw,22rem)]"
        >
          <span className="tape -top-3 left-1/2 z-10 -translate-x-1/2 rotate-[-4deg]" />
          <Polaroid
            src={config.heroImage}
            alt={`Portrait of ${name}`}
            label="Add your hero photo"
            caption={<>the birthday star ✶</>}
            captionClassName="text-[var(--bd-primary)]"
          />
          <Doodle className="-top-10 -right-10 size-16 text-[var(--bd-primary)]" d="M30 50 C 5 32, 12 10, 30 22 C 48 10, 55 32, 30 50 Z" />
          <Doodle className="-bottom-8 -left-12 size-16 text-[var(--bd-accent)]" d="M30 6 L36 24 L54 24 L40 35 L45 53 L30 42 L15 53 L20 35 L6 24 L24 24 Z" />
        </motion.div>
        <div className="text-center md:text-left">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm font-bold tracking-[0.3em] text-[#9a7f69] uppercase"
          >
            A box full of us
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className={`${hand} mt-3 text-7xl leading-[0.9] sm:text-8xl`}
          >
            Happy Birthday,
            <br />
            <span className="relative inline-block text-[var(--bd-primary)]">
              <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
              <svg viewBox="0 0 300 20" className="absolute -bottom-2 left-0 h-4 w-full" preserveAspectRatio="none" aria-hidden>
                <motion.path
                  d="M4 14 C 80 4, 160 18, 296 8"
                  stroke="var(--bd-accent)"
                  strokeWidth={5}
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.6, duration: 0.9 }}
                />
              </svg>
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mt-6 text-lg text-[#6b5444]">
            Every photo in here has a story. Scroll down and pick one up.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

function scatter(n: number, seed: number, mobile: boolean) {
  const rnd = (i: number) => (Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453) % 1;
  const cols = mobile ? 2 : 4;
  return Array.from({ length: n }, (_, i) => {
    const r1 = Math.abs(rnd(i + 1));
    const r2 = Math.abs(rnd(i + 7));
    const r3 = rnd(i + 13);
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      left: (col / cols) * 100 + r1 * (mobile ? 6 : 8) + (mobile ? 2 : 1),
      top: row * (mobile ? 250 : 260) + r2 * 50 + 10,
      rotate: r3 * 16,
    };
  });
}

function MemoryTable() {
  const { config } = useExperience();
  const memories = getMemories(config);
  const mobile = useMediaQuery('(max-width: 639px)');
  const [seed, setSeed] = useState(1);
  const [index, setIndex] = useState<number | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const deskRef = useRef<HTMLDivElement>(null);
  const positions = useMemo(() => scatter(memories.length, seed, mobile), [memories.length, seed, mobile]);
  const rows = Math.ceil(memories.length / (mobile ? 2 : 4));

  return (
    <section aria-labelledby="pm-table" className="relative px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="pm-table" className={`${hand} text-6xl`}>
              Some moments worth remembering…
            </h2>
            <p className="mt-1 text-[#7a6352]">Drag them around. Tap one to look closer.</p>
          </div>
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#4a3729] px-5 text-sm font-semibold text-[#fffdf8] shadow-md transition-transform hover:-rotate-2 active:scale-95"
          >
            <Shuffle className="size-4" aria-hidden /> Shuffle the photos
          </button>
        </div>
        <div
          ref={deskRef}
          className="relative mt-10 rounded-[2rem] bg-[#e6d6bf] shadow-[inset_0_2px_20px_rgb(74_55_41/0.15)]"
          style={{ height: rows * (mobile ? 250 : 260) + 120 }}
        >
          {memories.map((m, i) => {
            const pos = positions[i];
            const z = order.indexOf(m.id) + 1;
            return (
              <motion.div
                key={`${m.id}-${seed}`}
                initial={seed > 1 ? { left: '40%', top: 40, rotate: 0 } : false}
                drag
                dragConstraints={deskRef}
                dragElastic={0.15}
                dragMomentum={false}
                onDragStart={() => setOrder((o) => [...o.filter((x) => x !== m.id), m.id])}
                onTap={() => setIndex(i)}
                whileDrag={{ scale: 1.08, rotate: 0, boxShadow: '0 30px 50px -10px rgba(74,55,41,0.5)' }}
                animate={{ left: `${pos.left}%`, top: pos.top, rotate: pos.rotate }}
                transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                className="absolute w-[44%] cursor-grab touch-none active:cursor-grabbing sm:w-[21%]"
                style={{ zIndex: z }}
                role="button"
                tabIndex={0}
                aria-label={`Memory: ${m.titleText}. Press Enter to enlarge.`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIndex(i);
                  }
                }}
              >
                <Polaroid src={m.image} alt={m.titleText} label={m.slotLabel} caption={m.titleText} className="pointer-events-none select-none" />
              </motion.div>
            );
          })}
        </div>
      </div>
      <Lightbox items={toLightboxItems(memories)} index={index} onIndexChange={setIndex} captionClassName={`${hand} text-3xl`} />
    </section>
  );
}

function NoteCard() {
  const { config } = useExperience();
  return (
    <section aria-labelledby="pm-note" className="relative px-5 py-20">
      <Reveal kind="scale" className="relative mx-auto max-w-2xl">
        <span className="tape -top-3 left-10 z-10 rotate-[-8deg]" />
        <span className="tape -top-3 right-10 z-10 rotate-[6deg]" />
        <article
          className="rotate-[0.8deg] bg-[#fffdf6] px-8 pt-12 pb-10 shadow-[0_20px_40px_-20px_rgb(74_55_41/0.45)] sm:px-14"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 2.35rem, rgb(120 150 200 / 0.28) 2.35rem, rgb(120 150 200 / 0.28) 2.42rem)',
          }}
        >
          <h2 id="pm-note" className={`${hand} text-5xl text-[var(--bd-primary)]`}>
            A message just for you…
          </h2>
          <Paragraphs
            value={config.messages.main}
            placeholder={PLACEHOLDER.message}
            className={`${hand} mt-4 space-y-[2.42rem] text-[1.75rem] leading-[2.42rem]`}
          />
          <p className={`${hand} mt-[2.42rem] text-right text-3xl`}>
            love, <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} /> <Heart className="inline size-6 fill-[var(--bd-primary)] text-[var(--bd-primary)]" aria-hidden />
          </p>
        </article>
      </Reveal>
    </section>
  );
}

function Clothesline() {
  const { config } = useExperience();
  const items = getTimeline(config);
  return (
    <section aria-labelledby="pm-line" className="relative py-20">
      <h2 id="pm-line" className={`${hand} px-5 text-center text-6xl`}>
        Our little story…
      </h2>
      <div className="no-scrollbar relative mt-12 overflow-x-auto pb-10">
        <div className="relative mx-auto flex w-max gap-8 px-8 pt-10 sm:gap-12">
          <svg className="absolute inset-x-0 top-0 h-16 w-full" preserveAspectRatio="none" viewBox="0 0 100 20" aria-hidden>
            <path d="M0 4 Q 50 22 100 4" stroke={INK} strokeWidth={0.4} fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
          {items.map((t, i) => (
            <motion.div
              key={t.id}
              className="relative w-56 origin-top sm:w-64"
              style={{ marginTop: Math.sin(((i + 0.5) / items.length) * Math.PI) * 26 }}
              initial={{ rotate: i % 2 ? 8 : -8, opacity: 0, y: -30 }}
              whileInView={{ rotate: i % 2 ? 2 : -2, opacity: 1, y: 0 }}
              whileHover={{ rotate: [0, 4, -3, 2, 0], transition: { duration: 1 } }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 80, damping: 9, delay: i * 0.15 }}
            >
              <span aria-hidden className="absolute -top-5 left-1/2 z-10 h-9 w-3 -translate-x-1/2 rounded-sm bg-[#b48a62] shadow" />
              <Polaroid src={t.image} alt={t.titleText} caption={t.titleText} />
              <p className="mt-3 text-center text-sm text-[#6b5444]">{t.captionText}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FlyTogether() {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(['#ffffff']);
  const [flown, setFlown] = useState(false);
  const photos = config.memories.map((m) => m.image).filter(Boolean) as string[];
  const words = ['HAPPY', 'BIRTHDAY', name.toUpperCase()];
  let k = 0;

  const fly = () => {
    setFlown(true);
    window.setTimeout(() => fx.cannons({ colors, count: 180 }), 1400);
  };

  return (
    <section aria-labelledby="pm-fly" className="relative overflow-hidden px-4 pt-16 pb-28 text-center">
      <h2 id="pm-fly" className="sr-only">
        Happy birthday, {name}
      </h2>
      {!flown && (
        <Reveal kind="up">
          <p className={`${hand} text-5xl`}>One last thing…</p>
          <button
            type="button"
            onClick={fly}
            className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-[var(--bd-primary)] px-8 text-lg font-bold text-white shadow-lg transition-transform hover:-rotate-2 active:scale-95"
          >
            <Sparkles className="size-5" aria-hidden /> Toss all the photos in the air
          </button>
        </Reveal>
      )}
      {flown && (
        <div aria-hidden className="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:gap-4">
          {words.map((word, w) => (
            <div key={w} className="flex flex-wrap justify-center gap-1.5 sm:gap-2.5">
              {[...word].map((ch, c) => {
                const idx = k++;
                if (ch === ' ') return <span key={c} className="w-4 sm:w-8" />;
                const img = photos.length ? photos[idx % photos.length] : undefined;
                return (
                  <motion.div
                    key={c}
                    className="relative w-9 bg-white p-1 pb-3 shadow-md sm:w-16 sm:p-1.5 sm:pb-5"
                    initial={{
                      x: (Math.sin(idx * 3.1) * 0.5 + 0.5) * 1200 - 600,
                      y: (Math.cos(idx * 2.3) * 0.5 + 0.5) * 900 - 300,
                      rotate: Math.sin(idx * 7) * 90,
                      opacity: 0,
                    }}
                    animate={{ x: 0, y: 0, rotate: Math.sin(idx * 5) * 6, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 60, damping: 11, delay: idx * 0.04 }}
                  >
                    <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#e9d6c2]">
                      {img && <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />}
                      <span className={`${hand} relative text-xl font-bold text-[#3a2a1e] sm:text-4xl`}>{ch}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {flown && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.8 }}
            className="relative mx-auto mt-16 max-w-xl"
          >
            <span className="tape -top-3 left-1/2 z-10 -translate-x-1/2 rotate-[3deg]" />
            <div className="-rotate-1 bg-[#fff6c9] p-8 shadow-[0_20px_40px_-20px_rgb(74_55_41/0.5)]">
              <p className={`${hand} text-4xl`}>P.S.</p>
              <p className={`${hand} mt-2 text-3xl leading-snug`}>
                <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
              </p>
              <p className="mt-5 text-sm text-[#7a6352]">{config.messages.final}</p>
            </div>
            <button type="button" onClick={restart} className={`${hand} mt-10 h-11 text-2xl text-[#7a6352] underline-offset-4 hover:underline`}>
              close the box & open it again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
