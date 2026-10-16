import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const cosmicJourneyTemplate: BirthdayTemplate = {
  id: 'cosmic-journey',
  name: 'Cosmic Journey',
  tagline: 'Travel planet to planet through your memories',
  description: 'Launch into space: they are the sun at the centre, every memory is an orbiting planet you can land on, and the planets align for the finale.',
  categories: ['creative'],
  moods: ['Adventurous', 'Epic', 'Futuristic'],
  bestFor: 'Tech, science and adventurous personalities',
  palette: { primary: '#7dd3fc', secondary: '#7c3aed', accent: '#fbbf24' },
  tone: 'dark',
  fonts: { google: ['Orbitron:wght@500;700;900', 'Exo+2:wght@300;400;600'], display: "'Orbitron', system-ui, sans-serif", body: "'Exo 2', system-ui, sans-serif" },
  animations: { language: 'Orbit & warp', ambientDensity: 10 },
  interactions: { highlights: ['Launch countdown', 'Orbiting memory planets', 'Warp travel', 'Planet alignment'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
