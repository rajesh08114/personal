import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const foreverTimelineTemplate: BirthdayTemplate = {
  id: 'forever-timeline',
  name: 'Forever Timeline',
  tagline: 'From the day we met, to forever',
  description: 'A minimal, luxurious timeline that follows your scroll. Milestones expand as they reach centre stage, and the line keeps going past the edge.',
  categories: ['love'],
  loveTags: ['elegant', 'emotional', 'premium'],
  moods: ['Minimal', 'Luxurious', 'Sincere'],
  bestFor: 'Long-term love and anniversaries-on-birthdays',
  palette: { primary: '#7d1d2f', secondary: '#1a1414', accent: '#c8a46e' },
  tone: 'light',
  fonts: { google: ['DM+Serif+Display:ital@0;1', 'Work+Sans:wght@300;400;500'], display: "'DM Serif Display', Georgia, serif", body: "'Work Sans', system-ui, sans-serif" },
  animations: { language: 'Expand on focus', ambientDensity: 0 },
  interactions: { highlights: ['Scroll-following line', 'Milestones expand at centre', 'Past → today → forever', 'Endless finale'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
