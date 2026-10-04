import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  const pos = [
    [14, 30, -8, '#f2b5a7'],
    [38, 22, 5, '#b9d3ee'],
    [62, 32, -4, '#cfe8c9'],
    [26, 58, 6, '#f7d9a8'],
    [52, 60, -7, '#e1c7f0'],
  ] as const;
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#e9dccb]">
      <svg viewBox="0 0 200 30" className="absolute inset-x-0 top-0 w-full" aria-hidden>
        <path d="M0 4 Q100 26 200 4" stroke="#6b5a4a" fill="none" strokeWidth=".6" />
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx={10 + i * 22} cy={4 + Math.sin((i / 8) * Math.PI) * 12 + 3} r="2.5" fill="#ffd27a" className="animate-twinkle" style={{ animationDelay: `${i * 0.25}s` }} />
        ))}
      </svg>
      {pos.map(([x, y, r, c], i) => (
        <div key={i} className="absolute w-[22%] bg-white p-1 pb-3 shadow transition-transform duration-500 group-hover:scale-105" style={{ left: `${x}%`, top: `${y}%`, transform: `rotate(${r}deg)` }}>
          <div className="aspect-square" style={{ background: c }} />
        </div>
      ))}
      <p className="absolute right-4 bottom-3 text-xl text-[#7a3b2e]" style={{ fontFamily: "'Reenie Beanie', cursive" }}>
        look at us ♡
      </p>
    </div>
  );
}

export const polaroidWallTemplate: BirthdayTemplate = {
  id: 'polaroid-wall',
  name: 'Our Polaroid Wall',
  tagline: 'Look at us…',
  description: 'A cozy wall of your photos under warm string lights. Drag, rotate and flip them to find hidden messages, then step back to see the heart they make.',
  categories: ['love'],
  loveTags: ['cozy', 'cute', 'emotional'],
  moods: ['Cozy', 'Playful', 'Nostalgic'],
  bestFor: 'Couples with a camera roll full of us',
  palette: { primary: '#c2493d', secondary: '#5b4434', accent: '#ffd27a' },
  tone: 'light',
  fonts: { google: ['Reenie+Beanie', 'Karla:wght@400;500;700'], display: "'Reenie Beanie', cursive", body: "'Karla', system-ui, sans-serif" },
  animations: { language: 'Flash & flip', ambientDensity: 0 },
  interactions: { highlights: ['Drag & rotate photos', 'Flip for hidden messages', 'Pinned love notes', 'Photos form a heart'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
