import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const secretGardenTemplate: BirthdayTemplate = {
  id: 'secret-garden',
  name: 'The Secret Garden',
  tagline: 'Hidden love notes, waiting to be found',
  description: 'A foggy, candlelit garden with four gates. Discover memories, old photographs and a love letter, and catch fireflies to unlock the secret gate.',
  categories: ['love'],
  loveTags: ['magical', 'romantic', 'creative'],
  moods: ['Mysterious', 'Enchanting', 'Romantic'],
  bestFor: 'Curious hearts who love a little mystery',
  palette: { primary: '#c9a35b', secondary: '#0f2a1b', accent: '#8e1f35' },
  tone: 'dark',
  fonts: { google: ['Cormorant+SC:wght@400;600', 'Spectral:ital,wght@0,300;0,400;1,300'], display: "'Cormorant SC', Georgia, serif", body: "'Spectral', Georgia, serif" },
  animations: { language: 'Fog & candlelight', ambientDensity: 4 },
  interactions: { highlights: ['Four gates to explore', 'Flowers hide memories', 'Catch fireflies for keys', 'A glowing clearing'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
