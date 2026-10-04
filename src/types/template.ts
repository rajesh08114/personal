import type { ComponentType, LazyExoticComponent } from 'react';
import type { TemplateId, ThemeColors } from './birthday';

export type TemplateCategory = 'romantic' | 'fun' | 'memories' | 'elegant' | 'creative' | 'cozy' | 'love';

/** Secondary filters inside the Love & Romance collection. */
export type LoveTag = 'romantic' | 'emotional' | 'cinematic' | 'cute' | 'elegant' | 'magical' | 'cozy' | 'creative' | 'premium';

export interface TemplateFonts {
  /** Google Fonts css2 `family=` values, e.g. "Bebas+Neue" or "Lora:ital,wght@0,400;1,400". */
  google: string[];
  display: string;
  body: string;
  accent?: string;
}

export interface AnimationConfig {
  /** One-word description of the motion language, shown in the gallery. */
  language: string;
  /** Default ambient particle density multiplier. */
  ambientDensity: number;
}

export interface InteractionConfig {
  highlights: string[];
}

export interface BirthdayTemplate {
  id: TemplateId;
  name: string;
  tagline: string;
  description: string;
  categories: TemplateCategory[];
  /** Filters for the Love & Romance collection (love templates only). */
  loveTags?: LoveTag[];
  moods: string[];
  bestFor: string;
  /** Default colours, used when the creator keeps "Template colours". */
  palette: ThemeColors;
  /** Whether UI chrome (music player, progress) should render light-on-dark. */
  tone: 'dark' | 'light';
  fonts: TemplateFonts;
  animations: AnimationConfig;
  interactions: InteractionConfig;
  Thumbnail: ComponentType;
  /**
   * Each template owns its full section arrangement and storytelling,
   * so the presentation is a single lazily-loaded root component.
   */
  component: LazyExoticComponent<ComponentType>;
}
