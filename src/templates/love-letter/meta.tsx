import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const loveLetterTemplate: BirthdayTemplate = {
  id: 'love-letter',
  name: 'The Love Letter',
  tagline: 'I wrote something for you…',
  description: 'An ivory envelope sealed in wax. The paper unfolds, the letter writes itself line by line, photos slide in — and it all folds back up at the end.',
  categories: ['love', 'romantic', 'cozy'],
  loveTags: ['romantic', 'emotional', 'elegant', 'cozy'],
  moods: ['Intimate', 'Romantic', 'Handwritten'],
  bestFor: 'Romantic, intimate, emotional',
  palette: { primary: '#8e2236', secondary: '#4a2c22', accent: '#d9667a' },
  tone: 'light',
  fonts: {
    google: ['Pinyon+Script', 'Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400'],
    display: "'Pinyon Script', cursive",
    body: "'Cormorant Garamond', Georgia, serif",
  },
  animations: { language: 'Unfold & ink', ambientDensity: 3 },
  interactions: { highlights: ['Envelope that opens', 'Line-by-line handwriting', 'Photos slide in', 'Folds back up'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
