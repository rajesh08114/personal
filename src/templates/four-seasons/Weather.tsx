import { useEffect, useRef } from 'react';
import type { MotionValue } from 'motion/react';
import { TIER_SCALE, useDeviceTier } from '@/hooks/useDeviceTier';
import { LOOKS, seasonWeights, type Season } from './seasons';

type Kind = Season;

interface Flake {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  spin: number;
  phase: number;
  color: string;
  age: number;
  life: number;
}

/** Per season: how many particles per second at full strength, and how they move. */
const WEATHER: Record<Kind, { rate: number; fall: [number, number]; size: [number, number] }> = {
  spring: { rate: 9, fall: [28, 55], size: [7, 12] },
  summer: { rate: 5, fall: [-6, 6], size: [2, 3.4] },
  autumn: { rate: 7, fall: [45, 85], size: [11, 17] },
  winter: { rate: 26, fall: [22, 60], size: [1.4, 3.6] },
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * One canvas for all four kinds of weather. Each season's particles fade in and out with
 * the season's weight at the current year position, so spring petals give way to summer
 * fireflies, falling leaves, then snow. Scales with the device, pauses when the tab is hidden.
 */
export function Weather({
  order,
  pos,
  scale = 1,
}: {
  order: Season[];
  pos: MotionValue<number>;
  scale?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tier = useDeviceTier();
  const orderKey = order.join(',');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const seasons = orderKey.split(',') as Season[];
    const budget = Math.round(160 * TIER_SCALE[tier] * scale);
    const flakes: Flake[] = [];
    const carry: Record<Kind, number> = { spring: 0, summer: 0, autumn: 0, winter: 0 };
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = performance.now();
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (kind: Kind): Flake => {
      const spec = WEATHER[kind];
      const palette = kind === 'summer' ? ['#fff3b0', '#ffe066'] : LOOKS[kind].foliage;
      return {
        kind,
        x: rand(-20, w + 20),
        y: kind === 'summer' ? rand(h * 0.35, h * 0.9) : -20,
        vx: rand(-12, 12),
        vy: rand(spec.fall[0], spec.fall[1]),
        size: rand(spec.size[0], spec.size[1]),
        rot: rand(0, Math.PI * 2),
        spin: rand(-2, 2),
        phase: rand(0, Math.PI * 2),
        color: kind === 'winter' ? '#ffffff' : palette[Math.floor(Math.random() * palette.length)],
        age: 0,
        life: kind === 'summer' ? rand(4, 8) : 30,
      };
    };

    const draw = (f: Flake, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(f.x, f.y);
      ctx.fillStyle = f.color;
      if (f.kind === 'summer') {
        // Fireflies: a soft glow that pulses.
        const glow = 0.55 + 0.45 * Math.sin(f.phase + f.age * 3);
        ctx.globalAlpha = alpha * glow;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, f.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (f.kind === 'winter') {
        ctx.beginPath();
        ctx.arc(0, 0, f.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (f.kind === 'spring') {
        ctx.rotate(f.rot);
        ctx.scale(1, Math.max(0.3, Math.abs(Math.cos(f.phase + f.age * 2))));
        ctx.beginPath();
        ctx.ellipse(0, 0, f.size / 2, f.size / 3.2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.rotate(f.rot);
        ctx.scale(Math.max(0.2, Math.abs(Math.cos(f.phase + f.age * 2.4))), 1);
        const s = f.size / 2;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(s * 0.9, -s * 0.2, 0, s);
        ctx.quadraticCurveTo(-s * 0.9, -s * 0.2, 0, -s);
        ctx.fill();
      }
      ctx.restore();
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const weights = seasonWeights(pos.get(), seasons.length);
      const strength: Record<Kind, number> = { spring: 0, summer: 0, autumn: 0, winter: 0 };
      seasons.forEach((s, i) => (strength[s] = weights[i]));

      for (const kind of Object.keys(WEATHER) as Kind[]) {
        carry[kind] += WEATHER[kind].rate * strength[kind] * dt * TIER_SCALE[tier] * scale;
        while (carry[kind] >= 1) {
          carry[kind] -= 1;
          if (flakes.length < budget) flakes.push(spawn(kind));
        }
      }

      ctx.clearRect(0, 0, w, h);
      for (let i = flakes.length - 1; i >= 0; i--) {
        const f = flakes[i];
        f.age += dt;
        if (f.kind === 'summer') {
          f.vx += rand(-30, 30) * dt;
          f.vy += rand(-30, 30) * dt;
          f.vx *= 0.98;
          f.vy *= 0.98;
        } else {
          // Sway: petals and leaves are carried sideways by the breeze.
          f.vx = Math.sin(f.phase + f.age * 1.3) * (f.kind === 'winter' ? 10 : 26);
        }
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.rot += f.spin * dt;
        // Particles of a season that has passed fade out instead of vanishing.
        const fadeIn = Math.min(1, f.age * 2);
        const fadeOut = f.kind === 'summer' ? Math.min(1, (f.life - f.age) * 2) : 1;
        const alpha = Math.max(0, Math.min(fadeIn, fadeOut)) * Math.min(1, strength[f.kind] * 1.5 + 0.15);
        if (f.y > h + 30 || f.x < -60 || f.x > w + 60 || f.age > f.life) {
          flakes.splice(i, 1);
          continue;
        }
        draw(f, alpha);
      }
      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [orderKey, pos, scale, tier]);

  return (
    <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[5] h-full w-full" />
  );
}
