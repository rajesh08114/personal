import { useEffect, useRef } from 'react';
import { useExperienceOptional } from '@/components/experience/ExperienceContext';
import { TIER_SCALE, useDeviceTier } from '@/hooks/useDeviceTier';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cn } from '@/utils/cn';

export type ParticleVariant = 'dust' | 'stars' | 'fireflies' | 'bubbles' | 'embers' | 'snow';

interface ParticlesProps {
  variant?: ParticleVariant;
  /** Particles per 100k px² before device/theme scaling. */
  density?: number;
  colors?: string[];
  className?: string;
  /** Fireflies drift toward the pointer. */
  followPointer?: boolean;
  /** Fixed to the viewport instead of the parent box. */
  fixed?: boolean;
}

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  speed: number;
  color: string;
}

const PRESETS: Record<ParticleVariant, { speed: number; size: [number, number]; glow: number; twinkle: boolean }> = {
  dust: { speed: 10, size: [0.6, 2], glow: 6, twinkle: true },
  stars: { speed: 1.5, size: [0.4, 1.6], glow: 4, twinkle: true },
  fireflies: { speed: 18, size: [1.2, 2.6], glow: 14, twinkle: true },
  bubbles: { speed: 22, size: [3, 9], glow: 0, twinkle: false },
  embers: { speed: 26, size: [0.8, 2.2], glow: 10, twinkle: true },
  snow: { speed: 16, size: [1, 3], glow: 0, twinkle: false },
};

/**
 * Ambient canvas particles. Pauses when offscreen or when the tab is hidden,
 * scales its count with the device tier and renders a static frame under reduced motion.
 */
export function Particles({
  variant = 'dust',
  density = 6,
  colors = ['#ffffff'],
  className,
  followPointer = false,
  fixed = false,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tier = useDeviceTier();
  const reduced = usePrefersReducedMotion();
  const exp = useExperienceOptional();
  const themeScale = exp?.effectsScale ?? 1;
  const colorKey = colors.join(',');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const preset = PRESETS[variant];
    const palette = colorKey.split(',');
    let dots: Dot[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    const pointer = { x: -9999, y: -9999 };

    const seed = () => {
      const area = (w * h) / 100_000;
      const count = Math.min(260, Math.round(area * density * TIER_SCALE[tier] * themeScale));
      dots = Array.from({ length: count }, () => {
        const a = Math.random() * Math.PI * 2;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: Math.cos(a) * preset.speed * (0.3 + Math.random()),
          vy:
            variant === 'bubbles' || variant === 'embers' || variant === 'dust'
              ? -preset.speed * (0.4 + Math.random())
              : variant === 'snow'
                ? preset.speed * (0.5 + Math.random())
                : Math.sin(a) * preset.speed * (0.3 + Math.random()),
          r: preset.size[0] + Math.random() * (preset.size[1] - preset.size[0]),
          phase: Math.random() * Math.PI * 2,
          speed: 0.6 + Math.random() * 1.6,
          color: palette[Math.floor(Math.random() * palette.length)],
        };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      draw(0, 0);
    };

    const draw = (t: number, dt: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        if (dt) {
          if (variant === 'fireflies') {
            d.vx += (Math.random() - 0.5) * 14 * dt;
            d.vy += (Math.random() - 0.5) * 14 * dt;
            if (followPointer && pointer.x > -999) {
              const dx = pointer.x - d.x;
              const dy = pointer.y - d.y;
              const dist = Math.hypot(dx, dy) || 1;
              if (dist < 260) {
                d.vx += (dx / dist) * 30 * dt;
                d.vy += (dy / dist) * 30 * dt;
              }
            }
            const sp = Math.hypot(d.vx, d.vy);
            const max = preset.speed * 1.8;
            if (sp > max) {
              d.vx = (d.vx / sp) * max;
              d.vy = (d.vy / sp) * max;
            }
          }
          d.x += d.vx * dt + (variant === 'snow' || variant === 'bubbles' ? Math.sin(t * 0.8 + d.phase) * 8 * dt : 0);
          d.y += d.vy * dt;
          if (d.x < -10) d.x = w + 10;
          if (d.x > w + 10) d.x = -10;
          if (d.y < -10) d.y = h + 10;
          if (d.y > h + 10) d.y = -10;
        }
        const alpha = preset.twinkle ? 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * d.speed + d.phase)) : 0.7;
        ctx.globalAlpha = alpha;
        if (variant === 'bubbles') {
          ctx.strokeStyle = d.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.stroke();
          continue;
        }
        ctx.fillStyle = d.color;
        if (preset.glow) {
          ctx.shadowColor = d.color;
          ctx.shadowBlur = preset.glow;
        }
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(now / 1000, dt);
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (reduced || raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const pause = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else pause();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? pause() : play());
    document.addEventListener('visibilitychange', onVis);
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    if (followPointer) window.addEventListener('pointermove', onMove, { passive: true });
    play();

    return () => {
      pause();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
    };
  }, [variant, density, colorKey, tier, reduced, followPointer, themeScale]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('pointer-events-none inset-0 h-full w-full', fixed ? 'fixed' : 'absolute', className)}
    />
  );
}
