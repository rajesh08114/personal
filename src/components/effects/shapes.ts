/** Point clouds (normalised to 0–1) that particle systems can morph into. */
export type Pt = [number, number];

/** Evenly-ish distributed points filling a heart silhouette. */
export function heartPoints(count: number): Pt[] {
  const pts: Pt[] = [];
  let guard = 0;
  while (pts.length < count && guard++ < count * 40) {
    const x = Math.random() * 2.6 - 1.3;
    const y = Math.random() * 2.6 - 1.3;
    // Classic implicit heart: (x²+y²−1)³ − x²y³ ≤ 0
    const a = x * x + y * y - 1;
    if (a * a * a - x * x * y * y * y <= 0) pts.push([(x + 1.3) / 2.6, 1 - (y + 1.3) / 2.6]);
  }
  return pts;
}

/** Points on the outline of a heart (parametric). */
export function heartOutline(count: number): Pt[] {
  return Array.from({ length: count }, (_, i) => {
    const t = (i / count) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return [0.5 + x / 36, 0.48 - y / 36] as Pt;
  });
}

/**
 * Samples filled pixels of rendered text. Returns points normalised to the
 * text's own box plus that box's aspect ratio (width / height).
 */
export async function textPoints(
  text: string,
  { fontFamily = 'Georgia, serif', weight = 600, count = 900 }: { fontFamily?: string; weight?: number; count?: number } = {},
): Promise<{ points: Pt[]; aspect: number }> {
  try {
    await document.fonts.load(`${weight} 120px ${fontFamily}`);
  } catch {
    /* fall back to system fonts */
  }
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { points: [], aspect: 1 };
  const lines = text.split('\n');
  const size = 160;
  ctx.font = `${weight} ${size}px ${fontFamily}`;
  const w = Math.ceil(Math.max(...lines.map((l) => ctx.measureText(l).width))) + 20;
  const h = Math.ceil(lines.length * size * 1.15) + 20;
  canvas.width = w;
  canvas.height = h;
  ctx.font = `${weight} ${size}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000';
  lines.forEach((l, i) => ctx.fillText(l, w / 2, 10 + size * 1.15 * (i + 0.5)));
  const data = ctx.getImageData(0, 0, w, h).data;
  const filled: Pt[] = [];
  const step = Math.max(2, Math.round(Math.sqrt((w * h) / (count * 6))));
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) if (data[(y * w + x) * 4 + 3] > 128) filled.push([x / w, y / h]);
  for (let i = filled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filled[i], filled[j]] = [filled[j], filled[i]];
  }
  return { points: filled.slice(0, count), aspect: w / h };
}

/** Random scatter across the whole box. */
export function scatterPoints(count: number): Pt[] {
  return Array.from({ length: count }, () => [Math.random(), Math.random()] as Pt);
}
