import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="paper-grain relative flex h-full w-full items-center justify-center overflow-hidden bg-[#c9a57a]">
      <div className="relative h-[78%] w-[52%] origin-left rounded-r-lg bg-[#f7efe2] shadow-[6px_6px_0_#e6d8c3,12px_12px_20px_rgb(0_0_0/0.25)] transition-transform duration-700 [transform:perspective(600px)_rotateY(0deg)] group-hover:[transform:perspective(600px)_rotateY(-18deg)]">
        <div className="absolute inset-y-0 left-0 w-3 rounded-l bg-[#b5523b]" />
        <div className="absolute top-[14%] left-[22%] h-[38%] w-[56%] -rotate-3 bg-white p-1 shadow">
          <div className="h-full w-full bg-[#f4b6a6]" />
        </div>
        <span className="tape top-[10%] left-[34%] scale-50" />
        <p className="absolute inset-x-0 bottom-[16%] text-center text-lg text-[#b5523b]" style={{ fontFamily: "'Permanent Marker', cursive" }}>
          our book
        </p>
        <span className="absolute right-3 bottom-3 inline-flex size-7 rotate-12 items-center justify-center rounded-full bg-[#ffd166] text-xs">★</span>
      </div>
    </div>
  );
}

export const scrapbookTemplate: BirthdayTemplate = {
  id: 'scrapbook',
  name: 'Birthday Scrapbook',
  tagline: 'Flip through a handmade book',
  description: 'A tactile scrapbook you page through: taped photos, doodles, stickers you can move, hidden notes and an envelope to open.',
  categories: ['memories', 'cozy'],
  moods: ['Handmade', 'Personal', 'Heartfelt'],
  bestFor: 'Personal, emotional and friendship birthdays',
  palette: { primary: '#b5523b', secondary: '#3d5a80', accent: '#ffd166' },
  tone: 'light',
  fonts: {
    google: ['Permanent+Marker', 'Patrick+Hand'],
    display: "'Permanent Marker', cursive",
    body: "'Patrick Hand', 'Comic Sans MS', cursive",
  },
  animations: { language: 'Page turn', ambientDensity: 0 },
  interactions: { highlights: ['Turn the pages', 'Movable stickers', 'Hidden sticky notes', 'Open the envelope'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
