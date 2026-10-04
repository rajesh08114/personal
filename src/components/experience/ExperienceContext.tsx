import { createContext, useContext } from 'react';
import type { BirthdayConfig, ExperienceMode } from '@/types/birthday';
import type { BirthdayTemplate } from '@/types/template';
import type { ResolvedTheme } from '@/themes/resolveTheme';
import type { FxApi } from '@/components/effects/FxLayer';
import { PLACEHOLDER } from '@/data/placeholders';

export interface AudioApi {
  /** A song is configured and enabled. */
  available: boolean;
  playing: boolean;
  /** Fills `out` with frequency data (0–255). Returns false when no live audio is available. */
  getLevels: (out: Uint8Array) => boolean;
}

export interface ExperienceValue {
  config: BirthdayConfig;
  template: BirthdayTemplate;
  mode: ExperienceMode;
  theme: ResolvedTheme;
  /** Has the recipient passed the opening screen? */
  opened: boolean;
  /** Call from the template's opening interaction. Also starts music. */
  open: () => void;
  /** Return to the opening screen and scroll to the top. */
  restart: () => void;
  fx: FxApi;
  /** Theme-driven particle multiplier (subtle 0.55 · normal 1 · lively 1.4). */
  effectsScale: number;
  reducedMotion: boolean;
  age: number | null;
  audio: AudioApi;
}

export const ExperienceContext = createContext<ExperienceValue | null>(null);

export function useExperience(): ExperienceValue {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error('useExperience must be used inside <ExperienceShell>');
  return ctx;
}

export function useExperienceOptional(): ExperienceValue | null {
  return useContext(ExperienceContext);
}

/** Resolved strings for places that can't render a <Fill> (alt text, titles, canvas). */
export function useBirthdayText() {
  const { config, age } = useExperience();
  return {
    name: config.birthdayPerson.trim() || PLACEHOLDER.name,
    hasName: Boolean(config.birthdayPerson.trim()),
    sender: config.senderName.trim() || PLACEHOLDER.sender,
    hasSender: Boolean(config.senderName.trim()),
    relationship: config.relationship.trim() || PLACEHOLDER.relationship,
    age: age !== null ? String(age) : PLACEHOLDER.age,
    hasAge: age !== null,
  };
}

/** Shared palette array for effects (confetti/fireworks) from the active theme. */
export function useThemeColors(extra: string[] = ['#ffffff']): string[] {
  const { theme } = useExperience();
  return [theme.primary, theme.secondary, theme.accent, ...extra];
}
