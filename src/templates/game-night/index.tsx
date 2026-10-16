import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, Lock, Trophy } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Lightbox } from '@/components/experience/Lightbox';
import { getMemories, getTimeline, toLightboxItems } from '@/components/experience/content';
import { useTypewriter } from '@/hooks/useText';
import { PLACEHOLDER } from '@/data/placeholders';
import { cn } from '@/utils/cn';
import './game.css';

const pixel = 'font-t-display';

export default function GameNight() {
  const { opened } = useExperience();
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const add = useCallback((n: number) => setScore((s) => s + n), []);
  const complete = useCallback((l: number) => setLevel((cur) => Math.max(cur, l + 1)), []);
  // A blocky 8-bit screen wipe whenever the game starts or a new level unlocks.
  const [wipe, setWipe] = useState(0);
  useEffect(() => {
    if (opened) setWipe((w) => w + 1);
  }, [opened, level]);

  return (
    <div className="gn-root relative min-h-dvh overflow-hidden bg-[#140a2e] text-[22px] leading-snug text-[#e9e4ff]">
      <div className="gn-grid" aria-hidden />
      <div className="gn-scanlines" aria-hidden />
      <AnimatePresence>{wipe > 0 && <PixelWipe key={wipe} onDone={() => setWipe(0)} />}</AnimatePresence>
      <AnimatePresence>{!opened && <Attract key="a" />}</AnimatePresence>
      {opened && (
        <>
          <Hud score={score} level={level} />
          <main className="relative z-10 mx-auto max-w-4xl px-6 pt-28 pb-24">
            <PlayerCard />
            <LevelPanel n={1} title="Pop the balloons" unlocked={level >= 1} done={level > 1} onSkip={() => complete(1)}>
              <BalloonPop onScore={add} onWin={() => complete(1)} />
            </LevelPanel>
            <Inventory unlocked={level > 1} />
            <LevelPanel n={2} title="Catch the falling stars" unlocked={level >= 2} done={level > 2} onSkip={() => complete(2)}>
              <StarCatch onScore={add} onWin={() => complete(2)} />
            </LevelPanel>
            <SecretMessage unlocked={level > 2} />
            <LevelPanel n={3} title="Boss: unlock the birthday" unlocked={level >= 3} done={level > 3} onSkip={() => complete(3)}>
              <ChargeBoss onWin={() => { add(1000); complete(3); }} />
            </LevelPanel>
            <Ending unlocked={level > 3} score={score} />
          </main>
        </>
      )}
    </div>
  );
}

function Attract() {
  const { config, open } = useExperience();
  const { output, done } = useTypewriter(config.messages.intro.trim() || 'PLAYER 01 HAS ENTERED A NEW LEVEL.', true, 45);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Enter' && open();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center" exit={{ opacity: 0, scale: 1.2, transition: { duration: 0.4 } }}>
      <p className={`${pixel} gn-blink text-xs text-[var(--bd-accent)]`}>INSERT COIN</p>
      <p className={`${pixel} mt-10 min-h-16 max-w-xl text-sm leading-loose text-white sm:text-lg`} aria-live="polite">
        {output}
        <span className="gn-blink">_</span>
      </p>
      <motion.button
        type="button"
        onClick={open}
        initial={{ opacity: 0 }}
        animate={{ opacity: done ? 1 : 0 }}
        className={`${pixel} gn-btn mt-12 px-8 py-5 text-sm`}
      >
        ▶ PRESS START
      </motion.button>
      <p className="mt-4 text-lg text-white/50">or press Enter</p>
    </motion.div>
  );
}

function Hud({ score, level }: { score: number; level: number }) {
  const { name } = useBirthdayText();
  return (
    <header className={`${pixel} fixed inset-x-0 top-0 z-40 border-b-4 border-[#2a1760] bg-[#140a2e]/90`}>
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 text-[0.55rem] sm:text-[0.7rem]">
        <span className="truncate text-[var(--bd-secondary)]">P1 {name.toUpperCase()}</span>
        <span className="text-[var(--bd-accent)]" aria-live="polite">
          SCORE {String(score).padStart(6, '0')}
        </span>
        <span className="hidden sm:inline">LVL {Math.min(level, 3)}/3</span>
        <span className="flex gap-1 text-[var(--bd-primary)]" aria-label="3 lives">
          {[0, 1, 2].map((i) => (
            <Heart key={i} className="size-3 fill-current sm:size-4" aria-hidden />
          ))}
        </span>
      </div>
    </header>
  );
}

function PixelFrame({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('gn-frame bg-[#1d1145] p-4 sm:p-6', className)}>{children}</div>;
}

function PlayerCard() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  const stats = [
    ['AWESOME', 100],
    ['KINDNESS', 96],
    ['HUMOR', 92],
    ['BIRTHDAY POWER', 100],
  ] as const;
  return (
    <section aria-labelledby="gn-player">
      <PixelFrame className="grid items-center gap-6 sm:grid-cols-[14rem_1fr]">
        <div className="gn-frame mx-auto w-48 bg-black p-2 sm:w-full">
          <PhotoSlot src={config.heroImage} alt={`Player one: ${name}`} label="Add hero photo" priority className="aspect-square w-full [image-rendering:pixelated]" />
        </div>
        <div>
          <p className={`${pixel} text-[0.6rem] text-[var(--bd-secondary)]`}>PLAYER SELECT</p>
          <h1 id="gn-player" className={`${pixel} mt-3 text-xl leading-relaxed text-white sm:text-3xl`}>
            HAPPY BIRTHDAY,
            <br />
            <span className="text-[var(--bd-primary)]">
              <Fill value={config.birthdayPerson.toUpperCase()} placeholder={PLACEHOLDER.name} />
            </span>
          </h1>
          <dl className="mt-5 space-y-2">
            {stats.map(([k, v], i) => (
              <div key={k} className="grid grid-cols-[9rem_1fr] items-center gap-3">
                <dt className="text-lg text-white/70">{k}</dt>
                <dd className="h-4 bg-black/50" aria-label={`${v} percent`}>
                  <motion.div
                    className="h-full bg-[repeating-linear-gradient(90deg,var(--bd-accent)_0_10px,transparent_10px_12px)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${v}%` }}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.2, ease: 'linear' }}
                  />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </PixelFrame>
    </section>
  );
}

function LevelPanel({ n, title, unlocked, done, onSkip, children }: { n: number; title: string; unlocked: boolean; done: boolean; onSkip: () => void; children: ReactNode }) {
  return (
    <section aria-labelledby={`gn-level-${n}`} className="mt-16">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 id={`gn-level-${n}`} className={`${pixel} text-sm leading-relaxed sm:text-lg`}>
          <span className="text-[var(--bd-secondary)]">LEVEL {n}</span>
          <br />
          {title.toUpperCase()}
        </h2>
        {unlocked && !done && (
          <button type="button" onClick={onSkip} className="h-11 px-3 text-lg text-white/50 underline underline-offset-4 hover:text-white">
            skip level
          </button>
        )}
        {done && <span className={`${pixel} text-[0.6rem] text-[#7dff9c]`}>CLEAR!</span>}
      </div>
      <PixelFrame className="relative">
        {unlocked ? (
          done ? (
            <p className={`${pixel} py-10 text-center text-xs leading-loose text-[#7dff9c]`}>★ LEVEL COMPLETE ★</p>
          ) : (
            children
          )
        ) : (
          <div className="flex flex-col items-center gap-3 py-12 text-center text-white/50">
            <Lock className="size-8" aria-hidden />
            <p className={`${pixel} text-[0.6rem]`}>CLEAR LEVEL {n - 1} TO UNLOCK</p>
          </div>
        )}
      </PixelFrame>
    </section>
  );
}

function BalloonPop({ onScore, onWin }: { onScore: (n: number) => void; onWin: () => void }) {
  const { fx } = useExperience();
  const goal = 8;
  const [balloons, setBalloons] = useState<Array<{ id: number; x: number; color: string; dur: number }>>([]);
  const [popped, setPopped] = useState(0);
  const [playing, setPlaying] = useState(false);
  const idRef = useRef(0);
  const colors = ['#ff2bd6', '#7df9ff', '#ffe14d', '#7dff9c'];

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      const id = idRef.current++;
      setBalloons((b) => [...b.slice(-14), { id, x: 5 + Math.random() * 85, color: colors[id % colors.length], dur: 4 + Math.random() * 2.5 }]);
    }, 650);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  useEffect(() => {
    if (popped >= goal) {
      setPlaying(false);
      window.setTimeout(onWin, 500);
    }
  }, [popped, onWin]);

  return (
    <div className="relative h-80 overflow-hidden bg-black/40">
      {!playing && popped < goal && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
          <p className="text-xl">Pop {goal} balloons!</p>
          <button type="button" onClick={() => setPlaying(true)} className={`${pixel} gn-btn px-6 py-4 text-xs`}>
            START
          </button>
        </div>
      )}
      <p className={`${pixel} absolute top-3 left-3 z-10 text-[0.6rem] text-[var(--bd-accent)]`} aria-live="polite">
        {popped}/{goal}
      </p>
      {balloons.map((b) => (
        <button
          key={b.id}
          type="button"
          aria-label="Pop balloon"
          className="gn-balloon absolute bottom-0"
          style={{ left: `${b.x}%`, animationDuration: `${b.dur}s`, ['--c' as string]: b.color }}
          onAnimationEnd={() => setBalloons((list) => list.filter((x) => x.id !== b.id))}
          onClick={(e) => {
            fx.burst({ x: e.clientX, y: e.clientY, shape: 'pixel', colors: [b.color, '#ffffff'], count: 14, size: 7 });
            setBalloons((list) => list.filter((x) => x.id !== b.id));
            setPopped((p) => p + 1);
            onScore(100);
          }}
        />
      ))}
    </div>
  );
}

function StarCatch({ onScore, onWin }: { onScore: (n: number) => void; onWin: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [caught, setCaught] = useState(0);
  const goal = 10;
  const cb = useRef({ onScore, onWin });
  useEffect(() => {
    cb.current = { onScore, onWin };
  });

  useEffect(() => {
    if (!playing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    const px = Math.max(3, Math.round(W / 160));
    let basket = W / 2;
    const bw = px * 16;
    let stars: Array<{ x: number; y: number; vy: number }> = [];
    let count = 0;
    let spawn = 0;
    let raf = 0;
    let last = performance.now();
    const keys = { left: false, right: false };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      basket = Math.min(W - bw / 2, Math.max(bw / 2, e.clientX - r.left));
    };
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (e.key === 'ArrowLeft') keys.left = down;
      if (e.key === 'ArrowRight') keys.right = down;
      if (e.key.startsWith('Arrow')) e.preventDefault();
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onMove);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    const drawStar = (x: number, y: number) => {
      ctx.fillStyle = '#ffe14d';
      const cells = [[0, -2], [-1, -1], [0, -1], [1, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [1, 1], [-2, 2], [2, 2]];
      cells.forEach(([cx, cy]) => ctx.fillRect(x + cx * px, y + cy * px, px, px));
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (keys.left) basket = Math.max(bw / 2, basket - 420 * dt);
      if (keys.right) basket = Math.min(W - bw / 2, basket + 420 * dt);
      spawn -= dt;
      if (spawn <= 0) {
        spawn = 0.55 + Math.random() * 0.4;
        stars.push({ x: 20 + Math.random() * (W - 40), y: -10, vy: H * (0.35 + Math.random() * 0.25) });
      }
      ctx.fillStyle = '#0b0620';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#2a1760';
      for (let i = 0; i < W; i += 24) ctx.fillRect(i, H - 6, 12, 6);
      const by = H - px * 8;
      stars = stars.filter((s) => {
        s.y += s.vy * dt;
        if (s.y > by - px * 2 && s.y < by + px * 3 && Math.abs(s.x - basket) < bw / 2 + px) {
          count += 1;
          setCaught(count);
          cb.current.onScore(50);
          return false;
        }
        if (s.y > H + 10) return false;
        drawStar(s.x, s.y);
        return true;
      });
      ctx.fillStyle = '#ff2bd6';
      ctx.fillRect(basket - bw / 2, by, bw, px * 4);
      ctx.fillRect(basket - bw / 2, by - px * 2, px * 2, px * 2);
      ctx.fillRect(basket + bw / 2 - px * 2, by - px * 2, px * 2, px * 2);
      if (count >= goal) {
        setPlaying(false);
        window.setTimeout(() => cb.current.onWin(), 400);
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onMove);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };
  }, [playing]);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0b0620]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" aria-label="Star catching game. Move with your finger, mouse or arrow keys." />
      <p className={`${pixel} absolute top-3 left-3 text-[0.6rem] text-[var(--bd-accent)]`} aria-live="polite">
        ★ {caught}/{goal}
      </p>
      {!playing && caught < goal && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/50 text-center">
          <p className="px-4 text-xl">Catch {goal} stars. Drag, move your mouse or use ← →</p>
          <button type="button" onClick={() => setPlaying(true)} className={`${pixel} gn-btn px-6 py-4 text-xs`}>
            START
          </button>
        </div>
      )}
    </div>
  );
}

function ChargeBoss({ onWin }: { onWin: () => void }) {
  const [charge, setCharge] = useState(0);
  const holding = useRef(false);
  const won = useRef(false);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setCharge((c) => {
        const next = Math.min(1, Math.max(0, c + (holding.current ? dt / 2.2 : -dt / 1.5)));
        if (next >= 1 && !won.current) {
          won.current = true;
          window.setTimeout(onWin, 300);
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onWin]);

  const start = () => (holding.current = true);
  const stop = () => (holding.current = false);

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <p className="text-xl">Hold the button to charge the birthday power!</p>
      <div className="h-8 w-full max-w-md border-4 border-white bg-black p-1" role="progressbar" aria-valuenow={Math.round(charge * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Birthday power">
        <div className="h-full bg-[repeating-linear-gradient(90deg,var(--bd-primary)_0_12px,var(--bd-accent)_12px_24px)]" style={{ width: `${charge * 100}%` }} />
      </div>
      <button
        type="button"
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), start())}
        onKeyUp={stop}
        onContextMenu={(e) => e.preventDefault()}
        className={`${pixel} gn-btn touch-none px-10 py-6 text-sm select-none`}
      >
        HOLD TO CHARGE
      </button>
    </div>
  );
}

function Inventory({ unlocked }: { unlocked: boolean }) {
  const { config } = useExperience();
  const memories = getMemories(config);
  const [index, setIndex] = useState<number | null>(null);
  return (
    <section aria-labelledby="gn-inv" className="mt-16">
      <h2 id="gn-inv" className={`${pixel} mb-4 text-sm sm:text-base`}>
        <span className="text-[var(--bd-accent)]">INVENTORY</span> · MEMORIES
      </h2>
      <ul className="grid grid-cols-2 gap-7 p-3 sm:grid-cols-3">
        {memories.map((m, i) => (
          <li key={m.id}>
            <button
              type="button"
              disabled={!unlocked}
              onClick={() => setIndex(i)}
              aria-label={unlocked ? `Open memory: ${m.titleText}` : 'Locked memory'}
              className="gn-frame group block w-full bg-[#1d1145] p-2 text-left transition-transform hover:-translate-y-1 disabled:hover:translate-y-0"
            >
              <div className="relative">
                <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} className={cn('aspect-square w-full', !unlocked && 'opacity-0')} />
                {!unlocked && (
                  <span className={`${pixel} absolute inset-0 flex items-center justify-center bg-black text-3xl text-white/30`} aria-hidden>
                    ?
                  </span>
                )}
              </div>
              <p className="mt-2 truncate text-lg">{unlocked ? m.titleText : '???'}</p>
            </button>
          </li>
        ))}
      </ul>
      <Lightbox items={toLightboxItems(memories)} index={index} onIndexChange={setIndex} />
    </section>
  );
}

function SecretMessage({ unlocked }: { unlocked: boolean }) {
  const { config } = useExperience();
  const { sender } = useBirthdayText();
  const text = config.messages.main.trim() || PLACEHOLDER.message;
  const { output } = useTypewriter(text, unlocked, 22);
  return (
    <section aria-labelledby="gn-msg" className="mt-16">
      <h2 id="gn-msg" className={`${pixel} mb-4 text-sm sm:text-base`}>
        <span className="text-[var(--bd-accent)]">UNLOCKED</span> · SECRET MESSAGE
      </h2>
      <PixelFrame>
        {unlocked ? (
          <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
            <span className={`${pixel} inline-flex h-16 w-16 items-center justify-center bg-[var(--bd-primary)] text-xl text-white`} aria-hidden>
              {sender.trim().charAt(0).toUpperCase() || '?'}
            </span>
            <div>
              <p className={`${pixel} text-[0.6rem] text-[var(--bd-secondary)]`}>{sender.toUpperCase()} SAYS:</p>
              <p className="mt-2 text-2xl leading-snug whitespace-pre-line">
                {output}
                <span className="sr-only">{text}</span>
              </p>
            </div>
          </div>
        ) : (
          <p className="flex items-center gap-3 text-white/50">
            <Lock className="size-5" aria-hidden /> Clear level 2 to read the secret message.
          </p>
        )}
      </PixelFrame>
    </section>
  );
}

function Ending({ unlocked, score }: { unlocked: boolean; score: number }) {
  const { config, fx, restart } = useExperience();
  const { age, hasAge, name } = useBirthdayText();
  const colors = useThemeColors(['#7dff9c', '#ffffff']);
  const items = getTimeline(config);
  const fired = useRef(false);

  useEffect(() => {
    if (!unlocked || fired.current) return;
    fired.current = true;
    fx.cannons({ colors, count: 220, shapes: ['pixel'] });
    fx.fireworks({ colors, duration: 3, rockets: 8, shape: 'pixel' });
  }, [unlocked, fx, colors]);

  if (!unlocked) return null;
  return (
    <section aria-labelledby="gn-end" className="mt-20 text-center">
      <motion.h2
        id="gn-end"
        initial={{ scale: 3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className={`${pixel} text-2xl leading-relaxed text-[var(--bd-accent)] drop-shadow-[0_0_12px_var(--bd-accent)] sm:text-5xl`}
      >
        LEVEL <span className={cn(!hasAge && 'bd-placeholder')}>{age}</span>
        <br />
        UNLOCKED
      </motion.h2>
      <p className={`${pixel} mt-6 text-[0.7rem] leading-loose`}>FINAL SCORE {String(score).padStart(6, '0')}</p>
      <PixelFrame className="mx-auto mt-10 max-w-2xl text-left">
        <p className={`${pixel} text-[0.6rem] text-[var(--bd-secondary)]`}>ACHIEVEMENTS</p>
        <ul className="mt-4 space-y-3">
          {items.map((t) => (
            <li key={t.id} className="flex items-start gap-3">
              <Trophy className="mt-1 size-5 shrink-0 text-[var(--bd-accent)]" aria-hidden />
              <span>
                <span className="text-2xl text-white">{t.titleText}</span>
                <span className="block text-lg text-white/60">{t.captionText}</span>
              </span>
            </li>
          ))}
        </ul>
      </PixelFrame>
      <PixelFrame className="mx-auto mt-6 max-w-2xl">
        <div className="gn-frame mx-auto w-full max-w-sm bg-black p-2">
          <PhotoSlot src={config.finalImage ?? config.heroImage} alt={`A final photo for ${name}`} label="Add a final photo" className="aspect-square w-full" />
        </div>
        <p className="mt-5 text-2xl leading-snug">
          <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
        </p>
        <p className="mt-3 text-lg text-white/60">{config.messages.final}</p>
      </PixelFrame>
      <button type="button" onClick={restart} className={`${pixel} gn-btn mt-12 px-6 py-4 text-xs`}>
        CONTINUE? ▶ PLAY AGAIN
      </button>
    </section>
  );
}

const WIPE_COLS = 12;
const WIPE_ROWS = 8;

/**
 * An 8-bit screen transition: blocks snap in along a diagonal, hold for a beat and snap out.
 * Stepped timing (no easing) is what makes it read as a console, not a web page.
 */
function PixelWipe({ onDone }: { onDone: () => void }) {
  const { reducedMotion } = useExperience();
  useEffect(() => {
    const t = window.setTimeout(onDone, reducedMotion ? 0 : 900);
    return () => window.clearTimeout(t);
  }, [onDone, reducedMotion]);
  if (reducedMotion) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] grid" style={{ gridTemplateColumns: `repeat(${WIPE_COLS}, 1fr)`, gridTemplateRows: `repeat(${WIPE_ROWS}, 1fr)` }}>
      {Array.from({ length: WIPE_COLS * WIPE_ROWS }, (_, i) => {
        const diag = (i % WIPE_COLS) + Math.floor(i / WIPE_COLS);
        return (
          <motion.span
            key={i}
            className="bg-[#140a2e]"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1, 1, 0] }}
            transition={{ duration: 0.75, times: [0, 0.25, 0.6, 1], delay: diag * 0.012, ease: (t) => Math.round(t * 4) / 4 }}
          />
        );
      })}
    </div>
  );
}
