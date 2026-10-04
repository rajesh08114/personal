import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0b0a08]">
      <div className="absolute inset-[22%_18%] bg-gradient-to-br from-[#5a4632] to-[#1c1712] transition-all duration-1000 group-hover:inset-0" />
      <p className="absolute top-4 left-5 text-4xl text-[#c8a96a]" style={{ fontFamily: "'Italiana', serif" }}>
        01
      </p>
      <p className="absolute right-5 bottom-4 text-sm tracking-[0.4em] text-[#efe6d6]" style={{ fontFamily: "'Italiana', serif" }}>
        OUR STORY
      </p>
    </div>
  );
}

export const ourStoryTemplate: BirthdayTemplate = {
  id: 'our-story',
  name: 'Our Story',
  tagline: 'Every love story has a beginning',
  description: 'Your relationship as a film in six chapters. Photos open from a small frame to full screen as you scroll.',
  categories: ['love'],
  loveTags: ['cinematic', 'elegant', 'emotional', 'premium'],
  moods: ['Cinematic', 'Elegant', 'Timeless'],
  bestFor: 'Couples with a story worth telling',
  palette: { primary: '#c8a96a', secondary: '#0b0a08', accent: '#efe6d6' },
  tone: 'dark',
  fonts: { google: ['Italiana', 'Libre+Caslon+Text:ital,wght@0,400;1,400'], display: "'Italiana', Georgia, serif", body: "'Libre Caslon Text', Georgia, serif" },
  animations: { language: 'Mask & zoom', ambientDensity: 0 },
  interactions: { highlights: ['Pinned chapters', 'Expanding photo masks', 'Slow parallax', 'Cinematic finale'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
