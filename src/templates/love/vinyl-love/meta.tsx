import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const vinylLoveTemplate: BirthdayTemplate = {
  id: 'vinyl-love',
  name: 'Vinyl Love',
  tagline: 'Our soundtrack, side A',
  description: 'A warm vintage record player. Drop the needle and your story plays in five tracks, with photos and messages following along.',
  categories: ['love'],
  loveTags: ['cozy', 'creative', 'romantic'],
  moods: ['Vintage', 'Warm', 'Musical'],
  bestFor: 'Couples with a song that’s “ours”',
  palette: { primary: '#c4552f', secondary: '#1f130b', accent: '#f0d9b5' },
  tone: 'dark',
  fonts: { google: ['Righteous', 'Crimson+Pro:ital,wght@0,400;0,500;1,400'], display: "'Righteous', system-ui, sans-serif", body: "'Crimson Pro', Georgia, serif" },
  animations: { language: 'Spin & groove', ambientDensity: 0 },
  interactions: { highlights: ['Spinning turntable', 'Five-track story', 'Synced photos & words', 'Needle-lift finale'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
