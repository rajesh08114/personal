import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="paper-grain relative h-full w-full overflow-hidden bg-[#efe4d2]">
      {[
        { r: -8, x: 14, y: 16, c: '#f4b6a6' },
        { r: 6, x: 40, y: 10, c: '#a9c9e8' },
        { r: -3, x: 62, y: 22, c: '#bfe0c4' },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute w-[30%] bg-white p-1.5 pb-5 shadow-md transition-transform duration-500 group-hover:-translate-y-1"
          style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `rotate(${p.r}deg)` }}
        >
          <div className="aspect-square" style={{ background: p.c }} />
        </div>
      ))}
      <span className="tape top-[12%] left-[44%] rotate-[-6deg] scale-50" />
      <p className="absolute inset-x-0 bottom-4 text-center text-2xl text-[#5b4636]" style={{ fontFamily: 'Caveat, cursive' }}>
        the memory box
      </p>
    </div>
  );
}

export const polaroidMemoriesTemplate: BirthdayTemplate = {
  id: 'polaroid-memories',
  name: 'Polaroid Memories',
  tagline: 'Open the memory box',
  description: 'A warm, nostalgic desk of polaroids you can drag, shuffle and enlarge — until they fly together to spell Happy Birthday.',
  categories: ['memories', 'cozy'],
  moods: ['Nostalgic', 'Warm', 'Playful'],
  bestFor: 'Best friends, childhood friends, close relationships',
  palette: { primary: '#d9705a', secondary: '#5b4636', accent: '#f2c14e' },
  tone: 'light',
  fonts: {
    google: ['Caveat:wght@400;600;700', 'DM+Sans:wght@400;500;700'],
    display: "'Caveat', cursive",
    body: "'DM Sans', system-ui, sans-serif",
  },
  animations: { language: 'Toss & settle', ambientDensity: 0 },
  interactions: { highlights: ['Drag the photos', 'Shuffle the desk', 'Clothesline story', 'Photos spell the wish'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
