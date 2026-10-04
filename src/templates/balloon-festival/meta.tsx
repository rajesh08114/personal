import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  const balloons = [
    { x: 12, y: 30, c: '#ff5d8f', d: 0 },
    { x: 34, y: 14, c: '#ffc93c', d: 0.4 },
    { x: 56, y: 26, c: '#4cc9f0', d: 0.8 },
    { x: 76, y: 12, c: '#7b61ff', d: 0.2 },
  ];
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#bde7ff] to-[#ffe6f2]">
      {balloons.map((b, i) => (
        <div key={i} className="absolute animate-float transition-transform duration-700 group-hover:-translate-y-3" style={{ left: `${b.x}%`, top: `${b.y}%`, animationDelay: `${b.d}s` }}>
          <div className="h-14 w-11 rounded-[50%_50%_48%_48%/55%_55%_45%_45%] shadow-inner" style={{ background: `radial-gradient(circle at 30% 30%, #ffffffaa, ${b.c} 40%)` }} />
          <div className="mx-auto h-8 w-px bg-black/25" />
        </div>
      ))}
      <p className="absolute inset-x-0 bottom-4 text-center text-2xl font-bold text-[#ff5d8f]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
        Pop! Pop! Hooray!
      </p>
    </div>
  );
}

export const balloonFestivalTemplate: BirthdayTemplate = {
  id: 'balloon-festival',
  name: 'Balloon Festival',
  tagline: 'Every balloon hides a surprise',
  description: 'A bright sky that slowly fills with balloons. Pop them to uncover memories and messages, then pop the giant golden one.',
  categories: ['fun'],
  moods: ['Playful', 'Bright', 'Energetic'],
  bestFor: 'Fun friends, kids and energetic personalities',
  palette: { primary: '#ff5d8f', secondary: '#4cc9f0', accent: '#ffc93c' },
  tone: 'light',
  fonts: { google: ['Fredoka:wght@400;500;600;700'], display: "'Fredoka', system-ui, sans-serif", body: "'Fredoka', system-ui, sans-serif" },
  animations: { language: 'Bounce & pop', ambientDensity: 0 },
  interactions: { highlights: ['Pop to reveal', 'Hidden messages', 'Hot-air balloon story', 'Golden balloon finale'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
