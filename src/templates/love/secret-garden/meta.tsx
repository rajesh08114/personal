import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-end justify-center gap-3 overflow-hidden bg-gradient-to-b from-[#06120c] to-[#0f2a1b] pb-5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgb(255_200_120/0.25),transparent_60%)]" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="relative h-24 w-16 overflow-hidden rounded-t-full border-2 border-[#3d5a3f] bg-[#0a1a10]">
          <div className="absolute inset-y-0 left-0 w-1/2 origin-left bg-[#2c3d2a] transition-transform duration-700 group-hover:[transform:perspective(200px)_rotateY(-70deg)]" />
          <div className="absolute inset-y-0 right-0 w-1/2 origin-right bg-[#253622] transition-transform duration-700 group-hover:[transform:perspective(200px)_rotateY(70deg)]" />
        </div>
      ))}
      {[18, 70, 44].map((x, i) => (
        <span key={i} className="absolute size-1.5 animate-twinkle rounded-full bg-[#ffe9a8] shadow-[0_0_8px_#ffe9a8]" style={{ left: `${x}%`, top: `${20 + i * 12}%`, animationDelay: `${i * 0.7}s` }} />
      ))}
    </div>
  );
}

export const secretGardenTemplate: BirthdayTemplate = {
  id: 'secret-garden',
  name: 'The Secret Garden',
  tagline: 'Hidden love notes, waiting to be found',
  description: 'A foggy, candlelit garden with four gates. Discover memories, old photographs and a love letter, and catch fireflies to unlock the secret gate.',
  categories: ['love'],
  loveTags: ['magical', 'romantic', 'creative'],
  moods: ['Mysterious', 'Enchanting', 'Romantic'],
  bestFor: 'Curious hearts who love a little mystery',
  palette: { primary: '#c9a35b', secondary: '#0f2a1b', accent: '#8e1f35' },
  tone: 'dark',
  fonts: { google: ['Cormorant+SC:wght@400;600', 'Spectral:ital,wght@0,300;0,400;1,300'], display: "'Cormorant SC', Georgia, serif", body: "'Spectral', Georgia, serif" },
  animations: { language: 'Fog & candlelight', ambientDensity: 4 },
  interactions: { highlights: ['Four gates to explore', 'Flowers hide memories', 'Catch fireflies for keys', 'A glowing clearing'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
