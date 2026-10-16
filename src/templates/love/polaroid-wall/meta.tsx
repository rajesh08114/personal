import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

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
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
