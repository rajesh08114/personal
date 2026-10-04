import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import { Flower2, Sprout } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Lightbox } from '@/components/experience/Lightbox';
import { Reveal } from '@/components/experience/Motion';
import { getMemories, getTimeline, toLightboxItems } from '@/components/experience/content';
import { Particles } from '@/components/effects/Particles';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';
import './garden.css';

const serif = 'font-t-display';
const PETALS = ['#f4978e', '#ffafcc', '#c8b6ff', '#ffc8dd', '#f7b267', '#bde0fe'];

export default function GardenOfWishes() {
  const { opened } = useExperience();
  const [bloomAll, setBloomAll] = useState(false);
  return (
    <div className="relative min-h-dvh overflow-hidden text-[#3d4a3a]">
      <div aria-hidden className="fixed inset-0 bg-gradient-to-b from-[#ffe8d6] via-[#fdf2e3] to-[#e3f4ea]">
        <div className="absolute -top-40 -right-40 size-[36rem] rounded-full bg-[radial-gradient(circle,#ffd8a8,transparent_65%)]" />
        <div className="absolute -top-20 right-0 h-[120vh] w-[60vw] origin-top-right rotate-12 bg-[repeating-conic-gradient(from_200deg_at_100%_0,rgb(255_236_200/0.35)_0deg_4deg,transparent_4deg_12deg)] opacity-70" />
        <Particles variant="fireflies" density={5} colors={['#ffd166', '#ffe9a8']} followPointer />
      </div>
      <Butterflies />
      <AnimatePresence>{!opened && <Opening key="o" />}</AnimatePresence>
      {opened && (
        <main className="relative z-10">
          <Hero />
          <Garden bloomAll={bloomAll} />
          <Message />
          <Vine />
          <Bloom onBloom={() => setBloomAll(true)} bloomed={bloomAll} />
        </main>
      )}
    </div>
  );
}

function Butterflies() {
  const { reducedMotion } = useExperience();
  if (reducedMotion) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {[
        { color: '#c8b6ff', top: '20%', dur: 26, delay: 0 },
        { color: '#f4978e', top: '55%', dur: 32, delay: 9 },
      ].map((b, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: b.top }}
          initial={{ x: '-10vw', y: 0 }}
          animate={{ x: ['-10vw', '30vw', '60vw', '110vw'], y: [0, -60, 40, -30] }}
          transition={{ duration: b.dur, repeat: Infinity, delay: b.delay, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 40 30" className="h-7 w-9">
            <g style={{ transformOrigin: '20px 15px', animation: 'gw-flap 0.35s ease-in-out infinite alternate' }}>
              <path d="M20 15 C 6 0, 0 12, 8 18 C 12 22, 18 20, 20 15 Z" fill={b.color} />
              <path d="M20 15 C 34 0, 40 12, 32 18 C 28 22, 22 20, 20 15 Z" fill={b.color} />
            </g>
            <rect x="19" y="10" width="2" height="12" rx="1" fill="#3d4a3a" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

function Opening() {
  const { config, open } = useExperience();
  const [planted, setPlanted] = useState(false);
  const plant = () => {
    setPlanted(true);
    window.setTimeout(open, 2000);
  };
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fdf2e3]/80 px-6 text-center" exit={{ opacity: 0, transition: { duration: 1 } }}>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6 }} className={`${serif} max-w-xl text-3xl leading-snug italic sm:text-5xl`}>
        {config.messages.intro.trim() || 'Every beautiful memory leaves a little light behind.'}
      </motion.p>
      <div className="relative mt-12 h-40 w-32">
        <svg viewBox="0 0 100 140" className="absolute inset-0 h-full w-full" aria-hidden>
          <ellipse cx="50" cy="132" rx="40" ry="8" fill="#a3b18a" />
          {planted && (
            <>
              <motion.path d="M50 130 C 50 100, 46 80, 52 50" stroke="#6a994e" strokeWidth="4" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.4 }} />
              <motion.path d="M50 95 C 30 88, 26 76, 32 70 C 42 74, 48 84, 50 95 Z" fill="#8cb369" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1, type: 'spring' }} style={{ transformOrigin: '100% 100%' }} />
              <motion.path d="M51 80 C 70 72, 74 60, 68 54 C 58 58, 52 68, 51 80 Z" fill="#8cb369" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.3, type: 'spring' }} style={{ transformOrigin: '0% 100%' }} />
            </>
          )}
          <motion.circle cx="50" cy={planted ? 128 : 60} r="5" fill="#7f5539" animate={{ cy: planted ? 128 : 60 }} transition={{ duration: 0.4 }} />
        </svg>
      </div>
      {!planted && (
        <motion.button
          type="button"
          onClick={plant}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          whileHover={{ scale: 1.05 }}
          className="mt-6 inline-flex h-14 items-center gap-2 rounded-full bg-[var(--bd-secondary)] px-8 font-bold text-white shadow-lg"
        >
          <Sprout className="size-5" aria-hidden /> Plant the first seed
        </motion.button>
      )}
    </motion.div>
  );
}

function Hero() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  return (
    <section aria-label="Happy birthday" className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-20 text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.4, ease: EASE.out }} className="relative size-64 [--r:104px] sm:size-80 sm:[--r:130px]">
        {Array.from({ length: 14 }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute top-1/2 left-1/2 h-14 w-9 rounded-full opacity-90 sm:h-16 sm:w-11"
            style={{
              background: PETALS[i % PETALS.length],
              transform: `translate(-50%, -50%) rotate(${i * (360 / 14)}deg) translateY(calc(var(--r) * -1))`,
            }}
          />
        ))}
        <div className="absolute inset-[16%] overflow-hidden rounded-full border-[6px] border-white shadow-xl">
          <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add your hero photo" tone="light" priority className="h-full w-full" />
        </div>
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 1.2 }} className={`${serif} mt-12 text-5xl leading-tight sm:text-7xl`}>
        <span className="italic">Happy Birthday,</span>
        <br />
        <span className="text-[var(--bd-primary)]">
          <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
        </span>
      </motion.h1>
      <p className="mt-4 text-lg text-[#5d6b58]">Welcome to a garden grown from our memories.</p>
    </section>
  );
}

function GardenFlower({ grown, color, src, title, label, onPlant, onOpen, delay = 0 }: {
  grown: boolean; color: string; src?: string; title: string; label: string; onPlant: () => void; onOpen: () => void; delay?: number;
}) {
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative h-72 w-36 sm:w-40">
        <svg viewBox="0 0 120 260" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <motion.path d="M60 250 C 58 200, 66 150, 60 110" stroke="#6a994e" strokeWidth="5" fill="none" strokeLinecap="round" initial={false} animate={{ pathLength: grown ? 1 : 0 }} transition={{ duration: 1, delay }} />
          <motion.path d="M61 200 C 34 194, 26 176, 32 168 C 46 172, 58 186, 61 200 Z" fill="#8cb369" initial={false} animate={{ scale: grown ? 1 : 0 }} transition={{ delay: delay + 0.6, type: 'spring' }} style={{ transformOrigin: '100% 100%' }} />
          <motion.path d="M61 168 C 88 160, 94 144, 88 136 C 74 140, 64 154, 61 168 Z" fill="#8cb369" initial={false} animate={{ scale: grown ? 1 : 0 }} transition={{ delay: delay + 0.75, type: 'spring' }} style={{ transformOrigin: '0% 100%' }} />
          {Array.from({ length: 10 }, (_, i) => (
            <g key={i} transform={`rotate(${i * 36} 60 64)`}>
              <motion.ellipse
                cx="60"
                cy="34"
                rx="15"
                ry="30"
                fill={color}
                opacity={0.92}
                initial={false}
                animate={{ scale: grown ? 1 : 0 }}
                transition={{ delay: delay + 0.9 + i * 0.04, type: 'spring', stiffness: 180, damping: 12 }}
                style={{ transformOrigin: '50% 100%' }}
              />
            </g>
          ))}
          <ellipse cx="60" cy="252" rx="34" ry="7" fill="#7f5539" opacity="0.35" />
        </svg>
        <AnimatePresence>
          {grown && (
            <motion.button
              type="button"
              onClick={onOpen}
              aria-label={`Open memory: ${title}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ delay: delay + 1.2, type: 'spring' }}
              className="absolute top-[13.5%] left-1/2 aspect-square w-[42%] -translate-x-1/2 overflow-hidden rounded-full border-4 border-[#ffd166] bg-white shadow-md transition-transform hover:scale-110"
            >
              <PhotoSlot src={src} alt={title} label="+" tone="light" className="h-full w-full rounded-full" />
            </motion.button>
          )}
        </AnimatePresence>
        {!grown && (
          <button
            type="button"
            onClick={onPlant}
            aria-label={`Plant a seed for ${label}`}
            className="absolute bottom-2 left-1/2 inline-flex h-11 -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/80 px-4 text-sm font-bold text-[var(--bd-secondary)] shadow-md transition-transform hover:scale-105"
          >
            <Sprout className="size-4" aria-hidden /> Plant
          </button>
        )}
      </div>
      <p className={cn('mt-1 max-w-[10rem] text-center text-sm font-semibold transition-opacity', grown ? 'opacity-100' : 'opacity-0')}>{title}</p>
    </div>
  );
}

function Garden({ bloomAll }: { bloomAll: boolean }) {
  const { config } = useExperience();
  const memories = getMemories(config);
  const [planted, setPlanted] = useState<string[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const all = bloomAll || planted.length >= memories.length;

  return (
    <section aria-labelledby="gw-garden" className="relative px-4 py-20">
      <Reveal kind="up" className="text-center">
        <h2 id="gw-garden" className={`${serif} text-4xl italic sm:text-6xl`}>
          Some moments worth remembering…
        </h2>
        <p className="mt-3 text-[#5d6b58]">Plant a seed and watch a memory bloom.</p>
      </Reveal>
      <div className="mx-auto mt-10 max-w-6xl rounded-[3rem] bg-gradient-to-b from-transparent via-transparent to-[#a3b18a]/40 pb-6">
        <ul className="flex flex-wrap justify-center gap-x-2 gap-y-6">
          {memories.map((m, i) => (
            <li key={m.id}>
              <GardenFlower
                grown={bloomAll || planted.includes(m.id)}
                color={PETALS[i % PETALS.length]}
                src={m.image}
                title={m.titleText}
                label={m.slotLabel}
                onPlant={() => setPlanted((p) => [...p, m.id])}
                onOpen={() => setIndex(i)}
              />
            </li>
          ))}
        </ul>
      </div>
      {!all && (
        <div className="mt-6 text-center">
          <button type="button" onClick={() => setPlanted(memories.map((m) => m.id))} className="h-11 rounded-full px-5 font-semibold text-[var(--bd-secondary)] underline underline-offset-4">
            Plant every seed
          </button>
        </div>
      )}
      <Lightbox items={toLightboxItems(memories)} index={index} onIndexChange={setIndex} captionClassName={`${serif} italic`} />
    </section>
  );
}

function Message() {
  const { config } = useExperience();
  return (
    <section aria-labelledby="gw-msg" className="px-5 py-20">
      <Reveal kind="scale" className="relative mx-auto max-w-2xl">
        <Flower2 className="absolute -top-6 -left-4 size-14 rotate-[-20deg] text-[var(--bd-primary)]" aria-hidden />
        <Flower2 className="absolute -right-3 -bottom-6 size-12 rotate-12 text-[#c8b6ff]" aria-hidden />
        <article className="rounded-[2.5rem] bg-white/75 p-8 shadow-[0_30px_60px_-30px_rgb(61_74_58/0.4)] sm:p-12">
          <h2 id="gw-msg" className={`${serif} text-3xl italic sm:text-4xl`}>
            A message just for you…
          </h2>
          <Paragraphs value={config.messages.main} placeholder={PLACEHOLDER.message} className="mt-6 space-y-5 text-lg leading-relaxed text-[#4b5847] sm:text-xl" />
          <p className={`${serif} mt-8 text-right text-xl italic text-[var(--bd-primary)]`}>
            with love, <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
          </p>
        </article>
      </Reveal>
    </section>
  );
}

function Vine() {
  const { config } = useExperience();
  const items = getTimeline(config);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 40%'] });
  const grow = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const segment = 100 / Math.max(1, items.length);
  const d = items.reduce((acc, _, i) => acc + ` C ${i % 2 ? 30 : 70} ${segment * i + segment * 0.35}, ${i % 2 ? 70 : 30} ${segment * i + segment * 0.65}, 50 ${segment * (i + 1)}`, 'M50 0');

  return (
    <section aria-labelledby="gw-vine" className="px-5 py-20">
      <Reveal kind="up" className="text-center">
        <h2 id="gw-vine" className={`${serif} text-4xl italic sm:text-6xl`}>
          Our little story…
        </h2>
      </Reveal>
      <div ref={ref} className="relative mx-auto mt-14 max-w-4xl">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          <motion.path d={d} stroke="#6a994e" strokeWidth="1.2" fill="none" vectorEffect="non-scaling-stroke" style={{ pathLength: grow }} strokeLinecap="round" />
        </svg>
        <ol className="relative">
          {items.map((t, i) => (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, ease: EASE.out }}
              className={cn('flex min-h-64 items-center py-6', i % 2 ? 'justify-end' : 'justify-start')}
            >
              <div className="w-[min(78%,22rem)] rounded-[2rem] rounded-tl-none bg-white/80 p-4 shadow-lg">
                <PhotoSlot src={t.image} alt={t.titleText} label="Add a photo" tone="light" className="aspect-[16/10] w-full rounded-2xl" />
                <h3 className={`${serif} mt-3 text-2xl italic`}>{t.titleText}</h3>
                <p className="text-[#5d6b58]">{t.captionText}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Bloom({ onBloom, bloomed }: { onBloom: () => void; bloomed: boolean }) {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(PETALS);

  const bloom = () => {
    onBloom();
    fx.rain({ colors, shapes: ['petal'], count: 220, size: 14, duration: 4 });
    window.setTimeout(() => fx.confetti({ x: 0.5, y: 0.7, colors, shapes: ['petal', 'circle'], count: 120 }), 400);
  };

  return (
    <section aria-labelledby="gw-final" className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-24 text-center">
      {!bloomed ? (
        <>
          <h2 id="gw-final" className={`${serif} text-4xl italic sm:text-6xl`}>
            Ready for the whole garden?
          </h2>
          <motion.button
            type="button"
            onClick={bloom}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-10 inline-flex h-16 items-center gap-3 rounded-full bg-[var(--bd-primary)] px-10 text-lg font-bold text-white shadow-[0_15px_40px_-10px_var(--bd-primary)]"
          >
            <Flower2 className="size-6" aria-hidden /> Let everything bloom
          </motion.button>
          <p className="mt-4 text-sm text-[#5d6b58]">Every flower in your garden will open at once.</p>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: 0.6 }} role="status" className="flex flex-col items-center">
          <h2 id="gw-final" className={`${serif} text-6xl leading-tight sm:text-8xl`}>
            <span className="italic">Happy Birthday</span>
            <br />
            <span className="text-[var(--bd-primary)]">
              <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
            </span>
          </h2>
          <div className="mt-10 w-full max-w-md overflow-hidden rounded-[3rem] border-8 border-white shadow-xl">
            <PhotoSlot src={config.finalImage ?? config.heroImage} alt={`A final photo for ${name}`} label="Add a final photo" tone="light" className="aspect-[4/5] w-full" />
          </div>
          <p className={`${serif} mt-10 max-w-xl text-2xl leading-relaxed italic`}>
            <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
          </p>
          <p className="mt-4 text-[#5d6b58]">{config.messages.final}</p>
          <button type="button" onClick={restart} className="mt-10 h-11 text-[var(--bd-secondary)] underline underline-offset-4">
            Walk through the garden again
          </button>
        </motion.div>
      )}
    </section>
  );
}
