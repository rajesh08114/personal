import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const foreverLetterboxTemplate: BirthdayTemplate = {
  id: 'forever-letterbox',
  name: 'Forever Letterbox',
  tagline: 'A widescreen love story, to be continued',
  description: 'Everything framed in cinematic 21:9. Scenes pan slowly and dip to black between cuts, ending on four words: to be continued…',
  categories: ['love'],
  loveTags: ['cinematic', 'premium', 'elegant'],
  moods: ['Cinematic', 'Restrained', 'Moving'],
  bestFor: 'Couples who love a slow-burn story',
  palette: { primary: '#f1e6d2', secondary: '#000000', accent: '#d9b77e' },
  tone: 'dark',
  fonts: { google: ['Tenor+Sans', 'Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300'], display: "'Tenor Sans', system-ui, sans-serif", body: "'Newsreader', Georgia, serif" },
  animations: { language: 'Pan & dip to black', ambientDensity: 0 },
  interactions: { highlights: ['Pinned 21:9 frame', 'Slow camera pans', 'Dip-to-black cuts', '“To be continued…”'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
