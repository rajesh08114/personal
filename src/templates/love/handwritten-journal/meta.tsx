import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const handwrittenJournalTemplate: BirthdayTemplate = {
  id: 'handwritten-journal',
  name: 'Handwritten Journal',
  tagline: 'Our private journal, page by page',
  description: 'A lined notebook whose pages turn as you scroll. Photos taped in, pen doodles, folded corners with secrets, and a last page still being written.',
  categories: ['love'],
  loveTags: ['cozy', 'emotional', 'cute'],
  moods: ['Personal', 'Tender', 'Handmade'],
  bestFor: 'Couples who write each other notes',
  palette: { primary: '#2f5d8a', secondary: '#3b4a5a', accent: '#d9534f' },
  tone: 'dark',
  fonts: { google: ['Homemade+Apple', 'Kalam:wght@300;400;700'], display: "'Homemade Apple', cursive", body: "'Kalam', cursive" },
  animations: { language: 'Scroll page-turn', ambientDensity: 0 },
  interactions: { highlights: ['Pages turn as you scroll', 'Taped-in photos', 'Folded-corner secrets', 'A page still being written'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
