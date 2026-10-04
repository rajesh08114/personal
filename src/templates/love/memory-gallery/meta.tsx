import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-black p-4">
      <div className="mx-auto h-[62%] w-[70%] bg-gradient-to-br from-[#6b5a4a] to-[#1a1512] transition-transform duration-1000 group-hover:scale-[1.06]" />
      <div className="flex items-end justify-between text-white" style={{ fontFamily: "'Gloock', serif" }}>
        <span className="text-sm">No. 01</span>
        <span className="text-[0.55rem] tracking-[0.3em] text-white/60">DATE · PLACE · MEMORY</span>
      </div>
    </div>
  );
}

export const memoryGalleryTemplate: BirthdayTemplate = {
  id: 'memory-gallery',
  name: 'The Memory Gallery',
  tagline: 'A private exhibition of us',
  description: 'A luxury photography exhibition about your relationship. One photo at a time, with museum placards, shutter transitions and a final collage.',
  categories: ['love'],
  loveTags: ['elegant', 'cinematic', 'premium'],
  moods: ['Gallery', 'Refined', 'Quiet'],
  bestFor: 'Couples with photos worth framing',
  palette: { primary: '#e8e2d6', secondary: '#000000', accent: '#c9a96e' },
  tone: 'dark',
  fonts: { google: ['Gloock', 'Figtree:wght@300;400;500'], display: "'Gloock', Georgia, serif", body: "'Figtree', system-ui, sans-serif" },
  animations: { language: 'Shutter & distort', ambientDensity: 0 },
  interactions: { highlights: ['One photo at a time', 'Museum placards', 'Distortion transitions', 'Cinematic collage'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
