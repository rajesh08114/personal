import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#070b18]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      <div className="absolute inset-0 bg-[linear-gradient(rgb(110_231_249/0.07)_1px,transparent_1px),linear-gradient(90deg,rgb(110_231_249/0.07)_1px,transparent_1px)] bg-[size:20px_20px]" />
      <div className="relative flex size-24 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-dashed border-[#6ee7f9]/60 animate-spin-slow" />
        <span className="absolute inset-3 rounded-full border border-[#6ee7f9]/40 transition-transform duration-1000 group-hover:rotate-180" />
        <span className="h-12 w-7 rounded-full bg-gradient-to-b from-[#6ee7f9] to-[#a78bfa] shadow-[0_0_24px_#6ee7f9]" />
      </div>
      <p className="absolute bottom-4 text-[0.55rem] tracking-[0.3em] text-[#6ee7f9]">TIME CAPSULE · SEALED</p>
    </div>
  );
}

export const timeCapsuleTemplate: BirthdayTemplate = {
  id: 'time-capsule',
  name: 'Time Capsule',
  tagline: 'A message from today, for someday',
  description: 'A softly glowing digital archive: unseal the capsule, open memory pods, scrub through a dated timeline and count down to next year.',
  categories: ['memories', 'creative'],
  moods: ['Meaningful', 'Reflective', 'Futuristic'],
  bestFor: 'Emotional, meaningful, long-term friendships',
  palette: { primary: '#6ee7f9', secondary: '#a78bfa', accent: '#fde68a' },
  tone: 'dark',
  fonts: { google: ['Sora:wght@300;400;600;700', 'IBM+Plex+Mono:wght@400;500'], display: "'Sora', system-ui, sans-serif", body: "'Sora', system-ui, sans-serif", accent: "'IBM Plex Mono', monospace" },
  animations: { language: 'Unseal & decode', ambientDensity: 3 },
  interactions: { highlights: ['Unseal the capsule', 'Open memory pods', 'Timeline scrubber', 'Countdown to next year'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
