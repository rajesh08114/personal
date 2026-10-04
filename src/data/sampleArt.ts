/**
 * Abstract, clearly-labelled "sample photo" artwork for template previews.
 * We deliberately avoid stock photos — these are generated gradients.
 */
const PALETTES: Array<[string, string, string]> = [
  ['#f6c66a', '#d9467a', '#3b1d4a'],
  ['#9be7d8', '#3a7bd5', '#1b1f3b'],
  ['#ffd3b6', '#ff8c94', '#6b2d5c'],
  ['#c3f0ca', '#4caf88', '#173d36'],
  ['#e0c3fc', '#8ec5fc', '#2d2a5a'],
  ['#ffe29f', '#ffa99f', '#7a3e48'],
  ['#a1c4fd', '#c2e9fb', '#24496b'],
  ['#fbc2eb', '#a6c1ee', '#45325e'],
];

export function sampleArt(
  seed: number,
  label = 'Sample photo',
  ratio: 'portrait' | 'landscape' | 'square' = 'portrait',
): string {
  const [a, b, c] = PALETTES[seed % PALETTES.length];
  const w = ratio === 'landscape' ? 1200 : ratio === 'square' ? 1000 : 900;
  const h = ratio === 'landscape' ? 800 : ratio === 'square' ? 1000 : 1200;
  const r = (n: number) => (Math.sin(seed * 9301 + n * 49297) + 1) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>
<filter id="b"><feGaussianBlur stdDeviation="60"/></filter>
</defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<g filter="url(#b)" opacity=".75">
<circle cx="${(r(1) * w).toFixed(0)}" cy="${(r(2) * h).toFixed(0)}" r="${(w * 0.28).toFixed(0)}" fill="${a}"/>
<circle cx="${(r(3) * w).toFixed(0)}" cy="${(r(4) * h).toFixed(0)}" r="${(w * 0.22).toFixed(0)}" fill="#ffffff" opacity=".5"/>
<circle cx="${(r(5) * w).toFixed(0)}" cy="${(r(6) * h).toFixed(0)}" r="${(w * 0.3).toFixed(0)}" fill="${c}"/>
</g>
<text x="40" y="${h - 44}" font-family="Manrope, Arial, sans-serif" font-size="30" letter-spacing="6" fill="#ffffff" fill-opacity=".8">${label.toUpperCase()}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
