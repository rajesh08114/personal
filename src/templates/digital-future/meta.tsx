import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const digitalFutureTemplate: BirthdayTemplate = {
  id: 'digital-future',
  name: 'Terminal 1983',
  tagline: 'An amber screen, late at night',
  description: 'An amber-phosphor computer terminal in a beige case. It boots, you log in, your letter decodes on screen, memories are listed as files, and BIRTHDAY.EXE prints a cake made of text.',
  categories: ['creative'],
  moods: ['Nostalgic', 'Techy', 'Witty'],
  bestFor: 'Programmers, gamers and anyone who grew up with a beige computer',
  palette: { primary: '#ffb000', secondary: '#140e04', accent: '#ffd27a' },
  tone: 'dark',
  fonts: { google: ['VT323', 'IBM+Plex+Mono:wght@400;500'], display: "'VT323', monospace", body: "'IBM Plex Mono', monospace" },
  animations: { language: 'Phosphor — type, blink, power off', ambientDensity: 0 },
  interactions: { highlights: ['Boot sequence & log in', 'Letter decodes on screen', 'Memories as files', 'BIRTHDAY.EXE prints a text cake'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
