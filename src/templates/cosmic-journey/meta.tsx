import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#03040c] bg-[radial-gradient(ellipse_at_30%_30%,#3b1d6e55,transparent_60%),radial-gradient(ellipse_at_80%_70%,#0e4d6e55,transparent_60%)]">
      <div className="absolute size-40 rounded-full border border-white/10 [transform:rotateX(70deg)]" />
      <div className="absolute size-28 animate-spin-slow rounded-full border border-white/15">
        <span className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rounded-full bg-gradient-to-br from-[#7dd3fc] to-[#3b82f6]" />
      </div>
      <div className="absolute size-44 animate-[spin_40s_linear_infinite_reverse] rounded-full border border-white/10">
        <span className="absolute top-1/2 -right-2 size-5 rounded-full bg-gradient-to-br from-[#fca5a5] to-[#e11d48]" />
      </div>
      <span className="relative size-10 rounded-full bg-gradient-to-br from-[#fde68a] to-[#f59e0b] shadow-[0_0_30px_#f59e0b] transition-transform duration-500 group-hover:scale-125" />
    </div>
  );
}

export const cosmicJourneyTemplate: BirthdayTemplate = {
  id: 'cosmic-journey',
  name: 'Cosmic Journey',
  tagline: 'Travel planet to planet through your memories',
  description: 'Launch into space: they are the sun at the centre, every memory is an orbiting planet you can land on, and the planets align for the finale.',
  categories: ['creative'],
  moods: ['Adventurous', 'Epic', 'Futuristic'],
  bestFor: 'Tech, science and adventurous personalities',
  palette: { primary: '#7dd3fc', secondary: '#7c3aed', accent: '#fbbf24' },
  tone: 'dark',
  fonts: { google: ['Orbitron:wght@500;700;900', 'Exo+2:wght@300;400;600'], display: "'Orbitron', system-ui, sans-serif", body: "'Exo 2', system-ui, sans-serif" },
  animations: { language: 'Orbit & warp', ambientDensity: 10 },
  interactions: { highlights: ['Launch countdown', 'Orbiting memory planets', 'Warp travel', 'Planet alignment'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
