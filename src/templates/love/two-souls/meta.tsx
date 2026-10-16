import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const twoSoulsTemplate: BirthdayTemplate = {
  id: 'two-souls',
  name: 'Two Souls',
  tagline: 'Two lanterns on dark water, drifting until they meet',
  description: 'Two candle lanterns floating on a night river, like a lantern festival, drift towards each other. Memories gather as points of light, and the light finally settles into a heart and their name.',
  categories: ['love'],
  loveTags: ['magical', 'emotional', 'creative', 'premium'],
  moods: ['Quiet', 'Minimal', 'Tender'],
  bestFor: 'Soulmates and deep, quiet love',
  palette: { primary: '#e8a25b', secondary: '#1a2030', accent: '#f1e7d6' },
  tone: 'dark',
  fonts: { google: ['Cormorant+Garamond:ital,wght@0,400;0,600;1,400', 'Karla:wght@300;400;500'], display: "'Cormorant Garamond', Georgia, serif", body: "'Karla', system-ui, sans-serif" },
  animations: { language: 'Slow drift on water', ambientDensity: 1 },
  interactions: { highlights: ['Two lanterns meet', 'A faint light follows your finger', 'Memories as points of light', 'Light settles into a heart'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
