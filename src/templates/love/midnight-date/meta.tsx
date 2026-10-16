import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const midnightDateTemplate: BirthdayTemplate = {
  id: 'midnight-date',
  name: 'Midnight Date',
  tagline: 'Meet me at midnight…',
  description: 'A moonlit city to explore. Every glowing place holds a memory or a love note, and at the end the city lights spell out what you mean.',
  categories: ['love'],
  loveTags: ['romantic', 'magical', 'creative'],
  moods: ['Moonlit', 'Romantic', 'Adventurous'],
  bestFor: 'Couples who love late nights and city lights',
  palette: { primary: '#ffd27a', secondary: '#0d1840', accent: '#9ec5ff' },
  tone: 'dark',
  fonts: { google: ['Marcellus', 'Mulish:wght@300;400;600'], display: "'Marcellus', Georgia, serif", body: "'Mulish', system-ui, sans-serif" },
  animations: { language: 'Moonlight & glow', ambientDensity: 6 },
  interactions: { highlights: ['Explore the city', 'Glowing places hold memories', 'Moon moves as you scroll', 'Windows spell I LOVE YOU'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
