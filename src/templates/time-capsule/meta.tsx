import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#d9cdb6]">
      <div className="relative flex size-28 items-center justify-center rounded-full bg-[#4c6c65] shadow-[inset_0_0_0_6px_#44615a,0_10px_18px_-8px_rgb(40_30_20/0.6)] transition-transform duration-500 group-hover:-rotate-6">
        <span className="bg-[#1f1e1c] px-2 py-0.5 text-[0.55rem] font-bold tracking-[0.18em] text-[#f4f1ea]">DO NOT OPEN</span>
        <span className="absolute top-1/2 left-[-12%] h-5 w-[124%] -translate-y-1/2 -rotate-[8deg] bg-[#e8dcb5]/90" />
      </div>
    </div>
  );
}

export const timeCapsuleTemplate: BirthdayTemplate = {
  id: 'time-capsule',
  name: 'Time Capsule',
  tagline: 'A tin buried a while ago, dug up today',
  description: 'An old biscuit tin dug up from the garden: peel the tape, lift the lid, read a typed letter, unwrap photos from tissue paper, flip through ticket stubs, and open the envelope marked “open last”.',
  categories: ['memories', 'creative'],
  moods: ['Meaningful', 'Reflective', 'Tactile'],
  bestFor: 'Emotional, meaningful, long-term friendships',
  palette: { primary: '#4c6c65', secondary: '#e7d9bd', accent: '#9b2c24' },
  tone: 'light',
  fonts: { google: ['Special+Elite', 'Caveat:wght@500', 'Lora:ital@0;1'], display: "'Special Elite', 'Courier New', monospace", body: "'Lora', Georgia, serif", accent: "'Caveat', cursive" },
  animations: { language: 'Peel, lift, unwrap', ambientDensity: 0 },
  interactions: { highlights: ['Peel the masking tape', 'Unwrap photos from tissue', 'Ticket-stub timeline', '“Open last” envelope'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
