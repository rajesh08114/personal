import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#f4efe6]">
      <div className="flex flex-1 flex-col justify-center pl-6">
        <p className="text-4xl leading-none text-[#0e0d0b]" style={{ fontFamily: "'Bodoni Moda', Didot, serif" }}>
          Today
        </p>
        <p className="mt-2 text-[0.55rem] tracking-[0.45em] text-[#0e0d0b]/70">IS YOUR DAY.</p>
        <span className="mt-4 block h-px w-8 bg-[#b8975a] transition-all duration-700 group-hover:w-20" />
      </div>
      <div className="w-[38%] bg-[#0e0d0b] p-3">
        <div className="h-full w-full bg-gradient-to-b from-[#3b352c] to-[#15130f] transition-transform duration-1000 group-hover:scale-105" />
      </div>
    </div>
  );
}

export const minimalLuxuryTemplate: BirthdayTemplate = {
  id: 'minimal-luxury',
  name: 'Minimal Luxury',
  tagline: 'An invitation-grade tribute',
  description: 'Black, cream and a whisper of gold. Huge typography, masked photography, an editorial index and a single candle.',
  categories: ['elegant'],
  moods: ['Sophisticated', 'Quiet', 'Timeless'],
  bestFor: 'Elegant, mature and premium birthdays',
  palette: { primary: '#b8975a', secondary: '#0e0d0b', accent: '#e8dcc4' },
  tone: 'light',
  fonts: {
    google: ['Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..600', 'Montserrat:wght@300;400;500'],
    display: "'Bodoni Moda', Didot, Georgia, serif",
    body: "'Montserrat', system-ui, sans-serif",
  },
  animations: { language: 'Slow mask', ambientDensity: 0 },
  interactions: { highlights: ['Masked photography', 'Cursor image index', 'Editorial grid', 'Single candle'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
