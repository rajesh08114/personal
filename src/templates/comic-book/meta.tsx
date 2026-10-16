import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const comicBookTemplate: BirthdayTemplate = {
  id: 'comic-book',
  name: 'Comic Book',
  tagline: 'They’re the hero of this issue',
  description: 'A collectible comic issue: halftone panels, speech bubbles, POW! effects and a splash page announcing a new chapter.',
  categories: ['fun', 'creative'],
  moods: ['Bold', 'Funny', 'Heroic'],
  bestFor: 'Fun, energetic and creative personalities',
  palette: { primary: '#ff4d6d', secondary: '#4cc9f0', accent: '#ffe14d' },
  tone: 'light',
  fonts: { google: ['Bangers', 'Comic+Neue:wght@400;700'], display: "'Bangers', Impact, cursive", body: "'Comic Neue', 'Comic Sans MS', cursive" },
  animations: { language: 'Slam & burst', ambientDensity: 0 },
  interactions: { highlights: ['Collectible cover', 'Speech bubbles', 'POW! panel bursts', 'Splash-page finale'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
