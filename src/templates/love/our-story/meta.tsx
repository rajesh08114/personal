import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const ourStoryTemplate: BirthdayTemplate = {
  id: 'our-story',
  name: 'Our Story',
  tagline: 'Every love story has a beginning',
  description: 'Your relationship as a film in six chapters. Photos open from a small frame to full screen as you scroll.',
  categories: ['love'],
  loveTags: ['cinematic', 'elegant', 'emotional', 'premium'],
  moods: ['Cinematic', 'Elegant', 'Timeless'],
  bestFor: 'Couples with a story worth telling',
  palette: { primary: '#c8a96a', secondary: '#0b0a08', accent: '#efe6d6' },
  tone: 'dark',
  fonts: { google: ['Italiana', 'Libre+Caslon+Text:ital,wght@0,400;1,400'], display: "'Italiana', Georgia, serif", body: "'Libre Caslon Text', Georgia, serif" },
  animations: { language: 'Mask & zoom', ambientDensity: 0 },
  interactions: { highlights: ['Pinned chapters', 'Expanding photo masks', 'Slow parallax', 'Cinematic finale'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
