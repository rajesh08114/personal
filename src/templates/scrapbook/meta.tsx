import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

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
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
