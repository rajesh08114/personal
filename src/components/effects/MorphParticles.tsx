import { useEffect, useRef } from 'react';
import { TIER_SCALE, useDeviceTier } from '@/hooks/useDeviceTier';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import type { Pt } from './shapes';
import { cn } from '@/utils/cn';

export interface MorphTarget {
  points: Pt[];
  /** Width / height of the shape's own box, so it isn't stretched. */
  aspect: number;
  /** Fraction of the canvas the shape may occupy (default 0.8). */
  fill?: number;
}

interface MorphParticlesProps {
  /** null = particles drift freely. */
  target: MorphTarget | null;
  colors: string[];
  count?: number;
  size?: number;
  className?: string;
  /** Particles are pushed away from the pointer. */
  interactive?: boolean;
  /** Spring stiffness toward targets. */
  stiffness?: number;
}

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  hasTarget: boolean;
  sprite: number;
  r: number;
  phase: number;
}

function makeSprite(color: string, r: number) {
  const c = document.createElement('canvas');
  c.width = c.height = r * 4;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(r * 2, r * 2, 0, r * 2, r * 2, r * 2);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.2, color);
  grad.addColorStop(1, 'transparent');
  g.fillStyle = grad;
  g.fillRect(0, 0, r * 4, r * 4);
  return c;
}

/**
 * Glowing particles that drift freely or spring into any point cloud (a heart, a name,
 * a constellation). Changing `target` makes them flow from one shape to the next.
 */
export function MorphParticles({ target, colors, count = 900, size = 2, className, interactive = true, stiffness = 0.035 }: MorphParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{ assign: (t: MorphTarget | null) => void } | null>(null);
  const tier = useDeviceTier();
  const reduced = usePrefersReducedMotion();
  const n = Math.round(count * TIER_SCALE[tier]);
  const colorKey = colors.join(',');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const sprites = colorKey.split(',').map((c) => makeSprite(c, 8));
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let current: MorphTarget | null = null;
    const pointer = { x: -9999, y: -9999 };
    const parts: P[] = Array.from({ length: n }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      tx: 0,
      ty: 0,
      hasTarget: false,
      sprite: Math.floor(Math.random() * sprites.length),
      r: size * (0.5 + Math.random()),
      phase: Math.random() * Math.PI * 2,
    }));

    const assign = (t: MorphTarget | null) => {
      current = t;
      if (!t || t.points.length === 0) {
        parts.forEach((p) => (p.hasTarget = false));
        return;
      }
      const fill = t.fill ?? 0.8;
      // Fit the shape inside the canvas while preserving its aspect ratio.
      let bw = w * fill;
      let bh = bw / t.aspect;
      if (bh > h * fill) {
        bh = h * fill;
        bw = bh * t.aspect;
      }
      const ox = (w - bw) / 2;
      const oy = (h - bh) / 2;
      parts.forEach((p, i) => {
        const pt = t.points[i % t.points.length];
        const jitter = i >= t.points.length ? 3 : 0;
        p.tx = ox + pt[0] * bw + (Math.random() - 0.5) * jitter;
        p.ty = oy + pt[1] * bh + (Math.random() - 0.5) * jitter;
        p.hasTarget = true;
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const first = w === 0;
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (first) parts.forEach((p) => ((p.x *= w), (p.y *= h)));
      assign(current);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of parts) {
        const tw = 0.55 + 0.45 * Math.sin(t / 600 + p.phase);
        ctx.globalAlpha = tw;
        const s = p.r * 4;
        ctx.drawImage(sprites[p.sprite], p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    let last = performance.now();
    const step = (t: number) => {
      // Frame-rate independent: one "unit" is a 60 fps frame.
      const f = Math.min(4, Math.max(0.25, (t - last) / 16.67));
      last = t;
      const damp = Math.pow(0.82, f);
      for (const p of parts) {
        if (p.hasTarget) {
          p.vx += (p.tx - p.x) * stiffness * f;
          p.vy += (p.ty - p.y) * stiffness * f;
          p.vx *= damp;
          p.vy *= damp;
          p.vx += Math.cos(t / 900 + p.phase) * 0.02;
          p.vy += Math.sin(t / 900 + p.phase) * 0.02;
        } else {
          p.vx += (Math.random() - 0.5) * 0.04;
          p.vy += (Math.random() - 0.5) * 0.04;
          p.vx *= 0.98;
          p.vy *= 0.98;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
        if (interactive) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 6400 && d2 > 0.1) {
            const f = (6400 - d2) / 6400;
            p.vx += (dx / Math.sqrt(d2)) * f * 1.6;
            p.vy += (dy / Math.sqrt(d2)) * f * 1.6;
          }
        }
        p.x += p.vx * f;
        p.y += p.vy * f;
      }
    };

    const loop = (t: number) => {
      step(t);
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (raf || !visible || document.hidden) return;
      last = performance.now();
      if (reduced) {
        parts.forEach((p) => {
          if (p.hasTarget) {
            p.x = p.tx;
            p.y = p.ty;
          }
        });
        draw(0);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const pause = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    stateRef.current = {
      assign: (t) => {
        assign(t);
        if (reduced) play();
      },
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) play();
      else pause();
    });
    io.observe(canvas);
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -9999;
    };
    if (interactive) {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);
    }
    const onVis = () => (document.hidden ? pause() : play());
    document.addEventListener('visibilitychange', onVis);
    play();
    return () => {
      pause();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
      stateRef.current = null;
    };
  }, [n, colorKey, size, interactive, stiffness, reduced]);

  useEffect(() => {
    stateRef.current?.assign(target);
  }, [target, n, colorKey, reduced]);

  return <canvas ref={canvasRef} aria-hidden className={cn('pointer-events-none h-full w-full', className)} />;
}
