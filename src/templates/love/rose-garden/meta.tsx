import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const roseGardenTemplate: BirthdayTemplate = {
  id: 'rose-garden',
  name: 'Rose Garden',
  tagline: 'Every memory, a rose',
  description: 'A candlelit garden of roses. Each bud opens into a memory you share, petals drift on the wind, and at the end the whole garden blooms.',
  categories: ['love'],
  loveTags: ['romantic', 'elegant', 'emotional'],
  moods: ['Lush', 'Romantic', 'Dramatic'],
  bestFor: 'Classic, deeply romantic love',
  palette: { primary: '#b3203f', secondary: '#1c050b', accent: '#f3e3d3' },
  tone: 'dark',
  fonts: { google: ['Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..600', 'Lora:ital,wght@0,400;1,400'], display: "'Bodoni Moda', Georgia, serif", body: "'Lora', Georgia, serif" },
  animations: { language: 'Bloom & drift', ambientDensity: 3 },
  interactions: { highlights: ['A single rose blooms', 'Buds open into memories', 'Wind-blown petals', 'The whole garden blooms'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
