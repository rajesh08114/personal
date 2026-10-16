import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const cinemaDateTemplate: BirthdayTemplate = {
  id: 'cinema-date',
  name: 'Cinema Date',
  tagline: 'Tonight’s feature: The Story of Us',
  description: 'A private screening just for them. Curtains open, the projector hums, and your story plays chapter by chapter before the credits roll.',
  categories: ['love'],
  loveTags: ['cinematic', 'romantic', 'creative'],
  moods: ['Cinematic', 'Nostalgic', 'Fun'],
  bestFor: 'Movie-night couples',
  palette: { primary: '#e2b250', secondary: '#7a0f1c', accent: '#e8e2d6' },
  tone: 'dark',
  fonts: { google: ['Limelight', 'Archivo+Narrow:wght@400;500;600'], display: "'Limelight', Georgia, serif", body: "'Archivo Narrow', system-ui, sans-serif" },
  animations: { language: 'Projector flicker', ambientDensity: 2 },
  interactions: { highlights: ['Velvet curtains open', 'Scene-selection menu', 'Projector film burns', 'Credits starring you both'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
