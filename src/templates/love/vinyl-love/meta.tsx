import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_30%_20%,#5a3a22,#1f130b_70%)]">
      <div className="relative size-28 rounded-full bg-[repeating-radial-gradient(circle,#111_0_2px,#1d1d1d_2px_4px)] shadow-2xl transition-transform duration-[2s] group-hover:rotate-[360deg]">
        <span className="absolute inset-[34%] rounded-full bg-[#c4552f]" />
        <span className="absolute inset-[47%] rounded-full bg-[#1f130b]" />
      </div>
      <span className="absolute top-6 right-[26%] h-20 w-1.5 origin-top rotate-[18deg] rounded-full bg-[#cfc3b2] transition-transform duration-700 group-hover:rotate-[28deg]" />
      <p className="absolute bottom-3 left-4 text-sm text-[#f0d9b5]" style={{ fontFamily: "'Righteous', sans-serif" }}>
        Side A · Us
      </p>
    </div>
  );
}

export const vinylLoveTemplate: BirthdayTemplate = {
  id: 'vinyl-love',
  name: 'Vinyl Love',
  tagline: 'Our soundtrack, side A',
  description: 'A warm vintage record player. Drop the needle and your story plays in five tracks, with photos and messages following along.',
  categories: ['love'],
  loveTags: ['cozy', 'creative', 'romantic'],
  moods: ['Vintage', 'Warm', 'Musical'],
  bestFor: 'Couples with a song that’s “ours”',
  palette: { primary: '#c4552f', secondary: '#1f130b', accent: '#f0d9b5' },
  tone: 'dark',
  fonts: { google: ['Righteous', 'Crimson+Pro:ital,wght@0,400;0,500;1,400'], display: "'Righteous', system-ui, sans-serif", body: "'Crimson Pro', Georgia, serif" },
  animations: { language: 'Spin & groove', ambientDensity: 0 },
  interactions: { highlights: ['Spinning turntable', 'Five-track story', 'Synced photos & words', 'Needle-lift finale'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
