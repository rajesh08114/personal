import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const timeCapsuleTemplate: BirthdayTemplate = {
  id: 'time-capsule',
  name: 'Time Capsule',
  tagline: 'A tin buried a while ago, dug up today',
  description: 'An old biscuit tin dug up from the garden: peel the tape, lift the lid, read a typed letter, unwrap photos from tissue paper, flip through ticket stubs, and open the envelope marked “open last”.',
  categories: ['memories', 'creative'],
  moods: ['Meaningful', 'Reflective', 'Tactile'],
  bestFor: 'Emotional, meaningful, long-term friendships',
  palette: { primary: '#4c6c65', secondary: '#e7d9bd', accent: '#9b2c24' },
  tone: 'light',
  fonts: { google: ['Special+Elite', 'Caveat:wght@500', 'Lora:ital@0;1'], display: "'Special Elite', 'Courier New', monospace", body: "'Lora', Georgia, serif", accent: "'Caveat', cursive" },
  animations: { language: 'Peel, lift, unwrap', ambientDensity: 0 },
  interactions: { highlights: ['Peel the masking tape', 'Unwrap photos from tissue', 'Ticket-stub timeline', '“Open last” envelope'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
