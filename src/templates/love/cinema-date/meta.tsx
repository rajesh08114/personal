import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0506]">
      <div className="absolute top-[12%] left-1/2 h-[52%] w-[70%] -translate-x-1/2 bg-[#e8e2d6] shadow-[0_0_40px_rgb(232_226_214/0.35)]">
        <p className="flex h-full flex-col items-center justify-center text-[#1a0d0e]" style={{ fontFamily: "'Limelight', serif" }}>
          <span className="text-[0.5rem] tracking-[0.3em]">TONIGHT’S FEATURE</span>
          <span className="text-base">The Story of Us</span>
        </p>
      </div>
      <div className="absolute inset-y-0 left-0 w-[18%] bg-[repeating-linear-gradient(90deg,#7a0f1c_0_6px,#5a0a14_6px_12px)] transition-transform duration-1000 group-hover:-translate-x-1/2" />
      <div className="absolute inset-y-0 right-0 w-[18%] bg-[repeating-linear-gradient(90deg,#7a0f1c_0_6px,#5a0a14_6px_12px)] transition-transform duration-1000 group-hover:translate-x-1/2" />
      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 pb-2">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className="h-5 w-6 rounded-t-lg bg-[#2a1214]" />
        ))}
      </div>
    </div>
  );
}

export const cinemaDateTemplate: BirthdayTemplate = {
  id: 'cinema-date',
  name: 'Cinema Date',
  tagline: 'Tonight’s feature: The Story of Us',
  description: 'A private screening just for them. Curtains open, the projector hums, and your story plays chapter by chapter before the credits roll.',
  categories: ['love'],
  loveTags: ['cinematic', 'romantic', 'creative'],
  moods: ['Cinematic', 'Nostalgic', 'Fun'],
  bestFor: 'Movie-night couples',
  palette: { primary: '#e2b250', secondary: '#7a0f1c', accent: '#e8e2d6' },
  tone: 'dark',
  fonts: { google: ['Limelight', 'Archivo+Narrow:wght@400;500;600'], display: "'Limelight', Georgia, serif", body: "'Archivo Narrow', system-ui, sans-serif" },
  animations: { language: 'Projector flicker', ambientDensity: 2 },
  interactions: { highlights: ['Velvet curtains open', 'Scene-selection menu', 'Projector film burns', 'Credits starring you both'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
