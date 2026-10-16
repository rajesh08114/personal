import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const starryNightTemplate: BirthdayTemplate = {
  id: 'starry-night',
  name: 'Starry Night',
  tagline: 'Their name, written in the stars',
  description: 'A magical night sky: constellations spell their name, shooting stars carry wishes, and the sky bursts into fireworks.',
  categories: ['romantic', 'elegant'],
  moods: ['Magical', 'Romantic', 'Dreamy'],
  bestFor: 'Romantic, emotional and elegant birthdays',
  palette: { primary: '#8fa8ff', secondary: '#3b2f8f', accent: '#ffe7a3' },
  tone: 'dark',
  fonts: {
    google: ['Cormorant+Garamond:ital,wght@0,300;0,500;0,600;1,300;1,500', 'Jost:wght@300;400;500'],
    display: "'Cormorant Garamond', Georgia, serif",
    body: "'Jost', system-ui, sans-serif",
  },
  animations: { language: 'Twinkle & glide', ambientDensity: 10 },
  interactions: { highlights: ['Constellation name', 'Star trail cursor', 'Moon phases', 'Wish on a shooting star'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
