import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  const books = [
    ['#d9762b', 'h-[62%]'],
    ['#2f5d62', 'h-[70%]'],
    ['#a8342b', 'h-[66%]'],
    ['#1c1b19', 'h-[60%]'],
  ];
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-end overflow-hidden bg-[#e8dfcc] pb-6">
      <div className="flex h-[78%] items-end gap-2">
        {books.map(([c, h], i) => (
          <span key={c} className={`${h} w-12 shadow-md transition-transform duration-500 ${i === 1 ? 'group-hover:-translate-y-3' : ''}`} style={{ background: c }}>
            <span className="mx-auto mt-[30%] block size-7 rounded-full bg-[#f2ebdc]/30" />
          </span>
        ))}
      </div>
      <div className="h-2.5 w-[70%] bg-[#7a5c40]" />
    </div>
  );
}

export const parallelUniversesTemplate: BirthdayTemplate = {
  id: 'parallel-universes',
  name: 'Parallel Universes',
  tagline: 'In every universe, I’d still choose you',
  description: 'Four vintage science-fiction paperbacks on a shelf: the same two characters in four different editions. Each cover swings open on a chapter of your story, and every edition has the same last page.',
  categories: ['love'],
  loveTags: ['creative', 'magical', 'cinematic'],
  moods: ['Witty', 'Bookish', 'Profound'],
  bestFor: 'Bookish couples and sci-fi romantics',
  palette: { primary: '#2b2520', secondary: '#e8dfcc', accent: '#d9762b' },
  tone: 'light',
  fonts: { google: ['Crimson+Pro:ital,wght@0,400;0,600;1,400', 'Jost:wght@300;400;500;600', 'Anton'], display: "'Crimson Pro', Georgia, serif", body: "'Crimson Pro', Georgia, serif", accent: "'Jost', system-ui, sans-serif" },
  animations: { language: 'Book physics — pull, swing open, stack', ambientDensity: 0 },
  interactions: { highlights: ['Four period paperback covers', 'Covers swing open on the spine', 'Photos printed as two-ink cover art', 'The same last page in every edition'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
