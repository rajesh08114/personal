import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#fff6ee,#f1d9cf_70%)]">
      <div className="relative size-20 transition-transform duration-700 group-hover:-translate-y-2" style={{ transform: 'rotate(-6deg)' }}>
        <span className="absolute inset-x-0 bottom-0 h-[76%] rounded-md bg-[#c9566f] shadow-xl" />
        <span className="absolute bottom-0 left-1/2 h-[76%] w-3 -translate-x-1/2 bg-[#f3d38a]" />
        <span className="absolute inset-x-[-8%] top-[12%] h-[20%] rounded-md bg-[#b8475f] transition-transform duration-700 group-hover:-translate-y-4 group-hover:-rotate-12" />
      </div>
      {[[20, 70, '#e7b6c1'], [76, 66, '#f3d38a'], [64, 22, '#d9c2ef']].map(([x, y, c], i) => (
        <span key={i} className="absolute size-7 rounded-sm shadow" style={{ left: `${x}%`, top: `${y}%`, background: c as string }} />
      ))}
      <p className="absolute bottom-3 text-xl text-[#9a3a52]" style={{ fontFamily: "'Sacramento', cursive" }}>
        I got you something…
      </p>
    </div>
  );
}

export const giftBoxTemplate: BirthdayTemplate = {
  id: 'gift-box',
  name: 'The Gift Box',
  tagline: 'I got you something…',
  description: 'The whole website is a series of gifts. Open a 3D gift box to find five more inside, each with its own unwrapping, building up to the biggest one.',
  categories: ['love'],
  loveTags: ['cute', 'romantic', 'creative'],
  moods: ['Sweet', 'Playful', 'Generous'],
  bestFor: 'Sweet, playful love and gift-lovers',
  palette: { primary: '#c9566f', secondary: '#9a3a52', accent: '#f3d38a' },
  tone: 'light',
  fonts: { google: ['Sacramento', 'Quicksand:wght@400;500;600;700'], display: "'Sacramento', cursive", body: "'Quicksand', system-ui, sans-serif" },
  animations: { language: 'Unwrap & reveal', ambientDensity: 0 },
  interactions: { highlights: ['3D gift box', 'Five different unwrappings', 'A drawer, a hinge, a tear', 'Biggest gift last'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
