import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  const bulbs = ['#ff5d8f', '#ffd23f', '#3ef4ff', '#7dff9c', '#c084fc'];
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#1a0b2e]">
      <svg viewBox="0 0 200 40" className="absolute inset-x-0 top-0 w-full">
        <path d="M0 6 Q50 30 100 10 T200 8" stroke="#555" fill="none" />
        {Array.from({ length: 11 }, (_, i) => (
          <circle key={i} cx={i * 20} cy={6 + Math.sin(i * 0.9) * 8 + 8} r="3.5" fill={bulbs[i % 5]} className="animate-twinkle" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </svg>
      <div className="absolute inset-x-6 bottom-0 h-1/2 rounded-t-[50%] bg-gradient-to-t from-[#2d1452] to-[#5b2a86]" />
      <div className="absolute bottom-[30%] left-1/2 h-24 w-32 -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,#fff6,transparent_70%)] transition-opacity duration-500 group-hover:opacity-100 [clip-path:polygon(40%_0,60%_0,100%_100%,0_100%)] opacity-60" />
      <p className="absolute inset-x-0 bottom-6 text-center text-xl text-[#ffd23f]" style={{ fontFamily: "'Shrikhand', cursive" }}>
        Festival of You
      </p>
    </div>
  );
}

export const festivalTemplate: BirthdayTemplate = {
  id: 'festival',
  name: 'Festival of Memories',
  tagline: 'A whole festival, just for them',
  description: 'Tear the ticket and enter: a main stage, photo booth, message wall and wish zone with floating lanterns — then the headline act.',
  categories: ['fun'],
  moods: ['Festive', 'Social', 'Joyful'],
  bestFor: 'Large friend groups and social personalities',
  palette: { primary: '#ff5d8f', secondary: '#5b2a86', accent: '#ffd23f' },
  tone: 'dark',
  fonts: { google: ['Shrikhand', 'Rubik:wght@400;500;700'], display: "'Shrikhand', cursive", body: "'Rubik', system-ui, sans-serif" },
  animations: { language: 'Lights & crowd', ambientDensity: 4 },
  interactions: { highlights: ['Tear the ticket', 'Festival zones', 'Release wish lanterns', 'Headline finale'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
