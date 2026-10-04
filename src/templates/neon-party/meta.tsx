import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="np-thumb relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#120d10] bg-[linear-gradient(rgb(0_0_0/0.55)_2px,transparent_2px),linear-gradient(90deg,rgb(0_0_0/0.5)_2px,transparent_2px)] bg-[size:100%_18px,40px_36px]">
      <p className="text-3xl font-extrabold tracking-wide text-[#fff3fb] transition-opacity duration-300 group-hover:opacity-70" style={{ fontFamily: "'Monoton', sans-serif", textShadow: '0 0 4px #fff, 0 0 12px #ff3ea5, 0 0 26px #ff3ea5' }}>
        PARTY
      </p>
      <p className="mt-1 text-sm tracking-[0.3em] text-[#effeff]" style={{ textShadow: '0 0 4px #fff, 0 0 12px #3ef4ff' }}>
        OPEN LATE
      </p>
    </div>
  );
}

export const neonPartyTemplate: BirthdayTemplate = {
  id: 'neon-party',
  name: 'Neon Party',
  tagline: 'The birthday after-hours',
  description: 'A late-night bar wall: neon signs bent into their name, a light board you control, a music visualizer and one big arcade button to drop the beat.',
  categories: ['fun'],
  moods: ['Electric', 'Modern', 'Bold'],
  bestFor: 'Modern, energetic, nightlife-loving personalities',
  palette: { primary: '#ff3ea5', secondary: '#ff9f43', accent: '#3ef4ff' },
  tone: 'dark',
  fonts: { google: ['Monoton', 'Outfit:wght@300;400;600;800'], display: "'Monoton', cursive", body: "'Outfit', system-ui, sans-serif" },
  animations: { language: 'Pulse & glow', ambientDensity: 4 },
  interactions: { highlights: ['Neon sign flicker', 'Audio visualizer', 'Light board', 'Drop the beat'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
