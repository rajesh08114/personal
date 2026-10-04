import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-end justify-center gap-6 overflow-hidden bg-[radial-gradient(ellipse_at_50%_20%,#5a1424,#1c050b_75%)] pb-6">
      {[0.8, 1, 0.75].map((s, i) => (
        <div key={i} className="flex flex-col items-center" style={{ transform: `scale(${s})` }}>
          <div className="relative size-12 transition-transform duration-700 group-hover:scale-125">
            {[0, 1, 2, 3, 4].map((k) => (
              <span key={k} className="absolute inset-0 rounded-[50%_50%_45%_45%] border border-[#7a0f24] bg-[#b3203f]" style={{ transform: `rotate(${k * 72}deg) scale(${1 - k * 0.15})` }} />
            ))}
          </div>
          <span className="h-14 w-1 bg-[#3d6b3a]" />
        </div>
      ))}
      <p className="absolute top-5 text-lg text-[#f3e3d3] italic" style={{ fontFamily: "'Bodoni Moda', serif" }}>
        you, in bloom
      </p>
    </div>
  );
}

export const roseGardenTemplate: BirthdayTemplate = {
  id: 'rose-garden',
  name: 'Rose Garden',
  tagline: 'Every memory, a rose',
  description: 'A candlelit garden of roses. Each bud opens into a memory you share, petals drift on the wind, and at the end the whole garden blooms.',
  categories: ['love'],
  loveTags: ['romantic', 'elegant', 'emotional'],
  moods: ['Lush', 'Romantic', 'Dramatic'],
  bestFor: 'Classic, deeply romantic love',
  palette: { primary: '#b3203f', secondary: '#1c050b', accent: '#f3e3d3' },
  tone: 'dark',
  fonts: { google: ['Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..600', 'Lora:ital,wght@0,400;1,400'], display: "'Bodoni Moda', Georgia, serif", body: "'Lora', Georgia, serif" },
  animations: { language: 'Bloom & drift', ambientDensity: 3 },
  interactions: { highlights: ['A single rose blooms', 'Buds open into memories', 'Wind-blown petals', 'The whole garden blooms'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
