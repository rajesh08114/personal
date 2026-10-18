/**
 * A single lightweight canvas particle engine for every celebration effect:
 * confetti cannons, confetti rain, fireworks and themed bursts (hearts, stars, petals…).
 * The RAF loop only runs while particles exist.
 */
export type FxShape = 'rect' | 'circle' | 'heart' | 'star' | 'petal' | 'leaf' | 'pixel' | 'spark';

export interface ConfettiOptions {
  /** Origin as a 0–1 fraction of the viewport. */
  x?: number;
  y?: number;
  count?: number;
  /** Cone width in degrees. */
  spread?: number;
  /** Launch direction in degrees (90 = straight up). */
  angle?: number;
  velocity?: number;
  colors?: string[];
  shapes?: FxShape[];
  size?: number;
}

export interface RainOptions {
  count?: number;
  colors?: string[];
  shapes?: FxShape[];
  duration?: number;
  size?: number;
}

export interface FireworksOptions {
  duration?: number;
  rockets?: number;
  colors?: string[];
  /** Spark shape; 'spark' draws glowing trails. */
  shape?: FxShape;
}

export interface BurstOptions {
  /** Client (viewport) pixel coordinates. */
  x: number;
  y: number;
  count?: number;
  colors?: string[];
  shape?: FxShape;
  size?: number;
  speed?: number;
}

interface Particle {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  shape: FxShape;
  rot: number;
  vr: number;
  tilt: number;
  vt: number;
  sway: number;
}

interface Rocket {
  at: number;
  x: number;
  y: number;
  vy: number;
  color: string;
  colors: string[];
  shape: FxShape;
  launched: boolean;
}

const DEFAULT_COLORS = ['#f6c66a', '#ff7aa2', '#8fd3ff', '#b69cff', '#7ef0c5', '#ffffff'];
const MAX_PARTICLES = 1400;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export class FxEngine {
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private rockets: Rocket[] = [];
  private raf = 0;
  private last = 0;
  private clock = 0;
  private width = 0;
  private height = 0;
  /** Multiplier applied to all particle counts (device tier × theme effects). */
  scale = 1;
  enabled = true;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D not supported');
    this.ctx = ctx;
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private n(count: number) {
    return Math.max(4, Math.round(count * this.scale));
  }

  private spawn(p: Omit<Particle, 'px' | 'py'>) {
    if (this.particles.length >= MAX_PARTICLES) return;
    this.particles.push({ ...p, px: p.x, py: p.y });
  }

  confetti(o: ConfettiOptions = {}) {
    if (!this.enabled) return;
    const x = (o.x ?? 0.5) * this.width;
    const y = (o.y ?? 0.6) * this.height;
    const colors = o.colors ?? DEFAULT_COLORS;
    const shapes = o.shapes ?? ['rect', 'rect', 'circle'];
    const spread = ((o.spread ?? 70) * Math.PI) / 180;
    const angle = ((o.angle ?? 90) * Math.PI) / 180;
    const velocity = o.velocity ?? Math.min(1300, this.height * 1.25);
    const size = o.size ?? 9;
    for (let i = 0, n = this.n(o.count ?? 140); i < n; i++) {
      const a = angle + rand(-spread / 2, spread / 2);
      const speed = velocity * rand(0.45, 1);
      this.spawn({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: -Math.sin(a) * speed,
        gravity: 1500,
        drag: 0.12,
        life: 0,
        maxLife: rand(2.4, 3.8),
        size: size * rand(0.6, 1.2),
        color: pick(colors),
        shape: pick(shapes),
        rot: rand(0, Math.PI * 2),
        vr: rand(-8, 8),
        tilt: rand(0, Math.PI * 2),
        vt: rand(4, 12),
        sway: rand(-40, 40),
      });
    }
    this.start();
  }

  /** Two cannons from the bottom corners — the "big moment" effect. */
  cannons(o: Omit<ConfettiOptions, 'x' | 'y' | 'angle'> = {}) {
    this.confetti({ ...o, x: 0, y: 1, angle: 62, spread: 40, count: (o.count ?? 160) / 2 });
    this.confetti({ ...o, x: 1, y: 1, angle: 118, spread: 40, count: (o.count ?? 160) / 2 });
  }

  rain(o: RainOptions = {}) {
    if (!this.enabled) return;
    const colors = o.colors ?? DEFAULT_COLORS;
    const shapes = o.shapes ?? ['rect', 'circle'];
    const duration = o.duration ?? 3;
    const n = this.n(o.count ?? 160);
    for (let i = 0; i < n; i++) {
      this.spawn({
        x: rand(0, this.width),
        y: -rand(10, this.height * 0.9 * (duration / 3)),
        vx: rand(-30, 30),
        vy: rand(80, 220),
        gravity: 60,
        drag: 0.6,
        life: 0,
        maxLife: duration + rand(2.5, 4.5),
        size: (o.size ?? 9) * rand(0.6, 1.3),
        color: pick(colors),
        shape: pick(shapes),
        rot: rand(0, Math.PI * 2),
        vr: rand(-3, 3),
        tilt: rand(0, Math.PI * 2),
        vt: rand(2, 6),
        sway: rand(20, 60),
      });
    }
    this.start();
  }

  burst(o: BurstOptions) {
    if (!this.enabled) return;
    const colors = o.colors ?? DEFAULT_COLORS;
    const speed = o.speed ?? 260;
    for (let i = 0, n = this.n(o.count ?? 18); i < n; i++) {
      const a = rand(0, Math.PI * 2);
      const s = speed * rand(0.35, 1);
      this.spawn({
        x: o.x,
        y: o.y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - speed * 0.4,
        gravity: o.shape === 'spark' ? 220 : 420,
        drag: 0.25,
        life: 0,
        maxLife: rand(0.9, 1.6),
        size: (o.size ?? 12) * rand(0.6, 1.1),
        color: pick(colors),
        shape: o.shape ?? 'heart',
        rot: rand(-0.4, 0.4),
        vr: rand(-2, 2),
        tilt: 0,
        vt: 0,
        sway: 0,
      });
    }
    this.start();
  }

  fireworks(o: FireworksOptions = {}) {
    if (!this.enabled) return;
    const duration = o.duration ?? 4;
    const count = Math.max(3, Math.round((o.rockets ?? 9) * Math.max(0.5, this.scale)));
    const colors = o.colors ?? DEFAULT_COLORS;
    for (let i = 0; i < count; i++) {
      const targetY = rand(this.height * 0.12, this.height * 0.45);
      const dy = this.height - targetY;
      this.rockets.push({
        at: this.clock + (i / count) * duration + rand(0, 0.3),
        x: rand(this.width * 0.12, this.width * 0.88),
        y: this.height + 10,
        vy: -Math.sqrt(2 * 900 * dy),
        color: pick(colors),
        colors,
        shape: o.shape ?? 'spark',
        launched: false,
      });
    }
    this.start();
  }

  private explode(r: Rocket) {
    const n = this.n(70);
    const palette = [r.color, pick(r.colors), '#ffffff'];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand(-0.05, 0.05);
      const s = rand(140, 360);
      this.spawn({
        x: r.x,
        y: r.y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        gravity: 260,
        drag: 0.35,
        life: 0,
        maxLife: rand(1.1, 1.9),
        size: r.shape === 'spark' ? rand(1.6, 2.6) : rand(6, 10),
        color: pick(palette),
        shape: r.shape,
        rot: rand(0, Math.PI * 2),
        vr: rand(-4, 4),
        tilt: 0,
        vt: 0,
        sway: 0,
      });
    }
  }

  clear() {
    this.particles = [];
    this.rockets = [];
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.clear();
  }

  private start() {
    if (this.raf) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private frame = (now: number) => {
    const dt = Math.min(0.033, (now - this.last) / 1000);
    this.last = now;
    this.clock += dt;
    const { ctx } = this;
    ctx.clearRect(0, 0, this.width, this.height);

    for (const r of this.rockets) {
      if (r.at > this.clock) continue;
      r.launched = true;
      const py = r.y;
      r.vy += 900 * dt;
      r.y += r.vy * dt;
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(r.x, py + 14);
      ctx.lineTo(r.x, r.y);
      ctx.stroke();
      if (r.vy >= -40) this.explode(r);
    }
    this.rockets = this.rockets.filter((r) => !(r.launched && r.vy >= -40));

    const alive: Particle[] = [];
    for (const p of this.particles) {
      p.life += dt;
      if (p.life >= p.maxLife || p.y > this.height + 60) continue;
      const dragF = Math.pow(p.drag, dt);
      p.px = p.x;
      p.py = p.y;
      p.vx *= dragF;
      p.vy = p.vy * dragF + p.gravity * dt;
      p.x += (p.vx + Math.sin(p.life * 3 + p.tilt) * p.sway) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.tilt += p.vt * dt;
      this.draw(p);
      alive.push(p);
    }
    this.particles = alive;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    if (this.particles.length || this.rockets.length) {
      this.raf = requestAnimationFrame(this.frame);
    } else {
      this.raf = 0;
      ctx.clearRect(0, 0, this.width, this.height);
    }
  };

  private draw(p: Particle) {
    const { ctx } = this;
    const fade = Math.min(1, (p.maxLife - p.life) / 0.6);
    ctx.globalAlpha = fade;
    if (p.shape === 'spark') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p.px - (p.x - p.px) * 2, p.py - (p.y - p.py) * 2);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      return;
    }
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    const s = p.size;
    switch (p.shape) {
      case 'rect':
        ctx.scale(1, Math.cos(p.tilt));
        ctx.fillRect(-s / 2, -s / 4, s, s / 2);
        break;
      case 'pixel':
        ctx.rotate(-p.rot);
        ctx.fillRect(-s / 2, -s / 2, s, s);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, s / 2.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'petal':
        ctx.scale(1, Math.max(0.25, Math.abs(Math.cos(p.tilt))));
        ctx.beginPath();
        ctx.ellipse(0, 0, s / 2, s / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'leaf':
        // Tumbles as it falls: the flip shows the leaf edge-on, then face-on.
        ctx.scale(Math.max(0.2, Math.abs(Math.cos(p.tilt))), 1);
        leaf(ctx, s);
        break;
      case 'heart':
        heart(ctx, s);
        break;
      case 'star':
        star(ctx, s);
        break;
    }
    ctx.restore();
  }
}

function heart(ctx: CanvasRenderingContext2D, s: number) {
  const h = s / 2;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.7);
  ctx.bezierCurveTo(-h * 1.4, -h * 0.2, -h * 0.6, -h * 1.2, 0, -h * 0.45);
  ctx.bezierCurveTo(h * 0.6, -h * 1.2, h * 1.4, -h * 0.2, 0, h * 0.7);
  ctx.fill();
}

function leaf(ctx: CanvasRenderingContext2D, s: number) {
  const h = s / 2;
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.quadraticCurveTo(h * 0.9, -h * 0.2, 0, h);
  ctx.quadraticCurveTo(-h * 0.9, -h * 0.2, 0, -h);
  ctx.fill();
}

function star(ctx: CanvasRenderingContext2D, s: number) {
  const outer = s / 2;
  const inner = outer * 0.45;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
}
