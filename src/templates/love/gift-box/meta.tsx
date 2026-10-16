import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const giftBoxTemplate: BirthdayTemplate = {
  id: 'gift-box',
  name: 'The Gift Box',
  tagline: 'I got you something…',
  description: 'The whole website is a series of gifts. Open a 3D gift box to find five more inside, each with its own unwrapping, building up to the biggest one.',
  categories: ['love'],
  loveTags: ['cute', 'romantic', 'creative'],
  moods: ['Sweet', 'Playful', 'Generous'],
  bestFor: 'Sweet, playful love and gift-lovers',
  palette: { primary: '#c9566f', secondary: '#9a3a52', accent: '#f3d38a' },
  tone: 'light',
  fonts: { google: ['Sacramento', 'Quicksand:wght@400;500;600;700'], display: "'Sacramento', cursive", body: "'Quicksand', system-ui, sans-serif" },
  animations: { language: 'Unwrap & reveal', ambientDensity: 0 },
  interactions: { highlights: ['3D gift box', 'Five different unwrappings', 'A drawer, a hinge, a tear', 'Biggest gift last'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
