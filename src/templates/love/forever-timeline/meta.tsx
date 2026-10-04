import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f5efe6] p-5" style={{ fontFamily: "'DM Serif Display', serif" }}>
      <span className="absolute top-0 bottom-0 left-1/2 w-px bg-[#1a1414]/40" />
      <span className="absolute top-0 left-1/2 h-0 w-px bg-[#7d1d2f] transition-all duration-1000 group-hover:h-full" />
      {['The day we met', 'The best day', 'Today', 'Forever'].map((t, i) => (
        <div key={t} className={`absolute flex items-center gap-2 text-sm text-[#1a1414] ${i % 2 ? 'left-[54%]' : 'right-[54%] flex-row-reverse'}`} style={{ top: `${14 + i * 20}%` }}>
          <span className="size-2 rounded-full bg-[#7d1d2f]" />
          {t}
        </div>
      ))}
    </div>
  );
}

export const foreverTimelineTemplate: BirthdayTemplate = {
  id: 'forever-timeline',
  name: 'Forever Timeline',
  tagline: 'From the day we met, to forever',
  description: 'A minimal, luxurious timeline that follows your scroll. Milestones expand as they reach centre stage, and the line keeps going past the edge.',
  categories: ['love'],
  loveTags: ['elegant', 'emotional', 'premium'],
  moods: ['Minimal', 'Luxurious', 'Sincere'],
  bestFor: 'Long-term love and anniversaries-on-birthdays',
  palette: { primary: '#7d1d2f', secondary: '#1a1414', accent: '#c8a46e' },
  tone: 'light',
  fonts: { google: ['DM+Serif+Display:ital@0;1', 'Work+Sans:wght@300;400;500'], display: "'DM Serif Display', Georgia, serif", body: "'Work Sans', system-ui, sans-serif" },
  animations: { language: 'Expand on focus', ambientDensity: 0 },
  interactions: { highlights: ['Scroll-following line', 'Milestones expand at centre', 'Past → today → forever', 'Endless finale'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
