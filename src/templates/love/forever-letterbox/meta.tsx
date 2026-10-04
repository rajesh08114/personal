import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center overflow-hidden bg-black">
      <div className="relative aspect-[2.39/1] w-full overflow-hidden">
        <div className="absolute inset-0 scale-110 bg-gradient-to-r from-[#3b2b22] via-[#6b4a3a] to-[#2a2230] transition-transform duration-[2s] group-hover:translate-x-[-6%]" />
        <p className="absolute bottom-2 left-3 text-[0.55rem] tracking-[0.35em] text-white/80" style={{ fontFamily: "'Tenor Sans', sans-serif" }}>
          SCENE 01 — THE DAY WE MET
        </p>
      </div>
    </div>
  );
}

export const foreverLetterboxTemplate: BirthdayTemplate = {
  id: 'forever-letterbox',
  name: 'Forever Letterbox',
  tagline: 'A widescreen love story, to be continued',
  description: 'Everything framed in cinematic 21:9. Scenes pan slowly and dip to black between cuts, ending on four words: to be continued…',
  categories: ['love'],
  loveTags: ['cinematic', 'premium', 'elegant'],
  moods: ['Cinematic', 'Restrained', 'Moving'],
  bestFor: 'Couples who love a slow-burn story',
  palette: { primary: '#f1e6d2', secondary: '#000000', accent: '#d9b77e' },
  tone: 'dark',
  fonts: { google: ['Tenor+Sans', 'Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300'], display: "'Tenor Sans', system-ui, sans-serif", body: "'Newsreader', Georgia, serif" },
  animations: { language: 'Pan & dip to black', ambientDensity: 0 },
  interactions: { highlights: ['Pinned 21:9 frame', 'Slow camera pans', 'Dip-to-black cuts', '“To be continued…”'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
