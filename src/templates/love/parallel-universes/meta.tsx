import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const parallelUniversesTemplate: BirthdayTemplate = {
  id: 'parallel-universes',
  name: 'Parallel Universes',
  tagline: 'In every universe, I’d still choose you',
  description: 'Four vintage science-fiction paperbacks on a shelf: the same two characters in four different editions. Each cover swings open on a chapter of your story, and every edition has the same last page.',
  categories: ['love'],
  loveTags: ['creative', 'magical', 'cinematic'],
  moods: ['Witty', 'Bookish', 'Profound'],
  bestFor: 'Bookish couples and sci-fi romantics',
  palette: { primary: '#2b2520', secondary: '#e8dfcc', accent: '#d9762b' },
  tone: 'light',
  fonts: { google: ['Crimson+Pro:ital,wght@0,400;0,600;1,400', 'Jost:wght@300;400;500;600', 'Anton'], display: "'Crimson Pro', Georgia, serif", body: "'Crimson Pro', Georgia, serif", accent: "'Jost', system-ui, sans-serif" },
  animations: { language: 'Book physics — pull, swing open, stack', ambientDensity: 0 },
  interactions: { highlights: ['Four period paperback covers', 'Covers swing open on the spine', 'Photos printed as two-ink cover art', 'The same last page in every edition'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
