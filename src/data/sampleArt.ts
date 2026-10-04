/**
 * Clearly-labelled "sample photo" artwork for template previews.
 * We deliberately avoid stock photos — these are small procedural landscapes in
 * muted, film-stock tones (think faded Portra prints), so previews look like
 * real snapshots without pretending to be anyone's real memories.
 */

/** sky top, sky bottom, sun, far land, mid land, near land */
const PALETTES: Array<[string, string, string, string, string, string]> = [
  ['#c9d3d6', '#ecdcc4', '#f4e3c3', '#a7aeab', '#7d8a7f', '#4d5a4f'], // overcast coast
  ['#e3c6ad', '#f1ddc3', '#fbeedb', '#c09a86', '#94735f', '#5b463b'], // late-summer dusk
  ['#aebfc6', '#dfe3dc', '#f6f1e2', '#8fa3a6', '#62787a', '#3a4b4e'], // northern morning
  ['#d6cbb8', '#efe4cf', '#f8eedb', '#b3a88e', '#8a8166', '#575240'], // dry hills
  ['#c4b8c2', '#e9d8cf', '#f6e5d6', '#a49aa3', '#7c727d', '#4c4450'], // lavender evening
  ['#bccbc0', '#e6e3d0', '#f5efdc', '#9cad9b', '#728470', '#44523f'], // green valley
];

type Ratio = 'portrait' | 'landscape' | 'square';

/** A smooth ridge line across the frame, closed down to the bottom edge. */
function ridge(w: number, h: number, baseY: number, amp: number, seed: number, rnd: (n: number) => number): string {
  const steps = 24;
  const f1 = 1 + rnd(seed) * 2;
  const f2 = 3 + rnd(seed + 1) * 4;
  const p1 = rnd(seed + 2) * Math.PI * 2;
  const p2 = rnd(seed + 3) * Math.PI * 2;
  let d = `M0 ${h}`;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = baseY + Math.sin(t * Math.PI * f1 + p1) * amp + Math.sin(t * Math.PI * f2 + p2) * amp * 0.3;
    d += ` L${(t * w).toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d} L${w} ${h} Z`;
}

export function sampleArt(seed: number, label = 'Sample photo', ratio: Ratio = 'portrait'): string {
  const [skyTop, skyBottom, sun, far, mid, near] = PALETTES[seed % PALETTES.length];
  const w = ratio === 'landscape' ? 1200 : ratio === 'square' ? 1000 : 900;
  const h = ratio === 'landscape' ? 800 : ratio === 'square' ? 1000 : 1200;
  const rnd = (n: number) => (Math.sin(seed * 9301 + n * 49297) + 1) / 2;
  const horizon = h * (0.5 + rnd(1) * 0.12);
  const scene = seed % 3; // 0 hills · 1 sea · 2 mountains
  const sunX = w * (0.2 + rnd(2) * 0.6);
  const sunY = horizon - h * (0.08 + rnd(3) * 0.14);

  const land =
    scene === 1
      ? `<rect y="${horizon.toFixed(0)}" width="${w}" height="${(h - horizon).toFixed(0)}" fill="${mid}"/>
<rect y="${horizon.toFixed(0)}" width="${w}" height="3" fill="${sun}" opacity=".5"/>
<path d="${ridge(w, h, h * 0.86, h * 0.03, 30, rnd)}" fill="${near}"/>`
      : scene === 2
        ? `<path d="${ridge(w, h, horizon - h * 0.12, h * 0.1, 10, rnd)}" fill="${far}"/>
<path d="${ridge(w, h, horizon, h * 0.06, 20, rnd)}" fill="${mid}"/>
<path d="${ridge(w, h, h * 0.82, h * 0.04, 30, rnd)}" fill="${near}"/>`
        : `<path d="${ridge(w, h, horizon - h * 0.03, h * 0.04, 10, rnd)}" fill="${far}"/>
<path d="${ridge(w, h, horizon + h * 0.08, h * 0.05, 20, rnd)}" fill="${mid}"/>
<path d="${ridge(w, h, h * 0.84, h * 0.035, 30, rnd)}" fill="${near}"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
<defs>
<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skyTop}"/><stop offset="1" stop-color="${skyBottom}"/></linearGradient>
<radialGradient id="v" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a2018" stop-opacity=".28"/></radialGradient>
</defs>
<rect width="100%" height="100%" fill="url(#s)"/>
<circle cx="${sunX.toFixed(0)}" cy="${sunY.toFixed(0)}" r="${(w * 0.07).toFixed(0)}" fill="${sun}" opacity=".85"/>
${land}
<rect width="100%" height="100%" fill="url(#v)"/>
<text x="50%" y="${(h * 0.93).toFixed(0)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(w * 0.026)}" letter-spacing="5" fill="#ffffff" fill-opacity=".75">${label.toUpperCase()}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
