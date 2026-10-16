import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const neonPartyTemplate: BirthdayTemplate = {
  id: 'neon-party',
  name: 'Neon Party',
  tagline: 'The birthday after-hours',
  description: 'A late-night bar wall: neon signs bent into their name, a light board you control, a music visualizer and one big arcade button to drop the beat.',
  categories: ['fun'],
  moods: ['Electric', 'Modern', 'Bold'],
  bestFor: 'Modern, energetic, nightlife-loving personalities',
  palette: { primary: '#ff3ea5', secondary: '#ff9f43', accent: '#3ef4ff' },
  tone: 'dark',
  fonts: { google: ['Monoton', 'Outfit:wght@300;400;600;800'], display: "'Monoton', cursive", body: "'Outfit', system-ui, sans-serif" },
  animations: { language: 'Pulse & glow', ambientDensity: 4 },
  interactions: { highlights: ['Neon sign flicker', 'Audio visualizer', 'Light board', 'Drop the beat'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
