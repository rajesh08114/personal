import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';
import { lazyChunk, loadChunk } from '@/utils/lazyChunk';

const load = loadChunk(() => import('./index'));

export const digitalHeartbeatTemplate: BirthdayTemplate = {
  id: 'digital-heartbeat',
  name: 'Digital Heartbeat',
  tagline: 'You make my heart beat differently',
  description: 'Dark luxury, minimal and alive. A heartbeat line reacts to every move, click and song, memories pulse in rhythm, and the line becomes a glowing heart.',
  categories: ['love'],
  loveTags: ['premium', 'creative', 'emotional'],
  moods: ['Intense', 'Minimal', 'Alive'],
  bestFor: 'Passionate love, modern couples',
  palette: { primary: '#ff2e5f', secondary: '#070204', accent: '#ffb3c4' },
  tone: 'dark',
  fonts: { google: ['Space+Grotesk:wght@300;400;600', 'JetBrains+Mono:wght@400'], display: "'Space Grotesk', system-ui, sans-serif", body: "'Space Grotesk', system-ui, sans-serif", accent: "'JetBrains Mono', monospace" },
  animations: { language: 'Pulse & glow', ambientDensity: 0 },
  interactions: { highlights: ['Live ECG line', 'Reacts to cursor, clicks & music', 'Memories pulse in rhythm', 'Line becomes a heart'] },
  Thumbnail: lazyChunk(() => import('./thumbnail')),
  load,
  component: lazy(load),
};
