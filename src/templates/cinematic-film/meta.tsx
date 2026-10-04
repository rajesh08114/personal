import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-black">
      <div className="h-[14%] bg-black" />
      <div className="relative flex-1 bg-[radial-gradient(ellipse_at_center,#3a2f25,#0a0806_75%)]">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[0.6rem] tracking-[0.5em] text-white/50">A FILM ABOUT</p>
          <p className="mt-1 text-3xl tracking-[0.12em] text-[#f1d9a7] transition-all duration-700 group-hover:tracking-[0.25em]" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
            THE STORY OF YOU
          </p>
        </div>
      </div>
      <div className="flex h-[14%] items-center gap-1.5 bg-black px-2">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="h-2 w-3 rounded-[2px] bg-white/20" />
        ))}
      </div>
    </div>
  );
}

export const cinematicFilmTemplate: BirthdayTemplate = {
  id: 'cinematic-film',
  name: 'Cinematic Film',
  tagline: 'Their life, as a feature film',
  description: 'Letterboxed, film-grained and dramatic: chapters, subtitles, a film-strip gallery, and end credits starring the birthday person.',
  categories: ['elegant'],
  moods: ['Dramatic', 'Stylish', 'Premium'],
  bestFor: 'Dramatic, stylish, premium birthdays',
  palette: { primary: '#e8b04b', secondary: '#7a1f1f', accent: '#f1d9a7' },
  tone: 'dark',
  fonts: {
    google: ['Bebas+Neue', 'Inter+Tight:ital,wght@0,300;0,400;0,600;1,300'],
    display: "'Bebas Neue', Impact, sans-serif",
    body: "'Inter Tight', system-ui, sans-serif",
  },
  animations: { language: 'Cut & dissolve', ambientDensity: 0 },
  interactions: { highlights: ['Projector countdown', 'Scroll subtitles', 'Film-strip gallery', 'End credits'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
