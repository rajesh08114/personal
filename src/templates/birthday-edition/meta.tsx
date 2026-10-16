import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const birthdayEditionTemplate: BirthdayTemplate = {
  id: 'birthday-edition',
  name: 'The Birthday Edition',
  tagline: 'A front page printed for one person',
  description:
    'A broadsheet newspaper dated on their birthday: the headline is their name, your letter runs as the lead story, memories fill the archive pages, and a late-extra slip carries the surprise.',
  categories: ['memories', 'elegant'],
  moods: ['Witty', 'Warm', 'Classic'],
  bestFor: 'Anyone — friends, family, partners, colleagues',
  palette: { primary: '#1d1b18', secondary: '#efe9dc', accent: '#b3261e' },
  tone: 'light',
  fonts: {
    google: ['UnifrakturMaguntia', 'Old+Standard+TT:ital,wght@0,400;0,700;1,400', 'Libre+Caslon+Text:ital,wght@0,400;0,700;1,400'],
    display: "'Old Standard TT', Georgia, serif",
    body: "'Libre Caslon Text', Georgia, serif",
  },
  animations: { language: 'Paper physics — unfold, tear, paste', ambientDensity: 0 },
  interactions: { highlights: ['Unfold the morning paper', 'Letter set in newspaper columns', 'Tear-off wish tabs', '“Stop the presses” late extra'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
