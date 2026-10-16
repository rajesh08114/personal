import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const ourLittleUniverseTemplate: BirthdayTemplate = {
  id: 'our-little-universe',
  name: 'Our Little Universe',
  tagline: 'A brass orrery with your two names at its centre',
  description: 'A hand-made brass orrery under a desk lamp. Turn it by hand: six painted planets ride brass arms around a sun engraved with your two names, each holding memories, photos, messages or plans.',
  categories: ['love'],
  loveTags: ['magical', 'creative', 'cute', 'premium'],
  moods: ['Crafted', 'Whimsical', 'Warm'],
  bestFor: 'Couples who feel like their own little world',
  palette: { primary: '#c9a467', secondary: '#1d1914', accent: '#8e3b2e' },
  tone: 'dark',
  fonts: { google: ['IM+Fell+English+SC', 'IM+Fell+English:ital@0;1'], display: "'IM Fell English SC', Georgia, serif", body: "'IM Fell English', Georgia, serif" },
  animations: { language: 'Clockwork orbit in 3D', ambientDensity: 0 },
  interactions: { highlights: ['Turn the orrery by hand', 'Planets on brass arms, in depth', 'Six worlds to read', 'An engraved plaque finale'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
