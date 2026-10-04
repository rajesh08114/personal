import type {
  BirthdayConfig,
  Memory,
  TemplateId,
  ThemePresetId,
  TimelineItem,
} from '@/types/birthday';
import { createDefaultConfig, MAX_MEMORIES, MAX_TIMELINE } from './defaultConfig';
import { createId } from '@/utils/id';
import { TEMPLATE_IDS } from './templateIds';

const PRESETS: ThemePresetId[] = [
  'template',
  'romantic',
  'cute',
  'elegant',
  'fun',
  'minimal',
  'colorful',
  'dark-luxury',
  'custom',
];

type Loose = Record<string, unknown>;

const isObj = (v: unknown): v is Loose => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = '', max = 6000): string =>
  typeof v === 'string' ? v.slice(0, max) : fallback;
const optStr = (v: unknown): string | undefined => (typeof v === 'string' && v.length > 0 ? v : undefined);
const hex = (v: unknown, fallback: string): string =>
  typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;

export function isTemplateId(v: unknown): v is TemplateId {
  return typeof v === 'string' && (TEMPLATE_IDS as readonly string[]).includes(v);
}

/** Only allow images/audio we can safely render: data URLs, blob URLs, http(s). */
function mediaUrl(v: unknown): string | undefined {
  const s = optStr(v);
  if (!s) return undefined;
  return /^(data:(image|audio)\/|blob:|https?:\/\/)/i.test(s) ? s : undefined;
}

function memory(v: unknown): Memory | null {
  if (!isObj(v)) return null;
  return {
    id: str(v.id) || createId(8),
    image: mediaUrl(v.image),
    title: str(v.title, '', 120),
    description: str(v.description, '', 400),
    date: optStr(str(v.date, '', 40)),
    place: optStr(str(v.place, '', 60)),
  };
}

function timelineItem(v: unknown): TimelineItem | null {
  return memory(v);
}

/**
 * Turns anything (stored drafts, API responses, imported files, old versions)
 * into a valid BirthdayConfig. Never throws — broken data degrades to defaults.
 */
export function normalizeConfig(input: unknown): BirthdayConfig {
  const d = createDefaultConfig();
  if (!isObj(input)) return d;

  const messages = isObj(input.messages) ? input.messages : {};
  const theme = isObj(input.theme) ? input.theme : {};
  const music = isObj(input.music) ? input.music : {};
  const age = typeof input.age === 'number' && input.age > 0 && input.age < 130 ? Math.round(input.age) : undefined;
  const date = typeof input.birthdayDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.birthdayDate)
    ? input.birthdayDate
    : undefined;

  return {
    version: 1,
    templateId: isTemplateId(input.templateId) ? input.templateId : d.templateId,
    birthdayPerson: str(input.birthdayPerson, '', 60),
    senderName: str(input.senderName, '', 60),
    relationship: str(input.relationship, '', 60),
    birthdayDate: date,
    age,
    heroImage: mediaUrl(input.heroImage),
    finalImage: mediaUrl(input.finalImage),
    messages: {
      intro: str(messages.intro, d.messages.intro, 200),
      main: str(messages.main, d.messages.main),
      wish: str(messages.wish, d.messages.wish, 300),
      surprise: str(messages.surprise, d.messages.surprise, 1200),
      final: str(messages.final, d.messages.final, 300),
    },
    memories: Array.isArray(input.memories)
      ? input.memories.map(memory).filter((m): m is Memory => m !== null).slice(0, MAX_MEMORIES)
      : d.memories,
    timeline: Array.isArray(input.timeline)
      ? input.timeline.map(timelineItem).filter((t): t is TimelineItem => t !== null).slice(0, MAX_TIMELINE)
      : d.timeline,
    theme: {
      preset: PRESETS.includes(theme.preset as ThemePresetId) ? (theme.preset as ThemePresetId) : 'template',
      primary: hex(theme.primary, d.theme.primary),
      secondary: hex(theme.secondary, d.theme.secondary),
      accent: hex(theme.accent, d.theme.accent),
    },
    music: {
      url: mediaUrl(music.url),
      name: optStr(music.name)?.slice(0, 120),
      enabled: typeof music.enabled === 'boolean' ? music.enabled : true,
      volume: typeof music.volume === 'number' ? Math.min(1, Math.max(0, music.volume)) : 0.6,
    },
  };
}
