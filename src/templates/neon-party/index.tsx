import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Disc3, Music2, Zap } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Lightbox } from '@/components/experience/Lightbox';
import { Reveal } from '@/components/experience/Motion';
import { getMemories, getTimeline, toLightboxItems } from '@/components/experience/content';
import { PointerTrail } from '@/components/effects/PointerTrail';
import { TiltCard } from '@/components/effects/Interactive';
import { PLACEHOLDER } from '@/data/placeholders';
import { cn } from '@/utils/cn';
import './neon.css';

const neonFont = 'font-t-display';
const LIGHTS = [
  { id: 'pink', label: 'Pink', color: '#ff3ea5' },
  { id: 'cyan', label: 'Cyan', color: '#3ef4ff' },
  { id: 'amber', label: 'Amber', color: '#ff9f43' },
  { id: 'gold', label: 'Gold', color: '#ffd23f' },
];

export default function NeonParty() {
  const { opened } = useExperience();
  const [lights, setLights] = useState<Record<string, boolean>>({ pink: true, cyan: true, amber: false, gold: false });
  const [dropped, setDropped] = useState(false);
  const active = LIGHTS.filter((l) => lights[l.id]);
  const beamColors = active.length ? active.map((l) => l.color) : ['#3a3a4a'];

  return (
    <div className="np-wall relative min-h-dvh overflow-hidden text-[#f2ecff]">
      <div aria-hidden className="pointer-events-none fixed inset-0">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="np-beam"
            style={{
              left: `${8 + i * 22}%`,
              background: `linear-gradient(${beamColors[i % beamColors.length]}, transparent 85%)`,
              ['--speed' as string]: dropped ? `${2 + i * 0.4}s` : `${8 + i * 1.5}s`,
              ['--from' as string]: i % 2 ? '25deg' : '-25deg',
              ['--to' as string]: i % 2 ? '-20deg' : '20deg',
            }}
          />
        ))}
        {dropped && <div className="np-pulse absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgb(var(--bd-primary-rgb)/0.35),transparent_60%)]" />}
      </div>
      <AnimatePresence>{!opened && <Doorway key="door" />}</AnimatePresence>
      {opened && (
        <main className="relative z-10">
          <PointerTrail colors={['#ff3ea5', '#3ef4ff', '#8b5cf6']} size={3} rate={2} />
          <Hero />
          <LightBoard lights={lights} onToggle={(id) => setLights((l) => ({ ...l, [id]: !l[id] }))} />
          <Message />
          <Gallery />
          <Setlist />
          <Drop dropped={dropped} onDrop={() => setDropped(true)} />
        </main>
      )}
    </div>
  );
}

function NeonSign({ text, className, alt }: { text: string; className?: string; alt?: boolean }) {
  return (
    <span className={cn(alt ? 'np-neon-alt' : 'np-neon', className)} aria-label={text}>
      {[...text].map((ch, i) => (
        <span key={i} aria-hidden className="np-flicker inline-block whitespace-pre" style={{ ['--d' as string]: `${(i * 0.09) % 1.4}s` }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

function Doorway() {
  const { config, open } = useExperience();
  const { name } = useBirthdayText();
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07040f]/85 px-6 text-center" exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.6 } }}>
      <p className="text-sm tracking-[0.5em] text-white/50 uppercase">{config.messages.intro.trim() || 'Tonight only'}</p>
      <h1 className={`${neonFont} mt-8 text-3xl leading-relaxed sm:text-6xl`}>
        <NeonSign text="WELCOME TO" alt />
        <br />
        <NeonSign text={`${name.toUpperCase()}’S`} />
        <br />
        <NeonSign text="BIRTHDAY" alt />
      </h1>
      <motion.button
        type="button"
        onClick={open}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4 }}
        whileHover={{ scale: 1.05 }}
        className="mt-14 h-14 rounded-full border-2 border-[var(--bd-accent)] px-10 font-semibold tracking-[0.3em] text-[var(--bd-accent)] uppercase shadow-[0_0_20px_rgb(var(--bd-accent-rgb)/0.6),inset_0_0_20px_rgb(var(--bd-accent-rgb)/0.3)] transition-colors hover:bg-[var(--bd-accent)] hover:text-black"
      >
        Enter the party
      </motion.button>
    </motion.div>
  );
}

function Visualizer({ className, bars = 48 }: { className?: string; bars?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { audio, reducedMotion, theme } = useExperience();
  const getLevels = audio.getLevels;
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const data = new Uint8Array(64);
    let raf = 0;
    const draw = (t: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const live = getLevels(data);
      const grad = ctx.createLinearGradient(0, h, 0, 0);
      grad.addColorStop(0, theme.secondary);
      grad.addColorStop(0.6, theme.primary);
      grad.addColorStop(1, theme.accent);
      ctx.fillStyle = grad;
      const bw = w / bars;
      for (let i = 0; i < bars; i++) {
        const v = live
          ? data[Math.floor((i / bars) * 48)] / 255
          : 0.25 + 0.35 * Math.abs(Math.sin(t / 420 + i * 0.45)) * Math.abs(Math.cos(t / 900 + i * 0.13));
        const bh = Math.max(3, v * h);
        ctx.globalAlpha = 0.9;
        ctx.fillRect(i * bw + 1.5, h - bh, bw - 3, bh);
      }
      if (!reducedMotion) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [getLevels, reducedMotion, bars, theme]);
  return <canvas ref={ref} aria-hidden className={className} />;
}

function Hero() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  return (
    <section aria-label="Happy birthday" className="relative flex min-h-dvh flex-col items-center justify-center px-5 pt-20 pb-10 text-center">
      <div className="relative size-52 sm:size-64">
        <div aria-hidden className="np-tube absolute -inset-2 rounded-full" />
        <div className="absolute inset-0 overflow-hidden rounded-full border-4 border-[#120d10]">
          <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add your hero photo" priority className="h-full w-full" />
        </div>
      </div>
      <h1 className="mt-12">
        <span className={`${neonFont} block text-4xl sm:text-7xl`}>
          <NeonSign text="HAPPY BIRTHDAY" />
        </span>
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="np-neon-alt mt-5 block text-5xl font-extrabold tracking-tight sm:text-7xl"
        >
          <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
        </motion.span>
      </h1>
      <Visualizer className="mt-12 h-24 w-full max-w-3xl" />
    </section>
  );
}

function LightBoard({ lights, onToggle }: { lights: Record<string, boolean>; onToggle: (id: string) => void }) {
  return (
    <section aria-labelledby="np-lights" className="px-5 py-16">
      <div className="np-glass mx-auto max-w-3xl rounded-3xl p-6 sm:p-8">
        <h2 id="np-lights" className="text-sm font-semibold tracking-[0.35em] text-white/60 uppercase">
          Light board — you’re the DJ
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {LIGHTS.map((l) => {
            const on = lights[l.id];
            return (
              <button
                key={l.id}
                type="button"
                role="switch"
                aria-checked={on}
                onClick={() => onToggle(l.id)}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 p-4 transition-colors hover:bg-white/5"
              >
                <span
                  className="relative h-16 w-8 rounded-full border border-white/20 bg-black/60 transition-shadow"
                  style={{ boxShadow: on ? `0 0 18px ${l.color}` : 'none' }}
                  aria-hidden
                >
                  <motion.span
                    className="absolute left-1 size-6 rounded-full"
                    animate={{ top: on ? 4 : 34, background: on ? l.color : '#555' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  />
                </span>
                <span className="text-sm font-semibold" style={{ color: on ? l.color : undefined }}>
                  {l.label} {on ? 'on' : 'off'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function GlowCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('np-tube relative rounded-xl', className)}>
      <div className="np-panel relative rounded-xl p-7 sm:p-12">{children}</div>
    </div>
  );
}

function Message() {
  const { config } = useExperience();
  return (
    <section aria-labelledby="np-msg" className="px-5 py-20">
      <Reveal kind="scale" className="mx-auto max-w-3xl">
        <GlowCard>
          <h2 id="np-msg" className="np-neon text-3xl font-extrabold sm:text-4xl">
            A message just for you
          </h2>
          <Paragraphs value={config.messages.main} placeholder={PLACEHOLDER.message} className="mt-6 space-y-5 text-xl leading-relaxed font-light text-white/85" />
          <p className="mt-8 text-right font-semibold text-[var(--bd-accent)]">
            — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
          </p>
        </GlowCard>
      </Reveal>
    </section>
  );
}

function Gallery() {
  const { config } = useExperience();
  const memories = getMemories(config);
  const [index, setIndex] = useState<number | null>(null);
  return (
    <section aria-labelledby="np-gallery" className="px-5 py-20">
      <Reveal kind="up" className="text-center">
        <h2 id="np-gallery" className={`${neonFont} text-3xl sm:text-5xl`}>
          <span className="np-neon-alt">THE HIGHLIGHTS</span>
        </h2>
      </Reveal>
      <ul className="mx-auto mt-14 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {memories.map((m, i) => (
          <Reveal as="li" key={m.id} kind="up" delay={(i % 3) * 0.1}>
            <TiltCard className="rounded-3xl" max={9}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Open highlight: ${m.titleText}`}
                className="np-glass group block w-full overflow-hidden rounded-3xl text-left transition-shadow duration-300 hover:shadow-[0_0_0_2px_var(--bd-primary)]"
              >
                <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} className="aspect-[4/3] w-full" imgClassName="transition-transform duration-700 group-hover:scale-110" />
                <div className="p-5">
                  <p className="text-lg font-semibold">{m.titleText}</p>
                  <p className="text-sm text-white/60">{m.captionText}</p>
                </div>
              </button>
            </TiltCard>
          </Reveal>
        ))}
      </ul>
      <Lightbox items={toLightboxItems(memories)} index={index} onIndexChange={setIndex} />
    </section>
  );
}

function Setlist() {
  const { config } = useExperience();
  const items = getTimeline(config);
  return (
    <section aria-labelledby="np-setlist" className="px-5 py-20">
      <div className="np-glass mx-auto max-w-3xl rounded-3xl p-5 sm:p-8">
        <div className="flex items-center gap-3">
          <Disc3 className="size-8 animate-[spin_4s_linear_infinite] text-[var(--bd-primary)]" aria-hidden />
          <div>
            <h2 id="np-setlist" className="text-2xl font-extrabold">
              Tonight’s setlist
            </h2>
            <p className="text-sm text-white/50">Our little story, track by track</p>
          </div>
        </div>
        <ol className="mt-6 divide-y divide-white/10">
          {items.map((t, i) => (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group flex items-center gap-4 py-4"
            >
              <span className="w-6 text-right text-sm text-white/40 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <div className="size-14 shrink-0 overflow-hidden rounded-lg">
                <PhotoSlot src={t.image} alt={t.titleText} label="+" className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{t.titleText}</p>
                <p className="truncate text-sm text-white/55">{t.captionText}</p>
              </div>
              <span className="np-eq flex h-5 items-end gap-0.5 opacity-30 transition-opacity group-hover:opacity-100" aria-hidden>
                {[0, 1, 2, 3].map((b) => (
                  <span key={b} className="w-1 bg-[var(--bd-accent)]" style={{ height: '100%', animationDelay: `${b * 0.15}s` }} />
                ))}
              </span>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Drop({ dropped, onDrop }: { dropped: boolean; onDrop: () => void }) {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(['#ffd23f', '#ffffff']);

  const drop = () => {
    onDrop();
    fx.cannons({ colors, count: 220 });
    fx.fireworks({ colors, duration: 6, rockets: 14 });
  };

  return (
    <section aria-labelledby="np-drop" className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-24 text-center">
      {!dropped ? (
        <>
          <h2 id="np-drop" className="text-sm tracking-[0.4em] text-white/60 uppercase">
            Ready?
          </h2>
          <motion.button
            type="button"
            onClick={drop}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="np-arcade mt-8 inline-flex size-48 flex-col items-center justify-center gap-2 rounded-full text-xl font-extrabold tracking-widest text-white uppercase"
          >
            <Zap className="size-10" aria-hidden />
            Drop the beat
          </motion.button>
        </>
      ) : (
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 12 }} role="status" className="flex flex-col items-center">
          <h2 id="np-drop" className={`${neonFont} text-5xl leading-tight sm:text-8xl`}>
            <NeonSign text="HAPPY" />
            <br />
            <NeonSign text="BIRTHDAY" alt />
          </h2>
          <p className="np-neon mt-4 text-4xl font-extrabold">
            <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
          </p>
          <Visualizer className="mt-10 h-20 w-full max-w-xl" bars={32} />
          <GlowCard className="mt-10 max-w-xl">
            <p className="text-xl leading-relaxed">
              <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
            </p>
            <div className="mt-6 overflow-hidden rounded-2xl">
              <PhotoSlot src={config.finalImage ?? config.heroImage} alt={`A final photo for ${name}`} label="Add a final photo" className="aspect-[4/3] w-full" />
            </div>
            <p className="mt-5 inline-flex items-center gap-2 text-white/70">
              <Music2 className="size-4" aria-hidden /> {config.messages.final}
            </p>
          </GlowCard>
          <button type="button" onClick={restart} className="mt-10 h-11 rounded-full px-6 text-sm tracking-[0.3em] text-white/50 uppercase hover:text-white">
            One more time
          </button>
        </motion.div>
      )}
    </section>
  );
}
