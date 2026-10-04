import { useEffect, useRef } from 'react';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/useMediaQuery';

interface PointerTrailProps {
  colors: string[];
  shape?: 'star' | 'dot' | 'square';
  size?: number;
  /** Particles spawned per pointer move event. */
  rate?: number;
}

/** Leaves a short-lived trail of sparkles behind a fine pointer (mouse/trackpad). */
export function PointerTrail({ colors, shape = 'dot', size = 3, rate = 1 }: PointerTrailProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const colorKey = colors.join(',');

  useEffect(() => {
    if (!fine || reduced) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const palette = colorKey.split(',');
    type P = { x: number; y: number; vx: number; vy: number; life: number; color: string; s: number };
    let parts: P[] = [];
    let raf = 0;
    let last = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const drawStar = (x: number, y: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.quadraticCurveTo(x, y, x, y + r);
      ctx.quadraticCurveTo(x, y, x - r, y);
      ctx.quadraticCurveTo(x, y, x, y - r);
      ctx.fill();
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts = parts.filter((p) => (p.life -= dt) > 0);
      for (const p of parts) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        ctx.globalAlpha = Math.min(1, p.life * 1.6);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        const r = p.s * (0.4 + p.life);
        if (shape === 'star') drawStar(p.x, p.y, r * 1.6);
        else if (shape === 'square') ctx.fillRect(p.x - r / 2, p.y - r / 2, r, r);
        else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r / 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      raf = parts.length ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e: PointerEvent) => {
      for (let i = 0; i < rate; i++) {
        if (parts.length > 120) parts.shift();
        parts.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 30,
          vy: 10 + Math.random() * 25,
          life: 0.6 + Math.random() * 0.4,
          color: palette[Math.floor(Math.random() * palette.length)],
          s: size * (0.6 + Math.random() * 0.8),
        });
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, [fine, reduced, colorKey, shape, size, rate]);

  if (!fine || reduced) return null;
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[65] h-full w-full" />;
}
