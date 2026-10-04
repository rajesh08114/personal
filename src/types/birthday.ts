/**
 * The single data model every template renders from.
 * Templates never hardcode personal content — they read it from here.
 */

export type TemplateId =
  | 'aurora'
  | 'starry-night'
  | 'polaroid-memories'
  | 'cinematic-film'
  | 'balloon-festival'
  | 'scrapbook'
  | 'minimal-luxury'
  | 'game-night'
  | 'love-letter'
  | 'neon-party'
  | 'garden-of-wishes'
  | 'film-roll'
  | 'time-capsule'
  | 'comic-book'
  | 'fairytale'
  | 'festival'
  | 'cosmic-journey'
  | 'coffee-memories'
  | 'digital-future';

export type ThemePresetId =
  | 'template'
  | 'romantic'
  | 'cute'
  | 'elegant'
  | 'fun'
  | 'minimal'
  | 'colorful'
  | 'dark-luxury'
  | 'custom';

export interface Memory {
  id: string;
  /** Data URL or remote URL. Empty = show an upload placeholder. */
  image?: string;
  title: string;
  description: string;
}

export interface TimelineItem {
  id: string;
  image?: string;
  title: string;
  description: string;
}

export interface BirthdayMessages {
  /** Opening line. Empty = each template uses its own signature opening. */
  intro: string;
  /** The main personal letter. */
  main: string;
  /** Shown after the wish / cake moment. */
  wish: string;
  /** The hidden final surprise. */
  surprise: string;
  /** Closing line of the experience. */
  final: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface ThemeSettings extends ThemeColors {
  preset: ThemePresetId;
}

export interface MusicSettings {
  url?: string;
  name?: string;
  enabled: boolean;
  volume: number;
}

export interface BirthdayConfig {
  version: 1;
  templateId: TemplateId;
  birthdayPerson: string;
  senderName: string;
  relationship: string;
  /** ISO date (YYYY-MM-DD). */
  birthdayDate?: string;
  /** Overrides the age derived from birthdayDate. */
  age?: number;
  heroImage?: string;
  finalImage?: string;
  messages: BirthdayMessages;
  memories: Memory[];
  timeline: TimelineItem[];
  theme: ThemeSettings;
  music: MusicSettings;
}

export type ExperienceMode = 'live' | 'preview' | 'embed' | 'sample' | 'shared';
