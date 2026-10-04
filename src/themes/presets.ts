import type { ThemeColors, ThemePresetId } from '@/types/birthday';

export type EffectsLevel = 'subtle' | 'normal' | 'lively';

export interface ThemePreset {
  id: Exclude<ThemePresetId, 'template' | 'custom'>;
  name: string;
  description: string;
  colors: ThemeColors;
  /** How busy ambient particles and celebrations should be. */
  effects: EffectsLevel;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'romantic',
    name: 'Romantic',
    description: 'Rose, blush and warm candlelight',
    colors: { primary: '#d9467a', secondary: '#8e2d5c', accent: '#ffb3c7' },
    effects: 'normal',
  },
  {
    id: 'cute',
    name: 'Cute',
    description: 'Bubblegum pastels, soft and playful',
    colors: { primary: '#ff7eb6', secondary: '#7ec8ff', accent: '#ffe066' },
    effects: 'lively',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Champagne gold on deep ink',
    colors: { primary: '#c9a227', secondary: '#2b2a33', accent: '#efe3c2' },
    effects: 'subtle',
  },
  {
    id: 'fun',
    name: 'Fun',
    description: 'Tangerine, teal and sunshine',
    colors: { primary: '#ff6b35', secondary: '#00a6a6', accent: '#ffd23f' },
    effects: 'lively',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Quiet neutrals, one soft accent',
    colors: { primary: '#3f3f46', secondary: '#a1a1aa', accent: '#d6b98c' },
    effects: 'subtle',
  },
  {
    id: 'colorful',
    name: 'Colorful',
    description: 'Vivid gradients and electric energy',
    colors: { primary: '#7c3aed', secondary: '#06b6d4', accent: '#f43f5e' },
    effects: 'lively',
  },
  {
    id: 'dark-luxury',
    name: 'Dark Luxury',
    description: 'Obsidian with molten gold glow',
    colors: { primary: '#d4af37', secondary: '#1a1a1a', accent: '#f5e6b8' },
    effects: 'subtle',
  },
];

export function getPreset(id: ThemePresetId): ThemePreset | undefined {
  return THEME_PRESETS.find((p) => p.id === id);
}
