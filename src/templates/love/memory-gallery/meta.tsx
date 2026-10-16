import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

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
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
