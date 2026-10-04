import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#4a0e18,#0d0306_75%)]">
      <div className="absolute bottom-0 h-1/2 w-[90%] rounded-t-[50%] bg-gradient-to-b from-[#6b1424] to-[#2a060d]" />
      {[38, 50, 62].map((x, i) => (
        <div key={x} className="absolute flex flex-col items-center" style={{ left: `${x}%`, bottom: '38%' }}>
          <span className="flame block h-3 w-2 rounded-[50%_50%_45%_45%] bg-gradient-to-t from-[#ff8a3d] to-[#fff3c4] opacity-70 shadow-[0_0_14px_6px_rgb(255_190_100/0.5)] transition-opacity duration-500 group-hover:opacity-100" style={{ animationDelay: `${i * 0.2}s` }} />
          <span className="h-10 w-1.5 bg-[#f3e6d2]" />
        </div>
      ))}
      <p className="absolute top-4 text-lg text-[#f3e6d2] italic" style={{ fontFamily: "'Playfair Display SC', serif" }}>
        your seat is waiting
      </p>
    </div>
  );
}

export const candlelightDinnerTemplate: BirthdayTemplate = {
  id: 'candlelight-dinner',
  name: 'Candlelight Dinner',
  tagline: 'Your seat is waiting',
  description: 'A private dinner for two. Candles light one by one, and every object on the table opens a memory, a message or the final gift.',
  categories: ['love'],
  loveTags: ['romantic', 'elegant', 'premium', 'cozy'],
  moods: ['Intimate', 'Elegant', 'Warm'],
  bestFor: 'A romantic evening, even when apart',
  palette: { primary: '#ffb35c', secondary: '#4a0e18', accent: '#f3e6d2' },
  tone: 'dark',
  fonts: { google: ['Playfair+Display+SC:wght@400;700', 'Cormorant:ital,wght@0,400;0,500;1,400'], display: "'Playfair Display SC', Georgia, serif", body: "'Cormorant', Georgia, serif" },
  animations: { language: 'Candle glow', ambientDensity: 2 },
  interactions: { highlights: ['Candles light one by one', 'Objects on the table', 'A menu of love', 'Gift-box finale'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
