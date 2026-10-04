import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  const planets = [
    [0.34, 0.9, '#8e3b2e'],
    [0.62, 2.6, '#5f8f7d'],
    [0.88, 4.4, '#bf8f3a'],
  ] as const;
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#1d1914] bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,rgb(201_164_103/0.18),transparent_70%)]">
      <svg viewBox="0 0 200 140" className="h-full w-full transition-transform duration-[1.5s] group-hover:rotate-6" aria-hidden>
        {planets.map(([r], i) => (
          <ellipse key={i} cx="100" cy="70" rx={r * 90} ry={r * 32} fill="none" stroke="#b08d57" strokeOpacity=".4" />
        ))}
        {planets.map(([r, a, c], i) => {
          const x = 100 + Math.cos(a) * r * 90;
          const y = 70 + Math.sin(a) * r * 32;
          return (
            <g key={i}>
              <line x1="100" y1="70" x2={x} y2={y} stroke="#c9a467" strokeWidth="1.2" />
              <circle cx={x} cy={y} r={5 + i} fill={c} stroke="#c9a467" />
            </g>
          );
        })}
        <circle cx="100" cy="70" r="12" fill="#c9a467" />
      </svg>
    </div>
  );
}

export const ourLittleUniverseTemplate: BirthdayTemplate = {
  id: 'our-little-universe',
  name: 'Our Little Universe',
  tagline: 'A brass orrery with your two names at its centre',
  description: 'A hand-made brass orrery under a desk lamp. Turn it by hand: six painted planets ride brass arms around a sun engraved with your two names, each holding memories, photos, messages or plans.',
  categories: ['love'],
  loveTags: ['magical', 'creative', 'cute', 'premium'],
  moods: ['Crafted', 'Whimsical', 'Warm'],
  bestFor: 'Couples who feel like their own little world',
  palette: { primary: '#c9a467', secondary: '#1d1914', accent: '#8e3b2e' },
  tone: 'dark',
  fonts: { google: ['IM+Fell+English+SC', 'IM+Fell+English:ital@0;1'], display: "'IM Fell English SC', Georgia, serif", body: "'IM Fell English', Georgia, serif" },
  animations: { language: 'Clockwork orbit in 3D', ambientDensity: 0 },
  interactions: { highlights: ['Turn the orrery by hand', 'Planets on brass arms, in depth', 'Six worlds to read', 'An engraved plaque finale'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
