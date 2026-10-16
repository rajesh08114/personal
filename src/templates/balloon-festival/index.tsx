import { useMemo, useState, type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PartyPopper, Sparkles } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, splitParagraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Reveal } from '@/components/experience/Motion';
import { getMemories, getTimeline } from '@/components/experience/content';
import { PLACEHOLDER } from '@/data/placeholders';
import { cn } from '@/utils/cn';

const COLORS = ['#ff5d8f', '#ffc93c', '#4cc9f0', '#7b61ff', '#06d6a0', '#ff8c42'];
const display = 'font-t-display';

export default function BalloonFestival() {
  const { opened } = useExperience();
  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-[#bfe6ff] via-[#e8f6ff] to-[#ffe8f3] text-[#2b2250]">
      <Clouds />
      <AnimatePresence>{!opened && <Opening key="o" />}</AnimatePresence>
      {opened && (
        <main className="relative z-10">
          <Hero />
          <BalloonField />
          <HotAirStory />
          <GoldenBalloon />
        </main>
      )}
    </div>
  );
}

function Clouds() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {[
        { top: '8%', w: 220, d: 70, delay: -10 },
        { top: '24%', w: 160, d: 90, delay: -40 },
        { top: '55%', w: 260, d: 110, delay: -70 },
        { top: '78%', w: 180, d: 80, delay: -20 },
      ].map((c, i) => (
        <motion.div
          key={i}
          className="absolute h-14 rounded-full bg-white/80 blur-[2px]"
          style={{ top: c.top, width: c.w }}
          initial={{ x: '-30vw' }}
          animate={{ x: '120vw' }}
          transition={{ duration: c.d, repeat: Infinity, ease: 'linear', delay: c.delay }}
        />
      ))}
    </div>
  );
}

export function Balloon({ color, className, label }: { color: string; className?: string; label?: string }) {
  return (
    <svg viewBox="0 0 80 150" className={className} aria-hidden={label ? undefined : true} role={label ? 'img' : undefined} aria-label={label}>
      <defs>
        <radialGradient id={`bg-${color.slice(1)}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="25%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.85" />
        </radialGradient>
      </defs>
      <path d="M40 92 C 44 105, 32 115, 40 128 S 36 142, 40 150" stroke="#2b2250" strokeOpacity="0.35" strokeWidth="1.2" fill="none" />
      <ellipse cx="40" cy="46" rx="32" ry="40" fill={`url(#bg-${color.slice(1)})`} />
      <path d="M35 86 L45 86 L42 92 L38 92 Z" fill={color} />
      <ellipse cx="28" cy="28" rx="6" ry="10" fill="#fff" opacity="0.45" transform="rotate(-25 28 28)" />
    </svg>
  );
}

function usePop() {
  const { fx } = useExperience();
  return (e: MouseEvent, color: string) => {
    fx.burst({ x: e.clientX, y: e.clientY, count: 22, colors: [color, '#ffffff', '#ffc93c'], shape: 'rect', size: 9, speed: 380 });
  };
}

function Opening() {
  const { config, open } = useExperience();
  const pop = usePop();
  const balloons = [0, 1, 2, 3, 4];
  return (
    <motion.div className="fixed inset-0 z-50 overflow-hidden" exit={{ opacity: 0, transition: { duration: 0.5 } }}>
      <div className="absolute inset-x-0 top-[18%] px-6 text-center">
        <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, type: 'spring' }} className={`${display} text-3xl font-semibold sm:text-5xl`}>
          {config.messages.intro.trim() || 'Psst… something’s floating your way.'}
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} className="mt-3 text-lg text-[#5b5287]">
          Pop any balloon to begin
        </motion.p>
      </div>
      {balloons.map((i) => (
        <motion.button
          key={i}
          type="button"
          aria-label="Pop this balloon to open your surprise"
          className="absolute w-20 sm:w-24"
          style={{ left: `${10 + i * 18}%` }}
          initial={{ top: '110%' }}
          animate={{ top: `${42 + (i % 2) * 12}%` }}
          transition={{ delay: 0.8 + i * 0.35, duration: 3.2, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.08 }}
          onClick={(e) => {
            pop(e, COLORS[i]);
            open();
          }}
        >
          <motion.div animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }} transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}>
            <Balloon color={COLORS[i]} className="w-full" />
          </motion.div>
        </motion.button>
      ))}
    </motion.div>
  );
}

function Hero() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  const word = 'HAPPY BIRTHDAY';
  return (
    <section aria-label="Happy birthday" className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className={`${display} flex flex-col items-center`}>
        <span className="flex flex-wrap justify-center gap-1 sm:gap-2" aria-label={word}>
          {[...word].map((ch, i) =>
            ch === ' ' ? (
              <span key={i} className="basis-full sm:basis-auto sm:w-6" />
            ) : (
              <motion.span
                key={i}
                aria-hidden
                initial={{ y: 300, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 10, delay: 0.1 + i * 0.06 }}
                className="inline-block"
              >
                <span
                  className="inline-flex size-10 items-center justify-center rounded-[45%] text-2xl font-bold text-white shadow-[inset_-4px_-6px_0_rgb(0_0_0/0.12),inset_4px_4px_0_rgb(255_255_255/0.35)] sm:size-20 sm:text-5xl"
                  style={{ background: COLORS[i % COLORS.length], animation: `float ${3 + (i % 4) * 0.4}s ease-in-out ${i * 0.2}s infinite` }}
                >
                  {ch}
                </span>
              </motion.span>
            ),
          )}
        </span>
        <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, type: 'spring' }} className="mt-6 text-5xl font-bold text-[var(--bd-primary)] sm:text-7xl">
          <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />!
        </motion.span>
      </h1>
      <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.5, duration: 1.6, ease: [0.22, 1, 0.36, 1] }} className="relative mt-10 w-56 sm:w-64">
        <div className="animate-float">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[50%_50%_46%_46%/56%_56%_44%_44%] border-[6px] border-white shadow-[0_20px_40px_-10px_rgb(43_34_80/0.35)]">
            <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add your hero photo" tone="light" priority className="h-full w-full" />
          </div>
          <svg viewBox="0 0 20 80" className="mx-auto h-20 w-5" aria-hidden>
            <path d="M10 0 C 16 20, 4 40, 10 60 S 8 75, 10 80" stroke="#2b2250" strokeOpacity="0.35" fill="none" />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}

type Surprise = { id: string; kind: 'memory' | 'note'; title: string; text: string; image?: string; color: string };

function BalloonField() {
  const { config } = useExperience();
  const pop = usePop();
  const surprises = useMemo<Surprise[]>(() => {
    const memories = getMemories(config);
    const notes = splitParagraphs(config.messages.main);
    const list: Surprise[] = memories.map((m, i) => ({
      id: m.id,
      kind: 'memory',
      title: m.titleText,
      text: m.captionText,
      image: m.image,
      color: COLORS[i % COLORS.length],
    }));
    const msg = notes.length ? notes : [PLACEHOLDER.message];
    msg.forEach((p, i) => list.splice(Math.min(list.length, i * 3 + 1), 0, { id: `note-${i}`, kind: 'note', title: 'A note for you', text: p, color: COLORS[(i + 3) % COLORS.length] }));
    return list;
  }, [config]);
  const [popped, setPopped] = useState<string[]>([]);
  const found = surprises.filter((s) => popped.includes(s.id));

  return (
    <section aria-labelledby="bf-field" className="relative px-4 py-20">
      <Reveal kind="up" className="text-center">
        <h2 id="bf-field" className={`${display} text-4xl font-bold sm:text-6xl`}>
          Every balloon hides a surprise
        </h2>
        <p className="mt-3 text-lg text-[#5b5287]" aria-live="polite">
          {found.length} of {surprises.length} found
        </p>
      </Reveal>
      <ul className="mx-auto mt-10 grid max-w-5xl grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-4 lg:grid-cols-6">
        {surprises.map((s, i) => {
          const isPopped = popped.includes(s.id);
          return (
            <li key={s.id} className="flex h-40 items-end justify-center sm:h-48" style={{ paddingBottom: (i % 3) * 18 }}>
              <AnimatePresence>
                {!isPopped && (
                  <motion.button
                    type="button"
                    aria-label={`Pop balloon ${i + 1}`}
                    // Each balloon rises on its own spring (different buoyancy and drag), then bobs at rest.
                    initial={{ y: 220, opacity: 0, rotate: (i % 2 ? 1 : -1) * (6 + (i % 4) * 2) }}
                    whileInView={{ y: 0, opacity: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    exit={{ scale: [1, 1.25, 0.2], opacity: [1, 1, 0], transition: { duration: 0.18, ease: 'easeIn' } }}
                    transition={{
                      type: 'spring',
                      stiffness: 38 + ((i * 17) % 30),
                      damping: 7 + ((i * 7) % 6),
                      mass: 0.8 + ((i * 13) % 7) / 10,
                      delay: (i % 6) * 0.11 + ((i * 29) % 10) / 40,
                      opacity: { duration: 0.4, delay: (i % 6) * 0.11 },
                    }}
                    whileHover={{ scale: 1.08 }}
                    onClick={(e) => {
                      pop(e, s.color);
                      setPopped((p) => [...p, s.id]);
                    }}
                    className="w-16 sm:w-20"
                  >
                    <div style={{ animation: `float ${3 + (i % 3) * 0.5}s ease-in-out ${i * 0.15}s infinite` }}>
                      <Balloon color={s.color} className="w-full" />
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
      {popped.length < surprises.length && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setPopped(surprises.map((s) => s.id))}
            className="h-11 rounded-full px-5 text-sm font-semibold text-[#5b5287] underline-offset-4 hover:underline"
          >
            Pop them all at once
          </button>
        </div>
      )}
      <ul className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {found.map((s) => (
            <motion.li
              key={s.id}
              layout
              initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
              className="overflow-hidden rounded-3xl bg-white shadow-[0_15px_40px_-15px_rgb(43_34_80/0.35)]"
              style={{ borderTop: `8px solid ${s.color}` }}
            >
              {s.kind === 'memory' && <PhotoSlot src={s.image} alt={s.title} tone="light" label="Upload memory" className="aspect-[4/3] w-full" />}
              <div className="p-5">
                <p className={`${display} text-xl font-bold`} style={{ color: s.color }}>
                  {s.title}
                </p>
                <p className={cn('mt-1 text-[#4b4373]', s.kind === 'note' && 'text-lg leading-relaxed')}>{s.text}</p>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}

function HotAirStory() {
  const { config } = useExperience();
  const items = getTimeline(config);
  return (
    <section aria-labelledby="bf-story" className="relative px-4 py-20">
      <Reveal kind="up" className="text-center">
        <h2 id="bf-story" className={`${display} text-4xl font-bold sm:text-6xl`}>
          Up, up and away
        </h2>
        <p className="mt-2 text-lg text-[#5b5287]">Our little story, one balloon at a time.</p>
      </Reveal>
      <ol className="mx-auto mt-14 flex max-w-5xl flex-col gap-10 sm:gap-4">
        {items.map((t, i) => (
          <motion.li
            key={t.id}
            initial={{ y: 160, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className={cn('flex flex-col items-center gap-4 sm:w-1/2 sm:flex-row', i % 2 ? 'sm:ml-auto sm:flex-row-reverse sm:text-right' : '')}
          >
            <div className="w-36 shrink-0" style={{ animation: `float ${4 + i * 0.4}s ease-in-out infinite` }}>
              <div className="relative aspect-square overflow-hidden rounded-[50%_50%_40%_40%] border-4 border-white shadow-lg" style={{ background: COLORS[i % COLORS.length] }}>
                <PhotoSlot src={t.image} alt={t.titleText} label="Add photo" tone="light" className="absolute inset-3 rounded-[50%_50%_40%_40%]" />
              </div>
              <div className="mx-auto flex w-16 justify-between" aria-hidden>
                <span className="h-6 w-px rotate-[20deg] bg-[#7a5c3e]" />
                <span className="h-6 w-px -rotate-[20deg] bg-[#7a5c3e]" />
              </div>
              <div className="mx-auto h-6 w-12 rounded-b-lg bg-[#a77b50]" aria-hidden />
            </div>
            <div className="text-center sm:text-inherit">
              <h3 className={`${display} text-2xl font-bold`} style={{ color: COLORS[i % COLORS.length] }}>
                {t.titleText}
              </h3>
              <p className="mt-1 text-lg text-[#4b4373]">{t.captionText}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

function GoldenBalloon() {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(COLORS);
  const [popped, setPopped] = useState(false);
  const image = config.finalImage ?? config.heroImage;

  const popIt = (e: MouseEvent) => {
    setPopped(true);
    fx.burst({ x: e.clientX, y: e.clientY, count: 60, colors: ['#ffc93c', '#fff1a8', '#ffffff'], shape: 'star', speed: 520, size: 14 });
    fx.cannons({ colors, count: 240 });
    window.setTimeout(() => fx.rain({ colors, count: 200 }), 600);
  };

  return (
    <section aria-labelledby="bf-final" className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-24 text-center">
      <AnimatePresence mode="wait">
        {!popped ? (
          <motion.div key="gold" exit={{ scale: 1.6, opacity: 0, transition: { duration: 0.3 } }} className="flex flex-col items-center">
            <h2 id="bf-final" className={`${display} text-4xl font-bold sm:text-5xl`}>
              Pop the last balloon!
            </h2>
            <motion.button
              type="button"
              onClick={popIt}
              aria-label="Pop the giant golden balloon"
              className="mt-8 w-44 sm:w-56"
              animate={{ y: [0, -16, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.9 }}
            >
              <Balloon color="#ffc93c" className="w-full drop-shadow-[0_0_40px_rgb(255_201_60/0.7)]" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="party" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 10 }} className="flex flex-col items-center" role="status">
            <PartyPopper className="size-14 text-[var(--bd-primary)]" aria-hidden />
            <p className={`${display} mt-4 text-6xl leading-none font-bold text-[var(--bd-primary)] sm:text-8xl`}>HAPPY BIRTHDAY!</p>
            <p className={`${display} mt-3 text-4xl font-bold`}>
              <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
            </p>
            <div className="mt-10 w-full max-w-lg overflow-hidden rounded-[2rem] border-8 border-white shadow-xl">
              <PhotoSlot src={image} alt={`A final photo for ${name}`} label="Add a final photo" tone="light" className="aspect-[4/3] w-full" />
            </div>
            <div className="mt-8 max-w-xl rounded-3xl bg-white/80 p-6 text-xl leading-relaxed shadow-lg">
              <Sparkles className="mx-auto mb-2 size-6 text-[var(--bd-accent)]" aria-hidden />
              <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
              <p className="mt-4 text-base font-semibold text-[#5b5287]">
                — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
              </p>
            </div>
            <p className="mt-6 text-lg text-[#5b5287]">{config.messages.final}</p>
            <button type="button" onClick={restart} className="mt-8 h-11 rounded-full bg-[#2b2250] px-6 font-semibold text-white">
              Inflate everything again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
