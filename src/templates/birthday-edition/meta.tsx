import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#c9b9a0]">
      <div className="w-[78%] -rotate-2 bg-[#efe9dc] px-3 pt-2 pb-3 text-[#1d1b18] shadow-md transition-transform duration-500 group-hover:rotate-0">
        <p className="text-center text-xl leading-none" style={{ fontFamily: "'UnifrakturMaguntia', serif" }}>
          The Birthday Edition
        </p>
        <div className="mt-1 border-y border-double border-[#1d1b18] py-px text-center text-[0.4rem] tracking-[0.2em] uppercase">Vol. 30 · One copy printed</div>
        <p className="mt-1.5 text-[0.8rem] leading-tight font-bold uppercase" style={{ fontFamily: "'Old Standard TT', serif" }}>
          Local legend turns thirty
        </p>
        <div className="mt-1.5 grid grid-cols-[1.3fr_1fr] gap-1.5">
          <div className="aspect-[3/2] bg-[#9b9284]" />
          <div className="space-y-1">
            {[100, 90, 95, 70].map((w, i) => (
              <div key={i} className="h-0.5 bg-[#1d1b18]/25" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const birthdayEditionTemplate: BirthdayTemplate = {
  id: 'birthday-edition',
  name: 'The Birthday Edition',
  tagline: 'A front page printed for one person',
  description:
    'A broadsheet newspaper dated on their birthday: the headline is their name, your letter runs as the lead story, memories fill the archive pages, and a late-extra slip carries the surprise.',
  categories: ['memories', 'elegant'],
  moods: ['Witty', 'Warm', 'Classic'],
  bestFor: 'Anyone — friends, family, partners, colleagues',
  palette: { primary: '#1d1b18', secondary: '#efe9dc', accent: '#b3261e' },
  tone: 'light',
  fonts: {
    google: ['UnifrakturMaguntia', 'Old+Standard+TT:ital,wght@0,400;0,700;1,400', 'Libre+Caslon+Text:ital,wght@0,400;0,700;1,400'],
    display: "'Old Standard TT', Georgia, serif",
    body: "'Libre Caslon Text', Georgia, serif",
  },
  animations: { language: 'Paper physics — unfold, tear, paste', ambientDensity: 0 },
  interactions: { highlights: ['Unfold the morning paper', 'Letter set in newspaper columns', 'Tear-off wish tabs', '“Stop the presses” late extra'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
