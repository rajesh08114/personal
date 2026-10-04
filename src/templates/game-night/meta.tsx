import { lazy } from 'react';
import type { BirthdayTemplate } from '@/types/template';

function Thumbnail() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#140a2e]" style={{ fontFamily: "'Press Start 2P', monospace" }}>
      <div className="absolute inset-x-0 bottom-0 h-1/2 [background:linear-gradient(transparent_0,#140a2e_0),repeating-linear-gradient(90deg,#ff2bd633_0_1px,transparent_1px_24px),repeating-linear-gradient(0deg,#ff2bd633_0_1px,transparent_1px_16px)] [transform:perspective(200px)_rotateX(55deg)] origin-bottom" />
      <div className="absolute top-3 right-3 left-3 flex justify-between text-[0.45rem] text-[#7df9ff]">
        <span>P1</span>
        <span>SCORE 009900</span>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <p className="text-[0.7rem] text-[#ffe14d] drop-shadow-[0_0_6px_#ffe14d]">LEVEL UP!</p>
        <p className="animate-pulse text-[0.5rem] text-white group-hover:text-[#ff2bd6]">PRESS START</p>
      </div>
    </div>
  );
}

export const gameNightTemplate: BirthdayTemplate = {
  id: 'game-night',
  name: 'Game Night',
  tagline: 'Player 01 has entered a new level',
  description: 'An arcade birthday: pop balloons, catch falling stars and charge the boss level to unlock their birthday message and new level.',
  categories: ['fun', 'creative'],
  moods: ['Arcade', 'Playful', 'Competitive'],
  bestFor: 'Gamers, playful friends and younger audiences',
  palette: { primary: '#ff2bd6', secondary: '#7df9ff', accent: '#ffe14d' },
  tone: 'dark',
  fonts: { google: ['Press+Start+2P', 'VT323'], display: "'Press Start 2P', monospace", body: "'VT323', ui-monospace, monospace" },
  animations: { language: '8-bit snap', ambientDensity: 0 },
  interactions: { highlights: ['3 mini-games', 'Live score HUD', 'Unlockable inventory', 'Level-up finale'] },
  Thumbnail,
  component: lazy(() => import('./index')),
};
