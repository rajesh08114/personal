import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const fourSeasonsTemplate: BirthdayTemplate = {
  id: 'four-seasons',
  name: 'A Year Around You',
  tagline: 'One window, one tree, every season with you',
  description:
    'Draw the curtains on a tree outside the window and watch a whole year turn: blossoms open on your photos, fireflies light the summer, leaves fall on autumn memories and frost hides a winter surprise, until the year comes home to their birthday season.',
  categories: ['creative', 'memories'],
  moods: ['Nostalgic', 'Warm', 'Cinematic'],
  bestFor: 'Long friendships and people who notice the little things',
  palette: { primary: '#b5523b', secondary: '#4f7a46', accent: '#e3a64a' },
  tone: 'light',
  fonts: {
    google: ['IM+Fell+English:ital@0;1', 'EB+Garamond:ital,wght@0,400;0,500;0,600;1,400'],
    display: "'IM Fell English', Georgia, serif",
    body: "'EB Garamond', Georgia, serif",
  },
  animations: { language: 'A year turning', ambientDensity: 5 },
  interactions: {
    highlights: [
      'Draw the curtains',
      'Blossoms open on photos',
      'Catch summer fireflies',
      'Brush away autumn leaves',
      'Wipe the frost off the glass',
    ],
  },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
