import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const gameNightTemplate: BirthdayTemplate = {
  id: 'game-night',
  name: 'Game Night',
  tagline: 'Player 01 has entered a new level',
  description: 'An arcade birthday: pop balloons, catch falling stars and charge the boss level to unlock their birthday message and new level.',
  categories: ['fun', 'creative'],
  moods: ['Arcade', 'Playful', 'Competitive'],
  bestFor: 'Gamers, playful friends and younger audiences',
  palette: { primary: '#ff2bd6', secondary: '#7df9ff', accent: '#ffe14d' },
  tone: 'dark',
  fonts: { google: ['Press+Start+2P', 'VT323'], display: "'Press Start 2P', monospace", body: "'VT323', ui-monospace, monospace" },
  animations: { language: '8-bit snap', ambientDensity: 0 },
  interactions: { highlights: ['3 mini-games', 'Live score HUD', 'Unlockable inventory', 'Level-up finale'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
