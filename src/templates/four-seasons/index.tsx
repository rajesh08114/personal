import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { animate, AnimatePresence, motion, useInView, useMotionValue } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Lightbox } from '@/components/experience/Lightbox';
import { BirthdayCake } from '@/components/experience/BirthdayCake';
import {
  getMemories,
  getTimeline,
  toLightboxItems,
  type ResolvedMemory,
} from '@/components/experience/content';
import { MorphParticles, type MorphTarget } from '@/components/effects/MorphParticles';
import { textPoints } from '@/components/effects/shapes';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';
import { birthdaySeason, LOOKS, splitAcrossSeasons, yearEndingIn, type Season } from './seasons';
import { Scene, WindowFrame } from './Scene';
import { Weather } from './Weather';
import { FrostPane, REVEALS, WinterPrints } from './Reveals';
import './seasons.css';

const ROMAN = ['I', 'II', 'III', 'IV'];

/**
 * "A Year Around You": one window, one tree, a whole year. The world outside turns through
 * the four seasons as the recipient scrolls, and the year ends on the season of their birthday.
 */
export default function FourSeasons() {
  const { config, opened, effectsScale, reducedMotion } = useExperience();
  const order = useMemo(
    () => yearEndingIn(birthdaySeason(config.birthdayDate, config.hemisphere)),
    [config.birthdayDate, config.hemisphere],
  );
  const pos = useMotionValue(0);
  const memories = getMemories(config);
  const groups = splitAcrossSeasons(memories);
  const [lightbox, setLightbox] = useState<number | null>(null);

  /** Turning the year is a slow crossfade of the whole world, never a cut. */
  const goTo = (index: number) => {
    if (reducedMotion) pos.set(index);
    else animate(pos, index, { duration: 2.6, ease: EASE.silk });
  };

  return (
    <div className="fs-root relative min-h-dvh text-[#2f2a24]">
      <Scene order={order} pos={pos} />
      {!reducedMotion && opened && <Weather order={order} pos={pos} scale={effectsScale} />}
      <WindowFrame />
      <AnimatePresence>{!opened && <Curtains key="curtains" first={order[0]} />}</AnimatePresence>
      {opened && (
        <main className="relative z-10 pb-24">
          <Prologue onEnter={() => goTo(0)} />
          {order.map((season, i) => (
            <Act key={season} index={i} season={season} onEnter={() => goTo(i)} last={i === order.length - 1}>
              <ActContent index={i} season={season} items={groups[i]} onOpen={setLightbox} />
            </Act>
          ))}
          <Finale season={order[order.length - 1]} onEnter={() => goTo(order.length - 1)} />
        </main>
      )}
      <Lightbox
        items={toLightboxItems(memories)}
        index={lightbox}
        onIndexChange={setLightbox}
        captionClassName="font-t-display italic"
      />
    </div>
  );
}

/** Calls `onEnter` whenever the section becomes the one being read. */
function useEnter(onEnter: () => void, amount = 0.35) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount });
  const enter = useRef(onEnter);
  enter.current = onEnter;
  useEffect(() => {
    if (inView) enter.current();
  }, [inView]);
  return ref;
}

function Curtains({ first }: { first: Season }) {
  const { config, open, reducedMotion } = useExperience();
  const { name } = useBirthdayText();
  const [drawn, setDrawn] = useState(false);
  const draw = () => {
    if (drawn) return;
    setDrawn(true);
    window.setTimeout(open, reducedMotion ? 0 : 1500);
  };
  const half = (side: 'left' | 'right') => (
    <motion.div
      drag={drawn ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.35}
      onDragEnd={(_, info) => Math.abs(info.offset.x) > 60 && draw()}
      animate={{
        x: drawn ? (side === 'left' ? '-102%' : '102%') : 0,
        skewY: drawn ? (side === 'left' ? 2 : -2) : 0,
      }}
      transition={{ duration: 1.5, ease: EASE.silk }}
      className={cn(
        'fs-curtain absolute inset-y-0 w-1/2 cursor-grab active:cursor-grabbing',
        side === 'left' ? 'left-0' : 'right-0',
      )}
    />
  );
  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden"
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
    >
      {half('left')}
      {half('right')}
      <motion.div
        animate={{ opacity: drawn ? 0 : 1 }}
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center text-[#f6ead8]"
      >
        <p className="text-xs tracking-[0.4em] uppercase opacity-80">A year around</p>
        <h1 className="mt-4 font-t-display text-5xl leading-tight sm:text-7xl">{name}</h1>
        <p className="mt-6 max-w-md font-t-display text-xl italic opacity-90">
          {config.messages.intro.trim() || 'Every season was better with you in it.'}
        </p>
      </motion.div>
      {!drawn && (
        <div className="absolute inset-x-0 bottom-16 flex flex-col items-center gap-2">
          <motion.button
            type="button"
            onClick={draw}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="h-14 rounded-full bg-[#f6ead8] px-8 font-semibold tracking-wide text-[#5a2a24] shadow-xl"
          >
            Open the curtains
          </motion.button>
          <p className="text-sm text-[#f6ead8]/75">
            …or pull them apart. It’s {LOOKS[first].label.toLowerCase()} outside.
          </p>
        </div>
      )}
    </motion.div>
  );
}

function Prologue({ onEnter }: { onEnter: () => void }) {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  const ref = useEnter(onEnter);
  return (
    <section
      ref={ref}
      aria-label="Happy birthday"
      className="flex min-h-dvh flex-col items-start justify-center px-8 py-24 sm:px-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, delay: 0.4, ease: EASE.out }}
        className="fs-page max-w-md p-6 sm:p-8"
      >
        <div className="-rotate-2 bg-[#fffdf8] p-3 pb-10 shadow-[0_20px_40px_-18px_rgb(40_30_20/0.55)]">
          <PhotoSlot
            src={config.heroImage}
            alt={`Portrait of ${name}`}
            label="Add your hero photo"
            tone="light"
            priority
            className="aspect-[4/5] w-full"
          />
        </div>
        <p className="mt-8 text-xs tracking-[0.3em] text-black/50 uppercase">The almanac of a year</p>
        <h1 className="mt-2 font-t-display text-5xl leading-[1.05] sm:text-6xl">
          Happy Birthday,
          <br />
          <span className="text-[var(--bd-primary)] italic">
            <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
          </span>
        </h1>
        <p className="mt-4 text-lg">Here is a year outside our window. Every season of it had you in it.</p>
      </motion.div>
    </section>
  );
}

function Act({
  index,
  season,
  onEnter,
  last,
  children,
}: {
  index: number;
  season: Season;
  onEnter: () => void;
  last: boolean;
  children: ReactNode;
}) {
  const ref = useEnter(onEnter);
  const look = LOOKS[season];
  const next = () => {
    const el = ref.current?.nextElementSibling;
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <section
      ref={ref}
      id={`fs-${season}`}
      aria-labelledby={`fs-${season}-h`}
      className="flex min-h-dvh flex-col justify-center px-5 py-24 sm:px-12"
    >
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.2, ease: EASE.out }}
        className="fs-page mx-auto mb-10 max-w-md px-6 py-4 text-center"
      >
        <p className="text-xs tracking-[0.35em] text-black/55 uppercase">
          {ROMAN[index]} · {look.label}
        </p>
        <h2 id={`fs-${season}-h`} className="mt-1 font-t-display text-4xl italic sm:text-5xl">
          {look.motto}
        </h2>
      </motion.header>
      <div className="mx-auto w-full max-w-5xl">{children}</div>
      <div className="mt-12 text-center">
        <button
          type="button"
          onClick={next}
          className="fs-page inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold tracking-wide"
        >
          {last ? 'And then, your birthday' : 'The year turns'} <ArrowDown className="size-4" aria-hidden />
        </button>
      </div>
    </section>
  );
}

/** Each act gets the next message in the story; its photos are revealed the way its season would. */
const ACT_MESSAGES = ['intro', 'main', 'wish', 'surprise'] as const;

function ActContent({
  index,
  season,
  items,
  onOpen,
}: {
  index: number;
  season: Season;
  items: ResolvedMemory[];
  onOpen: (i: number) => void;
}) {
  const { config, reducedMotion } = useExperience();
  const key = ACT_MESSAGES[index];
  const message = (
    <article className="fs-page mx-auto max-w-2xl px-6 py-8 sm:px-10">
      {key === 'main' ? (
        <>
          <Paragraphs
            value={config.messages.main}
            placeholder={PLACEHOLDER.message}
            className="space-y-4 text-xl leading-relaxed"
          />
          <p className="mt-6 text-right font-t-display text-xl italic">
            — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
          </p>
        </>
      ) : (
        <p className="text-center font-t-display text-2xl leading-relaxed italic sm:text-3xl">
          <Fill
            value={
              key === 'intro'
                ? config.messages.intro.trim() || 'Every season was better with you in it.'
                : config.messages[key]
            }
            placeholder={key === 'surprise' ? PLACEHOLDER.surprise : PLACEHOLDER.message}
          />
        </p>
      )}
    </article>
  );

  return (
    <div className="space-y-12">
      {season === 'winter' ? (
        <FrostPane revealed={reducedMotion} label="Frosted window glass hiding a message">
          {message}
        </FrostPane>
      ) : (
        message
      )}
      {key === 'wish' && <Almanac />}
      {items.length > 0 &&
        (season === 'winter' ? (
          <WinterPrints items={items} onOpen={onOpen} />
        ) : (
          (() => {
            const Reveal = REVEALS[season];
            return <Reveal items={items} onOpen={onOpen} revealed={reducedMotion} />;
          })()
        ))}
    </div>
  );
}

/** The story chapters, as entries in a hand-kept almanac. */
function Almanac() {
  const { config } = useExperience();
  const items = getTimeline(config);
  return (
    <ol className="fs-page mx-auto max-w-2xl divide-y divide-black/10 px-6 py-4 sm:px-10">
      {items.map((t) => (
        <motion.li
          key={t.id}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, ease: EASE.out }}
          className="flex items-center gap-4 py-4"
        >
          <PhotoSlot
            src={t.image}
            alt={t.titleText}
            label="+"
            tone="light"
            className="size-16 shrink-0 rounded-full"
          />
          <div className="min-w-0">
            <p className="font-t-display text-xl">{t.titleText}</p>
            <p className="text-black/65">{t.captionText}</p>
            {(t.date || t.place) && (
              <p className="mt-0.5 text-xs tracking-[0.18em] text-black/45 uppercase">
                {[t.date, t.place].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </motion.li>
      ))}
    </ol>
  );
}

const SEASON_SHAPES = [
  { shapes: ['petal'] as const, colors: LOOKS.spring.foliage },
  { shapes: ['circle'] as const, colors: ['#fff3b0', '#ffe066'] },
  { shapes: ['leaf'] as const, colors: LOOKS.autumn.foliage },
  { shapes: ['circle'] as const, colors: ['#ffffff', '#e2e8f0'] },
];

function Finale({ season, onEnter }: { season: Season; onEnter: () => void }) {
  const { config, fx, restart, theme } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors();
  const ref = useEnter(onEnter);
  const [blown, setBlown] = useState(false);
  const [target, setTarget] = useState<MorphTarget | null>(null);

  useEffect(() => {
    if (!blown) return;
    let cancelled = false;
    void textPoints(name, { fontFamily: "'IM Fell English', Georgia, serif", weight: 400, count: 900 }).then(
      (t) => {
        if (!cancelled && t.points.length) setTarget({ points: t.points, aspect: t.aspect, fill: 0.9 });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [blown, name]);

  /** Every season at once: petals, fireflies, leaves and snow swirl up around the tree. */
  const celebrate = () => {
    setBlown(true);
    SEASON_SHAPES.forEach((s, i) =>
      window.setTimeout(
        () =>
          fx.confetti({
            x: 0.25 + i * 0.17,
            y: 0.85,
            angle: 90,
            spread: 70,
            count: 70,
            shapes: [...s.shapes],
            colors: s.colors,
            velocity: 900,
          }),
        i * 260,
      ),
    );
    window.setTimeout(() => fx.fireworks({ duration: 3, colors }), 1200);
  };

  return (
    <section
      ref={ref}
      aria-labelledby="fs-final"
      className="flex min-h-dvh flex-col items-center justify-center px-5 py-24 text-center"
    >
      <div className="fs-page w-full max-w-2xl px-6 py-10 sm:px-12">
        <p className="text-xs tracking-[0.35em] text-black/55 uppercase">
          And the year comes home · {LOOKS[season].label}
        </p>
        <h2 id="fs-final" className="mt-3 font-t-display text-5xl leading-tight sm:text-6xl">
          Happy Birthday,{' '}
          <span className="text-[var(--bd-primary)] italic">
            <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
          </span>
        </h2>
        <div className="mx-auto mt-8 max-w-xs">
          <BirthdayCake
            shape="cupcake"
            // One candle, the kind you'd leave burning on a windowsill.
            candles={1}
            onAllOut={celebrate}
            tone="light"
            skin={{
              frosting: '#fbf3e6',
              sponge: theme.accent,
              spongeDark: theme.primary,
              drip: '#fbf3e6',
              plate: '#e6dac4',
              candles: [theme.primary, theme.secondary, theme.accent],
              sprinkles: [...LOOKS.spring.foliage, ...LOOKS.autumn.foliage],
            }}
          />
        </div>
        <AnimatePresence>
          {blown && (
            <motion.div
              key="after"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, delay: 0.8, ease: EASE.out }}
              role="status"
            >
              {/* Dusk outside the window: the season's lights gather into their name. */}
              <div
                className="relative mx-auto mt-6 h-36 w-full overflow-hidden rounded-sm bg-linear-to-b from-[#1f2438] to-[#3a2f3f] sm:h-44"
                aria-hidden
              >
                <MorphParticles
                  target={target}
                  colors={['#ffe9a8', theme.accent, '#fff6dd', theme.primary]}
                  count={800}
                  size={1.5}
                  interactive={false}
                />
              </div>
              <div className="mx-auto mt-6 max-w-sm rotate-1 bg-[#fffdf8] p-3 pb-8 shadow-[0_20px_40px_-18px_rgb(40_30_20/0.55)]">
                <PhotoSlot
                  src={config.finalImage ?? config.heroImage}
                  alt={`A final photo for ${name}`}
                  label="Add a final photo"
                  tone="light"
                  className="aspect-[4/5] w-full"
                />
              </div>
              <p className="mx-auto mt-8 max-w-lg font-t-display text-2xl leading-relaxed italic">
                {config.messages.final}
              </p>
              <p className="mt-4 text-lg">
                With love, every season — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
              </p>
              <button
                type="button"
                onClick={restart}
                className="mt-8 h-11 px-4 font-semibold underline underline-offset-4"
              >
                Watch the year again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
