import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const coffeeMemoriesTemplate: BirthdayTemplate = {
  id: 'coffee-memories',
  name: 'Coffee & Memories',
  tagline: 'Your favourite table is waiting',
  description: 'A cozy café made for them: order from the chalkboard menu, sip a memory latte, blow out a cupcake candle and read the receipt.',
  categories: ['cozy'],
  moods: ['Cozy', 'Warm', 'Intimate'],
  bestFor: 'Cozy, intimate friendship birthdays',
  palette: { primary: '#8b5e3c', secondary: '#1f2a24', accent: '#e9b872' },
  tone: 'light',
  fonts: {
    google: ['Yeseva+One', 'Lora:ital,wght@0,400;0,600;1,400', 'Caveat:wght@500;700'],
    display: "'Yeseva One', Georgia, serif",
    body: "'Lora', Georgia, serif",
    accent: "'Caveat', cursive",
  },
  animations: { language: 'Steam & serve', ambientDensity: 0 },
  interactions: { highlights: ['Chalkboard menu', 'Orders served to your table', 'Cupcake candle', 'A priceless receipt'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
