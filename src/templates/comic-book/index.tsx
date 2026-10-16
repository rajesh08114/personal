import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useAnimate } from 'motion/react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Lightbox } from '@/components/experience/Lightbox';
import { getMemories, getTimeline, toLightboxItems } from '@/components/experience/content';
import { PLACEHOLDER } from '@/data/placeholders';
import { cn } from '@/utils/cn';
import { SPRING } from '@/animations/tokens';

const bang = 'font-t-display tracking-wide';
const halftone = 'bg-[radial-gradient(rgb(0_0_0/0.18)_1px,transparent_1.6px)] bg-[size:9px_9px]';
const SFX = ['POW!', 'BAM!', 'ZAP!', 'WOW!', 'BOOM!', 'WHAM!'];
const CAPTIONS = ['MEANWHILE…', 'LATER THAT YEAR…', 'AND THEN…', 'TODAY…', 'SOON AFTER…', 'FINALLY…'];

export default function ComicBook() {
  const { opened } = useExperience();
  return (
    <div className={cn('relative min-h-dvh bg-[#ffe14d] text-black', halftone)}>
      <AnimatePresence mode="wait">{!opened ? <Cover key="cover" /> : <Issue key="issue" />}</AnimatePresence>
    </div>
  );
}

export function Burst({ text, className, color = '#ffe14d' }: { text: string; className?: string; color?: string }) {
  const pts = Array.from({ length: 24 }, (_, i) => {
    const r = i % 2 ? 34 : 50;
    const a = (i / 24) * Math.PI * 2;
    return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;
  }).join(' ');
  return (
    <span className={cn('relative inline-flex items-center justify-center', className)} aria-hidden>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
        <polygon points={pts} fill={color} stroke="#000" strokeWidth={3} strokeLinejoin="round" />
      </svg>
      <span className={`${bang} relative text-[#ff4d6d] [text-shadow:2px_2px_0_#000]`}>{text}</span>
    </span>
  );
}

function Panel({ children, className, delay = 0, onClick, label, from }: { children: ReactNode; className?: string; delay?: number; onClick?: () => void; label?: string; from?: 'left' | 'right' }) {
  const Comp = onClick ? motion.button : motion.div;
  const dir = (from ?? (Math.round(delay * 20) % 2 ? 'right' : 'left')) === 'left' ? -1 : 1;
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={label}
      // Panels slam in from the side. The skew is the comic artist's "speed smear"; it snaps straight on impact.
      initial={{ opacity: 0, x: dir * 90, skewX: dir * -10, scale: 1.06, rotate: dir * 2 }}
      whileInView={{ opacity: 1, x: 0, skewX: 0, scale: 1, rotate: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ ...SPRING.impact, delay, opacity: { duration: 0.12, delay } }}
      className={cn('relative overflow-hidden border-4 border-black bg-white text-left shadow-[6px_6px_0_#000] will-change-transform', className)}
    >
      {children}
      {/* Halftone dots wash across the panel on arrival, then drop away, like a fresh print. */}
      <motion.span
        aria-hidden
        className={cn('pointer-events-none absolute inset-0 z-20 bg-white/40', halftone)}
        initial={{ opacity: 0.9, scale: 1 }}
        whileInView={{ opacity: 0, scale: 1.6 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55, delay: delay + 0.12, ease: 'easeOut' }}
      />
    </Comp>
  );
}

function CaptionBox({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn(`${bang} absolute z-10 border-[3px] border-black bg-[#ffe14d] px-2 py-0.5 text-lg`, className)}>{children}</span>;
}

function Cover() {
  const { config, open } = useExperience();
  const { name, age, hasAge } = useBirthdayText();
  return (
    <motion.div className="flex min-h-dvh items-center justify-center px-4 py-10" exit={{ rotateY: -90, opacity: 0, transition: { duration: 0.6 } }} style={{ transformOrigin: 'left center', perspective: 1200 }}>
      <motion.div initial={{ rotate: -6, scale: 0.8, opacity: 0 }} animate={{ rotate: -2, scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 12 }} className="relative w-[min(90vw,28rem)] border-[5px] border-black bg-white p-3 shadow-[10px_10px_0_#000]">
        <div className="flex items-start justify-between border-b-4 border-black pb-2">
          <p className={`${bang} text-xl leading-none text-[var(--bd-primary)]`}>
            Issue <span className={cn(!hasAge && 'bd-placeholder')}>#{age}</span>
          </p>
          <p className={`${bang} text-sm leading-none`}>PRICE: PRICELESS</p>
        </div>
        <h1 className={`${bang} mt-3 text-center text-5xl leading-[0.9] [text-shadow:3px_3px_0_var(--bd-secondary)]`}>
          {config.messages.intro.trim() || 'The amazing story of'}
          <span className="mt-1 block text-[var(--bd-primary)] [text-shadow:3px_3px_0_#000]">
            <Fill value={config.birthdayPerson.toUpperCase()} placeholder={PLACEHOLDER.name} />
          </span>
        </h1>
        <div className={cn('relative mt-4 border-4 border-black', halftone)}>
          <PhotoSlot src={config.heroImage} alt={`Cover star: ${name}`} label="Add your hero photo" tone="light" priority className="aspect-[4/5] w-full" imgClassName="contrast-125 saturate-150" />
          <Burst text="NEW!" className="absolute -top-6 -right-6 size-24 text-3xl" />
        </div>
        <motion.button
          type="button"
          onClick={open}
          whileHover={{ scale: 1.05, rotate: -1 }}
          whileTap={{ scale: 0.95 }}
          className={`${bang} mt-4 h-14 w-full border-4 border-black bg-[var(--bd-primary)] text-3xl text-white shadow-[4px_4px_0_#000] [text-shadow:2px_2px_0_#000]`}
        >
          Open issue!
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function Issue() {
  const { config, fx, reducedMotion } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(['#000000']);
  const memories = getMemories(config);
  const timeline = getTimeline(config);
  const [index, setIndex] = useState<number | null>(null);
  const [sfx, setSfx] = useState<{ id: number; text: string; x: number; y: number } | null>(null);

  const [scope, animatePage] = useAnimate();
  const pow = (x: number, y: number) => {
    setSfx({ id: Date.now(), text: SFX[Math.floor(Math.random() * SFX.length)], x, y });
    fx.burst({ x, y, shape: 'star', colors, count: 14, speed: 300, size: 14 });
    // A short impact jolt: a few pixels, a quarter of a second, nothing under reduced motion.
    if (!reducedMotion && scope.current) void animatePage(scope.current, { x: [0, -5, 4, -2, 0], y: [0, 2, -2, 1, 0] }, { duration: 0.26 });
  };

  return (
    <motion.main ref={scope} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <section aria-label="Meet our hero" className="grid gap-5 md:grid-cols-5">
        <Panel className="md:col-span-3">
          <CaptionBox className="top-3 left-3">MEET OUR HERO!</CaptionBox>
          <PhotoSlot src={config.heroImage} alt={`Our hero, ${name}`} label="Add your hero photo" tone="light" className="aspect-[4/3] w-full md:aspect-auto md:h-full md:min-h-80" imgClassName="contrast-125 saturate-150" />
          <Burst text="WOW!" className="absolute right-4 bottom-4 size-24 text-3xl" />
        </Panel>
        <Panel className={cn('flex flex-col justify-center gap-3 bg-[var(--bd-secondary)] p-6 md:col-span-2', halftone)} delay={0.15}>
          <h2 className={`${bang} text-5xl leading-none text-white [text-shadow:3px_3px_0_#000]`}>
            Happy Birthday,
            <br />
            <span className="text-[var(--bd-accent)]">
              <Fill value={config.birthdayPerson.toUpperCase()} placeholder={PLACEHOLDER.name} />!
            </span>
          </h2>
          <p className="text-lg font-bold">Today our hero levels up. The whole city is celebrating!</p>
        </Panel>
      </section>

      <section aria-labelledby="cb-msg" className="mt-10">
        <Panel className="p-6 sm:p-10" delay={0.1}>
          <CaptionBox className="top-3 left-3">
            <span id="cb-msg">
              A WORD FROM <Fill value={config.senderName.toUpperCase()} placeholder={PLACEHOLDER.sender} />
            </span>
          </CaptionBox>
          <div className="mt-10 flex items-end gap-4">
            <span className={`${bang} hidden size-20 shrink-0 items-center justify-center rounded-full border-4 border-black bg-[var(--bd-accent)] text-4xl sm:flex`} aria-hidden>
              {config.senderName.trim().charAt(0).toUpperCase() || '?'}
            </span>
            <div className="relative flex-1 rounded-[2rem] border-4 border-black bg-white p-6 shadow-[4px_4px_0_#000]">
              <span aria-hidden className="absolute -bottom-5 left-8 size-8 rotate-45 border-r-4 border-b-4 border-black bg-white sm:-left-5 sm:bottom-6 sm:rotate-[135deg]" />
              <Paragraphs value={config.messages.main} placeholder={PLACEHOLDER.message} className="relative space-y-4 text-xl leading-relaxed font-bold" />
            </div>
          </div>
        </Panel>
      </section>

      <section aria-labelledby="cb-gallery" className="mt-14">
        <h2 id="cb-gallery" className={`${bang} text-center text-5xl [text-shadow:3px_3px_0_#fff]`}>
          The greatest hits
        </h2>
        <p className="mt-1 text-center font-bold">Tap a panel to zoom in!</p>
        <ul className="mt-8 grid auto-rows-[12rem] grid-cols-2 gap-5 sm:auto-rows-[14rem] md:grid-cols-4">
          {memories.map((m, i) => (
            <li key={m.id} className={cn(i % 5 === 0 && 'col-span-2 row-span-2', i % 5 === 3 && 'row-span-2')}>
              <Panel
                className="group h-full w-full"
                delay={(i % 4) * 0.08}
                label={`Zoom into panel: ${m.titleText}`}
                onClick={() => setIndex(i)}
              >
                <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} tone="light" className="h-full w-full" imgClassName="contrast-125 saturate-150 transition-transform duration-500 group-hover:scale-110" />
                <CaptionBox className="bottom-2 left-2 max-w-[85%] truncate text-base">{m.titleText}</CaptionBox>
                <Burst text="ZOOM!" className="absolute top-2 right-2 size-20 scale-0 text-xl transition-transform duration-300 group-hover:scale-100" />
              </Panel>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="cb-story" className="mt-14">
        <h2 id="cb-story" className={`${bang} text-center text-5xl [text-shadow:3px_3px_0_#fff]`}>
          Previously, in our story…
        </h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2">
          {timeline.map((t, i) => (
            <li key={t.id}>
              <Panel className="h-full" delay={i * 0.1}>
                <CaptionBox className="top-2 left-2">{CAPTIONS[i % CAPTIONS.length]}</CaptionBox>
                <PhotoSlot src={t.image} alt={t.titleText} label="Add a photo" tone="light" className="aspect-[16/9] w-full" imgClassName="contrast-125 saturate-150" />
                <div className="border-t-4 border-black p-4">
                  <h3 className={`${bang} text-3xl`}>{t.titleText}</h3>
                  <p className="font-bold">{t.captionText}</p>
                </div>
              </Panel>
            </li>
          ))}
        </ol>
      </section>

      <Splash onPow={pow} />

      <AnimatePresence>
        {sfx && (
          <motion.div
            key={sfx.id}
            className="pointer-events-none fixed z-[75]"
            style={{ left: sfx.x - 60, top: sfx.y - 60 }}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: [0, 1.3, 1], rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            onAnimationComplete={() => window.setTimeout(() => setSfx((s) => (s?.id === sfx.id ? null : s)), 500)}
          >
            <Burst text={sfx.text} className="size-32 text-4xl" />
          </motion.div>
        )}
      </AnimatePresence>
      <Lightbox items={toLightboxItems(memories)} index={index} onIndexChange={setIndex} captionClassName={bang} />
    </motion.main>
  );
}

function Splash({ onPow }: { onPow: (x: number, y: number) => void }) {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(['#000000', '#ffffff']);
  const [boom, setBoom] = useState(false);

  return (
    <section aria-labelledby="cb-final" className="mt-16">
      <Panel className={cn('bg-[var(--bd-primary)] p-6 text-center sm:p-12', halftone)}>
        <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 200, damping: 10 }} className="mx-auto">
          <Burst text="NEW CHAPTER UNLOCKED!" className="mx-auto size-[min(80vw,26rem)] text-3xl sm:text-5xl" />
        </motion.div>
        <h2 id="cb-final" className={`${bang} mt-4 text-6xl leading-none text-white [text-shadow:4px_4px_0_#000] sm:text-8xl`}>
          Happy birthday, hero!
        </h2>
        {!boom ? (
          <motion.button
            type="button"
            onClick={(e) => {
              setBoom(true);
              onPow(e.clientX, e.clientY);
              fx.cannons({ colors, count: 200, shapes: ['star', 'rect'] });
            }}
            whileHover={{ scale: 1.08, rotate: 2 }}
            whileTap={{ scale: 0.9 }}
            className={`${bang} mt-10 h-16 border-4 border-black bg-[var(--bd-accent)] px-10 text-4xl shadow-[5px_5px_0_#000]`}
          >
            Ka-boom!
          </motion.button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mt-10 grid max-w-4xl gap-6 text-left md:grid-cols-2">
            <div className="border-4 border-black bg-white shadow-[5px_5px_0_#000]">
              <PhotoSlot src={config.finalImage ?? config.heroImage} alt={`A final panel of ${name}`} label="Add a final photo" tone="light" className="aspect-square w-full" imgClassName="contrast-125 saturate-150" />
            </div>
            <div className="relative self-center rounded-[50%] border-4 border-black bg-white px-8 py-12 text-center shadow-[5px_5px_0_#000]">
              <p className="text-xl leading-snug font-bold">
                <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
              </p>
              <span aria-hidden className="absolute -bottom-6 left-10 size-6 rounded-full border-4 border-black bg-white" />
              <span aria-hidden className="absolute -bottom-12 left-4 size-4 rounded-full border-4 border-black bg-white" />
            </div>
            <p className={`${bang} text-center text-3xl text-white [text-shadow:2px_2px_0_#000] md:col-span-2`}>
              {config.messages.final} — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
            </p>
          </motion.div>
        )}
      </Panel>
      <p className={`${bang} mt-10 text-center text-3xl`}>The end… to be continued!</p>
      <div className="mt-4 text-center">
        <button type="button" onClick={restart} className={`${bang} h-12 border-4 border-black bg-white px-6 text-2xl shadow-[4px_4px_0_#000]`}>
          Read it again
        </button>
      </div>
    </section>
  );
}
