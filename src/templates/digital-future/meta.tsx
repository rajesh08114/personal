import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#d8cfb8]">
      <div className="relative h-[76%] w-[82%] overflow-hidden rounded-md bg-[#140e04] px-4 py-3 text-[#ffb000] shadow-[inset_0_0_30px_8px_rgb(0_0_0/0.8)]" style={{ fontFamily: "'VT323', monospace", textShadow: '0 0 2px rgb(255 176 0 / 0.6)' }}>
        <p className="text-sm leading-tight">C:\&gt; RUN BIRTHDAY.EXE</p>
        <p className="text-sm leading-tight opacity-70">████████████░░░░ 75%</p>
        <p className="mt-2 text-2xl leading-none">HAPPY BIRTHDAY<span className="ml-1 inline-block h-5 w-2.5 translate-y-0.5 bg-[#ffb000] group-hover:opacity-0" /></p>
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgb(0_0_0/0.25)_0_1px,transparent_1px_3px)]" />
      </div>
    </div>
  );
}

export const digitalFutureTemplate: BirthdayTemplate = {
  id: 'digital-future',
  name: 'Terminal 1983',
  tagline: 'An amber screen, late at night',
  description: 'An amber-phosphor computer terminal in a beige case. It boots, you log in, your letter decodes on screen, memories are listed as files, and BIRTHDAY.EXE prints a cake made of text.',
  categories: ['creative'],
  moods: ['Nostalgic', 'Techy', 'Witty'],
  bestFor: 'Programmers, gamers and anyone who grew up with a beige computer',
  palette: { primary: '#ffb000', secondary: '#140e04', accent: '#ffd27a' },
  tone: 'dark',
  fonts: { google: ['VT323', 'IBM+Plex+Mono:wght@400;500'], display: "'VT323', monospace", body: "'IBM Plex Mono', monospace" },
  animations: { language: 'Phosphor — type, blink, power off', ambientDensity: 0 },
  interactions: { highlights: ['Boot sequence & log in', 'Letter decodes on screen', 'Memories as files', 'BIRTHDAY.EXE prints a text cake'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
