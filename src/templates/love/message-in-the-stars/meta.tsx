import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const messageInTheStarsTemplate: BirthdayTemplate = {
  id: 'message-in-the-stars',
  name: 'Message in the Stars',
  tagline: 'Every sentence becomes a star',
  description: 'Under a moving aurora, each line of your message is sent up to become a star. The stars draw a heart, and the whole sky spells their name.',
  categories: ['love'],
  loveTags: ['magical', 'romantic', 'emotional'],
  moods: ['Celestial', 'Poetic', 'Tender'],
  bestFor: 'Couples who say it best in words',
  palette: { primary: '#e0f2fe', secondary: '#020611', accent: '#34d399' },
  tone: 'dark',
  fonts: { google: ['Lustria', 'Nunito+Sans:wght@300;400;600'], display: "'Lustria', Georgia, serif", body: "'Nunito Sans', system-ui, sans-serif" },
  animations: { language: 'Aurora & starlight', ambientDensity: 8 },
  interactions: { highlights: ['Send each line to the sky', 'A constellation of words', 'Write a line back', 'Stars spell their name'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
