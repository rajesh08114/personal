import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const candlelightDinnerTemplate: BirthdayTemplate = {
  id: 'candlelight-dinner',
  name: 'Candlelight Dinner',
  tagline: 'Your seat is waiting',
  description: 'A private dinner for two. Candles light one by one, and every object on the table opens a memory, a message or the final gift.',
  categories: ['love'],
  loveTags: ['romantic', 'elegant', 'premium', 'cozy'],
  moods: ['Intimate', 'Elegant', 'Warm'],
  bestFor: 'A romantic evening, even when apart',
  palette: { primary: '#ffb35c', secondary: '#4a0e18', accent: '#f3e6d2' },
  tone: 'dark',
  fonts: { google: ['Playfair+Display+SC:wght@400;700', 'Cormorant:ital,wght@0,400;0,500;1,400'], display: "'Playfair Display SC', Georgia, serif", body: "'Cormorant', Georgia, serif" },
  animations: { language: 'Candle glow', ambientDensity: 2 },
  interactions: { highlights: ['Candles light one by one', 'Objects on the table', 'A menu of love', 'Gift-box finale'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
