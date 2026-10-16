import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const festivalTemplate: BirthdayTemplate = {
  id: 'festival',
  name: 'Festival of Memories',
  tagline: 'A whole festival, just for them',
  description: 'Tear the ticket and enter: a main stage, photo booth, message wall and wish zone with floating lanterns — then the headline act.',
  categories: ['fun'],
  moods: ['Festive', 'Social', 'Joyful'],
  bestFor: 'Large friend groups and social personalities',
  palette: { primary: '#ff5d8f', secondary: '#5b2a86', accent: '#ffd23f' },
  tone: 'dark',
  fonts: { google: ['Shrikhand', 'Rubik:wght@400;500;700'], display: "'Shrikhand', cursive", body: "'Rubik', system-ui, sans-serif" },
  animations: { language: 'Lights & crowd', ambientDensity: 4 },
  interactions: { highlights: ['Tear the ticket', 'Festival zones', 'Release wish lanterns', 'Headline finale'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
