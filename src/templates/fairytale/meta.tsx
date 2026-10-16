import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const fairytaleTemplate: BirthdayTemplate = {
  id: 'fairytale',
  name: 'Fairytale',
  tagline: 'Once upon a time, they were born',
  description: 'A living storybook: parallax kingdoms, a royal decree, a gallery of painted treasures, a map of your tale and a birthday spell to cast.',
  categories: ['creative', 'romantic'],
  moods: ['Whimsical', 'Magical', 'Warm'],
  bestFor: 'Whimsical, magical, emotional birthdays',
  palette: { primary: '#d4a64a', secondary: '#4c3a7a', accent: '#fff3c4' },
  tone: 'dark',
  fonts: {
    google: ['Cinzel+Decorative:wght@400;700', 'IM+Fell+English:ital@0;1'],
    display: "'Cinzel Decorative', Georgia, serif",
    body: "'IM Fell English', Georgia, serif",
  },
  animations: { language: 'Enchant & drift', ambientDensity: 5 },
  interactions: { highlights: ['Parallax storybook', 'Unrolling decree', 'Hidden stars to find', 'Cast a birthday spell'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
