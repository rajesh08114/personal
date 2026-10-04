import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative flex h-full w-full flex-col justify-center overflow-hidden bg-[#04060d] px-5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="absolute inset-0 bg-[linear-gradient(rgb(0_240_255/0.08)_1px,transparent_1px),linear-gradient(90deg,rgb(0_240_255/0.08)_1px,transparent_1px)] bg-[size:16px_16px]" />
      <p className="relative text-[0.6rem] text-[#00f0ff]">&gt; BIRTHDAY PROTOCOL</p>
      <p className="relative text-[0.6rem] text-[#00f0ff]/70">&gt; SUBJECT LOCATED</p>
      <p className="relative mt-2 text-lg font-bold text-white transition-[letter-spacing] duration-500 group-hover:tracking-widest" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
        STATUS: COMPLETE
      </p>
      <div className="relative mt-3 h-1.5 w-full bg-white/10">
        <div className="h-full w-2/3 bg-gradient-to-r from-[#00f0ff] to-[#ff2bd6] transition-all duration-700 group-hover:w-full" />
      </div>
    </div>
  );
}

export const digitalFutureTemplate: BirthdayTemplate = {
  id: 'digital-future',
  name: 'Digital Future',
  tagline: 'Birthday protocol initiated',
  description: 'A holographic interface from the future: boot sequence, subject scan, decrypting data logs and a mission that completes with a smile.',
  categories: ['creative'],
  moods: ['Futuristic', 'Techy', 'Witty'],
  bestFor: 'Tech enthusiasts and futuristic personalities',
  palette: { primary: '#00f0ff', secondary: '#ff2bd6', accent: '#b4ff39' },
  tone: 'dark',
  fonts: { google: ['Chakra+Petch:wght@400;600;700', 'JetBrains+Mono:wght@400;600'], display: "'Chakra Petch', system-ui, sans-serif", body: "'Chakra Petch', system-ui, sans-serif", accent: "'JetBrains Mono', monospace" },
  animations: { language: 'Glitch & decrypt', ambientDensity: 4 },
  interactions: { highlights: ['Boot sequence', 'Holographic scan', 'Decrypting logs', 'Mission complete'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
