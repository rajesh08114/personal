import type {
  BirthdayConfig,
  Memory,
  PhotoFraming,
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

/** Templates that were retired or renamed, mapped to their successor so old links keep working. */
const TEMPLATE_RENAMES: Record<string, TemplateId> = { aurora: 'birthday-edition' };

export function isTemplateId(v: unknown): v is TemplateId {
  return typeof v === 'string' && (TEMPLATE_IDS as readonly string[]).includes(v);
}

/** Only allow images/audio we can safely render: data URLs, blob URLs, http(s). */
function mediaUrl(v: unknown): string | undefined {
  const s = optStr(v);
  if (!s) return undefined;
  // Local static media, people photos, and template previews, data URLs, blob URLs, http(s), and account library URLs.
  return /^(data:(image|audio)\/|blob:|https?:\/\/|\/api\/library\/[a-f0-9]{24}\/file$|\/templates\/[a-z0-9_-]+\.webp$|\/people\/[a-z0-9_-]+\.webp$|\/media\/[a-f0-9]{64}\.webp$)/i.test(s) ? s : undefined;
}

const num = (v: unknown, min: number, max: number, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

const round = (v: number, k: number) => Math.round(v * k) / k;

/** Clamps stored framing; returns undefined for missing/invalid or default (no-op) framing. */
export function normalizeFraming(v: unknown): PhotoFraming | undefined {
  if (!isObj(v)) return undefined;
  const pos = isObj(v.position) ? v.position : {};
  const f: PhotoFraming = {
    fit: v.fit === 'contain' ? 'contain' : 'cover',
    position: { x: round(num(pos.x, 0, 100, 50), 100), y: round(num(pos.y, 0, 100, 50), 100) },
    zoom: round(num(v.zoom, 1, 4, 1), 1000),
  };
  const rotation = round(num(v.rotation, -45, 45, 0), 10);
  if (rotation) f.rotation = rotation;
  const isDefault = f.fit === 'cover' && f.position.x === 50 && f.position.y === 50 && f.zoom === 1 && !f.rotation;
  return isDefault ? undefined : f;
}

function memory(v: unknown): Memory | null {
  if (!isObj(v)) return null;
  const image = mediaUrl(v.image);
  return {
    id: str(v.id) || createId(8),
    image,
    framing: image ? normalizeFraming(v.framing) : undefined,
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
    templateId: isTemplateId(input.templateId)
      ? input.templateId
      : (TEMPLATE_RENAMES[String(input.templateId)] ?? d.templateId),
    birthdayPerson: str(input.birthdayPerson, '', 60),
    senderName: str(input.senderName, '', 60),
    relationship: str(input.relationship, '', 60),
    birthdayDate: date,
    age,
    hemisphere: input.hemisphere === 'south' ? 'south' : undefined,
    heroImage: mediaUrl(input.heroImage),
    heroFraming: mediaUrl(input.heroImage) ? normalizeFraming(input.heroFraming) : undefined,
    finalImage: mediaUrl(input.finalImage),
    finalFraming: mediaUrl(input.finalImage) ? normalizeFraming(input.finalFraming) : undefined,
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
      startSec: typeof music.startSec === 'number' && Number.isFinite(music.startSec) && music.startSec > 0
        ? Math.min(3600, Math.round(music.startSec * 10) / 10)
        : undefined,
      duration: typeof music.duration === 'number' && Number.isFinite(music.duration) && music.duration > 0
        ? Math.min(3600, Math.round(music.duration * 10) / 10)
        : undefined,
    },
  };
}
