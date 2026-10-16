import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const constellationOfUsTemplate: BirthdayTemplate = {
  id: 'constellation-of-us',
  name: 'Constellation of Us',
  tagline: 'Somehow, the universe brought us together',
  description: 'Your relationship as a constellation. Each star holds a memory, and at the end the stars rearrange to write both of your names.',
  categories: ['love'],
  loveTags: ['magical', 'elegant', 'emotional'],
  moods: ['Celestial', 'Elegant', 'Wondrous'],
  bestFor: 'Elegant, magical, emotional love',
  palette: { primary: '#a9c1ff', secondary: '#0a1230', accent: '#ffe6a8' },
  tone: 'dark',
  fonts: { google: ['Cinzel:wght@400;600', 'EB+Garamond:ital,wght@0,400;1,400'], display: "'Cinzel', Georgia, serif", body: "'EB Garamond', Georgia, serif" },
  animations: { language: 'Connect the stars', ambientDensity: 8 },
  interactions: { highlights: ['Stars appear and connect', 'Each star is a memory', 'Side-drawer stories', 'Stars spell your names'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
