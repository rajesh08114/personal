import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,#2a1650,#07041a_70%)]">
      <div className="absolute h-14 w-[70%] rounded-[50%] border border-white/20" />
      <div className="absolute h-8 w-[44%] rounded-[50%] border border-white/15" />
      <span className="relative size-10 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff,#ffb4d1_45%,#c06bff)] shadow-[0_0_40px_#ff9cd0]" />
      <span className="absolute left-[18%] size-5 rounded-full bg-gradient-to-br from-[#7dd3fc] to-[#2563eb] transition-transform duration-1000 group-hover:translate-x-24" />
      <span className="absolute right-[24%] top-[38%] size-3 rounded-full bg-gradient-to-br from-[#fde68a] to-[#f97316] transition-transform duration-1000 group-hover:-translate-x-16" />
      <p className="absolute bottom-3 text-[0.6rem] tracking-[0.4em] text-white/70" style={{ fontFamily: "'Comfortaa', sans-serif" }}>
        OUR LITTLE UNIVERSE
      </p>
    </div>
  );
}

export const ourLittleUniverseTemplate: BirthdayTemplate = {
  id: 'our-little-universe',
  name: 'Our Little Universe',
  tagline: 'A tiny universe, just for two',
  description: 'A floating miniature universe you can spin and tilt. Planets hold your memories, photos, dreams and plans, and two names glow at the centre.',
  categories: ['love'],
  loveTags: ['magical', 'creative', 'cute', 'premium'],
  moods: ['Dreamy', 'Whimsical', 'Cosmic'],
  bestFor: 'Couples who feel like their own little world',
  palette: { primary: '#ff9cd0', secondary: '#2a1650', accent: '#7dd3fc' },
  tone: 'dark',
  fonts: { google: ['Comfortaa:wght@400;600;700', 'Nunito:wght@400;600'], display: "'Comfortaa', system-ui, sans-serif", body: "'Nunito', system-ui, sans-serif" },
  animations: { language: 'Orbit in 3D', ambientDensity: 8 },
  interactions: { highlights: ['Drag to spin the universe', 'Planets with depth', 'Six worlds to explore', 'Zoom-out finale'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
