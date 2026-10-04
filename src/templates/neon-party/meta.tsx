import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#07040f]">
      <div className="absolute -top-10 left-1/4 h-48 w-16 origin-top rotate-[20deg] bg-gradient-to-b from-[#ff3ea5aa] to-transparent blur-md transition-transform duration-700 group-hover:rotate-[-10deg]" />
      <div className="absolute -top-10 right-1/4 h-48 w-16 origin-top -rotate-[20deg] bg-gradient-to-b from-[#3ef4ffaa] to-transparent blur-md transition-transform duration-700 group-hover:rotate-[10deg]" />
      <p className="relative text-2xl text-[#ffd6f0] [text-shadow:0_0_6px_#ff3ea5,0_0_18px_#ff3ea5]" style={{ fontFamily: "'Monoton', cursive" }}>
        PARTY
      </p>
      <div className="relative mt-4 flex h-8 items-end gap-1">
        {[40, 80, 55, 95, 65, 30, 75, 50].map((h, i) => (
          <span key={i} className="w-2 rounded-t bg-gradient-to-t from-[#8b5cf6] to-[#3ef4ff]" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

export const neonPartyTemplate: BirthdayTemplate = {
  id: 'neon-party',
  name: 'Neon Party',
  tagline: 'The birthday after-hours',
  description: 'Neon signs, sweeping light beams, a music visualizer and a light board you control — then drop the beat.',
  categories: ['fun'],
  moods: ['Electric', 'Modern', 'Bold'],
  bestFor: 'Modern, energetic, nightlife-loving personalities',
  palette: { primary: '#ff3ea5', secondary: '#8b5cf6', accent: '#3ef4ff' },
  tone: 'dark',
  fonts: { google: ['Monoton', 'Outfit:wght@300;400;600;800'], display: "'Monoton', cursive", body: "'Outfit', system-ui, sans-serif" },
  animations: { language: 'Pulse & glow', ambientDensity: 4 },
  interactions: { highlights: ['Neon sign flicker', 'Audio visualizer', 'Light board', 'Drop the beat'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
