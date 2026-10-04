import type { CSSProperties } from 'react';
import type { ThemeColors, ThemeSettings } from '@/types/birthday';
import { getPreset, type EffectsLevel } from './presets';

export interface ResolvedTheme extends ThemeColors {
  effects: EffectsLevel;
}

export function resolveTheme(settings: ThemeSettings, templatePalette: ThemeColors): ResolvedTheme {
  if (settings.preset === 'template') return { ...templatePalette, effects: 'normal' };
  if (settings.preset === 'custom') {
    return { primary: settings.primary, secondary: settings.secondary, accent: settings.accent, effects: 'normal' };
  }
  const preset = getPreset(settings.preset);
  return preset ? { ...preset.colors, effects: preset.effects } : { ...templatePalette, effects: 'normal' };
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** CSS custom properties consumed by every template (`var(--bd-primary)` etc.). */
export function themeToCssVars(theme: ThemeColors): CSSProperties {
  const vars: Record<string, string> = {};
  (['primary', 'secondary', 'accent'] as const).forEach((key) => {
    vars[`--bd-${key}`] = theme[key];
    vars[`--bd-${key}-rgb`] = hexToRgb(theme[key]).join(' ');
  });
  return vars as CSSProperties;
}
