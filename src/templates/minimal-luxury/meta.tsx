import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const minimalLuxuryTemplate: BirthdayTemplate = {
  id: 'minimal-luxury',
  name: 'Minimal Luxury',
  tagline: 'An invitation-grade tribute',
  description: 'Black, cream and a whisper of gold. Huge typography, masked photography, an editorial index and a single candle.',
  categories: ['elegant'],
  moods: ['Sophisticated', 'Quiet', 'Timeless'],
  bestFor: 'Elegant, mature and premium birthdays',
  palette: { primary: '#b8975a', secondary: '#0e0d0b', accent: '#e8dcc4' },
  tone: 'light',
  fonts: {
    google: ['Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..600', 'Montserrat:wght@300;400;500'],
    display: "'Bodoni Moda', Didot, Georgia, serif",
    body: "'Montserrat', system-ui, sans-serif",
  },
  animations: { language: 'Slow mask', ambientDensity: 0 },
  interactions: { highlights: ['Masked photography', 'Cursor image index', 'Editorial grid', 'Single candle'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
