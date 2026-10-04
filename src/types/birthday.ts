/**
 * The single data model every template renders from.
 * Templates never hardcode personal content — they read it from here.
 */

import type { TEMPLATE_IDS } from '@/data/templateIds';

export type TemplateId = (typeof TEMPLATE_IDS)[number];

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

/**
 * How a photo sits inside whatever frame a template gives it. Uses a focal-point
 * model, so the same settings look right in a square, a portrait print or a
 * widescreen still.
 */
export interface PhotoFraming {
  /** 'cover' fills the frame (cropping); 'contain' shows the whole photo. */
  fit: 'cover' | 'contain';
  /** Focal point in percent (0–100) of the photo; 50/50 = centred. */
  position: { x: number; y: number };
  /** 1 = no zoom, up to 4. */
  zoom: number;
  /** Straightening, in degrees (−45…45). */
  rotation?: number;
}

export interface Memory {
  id: string;
  /** Data URL or remote URL. Empty = show an upload placeholder. */
  image?: string;
  framing?: PhotoFraming;
  title: string;
  description: string;
  /** Free text, e.g. "June 2021" or "14 Feb 2022". Optional. */
  date?: string;
  /** Free text, e.g. "Lisbon" or "Our first apartment". Optional. */
  place?: string;
}

/** Story chapters / important dates share the same shape as memories. */
export type TimelineItem = Memory;

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
  heroFraming?: PhotoFraming;
  finalImage?: string;
  finalFraming?: PhotoFraming;
  messages: BirthdayMessages;
  memories: Memory[];
  timeline: TimelineItem[];
  theme: ThemeSettings;
  music: MusicSettings;
}

export type ExperienceMode = 'live' | 'preview' | 'embed' | 'sample' | 'shared';
