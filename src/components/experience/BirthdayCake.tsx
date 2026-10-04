import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Mic, MicOff, Wind } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CakeSkin {
  frosting: string;
  sponge: string;
  spongeDark: string;
  drip: string;
  plate: string;
  candles: string[];
  sprinkles: string[];
}

export const DEFAULT_CAKE_SKIN: CakeSkin = {
  frosting: '#fff4f7',
  sponge: '#f7b6c8',
  spongeDark: '#e98aa7',
  drip: '#ffd6e2',
  plate: 'rgba(255,255,255,0.55)',
  candles: ['#ffd36e', '#9fd8ff', '#ff9fc0', '#b9a2ff', '#8ef0c8'],
  sprinkles: ['#ffd36e', '#7cc8ff', '#ff6f9e', '#9b8cff', '#64e3b4'],
};

interface BirthdayCakeProps {
  candles?: number;
  shape?: 'tiered' | 'cupcake';
  skin?: CakeSkin;
  onAllOut?: () => void;
  /** Bump to relight every candle. */
  relightKey?: number;
  className?: string;
  /** Controls style for the helper buttons (light text on dark backgrounds or vice-versa). */
  tone?: 'dark' | 'light';
}

const VIEW_W = 400;
const VIEW_H = 380;

function candlePositions(n: number, shape: 'tiered' | 'cupcake'): Array<{ x: number; base: number }> {
  if (shape === 'cupcake') {
    const spread = n === 1 ? [200] : Array.from({ length: n }, (_, i) => 160 + (80 * i) / (n - 1));
    return spread.map((x) => ({ x, base: 150 }));
  }
  const left = 128;
  const right = 272;
  return Array.from({ length: n }, (_, i) => ({ x: n === 1 ? 200 : left + ((right - left) * i) / (n - 1), base: 158 }));
}

/**
 * Interactive cake: tap/click a candle, swipe across the flames, press Enter on a focused
 * candle, use "Blow all", or blow into the microphone. Flames lean away from the pointer.
 */
export function BirthdayCake({
  candles = 5,
  shape = 'tiered',
  skin = DEFAULT_CAKE_SKIN,
  onAllOut,
  relightKey = 0,
  className,
  tone = 'dark',
}: BirthdayCakeProps) {
  const count = Math.max(1, Math.min(9, candles));
  const positions = candlePositions(count, shape);
  const [lit, setLit] = useState<boolean[]>(() => Array(count).fill(true));
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [micState, setMicState] = useState<'off' | 'listening' | 'denied'>('off');
  const svgRef = useRef<SVGSVGElement>(null);
  const raf = useRef(0);
  const doneRef = useRef(false);
  const stopMic = useRef<() => void>(() => {});

  useEffect(() => {
    setLit(Array(count).fill(true));
    doneRef.current = false;
  }, [count, relightKey]);

  useEffect(() => {
    if (!doneRef.current && lit.length > 0 && lit.every((l) => !l)) {
      doneRef.current = true;
      stopMic.current();
      onAllOut?.();
    }
  }, [lit, onAllOut]);

  useEffect(() => () => stopMic.current(), []);

  const blow = useCallback((i: number) => {
    setLit((prev) => (prev[i] ? prev.map((l, j) => (j === i ? false : l)) : prev));
  }, []);

  const blowNext = useCallback(() => {
    setLit((prev) => {
      const idx = prev.findIndex(Boolean);
      return idx === -1 ? prev : prev.map((l, j) => (j === idx ? false : l));
    });
  }, []);

  const toSvg = (e: PointerEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: ((e.clientX - rect.left) / rect.width) * VIEW_W, y: ((e.clientY - rect.top) / rect.height) * VIEW_H };
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const p = toSvg(e);
    if (!p) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => setPointer(p));
    // Swiping across flames (touch drag or mouse drag) blows them out like a gust.
    if (e.buttons > 0 || e.pointerType === 'touch') {
      positions.forEach((c, i) => {
        if (Math.hypot(p.x - c.x, p.y - (c.base - 62)) < 26) blow(i);
      });
    }
  };

  const startMic = async () => {
    if (micState === 'listening') {
      stopMic.current();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      let loud = 0;
      let frame = 0;
      const started = performance.now();
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const v of data) sum += ((v - 128) / 128) ** 2;
        const rms = Math.sqrt(sum / data.length);
        loud = rms > 0.18 ? loud + 1 : 0;
        if (loud > 4) {
          blowNext();
          loud = -10;
        }
        if (performance.now() - started > 25000) stopMic.current();
        else frame = requestAnimationFrame(tick);
      };
      stopMic.current = () => {
        cancelAnimationFrame(frame);
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close();
        setMicState('off');
        stopMic.current = () => {};
      };
      setMicState('listening');
      tick();
    } catch {
      setMicState('denied');
    }
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      blow(i);
    }
  };

  const remaining = lit.filter(Boolean).length;
  const dark = tone === 'dark';

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full max-w-[420px] touch-none select-none"
        onPointerMove={onPointerMove}
        onPointerLeave={() => setPointer(null)}
        role="group"
        aria-label={`Birthday cake with ${count} candles, ${remaining} still lit`}
      >
        <defs>
          <radialGradient id="cake-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffd98a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffb347" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="flame-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff7d6" />
            <stop offset="45%" stopColor="#ffd34d" />
            <stop offset="100%" stopColor="#ff7a1a" />
          </linearGradient>
        </defs>

        {shape === 'tiered' ? <TieredCake skin={skin} /> : <Cupcake skin={skin} />}

        {positions.map((c, i) => {
          const isLit = lit[i];
          let lean = 0;
          if (pointer && isLit) {
            const dx = pointer.x - c.x;
            const dist = Math.hypot(dx, pointer.y - (c.base - 60));
            if (dist < 110) lean = Math.max(-22, Math.min(22, (-dx / Math.max(dist, 1)) * (110 - dist) * 0.35));
          }
          const color = skin.candles[i % skin.candles.length];
          const flameY = c.base - 52;
          return (
            <g
              key={i}
              role="button"
              tabIndex={0}
              aria-label={isLit ? `Blow out candle ${i + 1}` : `Candle ${i + 1} is out`}
              aria-pressed={!isLit}
              onClick={() => blow(i)}
              onKeyDown={(e) => onKey(e, i)}
              className="cursor-pointer outline-none [&:focus-visible>rect.candle-body]:stroke-[var(--focus-color,#fff)] [&:focus-visible>rect.candle-body]:stroke-[3]"
            >
              <rect x={c.x - 26} y={flameY - 34} width={52} height={92} fill="transparent" />
              <rect className="candle-body" x={c.x - 6} y={c.base - 44} width={12} height={46} rx={3} fill={color} />
              <path d={`M${c.x - 6} ${c.base - 34} l12 -6 M${c.x - 6} ${c.base - 20} l12 -6 M${c.x - 6} ${c.base - 6} l12 -6`} stroke="#fff" strokeOpacity={0.55} strokeWidth={2.5} />
              <line x1={c.x} y1={c.base - 44} x2={c.x} y2={c.base - 50} stroke="#4a3a2a" strokeWidth={2} />
              <AnimatePresence>
                {isLit ? (
                  <motion.g
                    key="flame"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.25 } }}
                    style={{
                      transformBox: 'view-box',
                      transformOrigin: `${c.x}px ${c.base - 48}px`,
                      transform: `rotate(${lean}deg)`,
                      transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    <circle cx={c.x} cy={flameY - 4} r={26} fill="url(#cake-glow)" opacity={0.65} />
                    <path
                      className="flame"
                      d={`M${c.x} ${flameY - 22} C ${c.x + 9} ${flameY - 8}, ${c.x + 8} ${flameY + 4}, ${c.x} ${flameY + 6} C ${c.x - 8} ${flameY + 4}, ${c.x - 9} ${flameY - 8}, ${c.x} ${flameY - 22} Z`}
                      fill="url(#flame-grad)"
                      style={{ animationDelay: `${i * 0.13}s` }}
                    />
                  </motion.g>
                ) : (
                  <motion.path
                    key="smoke"
                    d={`M${c.x} ${c.base - 52} q -8 -14 0 -26 q 8 -12 0 -26`}
                    stroke="#d8d8d8"
                    strokeWidth={3}
                    strokeLinecap="round"
                    fill="none"
                    initial={{ opacity: 0.8, y: 0, pathLength: 0 }}
                    animate={{ opacity: 0, y: -30, pathLength: 1 }}
                    transition={{ duration: 1.8, ease: 'easeOut' }}
                  />
                )}
              </AnimatePresence>
            </g>
          );
        })}
      </svg>

      {remaining > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setLit((l) => l.map(() => false))}
            className={cn(
              'inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors',
              dark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/5 text-ink-900 hover:bg-black/10',
            )}
          >
            <Wind className="size-4" aria-hidden /> Blow them all out
          </button>
          {typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function' && (
            <button
              type="button"
              onClick={startMic}
              aria-pressed={micState === 'listening'}
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors',
                dark ? 'text-white/80 hover:bg-white/10' : 'text-ink-700 hover:bg-black/5',
              )}
            >
              {micState === 'denied' ? <MicOff className="size-4" aria-hidden /> : <Mic className="size-4" aria-hidden />}
              {micState === 'listening' ? 'Listening… blow now' : micState === 'denied' ? 'Microphone unavailable' : 'Blow into your mic'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function TieredCake({ skin }: { skin: CakeSkin }) {
  const sprinkles = Array.from({ length: 22 }, (_, i) => ({
    x: 82 + ((i * 53) % 236),
    y: 248 + ((i * 29) % 60),
    r: (i * 37) % 180,
    c: skin.sprinkles[i % skin.sprinkles.length],
  }));
  return (
    <g>
      <ellipse cx={200} cy={334} rx={176} ry={22} fill={skin.plate} />
      <rect x={66} y={228} width={268} height={100} rx={18} fill={skin.sponge} />
      <rect x={66} y={290} width={268} height={38} rx={14} fill={skin.spongeDark} opacity={0.55} />
      <path d="M66 246 Q66 228 84 228 H316 Q334 228 334 246 V256 Q318 270 304 256 T276 258 T246 262 T214 256 T184 264 T152 256 T122 262 T94 256 T66 262 Z" fill={skin.drip} />
      {sprinkles.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width={9} height={3} rx={1.5} fill={s.c} transform={`rotate(${s.r} ${s.x} ${s.y})`} />
      ))}
      <rect x={106} y={158} width={188} height={76} rx={16} fill={skin.frosting} />
      <path d="M106 174 Q106 158 122 158 H278 Q294 158 294 174 V182 Q282 194 270 182 T244 184 T218 188 T192 182 T166 190 T140 182 T106 188 Z" fill={skin.drip} />
      {Array.from({ length: 7 }, (_, i) => (
        <circle key={i} cx={122 + i * 26} cy={226} r={6} fill={skin.drip} />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i} cx={80 + i * 27} cy={322} r={7} fill={skin.frosting} />
      ))}
    </g>
  );
}

function Cupcake({ skin }: { skin: CakeSkin }) {
  return (
    <g>
      <ellipse cx={200} cy={340} rx={130} ry={16} fill={skin.plate} />
      <path d="M110 230 H290 L268 334 H132 Z" fill={skin.spongeDark} />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M${118 + i * 20} 232 L${138 + i * 16.5} 334`} stroke={skin.sponge} strokeWidth={6} opacity={0.6} />
      ))}
      <path d="M96 236 Q92 196 140 192 Q138 160 180 158 Q196 128 222 150 Q262 146 262 184 Q308 188 304 236 Q200 254 96 236 Z" fill={skin.frosting} />
      <path d="M120 214 Q200 236 282 214" stroke={skin.drip} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.7} />
      {Array.from({ length: 14 }, (_, i) => (
        <rect
          key={i}
          x={124 + ((i * 41) % 150)}
          y={176 + ((i * 17) % 48)}
          width={8}
          height={3}
          rx={1.5}
          fill={skin.sprinkles[i % skin.sprinkles.length]}
          transform={`rotate(${(i * 47) % 180} ${124 + ((i * 41) % 150)} ${176 + ((i * 17) % 48)})`}
        />
      ))}
    </g>
  );
}
