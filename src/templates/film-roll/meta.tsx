import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

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
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
