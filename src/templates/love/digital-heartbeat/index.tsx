import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useAnimate } from 'motion/react';
import { Heart } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, splitParagraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories } from '@/components/experience/content';
import { heartOutline } from '@/components/effects/shapes';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';

const mono = 'font-t-accent';

/** Shared heartbeat: bpm reacts to the visitor; `beat` increments on every beat. */
const BeatCtx = createContext<{ bpm: number; beat: number; kick: () => void }>({ bpm: 64, beat: 0, kick: () => {} });

function useHeartbeatEngine() {
  const { audio, reducedMotion } = useExperience();
  const [bpm, setBpm] = useState(64);
  const [beat, setBeat] = useState(0);
  const excitement = useRef(0);
  const lastY = useRef(0);

  useEffect(() => {
    let last = { x: 0, y: 0, t: performance.now() };
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const v = Math.hypot(e.clientX - last.x, e.clientY - last.y) / Math.max(16, now - last.t);
      excitement.current = Math.min(1, excitement.current + v * 0.04);
      last = { x: e.clientX, y: e.clientY, t: now };
    };
    const onScroll = () => {
      const d = Math.abs(window.scrollY - lastY.current);
      lastY.current = window.scrollY;
      excitement.current = Math.min(1, excitement.current + d * 0.0006);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    const data = new Uint8Array(64);
    const tick = window.setInterval(() => {
      if (audio.getLevels(data)) {
        const bass = (data[1] + data[2] + data[3]) / 765;
        excitement.current = Math.max(excitement.current, bass * 0.8);
      }
      excitement.current *= 0.94;
      setBpm(Math.round(64 + excitement.current * 76));
    }, 200);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.clearInterval(tick);
    };
  }, [audio]);

  useEffect(() => {
    if (reducedMotion) return;
    const t = window.setTimeout(() => setBeat((b) => b + 1), 60000 / bpm);
    return () => window.clearTimeout(t);
  }, [beat, bpm, reducedMotion]);

  const kick = () => {
    excitement.current = Math.min(1, excitement.current + 0.35);
    setBeat((b) => b + 1);
  };
  return { bpm, beat, kick };
}

/** Scrolling ECG trace. Draws a PQRST spike on every beat. */
function ECG({ className, height = 120 }: { className?: string; height?: number }) {
  const { beat } = useContext(BeatCtx);
  const { theme, reducedMotion } = useExperience();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spike = useRef(-1);

  useEffect(() => {
    spike.current = 0;
  }, [beat]);

  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    const resize = () => {
      w = c.clientWidth;
      c.width = w * dpr;
      c.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const mid = height / 2;
    const ys: number[] = [];
    const shape = [0, -0.08, 0, 0.05, -0.7, 0.45, 0, 0, -0.12, -0.15, -0.1, 0];
    let raf = 0;
    const frame = () => {
      let y = mid;
      if (spike.current >= 0) {
        const s = shape[Math.floor(spike.current)] ?? 0;
        y = mid + s * height * 0.8;
        spike.current += 0.6;
        if (spike.current >= shape.length) spike.current = -1;
      }
      ys.push(y + (Math.random() - 0.5) * 1.2);
      const max = Math.ceil(w / 2.5);
      while (ys.length > max) ys.shift();
      ctx.clearRect(0, 0, w, height);
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 2;
      ctx.shadowColor = theme.primary;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ys.forEach((v, i) => {
        const x = w - (ys.length - i) * 2.5;
        if (i === 0) ctx.moveTo(x, v);
        else ctx.lineTo(x, v);
      });
      ctx.stroke();
      const lastY = ys[ys.length - 1] ?? mid;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(w - 2, lastY, 3, 0, Math.PI * 2);
      ctx.fill();
      raf = requestAnimationFrame(frame);
    };
    if (reducedMotion) {
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(w, mid);
      ctx.stroke();
    } else raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [height, theme.primary, reducedMotion]);

  return <canvas ref={canvasRef} aria-hidden className={className} style={{ height }} />;
}

function Bpm() {
  const { bpm, beat } = useContext(BeatCtx);
  return (
    <p className={`${mono} inline-flex items-center gap-2 text-sm text-[var(--bd-primary)]`} aria-live="off">
      <motion.span key={beat} initial={{ scale: 1.5 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
        <Heart className="size-4 fill-current" aria-hidden />
      </motion.span>
      {bpm} BPM
    </p>
  );
}

export default function DigitalHeartbeat() {
  const engine = useHeartbeatEngine();
  const { opened } = useExperience();
  return (
    <BeatCtx.Provider value={engine}>
      <div className="relative min-h-dvh bg-[#070204] text-[#f6e9ec]" onClick={(e) => (e.target as HTMLElement).closest('button,a') || engine.kick()}>
        <motion.div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgb(var(--bd-primary-rgb)/0.22),transparent_60%)]" key={engine.beat} initial={{ opacity: 1 }} animate={{ opacity: 0.55 }} transition={{ duration: 0.6 }} />
        <AnimatePresence>{!opened && <Monitor key="m" />}</AnimatePresence>
        {opened && <Story />}
      </div>
    </BeatCtx.Provider>
  );
}

function Monitor() {
  const { config, open } = useExperience();
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070204] px-6 text-center" exit={{ opacity: 0, transition: { duration: 1 } }}>
      <ECG className="w-full max-w-3xl" height={140} />
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 1.6 }} className="mt-10 max-w-xl text-3xl leading-snug font-light sm:text-4xl">
        {config.messages.intro.trim() || 'Some people make your heart beat differently.'}
      </motion.p>
      <motion.button type="button" onClick={open} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }} className={`${mono} mt-12 h-13 rounded-full border border-[var(--bd-primary)] px-9 text-xs tracking-[0.35em] text-[var(--bd-primary)] transition-colors hover:bg-[var(--bd-primary)] hover:text-[#070204]`}>
        FEEL IT
      </motion.button>
    </motion.div>
  );
}

function PulseCard({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const { beat } = useContext(BeatCtx);
  const { reducedMotion } = useExperience();
  const [scope, animate] = useAnimate();
  useEffect(() => {
    if (reducedMotion || !scope.current) return;
    void animate(scope.current, { scale: [1.025, 1] }, { duration: 0.35 });
  }, [beat, animate, scope, reducedMotion]);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8, delay, ease: EASE.out }} className="relative">
      <div ref={scope}>{children}</div>
    </motion.div>
  );
}

function Story() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  const memories = getMemories(config);
  const paras = splitParagraphs(config.messages.main);
  return (
    <main className="relative z-10">
      <div className="sticky top-0 z-30 border-b border-[var(--bd-primary)]/15 bg-[#070204]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4">
          <ECG className="h-12 flex-1" height={48} />
          <Bpm />
        </div>
      </div>

      <section aria-label="Happy birthday" className="flex min-h-[90dvh] flex-col items-center justify-center px-6 text-center">
        <PulseCard>
          <div className="relative size-56 overflow-hidden rounded-full ring-1 ring-[var(--bd-primary)]/60 shadow-[0_0_80px_rgb(var(--bd-primary-rgb)/0.45)] sm:size-72">
            <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add your hero photo" priority className="h-full w-full" imgClassName="contrast-110" />
          </div>
        </PulseCard>
        <h1 className="mt-10 text-5xl font-light tracking-tight sm:text-7xl">
          Happy Birthday, <span className="font-semibold text-[var(--bd-primary)]"><Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /></span>
        </h1>
        <p className={`${mono} mt-4 text-xs tracking-[0.3em] text-[#f6e9ec]/50`}>MOVE · SCROLL · CLICK — WATCH WHAT HAPPENS TO MY HEART</p>
      </section>

      <section aria-labelledby="dh-mem" className="px-5 py-16">
        <h2 id="dh-mem" className="text-center text-3xl font-light sm:text-5xl">
          Every beat, a memory
        </h2>
        <ul className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((m, i) => (
            <li key={m.id}>
              <PulseCard delay={(i % 3) * 0.1}>
                <article className="overflow-hidden rounded-2xl border border-[var(--bd-primary)]/20 bg-[#12060a]">
                  <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} className="aspect-[4/3] w-full" imgClassName="grayscale-[0.4] transition-[filter] duration-700 hover:grayscale-0" />
                  <div className="p-5">
                    <p className={`${mono} text-[0.65rem] tracking-[0.3em] text-[var(--bd-primary)]`}>
                      BEAT {String(i + 1).padStart(3, '0')}
                      {m.date ? ` · ${m.date.toUpperCase()}` : ''}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">{m.titleText}</h3>
                    <p className="mt-1 text-[#f6e9ec]/65">{m.captionText}</p>
                  </div>
                </article>
              </PulseCard>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="A message for you" className="px-6 py-20">
        <div className="mx-auto max-w-2xl space-y-8 text-center">
          {(paras.length ? paras : ['']).map((p, i) => (
            <motion.p key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 1 }} className="text-2xl leading-relaxed font-light sm:text-3xl">
              {p || <Fill value="" placeholder={PLACEHOLDER.message} />}
            </motion.p>
          ))}
          <p className={`${mono} text-xs tracking-[0.35em] text-[var(--bd-primary)]`}>— {(config.senderName.trim() || PLACEHOLDER.sender).toUpperCase()}</p>
        </div>
      </section>
      <HeartFinale />
    </main>
  );
}

function HeartFinale() {
  const { config, fx, restart, reducedMotion } = useExperience();
  const { beat } = useContext(BeatCtx);
  const colors = useThemeColors(['#ffffff']);
  const [drawn, setDrawn] = useState(false);
  const pts = heartOutline(120).map(([x, y]) => `${(x * 100).toFixed(2)},${(y * 100).toFixed(2)}`);
  const d = `M0,52 L22,52 L26,40 L30,62 L34,52 ${pts.map((p) => `L${p}`).join(' ')} L66,52 L70,40 L74,62 L78,52 L100,52`;

  return (
    <section aria-labelledby="dh-final" className="flex min-h-dvh flex-col items-center justify-center px-5 py-24 text-center">
      <div className="relative w-full max-w-xl">
        <svg viewBox="0 0 100 100" className="w-full overflow-visible" aria-hidden>
          <motion.path
            d={d}
            fill="none"
            stroke="var(--bd-primary)"
            strokeWidth={0.9}
            strokeLinejoin="round"
            initial={{ pathLength: reducedMotion ? 1 : 0 }}
            animate={{ pathLength: drawn ? 1 : 0.2 }}
            transition={{ duration: 3.4, ease: 'easeInOut' }}
            style={{ filter: 'drop-shadow(0 0 2px var(--bd-primary)) drop-shadow(0 0 6px var(--bd-primary))' }}
          />
          {drawn && (
            <motion.path key={beat} d={`M ${pts.join(' L ')} Z`} fill="var(--bd-primary)" initial={{ opacity: 0.45, scale: 1.04 }} animate={{ opacity: 0.18, scale: 1 }} transition={{ duration: 0.5 }} style={{ transformOrigin: '50% 50%' }} />
          )}
        </svg>
      </div>
      {!drawn ? (
        <button
          type="button"
          onClick={() => {
            setDrawn(true);
            window.setTimeout(() => fx.burst({ x: window.innerWidth / 2, y: window.innerHeight / 2.4, shape: 'heart', colors, count: 40, speed: 420, size: 16 }), 3400);
          }}
          className={`${mono} mt-10 h-13 rounded-full bg-[var(--bd-primary)] px-9 text-xs tracking-[0.35em] text-[#070204]`}
        >
          FOLLOW THE LINE
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.4, duration: 1.4 }} role="status">
          <h2 id="dh-final" className="mt-6 text-4xl font-light sm:text-6xl">
            You’re my favorite <span className="font-semibold text-[var(--bd-primary)]">heartbeat</span>.
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg text-[#f6e9ec]/75">
            <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
          </p>
          <p className={`${mono} mt-4 text-xs tracking-[0.3em] text-[#f6e9ec]/50`}>
            HAPPY BIRTHDAY, <Fill value={config.birthdayPerson.toUpperCase()} placeholder={PLACEHOLDER.name} />
          </p>
          <button type="button" onClick={restart} className={`${mono} mt-10 h-11 text-xs tracking-[0.3em] text-[#f6e9ec]/40 hover:text-[#f6e9ec]`}>
            RESTART THE HEART
          </button>
        </motion.div>
      )}
    </section>
  );
}
