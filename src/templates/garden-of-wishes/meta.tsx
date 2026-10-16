import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const gardenOfWishesTemplate: BirthdayTemplate = {
  id: 'garden-of-wishes',
  name: 'Garden of Wishes',
  tagline: 'Every memory blooms into a flower',
  description: 'A sunlit garden with fireflies and butterflies. Plant seeds that grow into flowers holding your memories, then let it all bloom.',
  categories: ['romantic', 'creative'],
  moods: ['Soft', 'Peaceful', 'Hopeful'],
  bestFor: 'Soft, emotional and peaceful personalities',
  palette: { primary: '#f4978e', secondary: '#6a994e', accent: '#ffd166' },
  tone: 'light',
  fonts: {
    google: ['Playfair+Display:ital,wght@0,400;0,600;1,400;1,500', 'Nunito:wght@400;600;700'],
    display: "'Playfair Display', Georgia, serif",
    body: "'Nunito', system-ui, sans-serif",
  },
  animations: { language: 'Grow & bloom', ambientDensity: 6 },
  interactions: { highlights: ['Plant seeds', 'Flowers hold memories', 'Fireflies follow you', 'Everything blooms'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
