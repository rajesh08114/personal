import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#7a2a3a,#2a0f16_75%)]">
      <div className="relative h-[52%] w-[62%] rounded-md bg-[#f3e3cf] shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-1/2 origin-top bg-[#e9d2b6] transition-transform duration-700 [clip-path:polygon(0_0,100%_0,50%_100%)] group-hover:[transform:rotateX(160deg)]" />
        <div className="absolute top-[42%] left-1/2 flex size-9 -translate-x-1/2 items-center justify-center rounded-full bg-[#a3243b] text-sm text-[#f3e3cf] shadow-md" style={{ fontFamily: "'Dancing Script', cursive" }}>
          ♥
        </div>
        <p className="absolute inset-x-0 bottom-3 text-center text-lg text-[#6b2a35]" style={{ fontFamily: "'Dancing Script', cursive" }}>
          a letter for you
        </p>
      </div>
    </div>
  );
}

export const loveLetterTemplate: BirthdayTemplate = {
  id: 'love-letter',
  name: 'Love Letter',
  tagline: 'Break the seal, unfold the letter',
  description: 'A candlelit envelope sealed in wax. Inside, a handwritten letter unfolds line by line, with photos tucked between the pages.',
  categories: ['romantic', 'cozy'],
  moods: ['Intimate', 'Romantic', 'Heartfelt'],
  bestFor: 'Partners and deeply personal relationships',
  palette: { primary: '#a3243b', secondary: '#5a1a28', accent: '#e8b4a0' },
  tone: 'dark',
  fonts: {
    google: ['Dancing+Script:wght@500;700', 'Cormorant+Infant:ital,wght@0,400;0,500;0,600;1,400'],
    display: "'Dancing Script', cursive",
    body: "'Cormorant Infant', Georgia, serif",
  },
  animations: { language: 'Unfold & ink', ambientDensity: 4 },
  interactions: { highlights: ['Wax seal envelope', 'Handwriting reveal', 'Tucked-in photos', 'Heart particles'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
