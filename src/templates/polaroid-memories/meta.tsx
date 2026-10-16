import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

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
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
