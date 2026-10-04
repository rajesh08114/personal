import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center overflow-hidden bg-[#0f0d0c]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgb(255_59_47/0.25),transparent_55%)]" />
      <div className="flex gap-2 bg-[#1b1714] px-3 py-4 transition-transform duration-1000 group-hover:-translate-x-10">
        {['#ffb38a', '#8fd3ff', '#c3f0ca', '#fbc2eb', '#ffe29f'].map((c, i) => (
          <div key={i} className="relative h-20 w-16 shrink-0 bg-black p-1">
            <div className="h-full w-full transition-[filter] duration-700 [filter:invert(1)_hue-rotate(180deg)] group-hover:[filter:none]" style={{ background: c }} />
          </div>
        ))}
      </div>
      <span className="absolute top-2 right-3 text-[0.55rem] tracking-widest text-[#ff6b5e]" style={{ fontFamily: "'Space Mono', monospace" }}>
        ● REC 400
      </span>
    </div>
  );
}

export const filmRollTemplate: BirthdayTemplate = {
  id: 'film-roll',
  name: 'Film Roll',
  tagline: 'A roll of memories, developing',
  description: 'A darkroom journey: scroll sideways through a film strip as each negative develops into colour, with a shutter you can fire.',
  categories: ['memories'],
  moods: ['Analog', 'Artsy', 'Nostalgic'],
  bestFor: 'Photography lovers and memory-focused birthdays',
  palette: { primary: '#ff3b2f', secondary: '#1b1714', accent: '#f2c879' },
  tone: 'dark',
  fonts: { google: ['Space+Mono:ital,wght@0,400;0,700;1,400', 'Archivo+Black'], display: "'Archivo Black', Impact, sans-serif", body: "'Space Mono', ui-monospace, monospace" },
  animations: { language: 'Develop & shutter', ambientDensity: 0 },
  interactions: { highlights: ['Horizontal film strip', 'Negatives develop', 'Camera shutter', 'Flip the final print'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
