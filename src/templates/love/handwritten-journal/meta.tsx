import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#3b4a5a]">
      <div className="relative flex h-[78%] w-[80%] shadow-2xl">
        <div className="flex-1 bg-[repeating-linear-gradient(#fdfbf4_0_10px,#c9d8ea_10px_11px)]" />
        <div className="w-1 bg-[#2b3440]" />
        <div className="relative flex-1 origin-left bg-[repeating-linear-gradient(#fdfbf4_0_10px,#c9d8ea_10px_11px)] transition-transform duration-1000 group-hover:[transform:perspective(400px)_rotateY(-35deg)]">
          <div className="absolute top-3 left-3 h-8 w-10 rotate-3 bg-[#e9b9a8]" />
          <span className="absolute right-0 bottom-0 size-5 bg-[linear-gradient(135deg,#fdfbf4_50%,#e8dfcc_50%)]" />
        </div>
      </div>
      <p className="absolute bottom-2 text-sm text-[#fdfbf4]" style={{ fontFamily: "'Kalam', cursive" }}>
        our journal
      </p>
    </div>
  );
}

export const handwrittenJournalTemplate: BirthdayTemplate = {
  id: 'handwritten-journal',
  name: 'Handwritten Journal',
  tagline: 'Our private journal, page by page',
  description: 'A lined notebook whose pages turn as you scroll. Photos taped in, pen doodles, folded corners with secrets, and a last page still being written.',
  categories: ['love'],
  loveTags: ['cozy', 'emotional', 'cute'],
  moods: ['Personal', 'Tender', 'Handmade'],
  bestFor: 'Couples who write each other notes',
  palette: { primary: '#2f5d8a', secondary: '#3b4a5a', accent: '#d9534f' },
  tone: 'dark',
  fonts: { google: ['Homemade+Apple', 'Kalam:wght@300;400;700'], display: "'Homemade Apple', cursive", body: "'Kalam', cursive" },
  animations: { language: 'Scroll page-turn', ambientDensity: 0 },
  interactions: { highlights: ['Pages turn as you scroll', 'Taped-in photos', 'Folded-corner secrets', 'A page still being written'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
