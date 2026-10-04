import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0d0a1a]">
      <div className="absolute -top-6 -left-6 size-32 rounded-full bg-[#d9467a] opacity-60 blur-2xl transition-transform duration-700 group-hover:translate-x-6" />
      <div className="absolute -right-8 bottom-0 size-36 rounded-full bg-[#7c3aed] opacity-60 blur-2xl transition-transform duration-700 group-hover:-translate-y-4" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="size-14 rounded-full bg-gradient-to-br from-[#f6c66a] to-[#d9467a] p-[2px] shadow-[0_0_30px_rgb(217_70_122/0.6)]">
          <div className="h-full w-full rounded-full bg-[#1b1430]" />
        </div>
        <p className="font-display text-lg text-white italic">Happy Birthday</p>
        <div className="h-1.5 w-16 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

export const auroraTemplate: BirthdayTemplate = {
  id: 'aurora',
  name: 'Aurora Surprise',
  tagline: 'The signature cinematic surprise',
  description:
    'A glowing, glassy journey: a cinematic opening, a floating portrait, a heartfelt letter, memories, an interactive cake and a gift that opens.',
  categories: ['elegant', 'romantic'],
  moods: ['Magical', 'Elegant', 'Emotional'],
  bestFor: 'Anyone — the all-round signature experience',
  palette: { primary: '#d9467a', secondary: '#7c3aed', accent: '#f6c66a' },
  tone: 'dark',
  fonts: { google: [], display: "'Fraunces', Georgia, serif", body: "'Manrope', system-ui, sans-serif" },
  animations: { language: 'Glow & drift', ambientDensity: 6 },
  interactions: { highlights: ['Magnetic opening', 'Tilt gallery', 'Blow-out cake', '3D gift box'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
