import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#0b0d12]">
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[#10141c]" />
      <span className="absolute top-[46%] left-[22%] size-2.5 rounded-full bg-[#fff4dc] shadow-[0_0_14px_4px_rgb(232_162_91/0.55)] transition-all duration-1000 group-hover:left-[47%]" />
      <span className="absolute top-[46%] right-[22%] size-2.5 rounded-full bg-[#fff4dc] shadow-[0_0_14px_4px_rgb(232_162_91/0.55)] transition-all duration-1000 group-hover:right-[47%]" />
      <p className="absolute bottom-5 text-xs tracking-[0.5em] text-[#f1e7d6]/70" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        YOU + ME = US
      </p>
    </div>
  );
}

export const twoSoulsTemplate: BirthdayTemplate = {
  id: 'two-souls',
  name: 'Two Souls',
  tagline: 'Two lanterns on dark water, drifting until they meet',
  description: 'Two candle lanterns floating on a night river, like a lantern festival, drift towards each other. Memories gather as points of light, and the light finally settles into a heart and their name.',
  categories: ['love'],
  loveTags: ['magical', 'emotional', 'creative', 'premium'],
  moods: ['Quiet', 'Minimal', 'Tender'],
  bestFor: 'Soulmates and deep, quiet love',
  palette: { primary: '#e8a25b', secondary: '#1a2030', accent: '#f1e7d6' },
  tone: 'dark',
  fonts: { google: ['Cormorant+Garamond:ital,wght@0,400;0,600;1,400', 'Karla:wght@300;400;500'], display: "'Cormorant Garamond', Georgia, serif", body: "'Karla', system-ui, sans-serif" },
  animations: { language: 'Slow drift on water', ambientDensity: 1 },
  interactions: { highlights: ['Two lanterns meet', 'A faint light follows your finger', 'Memories as points of light', 'Light settles into a heart'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
