import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const balloonFestivalTemplate: BirthdayTemplate = {
  id: 'balloon-festival',
  name: 'Balloon Festival',
  tagline: 'Every balloon hides a surprise',
  description: 'A bright sky that slowly fills with balloons. Pop them to uncover memories and messages, then pop the giant golden one.',
  categories: ['fun'],
  moods: ['Playful', 'Bright', 'Energetic'],
  bestFor: 'Fun friends, kids and energetic personalities',
  palette: { primary: '#ff5d8f', secondary: '#4cc9f0', accent: '#ffc93c' },
  tone: 'light',
  fonts: { google: ['Fredoka:wght@400;500;600;700'], display: "'Fredoka', system-ui, sans-serif", body: "'Fredoka', system-ui, sans-serif" },
  animations: { language: 'Bounce & pop', ambientDensity: 0 },
  interactions: { highlights: ['Pop to reveal', 'Hidden messages', 'Hot-air balloon story', 'Golden balloon finale'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
