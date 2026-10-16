import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { BookOpen, Sparkle, WandSparkles } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, splitParagraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Lightbox } from '@/components/experience/Lightbox';
import { getMemories, getTimeline, toLightboxItems } from '@/components/experience/content';
import { Particles } from '@/components/effects/Particles';
import { PointerTrail } from '@/components/effects/PointerTrail';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';

const deco = 'font-t-display';
const GOLD = '#d4a64a';
const parchment = 'bg-[#f3e6c8] text-[#3b2a1a] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6),inset_0_0_60px_rgb(120_80_30/0.25)]';

const StarsCtx = createContext<{ found: string[]; find: (id: string, x: number, y: number) => void }>({ found: [], find: () => {} });

export default function Fairytale() {
  const { opened, fx, theme } = useExperience();
  const [found, setFound] = useState<string[]>([]);
  const find = (id: string, x: number, y: number) => {
    setFound((f) => (f.includes(id) ? f : [...f, id]));
    fx.burst({ x, y, shape: 'star', colors: [GOLD, '#fff3c4'], count: 16, speed: 240, size: 12 });
  };
  return (
    <StarsCtx.Provider value={{ found, find }}>
      <div className="relative min-h-dvh bg-[#120d24] text-[#f6ead0]">
        <div aria-hidden className="pointer-events-none fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#120d24] via-[#2a1f4f] to-[#120d24]" />
          <Particles variant="dust" density={5} colors={[GOLD, theme.accent]} />
        </div>
        <AnimatePresence mode="wait">{!opened ? <BookCover key="cover" /> : <Story key="story" />}</AnimatePresence>
        {opened && (
          <p className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-[#d4a64a]/40 bg-[#120d24]/80 px-3 py-1.5 text-sm" aria-live="polite">
            <Sparkle className="size-4 fill-[#d4a64a] text-[#d4a64a]" aria-hidden /> {found.length}/3 hidden stars
          </p>
        )}
      </div>
    </StarsCtx.Provider>
  );
}

function HiddenStar({ id, className }: { id: string; className: string }) {
  const { found, find } = useContext(StarsCtx);
  if (found.includes(id)) return null;
  return (
    <button
      type="button"
      onClick={(e) => find(id, e.clientX, e.clientY)}
      aria-label="A hidden star! Tap to collect it"
      className={cn('absolute z-20 inline-flex size-11 items-center justify-center', className)}
    >
      <Sparkle className="size-4 animate-twinkle fill-[#fff3c4] text-[#fff3c4]" aria-hidden />
    </button>
  );
}

function BookCover() {
  const { config, open } = useExperience();
  return (
    <motion.div className="relative z-10 flex min-h-dvh items-center justify-center px-4" exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.9 } }}>
      <motion.button
        type="button"
        onClick={open}
        aria-label="Open the storybook"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ rotate: -1, scale: 1.02 }}
        transition={{ duration: 1.2, ease: EASE.out }}
        className="relative aspect-[3/4] w-[min(84vw,24rem)] rounded-r-xl rounded-l-sm bg-gradient-to-br from-[#5a2d2a] to-[#2e1514] p-6 shadow-[12px_16px_40px_rgb(0_0_0/0.7)]"
      >
        <span className="absolute inset-4 rounded-md border-2 border-[#d4a64a]/80" aria-hidden />
        <span className="absolute inset-6 rounded-md border border-[#d4a64a]/40" aria-hidden />
        <span className="relative flex h-full flex-col items-center justify-center gap-6 text-center">
          <Sparkle className="size-8 fill-[#d4a64a] text-[#d4a64a]" aria-hidden />
          <span className={`${deco} text-3xl leading-tight text-[#f3d98e]`}>{config.messages.intro.trim() || 'Once upon a time…'}</span>
          <span className="text-lg italic text-[#f3d98e]/80">
            The tale of <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
          </span>
          <span className="mt-6 inline-flex items-center gap-2 text-sm tracking-[0.3em] text-[#f3d98e]/70 uppercase">
            <BookOpen className="size-4" aria-hidden /> Open the book
          </span>
        </span>
      </motion.button>
    </motion.div>
  );
}

function Landscape({ lit }: { lit?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const far = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
  const mid = useTransform(scrollYProgress, [0, 1], ['0%', '-22%']);
  const near = useTransform(scrollYProgress, [0, 1], ['0%', '-35%']);
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] overflow-hidden">
      <motion.svg style={{ y: far }} viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-[-10%] h-full w-full">
        <path d="M0 140 Q80 90 160 130 T320 120 T400 110 V200 H0Z" fill="#2d2350" />
        <g fill="#1d1638">
          <rect x="250" y="70" width="40" height="70" />
          <rect x="238" y="92" width="12" height="48" />
          <rect x="290" y="92" width="12" height="48" />
          <polygon points="250,70 270,40 290,70" />
          <polygon points="238,92 244,78 250,92" />
          <polygon points="290,92 296,78 302,92" />
        </g>
        {[
          [262, 90],
          [276, 90],
          [268, 112],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="5" height="8" fill={lit ? '#ffd166' : '#140f2a'} style={{ transition: 'fill 1.2s', transitionDelay: `${i * 0.3}s` }} />
        ))}
      </motion.svg>
      <motion.svg style={{ y: mid }} viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-[-15%] h-full w-full">
        <path d="M0 160 Q100 120 200 155 T400 140 V200 H0Z" fill="#1a1433" />
        {[30, 60, 340, 370].map((x) => (
          <path key={x} d={`M${x} 160 l12 -40 l12 40 Z`} fill="#141029" />
        ))}
      </motion.svg>
      <motion.svg style={{ y: near }} viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-[-20%] h-full w-full">
        <path d="M0 180 Q120 150 240 178 T400 170 V200 H0Z" fill="#0e0a1d" />
      </motion.svg>
    </div>
  );
}

function Scene({ children, className, lit, label }: { children: ReactNode; className?: string; lit?: boolean; label: string }) {
  return (
    <section aria-label={label} className={cn('relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-24 text-center', className)}>
      <Landscape lit={lit} />
      <div className="relative z-10 w-full">{children}</div>
    </section>
  );
}

function GoldFrame({ children, className, oval }: { children: ReactNode; className?: string; oval?: boolean }) {
  return (
    <div className={cn('relative p-2.5 shadow-[0_20px_40px_rgb(0_0_0/0.6)]', oval ? 'rounded-[50%]' : 'rounded-md', className)} style={{ background: `linear-gradient(135deg, #f6d98a, ${GOLD} 40%, #8a6420 70%, #f6d98a)` }}>
      <div className={cn('overflow-hidden border-2 border-[#5c4214]', oval ? 'rounded-[50%]' : 'rounded-sm')}>{children}</div>
    </div>
  );
}

function Story() {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors([GOLD, '#fff3c4']);
  const memories = getMemories(config);
  const timeline = getTimeline(config);
  const paras = splitParagraphs(config.messages.main);
  const [index, setIndex] = useState<number | null>(null);
  const [spell, setSpell] = useState(false);
  const { found } = useContext(StarsCtx);

  const cast = () => {
    setSpell(true);
    fx.rain({ colors: [GOLD, '#fff3c4', '#ffffff'], shapes: ['star', 'circle'], count: 200, size: 9, duration: 4 });
    window.setTimeout(() => fx.fireworks({ colors, duration: 4, rockets: 10 }), 600);
  };

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} className="relative z-10">
      {/* Gold dust shaken loose wherever the pointer passes. */}
      <PointerTrail colors={[GOLD, '#fff3c4']} size={2} rate={1} />
      <Scene label="Once upon a time">
        <HiddenStar id="s1" className="top-[12%] left-[10%]" />
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className="text-2xl italic sm:text-3xl">
          Once upon a time…
        </motion.p>
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, duration: 1.5, ease: EASE.out }} className="mx-auto mt-10 w-[min(64vw,18rem)]">
          <GoldFrame oval>
            <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add your hero photo" priority className="aspect-[3/4] w-full" />
          </GoldFrame>
        </motion.div>
        {/* The line is uncovered left to right behind a soft edge, like candlelight moving across a page. */}
        <motion.h1
          initial={{ ['--reveal' as string]: '-25%' }}
          animate={{ ['--reveal' as string]: '125%' }}
          transition={{ delay: 2.2, duration: 2.8, ease: EASE.silk }}
          style={{
            maskImage: 'linear-gradient(90deg, #000 var(--reveal), transparent calc(var(--reveal) + 25%))',
            WebkitMaskImage: 'linear-gradient(90deg, #000 var(--reveal), transparent calc(var(--reveal) + 25%))',
          }}
          className="mx-auto mt-10 max-w-3xl text-3xl leading-snug sm:text-5xl"
        >
          a wonderful person named{' '}
          <span className={`${deco} text-[#f3d98e]`}>
            <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
          </span>{' '}
          was born.
        </motion.h1>
      </Scene>

      <section aria-labelledby="ft-decree" className="relative px-4 py-24">
        <HiddenStar id="s2" className="top-10 right-[12%]" />
        <h2 id="ft-decree" className={`${deco} text-center text-3xl text-[#f3d98e] sm:text-5xl`}>
          The royal decree
        </h2>
        <motion.article
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 2, ease: EASE.inOut }}
          className={cn('relative mx-auto mt-10 max-w-2xl rounded-sm px-8 py-12 sm:px-14', parchment)}
        >
          <span aria-hidden className="absolute inset-x-[-1rem] -top-4 h-8 rounded-full bg-gradient-to-b from-[#c9a46a] to-[#8b6a3a] shadow-md" />
          <span aria-hidden className="absolute inset-x-[-1rem] -bottom-4 h-8 rounded-full bg-gradient-to-b from-[#c9a46a] to-[#8b6a3a] shadow-md" />
          <p className="text-center text-sm tracking-[0.3em] uppercase">Hear ye, hear ye</p>
          <div className="mt-6 space-y-5 text-left text-xl leading-relaxed">
            {(paras.length ? paras : ['']).map((p, i) => (
              <p key={i} className={cn(i === 0 && 'first-letter:float-left first-letter:mr-2 first-letter:font-t-display first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-[#8a2c2c]')}>
                {p || <Fill value="" placeholder={PLACEHOLDER.message} />}
              </p>
            ))}
          </div>
          <p className="mt-8 text-right text-lg italic">
            By royal hand, <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
          </p>
          <span aria-hidden className="absolute right-8 -bottom-2 flex size-16 items-center justify-center rounded-full bg-[#8a2c2c] text-2xl text-[#f3d98e] shadow-lg">
            ✦
          </span>
        </motion.article>
      </section>

      <section aria-labelledby="ft-treasures" className="relative px-4 py-24">
        <h2 id="ft-treasures" className={`${deco} text-center text-3xl text-[#f3d98e] sm:text-5xl`}>
          Treasures of the realm
        </h2>
        <p className="mt-2 text-center text-lg italic text-[#f6ead0]/70">Paintings of the moments worth remembering</p>
        <ul className="mx-auto mt-12 grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((m, i) => (
            <motion.li key={m.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.15, duration: 1 }}>
              <button type="button" onClick={() => setIndex(i)} className="group block w-full" aria-label={`View painting: ${m.titleText}`}>
                <span aria-hidden className="mx-auto block h-6 w-px bg-[#d4a64a]/60" />
                <GoldFrame className="origin-top transition-transform duration-700 group-hover:rotate-[1.5deg]">
                  <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} className="aspect-[4/5] w-full" imgClassName="sepia-[0.25] transition-[filter] duration-700 group-hover:sepia-0" />
                </GoldFrame>
                <span className="mx-auto mt-4 block w-fit rounded-sm bg-[#2a1f4f] px-3 py-1 text-lg italic ring-1 ring-[#d4a64a]/50">{m.titleText}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ft-map" className="relative px-4 py-24">
        <HiddenStar id="s3" className="bottom-16 left-[8%]" />
        <h2 id="ft-map" className={`${deco} text-center text-3xl text-[#f3d98e] sm:text-5xl`}>
          The tale so far
        </h2>
        <div className={cn('relative mx-auto mt-12 max-w-4xl rounded-md p-6 sm:p-10', parchment)}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <motion.path
              d="M15 5 C 80 15, 85 30, 50 40 S 10 60, 45 72 S 90 85, 80 98"
              stroke="#8a2c2c"
              strokeWidth="0.6"
              strokeDasharray="2 1.6"
              fill="none"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 3 }}
            />
          </svg>
          <ol className="relative space-y-10">
            {timeline.map((t, i) => (
              <motion.li key={t.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 1 }} className={cn('flex flex-col gap-4 sm:flex-row sm:items-center', i % 2 && 'sm:flex-row-reverse')}>
                <div className="w-full sm:w-1/2">
                  <div className="rotate-[-1deg] border-4 border-[#f9f1dc] shadow-md">
                    <PhotoSlot src={t.image} alt={t.titleText} label="Add a photo" tone="light" className="aspect-[4/3] w-full" imgClassName="sepia-[0.35]" />
                  </div>
                </div>
                <div className={cn('sm:w-1/2', i % 2 ? 'sm:text-right' : 'sm:text-left')}>
                  <p className={`${deco} text-sm text-[#8a2c2c]`}>Chapter {['I', 'II', 'III', 'IV', 'V', 'VI'][i]}</p>
                  <h3 className={`${deco} text-2xl`}>{t.titleText}</h3>
                  <p className="text-lg italic">{t.captionText}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <Scene label="The birthday spell" lit={spell}>
        {!spell ? (
          <>
            <p className="text-2xl italic">{found.length === 3 ? 'You found every hidden star. The magic is ready.' : 'One last enchantment awaits…'}</p>
            <motion.button
              type="button"
              onClick={cast}
              whileHover={{ scale: 1.06, rotate: -3 }}
              whileTap={{ scale: 0.94 }}
              className={`${deco} mt-10 inline-flex h-16 items-center gap-3 rounded-full border-2 border-[#d4a64a] bg-[#2a1f4f]/80 px-10 text-xl text-[#f3d98e] shadow-[0_0_40px_rgb(212_166_74/0.5)]`}
            >
              <WandSparkles className="size-6" aria-hidden /> Cast the birthday spell
            </motion.button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6, delay: 0.6 }} role="status" className="mx-auto max-w-3xl">
            <h2 className={`${deco} text-4xl leading-tight text-[#f3d98e] sm:text-6xl`}>
              Happy Birthday, <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
            </h2>
            <p className="mt-6 text-2xl italic">And today begins another beautiful chapter.</p>
            <div className={cn('mx-auto mt-10 max-w-xl rounded-sm p-8 text-xl leading-relaxed', parchment)}>
              <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
            </div>
            <div className="mx-auto mt-10 w-[min(70vw,20rem)]">
              <GoldFrame>
                <PhotoSlot src={config.finalImage ?? config.heroImage} alt={`A final portrait of ${name}`} label="Add a final photo" className="aspect-[4/5] w-full" />
              </GoldFrame>
            </div>
            <p className="mt-10 text-lg italic text-[#f6ead0]/80">{config.messages.final}</p>
            <p className={`${deco} mt-6 text-2xl text-[#f3d98e]`}>The End… or rather, the beginning.</p>
            <button type="button" onClick={restart} className="mt-8 h-11 text-lg italic text-[#f6ead0]/60 underline underline-offset-4 hover:text-[#f6ead0]">
              Read the tale again
            </button>
          </motion.div>
        )}
      </Scene>
      <Lightbox items={toLightboxItems(memories)} index={index} onIndexChange={setIndex} captionClassName="italic" />
    </motion.main>
  );
}
