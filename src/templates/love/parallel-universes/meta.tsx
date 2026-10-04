import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  const orbs = [
    ['18%', '30%', 'from-[#ffd29a] to-[#ff7a59]'],
    ['42%', '58%', 'from-[#ff9ad5] to-[#5ee7df]'],
    ['62%', '24%', 'from-[#7dd3fc] to-[#2563eb]'],
    ['78%', '58%', 'from-[#c4b5fd] to-[#7c3aed]'],
  ];
  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_center,#1b1035,#05030d_75%)]">
      {orbs.map(([x, y, g], i) => (
        <span key={i} className={`absolute size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${g} opacity-90 shadow-[0_0_30px_rgb(255_255_255/0.25)] transition-all duration-1000 group-hover:top-1/2 group-hover:left-1/2`} style={{ left: x, top: y }} />
      ))}
      <p className="absolute inset-x-0 bottom-3 text-center text-[0.6rem] tracking-[0.3em] text-white/70" style={{ fontFamily: "'Unbounded', sans-serif" }}>
        IN EVERY UNIVERSE
      </p>
    </div>
  );
}

export const parallelUniversesTemplate: BirthdayTemplate = {
  id: 'parallel-universes',
  name: 'Parallel Universes',
  tagline: 'In every universe, I’d still choose you',
  description: 'Four dreamlike worlds, each holding a different memory. Dive into each one, then watch them collapse into one: “I’d still choose you.”',
  categories: ['love'],
  loveTags: ['creative', 'magical', 'cinematic'],
  moods: ['Dreamy', 'Sci-fi', 'Profound'],
  bestFor: 'Creative couples and sci-fi romantics',
  palette: { primary: '#c4b5fd', secondary: '#1b1035', accent: '#5ee7df' },
  tone: 'dark',
  fonts: { google: ['Unbounded:wght@300;500;700', 'Plus+Jakarta+Sans:wght@300;400;500'], display: "'Unbounded', system-ui, sans-serif", body: "'Plus Jakarta Sans', system-ui, sans-serif" },
  animations: { language: 'Portal & collapse', ambientDensity: 6 },
  interactions: { highlights: ['Four glowing worlds', 'Dive into each universe', 'Colour-shifting space', 'Universes collapse into one'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
