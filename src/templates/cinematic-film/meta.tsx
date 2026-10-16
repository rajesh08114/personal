import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const cinematicFilmTemplate: BirthdayTemplate = {
  id: 'cinematic-film',
  name: 'Cinematic Film',
  tagline: 'Their life, as a feature film',
  description: 'Letterboxed, film-grained and dramatic: chapters, subtitles, a film-strip gallery, and end credits starring the birthday person.',
  categories: ['elegant'],
  moods: ['Dramatic', 'Stylish', 'Premium'],
  bestFor: 'Dramatic, stylish, premium birthdays',
  palette: { primary: '#e8b04b', secondary: '#7a1f1f', accent: '#f1d9a7' },
  tone: 'dark',
  fonts: {
    google: ['Bebas+Neue', 'Inter+Tight:ital,wght@0,300;0,400;0,600;1,300'],
    display: "'Bebas Neue', Impact, sans-serif",
    body: "'Inter Tight', system-ui, sans-serif",
  },
  animations: { language: 'Cut & dissolve', ambientDensity: 0 },
  interactions: { highlights: ['Projector countdown', 'Scroll subtitles', 'Film-strip gallery', 'End credits'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
