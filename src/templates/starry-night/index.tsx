import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Star } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Lightbox } from '@/components/experience/Lightbox';
import { Reveal } from '@/components/experience/Motion';
import { getMemories, getTimeline, toLightboxItems } from '@/components/experience/content';
import { Particles } from '@/components/effects/Particles';
import { PointerTrail } from '@/components/effects/PointerTrail';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { PLACEHOLDER } from '@/data/placeholders';
import { formatBirthday } from '@/utils/date';
import { EASE } from '@/animations/tokens';
import './starry.css';

const serif = 'font-t-display';

export default function StarryNight() {
  const { opened } = useExperience();
  return (
    <div className="relative text-[#e9ecff]">
      <div className="sn-sky" aria-hidden>
        <Particles variant="stars" density={14} colors={['#ffffff', '#cfd8ff', '#ffe7a3']} />
        <span className="sn-shooting" style={{ top: '12%', right: '-10%', animationDelay: '2s' }} />
        <span className="sn-shooting" style={{ top: '30%', right: '-15%', animationDelay: '6.5s' }} />
      </div>
      <AnimatePresence>{!opened && <Opening key="o" />}</AnimatePresence>
      {opened && (
        <main className="relative z-10">
          <PointerTrail colors={['#ffffff', '#ffe7a3', '#bfcaff']} shape="star" size={3} />
          <Hero />
          <Letter />
          <ConstellationGallery />
          <MoonPhases />
          <ShootingStarWish />
          <Finale />
        </main>
      )}
    </div>
  );
}

function Opening() {
  const { config, open } = useExperience();
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black px-6 text-center"
      exit={{ opacity: 0, transition: { duration: 1.6 } }}
    >
      <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 6 }}>
        <Particles variant="stars" density={16} colors={['#ffffff', '#cfd8ff']} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, letterSpacing: '0.6em' }}
        animate={{ opacity: 1, letterSpacing: '0.25em' }}
        transition={{ duration: 3, ease: EASE.out }}
        className="relative text-xs font-medium text-white/60 uppercase"
      >
        {config.messages.intro.trim() || 'Look up…'}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 2 }}
        className={`${serif} relative mt-5 text-4xl font-light italic sm:text-6xl`}
      >
        tonight is a little different.
      </motion.h1>
      <motion.button
        type="button"
        onClick={open}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.8, duration: 1.2 }}
        whileHover={{ scale: 1.05 }}
        className="relative mt-12 inline-flex h-14 items-center gap-3 rounded-full border border-white/30 px-8 text-sm tracking-[0.3em] text-white uppercase transition-colors hover:border-white hover:bg-white/10"
      >
        <Star className="size-4 fill-current" aria-hidden /> Look up
      </motion.button>
    </motion.div>
  );
}

/** Samples points from the rendered name and links them into a constellation. */
function useConstellation(text: string) {
  const [data, setData] = useState<{ points: Array<[number, number]>; lines: Array<[number, number, number, number]>; size: number } | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await document.fonts.load('500 160px "Cormorant Garamond"');
      } catch {
        /* fall back to the system serif */
      }
      const W = 1200;
      const H = 300;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx || cancelled) return;
      let size = 210;
      const font = (s: number) => `500 ${s}px "Cormorant Garamond", Georgia, serif`;
      ctx.font = font(size);
      while (ctx.measureText(text).width > W * 0.9 && size > 36) {
        size -= 6;
        ctx.font = font(size);
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, W / 2, H / 2);
      const img = ctx.getImageData(0, 0, W, H).data;
      const candidates: Array<[number, number]> = [];
      for (let y = 0; y < H; y += 4) for (let x = 0; x < W; x += 4) if (img[(y * W + x) * 4 + 3] > 140) candidates.push([x, y]);
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }
      const minD = Math.max(10, Math.min(30, size * 0.15));
      const pts: Array<[number, number]> = [];
      for (const c of candidates) {
        if (pts.length >= 110) break;
        if (pts.every((p) => Math.hypot(p[0] - c[0], p[1] - c[1]) > minD)) pts.push(c);
      }
      // Greedy nearest-neighbour tour from the left; skip long jumps between letters.
      const remaining = [...pts].sort((a, b) => a[0] - b[0]);
      const tour: Array<[number, number]> = [];
      let cur = remaining.shift();
      while (cur) {
        tour.push(cur);
        let best = -1;
        let bestD = Infinity;
        remaining.forEach((p, i) => {
          const d = Math.hypot(p[0] - cur![0], p[1] - cur![1]);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        });
        cur = best >= 0 ? remaining.splice(best, 1)[0] : undefined;
      }
      const lines: Array<[number, number, number, number]> = [];
      for (let i = 1; i < tour.length; i++) {
        const [a, b] = [tour[i - 1], tour[i]];
        if (Math.hypot(a[0] - b[0], a[1] - b[1]) < minD * 2.6) lines.push([a[0], a[1], b[0], b[1]]);
      }
      if (!cancelled) setData({ points: tour, lines, size });
    })();
    return () => {
      cancelled = true;
    };
  }, [text]);
  return data;
}

function Hero() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  const data = useConstellation(name);
  const date = formatBirthday(config.birthdayDate);
  const [phase, setPhase] = useState(0);

  return (
    <section aria-label="Happy birthday" className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-24 text-center">
      <button
        type="button"
        onClick={() => setPhase((p) => (p + 1) % 4)}
        aria-label="The moon — tap to change its phase"
        className="sn-moon-glow absolute top-[8%] right-[8%] size-20 overflow-hidden rounded-full bg-[radial-gradient(circle_at_35%_35%,#fffdf4,#e8e1c8_60%,#cfc6a8)] transition-transform duration-500 hover:scale-110 sm:size-28"
      >
        <span className="absolute top-[30%] left-[25%] size-3 rounded-full bg-black/10" />
        <span className="absolute top-[55%] left-[55%] size-5 rounded-full bg-black/10" />
        <motion.span
          className="absolute inset-0 rounded-full bg-[#070c26]"
          animate={{ x: ['110%', '45%', '-5%', '-60%'][phase] }}
          transition={{ duration: 1.2, ease: EASE.soft }}
        />
      </button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="text-xs tracking-[0.4em] text-white/60 uppercase"
      >
        Under the same sky
      </motion.p>
      <h1 className="sr-only">Happy birthday, {name}</h1>
      <div className="relative mt-6 w-full max-w-5xl" aria-hidden>
        <svg viewBox="0 0 1200 300" className="w-full overflow-visible">
          {data?.lines.map(([x1, y1, x2, y2], i) => (
            <motion.line
              key={`l${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#cdd8ff"
              strokeOpacity={0.45}
              strokeWidth={1.1}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.025, duration: 0.5 }}
            />
          ))}
          {data?.points.map(([x, y], i) => (
            <motion.circle
              key={`p${i}`}
              cx={x}
              cy={y}
              r={i % 7 === 0 ? 3.4 : 2}
              fill={i % 7 === 0 ? 'var(--bd-accent)' : '#fff'}
              className="sn-star"
              style={{ ['--d' as string]: `${2 + (i % 5) * 0.6}s`, ['--delay' as string]: `${(i % 9) * 0.3}s` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.018, duration: 0.4 }}
            />
          ))}
          <motion.text
            x="600"
            y="150"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="'Cormorant Garamond', Georgia, serif"
            fontWeight={500}
            fontSize={data?.size ?? 120}
            fill="#ffffff"
            initial={{ opacity: 0 }}
            animate={{ opacity: data ? 0.16 : 0 }}
            transition={{ delay: 3, duration: 2.5 }}
          >
            {name}
          </motion.text>
        </svg>
      </div>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.6, duration: 1.4, ease: EASE.out }}
        className={`${serif} mt-4 text-5xl font-light italic sm:text-7xl`}
      >
        Happy Birthday
      </motion.p>
      {date && <p className="mt-4 text-xs tracking-[0.35em] text-white/50 uppercase">{date}</p>}
    </section>
  );
}

function Letter() {
  const { config } = useExperience();
  return (
    <section aria-labelledby="sn-letter" className="relative px-6 py-28">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal kind="blur">
          <h2 id="sn-letter" className={`${serif} text-4xl font-light italic sm:text-5xl`}>
            A letter written in starlight
          </h2>
        </Reveal>
        <Reveal kind="blur" delay={0.3}>
          <Paragraphs
            value={config.messages.main}
            placeholder={PLACEHOLDER.message}
            className={`${serif} mt-12 space-y-7 text-2xl leading-relaxed font-light text-white/85 sm:text-[1.7rem]`}
          />
        </Reveal>
        <Reveal kind="fade" delay={0.5}>
          <p className="mt-12 text-sm tracking-[0.3em] text-[var(--bd-accent)] uppercase">
            — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/** Spreads n stars across the whole sky in a gentle wave (desktop) or zig-zag (mobile). */
function constellationPoints(n: number, mobile: boolean): Array<[number, number]> {
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const wave = (Math.sin(i * 1.9) + 1) / 2;
    return mobile ? [i % 2 === 0 ? 26 + wave * 10 : 64 + wave * 10, 6 + t * 88] : [8 + t * 84, 18 + wave * 64];
  });
}

function ConstellationGallery() {
  const { config } = useExperience();
  const memories = getMemories(config).slice(0, 12);
  const [index, setIndex] = useState<number | null>(null);
  const mobile = useMediaQuery('(max-width: 639px)');
  const pts = constellationPoints(memories.length, mobile);

  return (
    <section aria-labelledby="sn-gallery" className="relative px-4 py-24">
      <Reveal kind="blur" className="text-center">
        <p className="text-xs tracking-[0.4em] text-white/50 uppercase">Constellation of us</p>
        <h2 id="sn-gallery" className={`${serif} mt-3 text-4xl font-light italic sm:text-5xl`}>
          Every memory, a star
        </h2>
      </Reveal>
      <div
        className={`relative mx-auto mt-14 w-full max-w-6xl ${mobile ? '' : 'aspect-[16/9]'}`}
        style={mobile ? { height: Math.max(360, memories.length * 96) } : undefined}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          {pts.slice(1).map(([x, y], i) => (
            <motion.line
              key={i}
              x1={pts[i][0]}
              y1={pts[i][1]}
              x2={x}
              y2={y}
              stroke="#cdd8ff"
              strokeOpacity={0.3}
              strokeWidth={0.18}
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
            />
          ))}
        </svg>
        <ul>
          {memories.map((m, i) => (
            <motion.li
              key={m.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pts[i][0]}%`, top: `${pts[i][1]}%` }}
              initial={{ opacity: 0, scale: 0.4 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.12, type: 'spring', stiffness: 160, damping: 14 }}
            >
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Open memory: ${m.titleText}`}
                className="group flex flex-col items-center"
              >
                <span className="relative block size-16 overflow-hidden rounded-full ring-2 ring-white/60 shadow-[0_0_30px_rgb(205_216_255/0.55)] transition-all duration-500 group-hover:scale-125 group-hover:ring-[var(--bd-accent)] sm:size-24">
                  <PhotoSlot src={m.image} alt={m.titleText} label={`0${i + 1}`.slice(-2)} className="h-full w-full rounded-full" />
                </span>
                <span className="mt-2 max-w-[8rem] text-center text-[0.7rem] leading-tight text-white/70 transition-colors group-hover:text-white sm:text-xs">
                  {m.titleText}
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
      <Lightbox items={toLightboxItems(memories)} index={index} onIndexChange={setIndex} captionClassName={serif} />
    </section>
  );
}

function MoonIcon({ phase }: { phase: number }) {
  // phase 0..1 → shadow offset
  const offset = 22 - phase * 44;
  return (
    <svg viewBox="0 0 44 44" className="size-16" aria-hidden>
      <defs>
        <clipPath id={`moon-${phase}`}>
          <circle cx="22" cy="22" r="18" />
        </clipPath>
      </defs>
      <circle cx="22" cy="22" r="18" fill="#f4f1e6" />
      <circle cx={22 + offset} cy="22" r="18" fill="#0a1030" clipPath={`url(#moon-${phase})`} />
    </svg>
  );
}

function MoonPhases() {
  const { config } = useExperience();
  const items = getTimeline(config);
  return (
    <section aria-labelledby="sn-phases" className="relative py-24">
      <Reveal kind="blur" className="px-6 text-center">
        <p className="text-xs tracking-[0.4em] text-white/50 uppercase">Phases of us</p>
        <h2 id="sn-phases" className={`${serif} mt-3 text-4xl font-light italic sm:text-5xl`}>
          Our little story
        </h2>
      </Reveal>
      <ol className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 sm:justify-center">
        {items.map((t, i) => (
          <Reveal as="li" key={t.id} kind="up" delay={i * 0.15} className="w-[16rem] shrink-0 snap-center text-center">
            <div className="flex justify-center">
              <MoonIcon phase={items.length === 1 ? 1 : i / (items.length - 1)} />
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <PhotoSlot src={t.image} alt={t.titleText} label="Add a photo" className="aspect-[4/3] w-full" />
            </div>
            <h3 className={`${serif} mt-4 text-2xl`}>{t.titleText}</h3>
            <p className="mt-1 text-sm text-white/60">{t.captionText}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

function ShootingStarWish() {
  const { config, fx } = useExperience();
  const colors = useThemeColors(['#ffffff', '#ffe7a3']);
  const [wished, setWished] = useState(false);

  const wish = () => {
    setWished(true);
    fx.fireworks({ colors, duration: 6, rockets: 14 });
    window.setTimeout(() => fx.rain({ colors, shapes: ['star'], count: 80, size: 10 }), 1200);
  };

  return (
    <section aria-labelledby="sn-wish" className="relative flex min-h-[80dvh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <Reveal kind="blur">
        <h2 id="sn-wish" className={`${serif} text-5xl font-light italic sm:text-6xl`}>
          Make a wish
        </h2>
        <p className="mt-4 text-white/60">Catch the shooting star before it fades.</p>
      </Reveal>
      <div className="relative mt-12 h-48 w-full max-w-3xl">
        {!wished && (
          <motion.button
            type="button"
            onClick={wish}
            aria-label="Catch the shooting star and make a wish"
            className="absolute flex items-center"
            initial={{ left: '90%', top: '0%' }}
            animate={{ left: ['90%', '10%'], top: ['5%', '70%'] }}
            transition={{ duration: 4.5, repeat: Infinity, repeatDelay: 0.6, ease: 'easeIn' }}
          >
            <Star className="size-8 fill-[var(--bd-accent)] text-[var(--bd-accent)] drop-shadow-[0_0_12px_#ffe7a3]" aria-hidden />
            <span className="h-[2px] w-24 origin-left -rotate-[38deg] bg-gradient-to-r from-white to-transparent" aria-hidden />
          </motion.button>
        )}
        <AnimatePresence>
          {wished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: EASE.out }}
              className="absolute inset-0 flex flex-col items-center justify-center"
              role="status"
            >
              <p className={`${serif} inline-flex items-center gap-3 text-3xl italic sm:text-4xl`}>
                Your wish is written in the stars <Sparkles className="size-6 text-[var(--bd-accent)]" aria-hidden />
              </p>
              <p className="mt-3 text-white/70">{config.messages.wish}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {!wished && (
        <button
          type="button"
          onClick={wish}
          className="mt-4 inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-6 text-sm tracking-[0.2em] uppercase hover:bg-white/10"
        >
          <Star className="size-4" aria-hidden /> Make my wish
        </button>
      )}
    </section>
  );
}

function Finale() {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const [lastStar, setLastStar] = useState(false);
  const image = config.finalImage ?? config.heroImage;

  return (
    <footer className="relative px-6 pt-16 pb-32 text-center">
      <Reveal kind="scale">
        <div className="sn-moon-glow mx-auto size-56 overflow-hidden rounded-full ring-1 ring-white/30 sm:size-72">
          <PhotoSlot src={image} alt={`A final photo of ${name}`} label="Add a final photo" className="h-full w-full rounded-full" />
        </div>
      </Reveal>
      <Reveal kind="blur" delay={0.2}>
        <p className={`${serif} mx-auto mt-12 max-w-2xl text-3xl leading-snug font-light italic sm:text-4xl`}>
          “May every dream you make under these stars come true.”
        </p>
        <h2 className={`${serif} mt-8 text-5xl sm:text-6xl`}>
          Happy Birthday, <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
        </h2>
        <p className="mt-4 text-white/60">{config.messages.final}</p>
      </Reveal>

      <div className="mx-auto mt-14 max-w-xl">
        {!lastStar ? (
          <button
            type="button"
            onClick={(e) => {
              setLastStar(true);
              fx.burst({ x: e.clientX, y: e.clientY, shape: 'star', count: 30, colors: ['#ffe7a3', '#ffffff'], speed: 340 });
            }}
            className="group inline-flex flex-col items-center gap-3"
          >
            <Star className="size-10 animate-pulse fill-[var(--bd-accent)] text-[var(--bd-accent)] transition-transform group-hover:scale-125" aria-hidden />
            <span className="text-sm tracking-[0.25em] text-white/70 uppercase">There’s one star left — touch it</span>
          </button>
        ) : (
          <motion.blockquote
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.4 }}
            className="rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur"
          >
            <p className={`${serif} text-2xl leading-relaxed italic`}>
              <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
            </p>
            <footer className="mt-4 text-xs tracking-[0.3em] text-[var(--bd-accent)] uppercase">
              With love, <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
            </footer>
          </motion.blockquote>
        )}
      </div>
      <button type="button" onClick={restart} className="mt-16 h-11 rounded-full px-5 text-xs tracking-[0.25em] text-white/50 uppercase hover:text-white">
        Watch the sky again
      </button>
    </footer>
  );
}
