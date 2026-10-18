/**
 * The year outside the window: which seasons play in which order, how the light and
 * the tree look in each, and how a continuous "year position" blends between them.
 * Pure functions only, so they are easy to test.
 */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Hemisphere = 'north' | 'south';

const CYCLE: Season[] = ['spring', 'summer', 'autumn', 'winter'];

/** Meteorological seasons (Mar–May is northern spring), flipped for the southern hemisphere. */
export function seasonOfMonth(month: number, hemisphere: Hemisphere = 'north'): Season {
  const north = CYCLE[Math.floor(((((month - 3) % 12) + 12) % 12) / 3)];
  return hemisphere === 'south' ? CYCLE[(CYCLE.indexOf(north) + 2) % 4] : north;
}

/** The season of their birthday, or winter (a year-end feeling) when no date is set. */
export function birthdaySeason(birthdayDate: string | undefined, hemisphere: Hemisphere = 'north'): Season {
  const m = /^\d{4}-(\d{2})-\d{2}$/.exec(birthdayDate ?? '');
  return m ? seasonOfMonth(Number(m[1]), hemisphere) : 'winter';
}

/** One full turn of the year that ends on (comes home to) `last`. */
export function yearEndingIn(last: Season): Season[] {
  const end = CYCLE.indexOf(last);
  return [1, 2, 3, 4].map((k) => CYCLE[(end + k) % 4]);
}

/** Splits memories across the four seasons as evenly as possible, keeping their order. */
export function splitAcrossSeasons<T>(items: T[], parts = 4): T[][] {
  const out: T[][] = [];
  let start = 0;
  for (let i = 0; i < parts; i++) {
    const size = Math.floor(items.length / parts) + (i < items.length % parts ? 1 : 0);
    out.push(items.slice(start, start + size));
    start += size;
  }
  return out;
}

export interface SeasonLook {
  label: string;
  /** Small-caps line under the season title. */
  motto: string;
  skyTop: string;
  skyBottom: string;
  ground: string;
  hills: string;
  /** Foliage colours, picked per leaf cluster. */
  foliage: string[];
  /** Foliage size: 0 = bare branches, 1 = full canopy. */
  canopy: number;
  /** Height of the sun above the horizon, 0–1. */
  sun: number;
  ink: string;
  paper: string;
}

export const LOOKS: Record<Season, SeasonLook> = {
  spring: {
    label: 'Spring',
    motto: 'The beginning of things',
    skyTop: '#c9dcea',
    skyBottom: '#f6e3e2',
    ground: '#9cbf7a',
    hills: '#b9cfa2',
    foliage: ['#f6c9d4', '#f1b3c4', '#fbe3e8', '#e9a2b8'],
    canopy: 0.62,
    sun: 0.45,
    ink: '#3b3a45',
    paper: '#fbf6f1',
  },
  summer: {
    label: 'Summer',
    motto: 'Long light, warm evenings',
    skyTop: '#6fa8d6',
    skyBottom: '#d8ecf2',
    ground: '#6e9c4c',
    hills: '#8db46a',
    foliage: ['#4f8a3c', '#3f7a33', '#6aa14b', '#5a9442'],
    canopy: 1,
    sun: 0.9,
    ink: '#24332a',
    paper: '#fdf8ec',
  },
  autumn: {
    label: 'Autumn',
    motto: 'Gold light, slow afternoons',
    skyTop: '#e7b98a',
    skyBottom: '#f6dcc0',
    ground: '#b88a4a',
    hills: '#c79a5c',
    foliage: ['#d9822b', '#c4502b', '#e8b04a', '#a8452a'],
    canopy: 0.82,
    sun: 0.3,
    ink: '#3a2a1e',
    paper: '#fbf1e2',
  },
  winter: {
    label: 'Winter',
    motto: 'Quiet snow, warm windows',
    skyTop: '#8e9fb3',
    skyBottom: '#dfe6ee',
    ground: '#eef2f6',
    hills: '#d3dce6',
    foliage: ['#ffffff', '#f1f5f9', '#e2e8f0', '#ffffff'],
    canopy: 0,
    sun: 0.12,
    ink: '#263241',
    paper: '#f7f9fb',
  },
};

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));

/** Mixes two #rrggbb colours; t = 0 → a, 1 → b. */
export function mix(a: string, b: string, t: number): string {
  const [x, y] = [hex(a), hex(b)];
  const k = Math.min(1, Math.max(0, t));
  return `#${x
    .map((v, i) =>
      Math.round(v + (y[i] - v) * k)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/** Splits a continuous year position (0 … seasons-1) into the two seasons it sits between. */
export function between(pos: number, count: number): { from: number; to: number; t: number } {
  const p = Math.min(count - 1, Math.max(0, pos));
  const from = Math.floor(p);
  const to = Math.min(count - 1, from + 1);
  return { from, to, t: p - from };
}

/** How strongly each season is present at a year position (sums to 1). */
export function seasonWeights(pos: number, count: number): number[] {
  const { from, to, t } = between(pos, count);
  return Array.from({ length: count }, (_, i) =>
    i === from && i === to ? 1 : i === from ? 1 - t : i === to ? t : 0,
  );
}

export type BlendedLook = Pick<SeasonLook, 'skyTop' | 'skyBottom' | 'ground' | 'hills' | 'ink' | 'paper'> & {
  canopy: number;
  sun: number;
};

/** The scene at a year position, blended between the neighbouring seasons. */
export function blendLook(order: Season[], pos: number): BlendedLook {
  const { from, to, t } = between(pos, order.length);
  const a = LOOKS[order[from]];
  const b = LOOKS[order[to]];
  // Ease the blend so each season holds for a moment before turning.
  const e = t * t * (3 - 2 * t);
  return {
    skyTop: mix(a.skyTop, b.skyTop, e),
    skyBottom: mix(a.skyBottom, b.skyBottom, e),
    ground: mix(a.ground, b.ground, e),
    hills: mix(a.hills, b.hills, e),
    ink: mix(a.ink, b.ink, e),
    paper: mix(a.paper, b.paper, e),
    canopy: a.canopy + (b.canopy - a.canopy) * e,
    sun: a.sun + (b.sun - a.sun) * e,
  };
}

/**
 * Leaf cluster `index` at a year position. Clusters turn one by one rather than all
 * at once (`stagger` delays later clusters), the way a real tree changes colour.
 */
export function clusterLook(
  order: Season[],
  pos: number,
  index: number,
  total: number,
): { color: string; scale: number } {
  const stagger = (index / Math.max(1, total)) * 0.35;
  const { from, to, t } = between(pos, order.length);
  const local = Math.min(1, Math.max(0, (t - stagger) / (1 - 0.35)));
  const e = local * local * (3 - 2 * local);
  const a = LOOKS[order[from]];
  const b = LOOKS[order[to]];
  const pick = (look: SeasonLook) => look.foliage[index % look.foliage.length];
  // Each cluster has its own size, so the canopy reads as leaves, not a cloud.
  const jitter = 0.78 + ((index * 37) % 23) / 100;
  return {
    color: mix(pick(a), pick(b), e),
    scale: (a.canopy + (b.canopy - a.canopy) * e) * jitter,
  };
}
