import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,#3b0d2a,#0a0410_70%)]">
      <span className="absolute left-[18%] size-6 rounded-full bg-[#ff5a7a] shadow-[0_0_30px_10px_#ff5a7a88] transition-all duration-1000 group-hover:left-[44%]" />
      <span className="absolute right-[18%] size-6 rounded-full bg-[#b388ff] shadow-[0_0_30px_10px_#b388ff88] transition-all duration-1000 group-hover:right-[44%]" />
      <p className="absolute bottom-5 text-xs tracking-[0.6em] text-white/70" style={{ fontFamily: "'Syne', sans-serif" }}>
        YOU + ME = US
      </p>
    </div>
  );
}

export const twoSoulsTemplate: BirthdayTemplate = {
  id: 'two-souls',
  name: 'Two Souls',
  tagline: 'Two lights, drifting until they meet',
  description: 'You and me as two glowing lights that find each other. Memories become a living constellation, and the light gathers into a heart, then their name.',
  categories: ['love'],
  loveTags: ['magical', 'emotional', 'creative', 'premium'],
  moods: ['Magical', 'Minimal', 'Luminous'],
  bestFor: 'Soulmates and deep, quiet love',
  palette: { primary: '#ff5a7a', secondary: '#7b2cbf', accent: '#b388ff' },
  tone: 'dark',
  fonts: { google: ['Syne:wght@400;600;700', 'Inter:wght@300;400;500'], display: "'Syne', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" },
  animations: { language: 'Particle drift', ambientDensity: 4 },
  interactions: { highlights: ['YOU + ME = US', 'Light that follows you', 'Living constellation', 'Particles become a heart'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
