import { describe, expect, it } from 'vitest';
import { normalizeConfig } from './normalizeConfig';
import { createDefaultConfig } from './defaultConfig';
import { createSampleConfig } from './sampleConfig';
import { getTurningAge, nextBirthday } from '@/utils/date';
import { getReadiness } from '@/utils/readiness';
import { getMemories, getTimeline } from '@/components/experience/content';
import { PLACEHOLDER, isPlaceholder } from './placeholders';

describe('normalizeConfig', () => {
  it('returns defaults for garbage input', () => {
    for (const bad of [null, undefined, 42, 'x', [], { templateId: 'nope' }]) {
      const c = normalizeConfig(bad);
      expect(c.version).toBe(1);
      expect(c.templateId).toBe('aurora');
      expect(Array.isArray(c.memories)).toBe(true);
    }
  });

  it('round-trips a valid config unchanged', () => {
    const sample = createSampleConfig('game-night');
    expect(normalizeConfig(JSON.parse(JSON.stringify(sample)))).toEqual(sample);
  });

  it('drops unsafe media URLs and invalid colours', () => {
    const c = normalizeConfig({
      heroImage: 'javascript:alert(1)',
      music: { url: 'file:///etc/passwd', enabled: 'yes' },
      theme: { preset: 'romantic', primary: 'red' },
    });
    expect(c.heroImage).toBeUndefined();
    expect(c.music.url).toBeUndefined();
    expect(c.music.enabled).toBe(true);
    expect(c.theme.primary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(c.theme.preset).toBe('romantic');
  });

  it('keeps optional date and place on memories, dropping empty ones', () => {
    const c = normalizeConfig({ memories: [{ id: 'a', title: 'x', description: 'y', date: 'June 2021', place: '' }] });
    expect(c.memories[0].date).toBe('June 2021');
    expect(c.memories[0].place).toBeUndefined();
  });

  it('accepts every love template id', () => {
    for (const id of ['our-story', 'two-souls', 'midnight-date', 'our-little-universe'] as const) {
      expect(normalizeConfig({ templateId: id }).templateId).toBe(id);
    }
  });

  it('caps list lengths and text lengths', () => {
    const c = normalizeConfig({
      birthdayPerson: 'x'.repeat(500),
      memories: Array.from({ length: 40 }, (_, i) => ({ id: String(i), title: 't', description: 'd' })),
    });
    expect(c.birthdayPerson.length).toBe(60);
    expect(c.memories.length).toBe(12);
  });
});

describe('dates', () => {
  it('prefers an explicit age', () => {
    expect(getTurningAge({ age: 30, birthdayDate: '2000-01-01' })).toBe(30);
  });
  it('derives the age being celebrated', () => {
    const now = new Date(2026, 9, 4);
    expect(getTurningAge({ birthdayDate: '1999-10-12' }, now)).toBe(27); // upcoming this year
    expect(getTurningAge({ birthdayDate: '1999-09-20' }, now)).toBe(27); // just passed
    expect(getTurningAge({ birthdayDate: '1999-01-10' }, now)).toBe(28); // long passed → next one
  });
  it('returns null without data', () => {
    expect(getTurningAge({})).toBeNull();
  });
  it('finds the next birthday', () => {
    const next = nextBirthday('1999-03-01', new Date(2026, 9, 4));
    expect(next?.getFullYear()).toBe(2027);
  });
});

describe('placeholders & content', () => {
  it('a new birthday is not ready and shows placeholders', () => {
    const c = createDefaultConfig();
    expect(getReadiness(c).every((r) => !r.done)).toBe(true);
    const memories = getMemories(c);
    expect(memories).toHaveLength(6);
    expect(memories[0].titleText).toBe(PLACEHOLDER.memoryTitle);
    expect(isPlaceholder(memories[0].titleText)).toBe(true);
  });

  it('falls back to placeholder slots when every memory is removed', () => {
    const c = { ...createDefaultConfig(), memories: [], timeline: [] };
    expect(getMemories(c, 4)).toHaveLength(4);
    expect(getTimeline(c)).toHaveLength(1);
  });

  it('the sample config is fully ready', () => {
    expect(getReadiness(createSampleConfig()).every((r) => r.done)).toBe(true);
  });

  it('love previews use romantic sample content with dates and places', () => {
    const c = createSampleConfig('two-souls', { love: true });
    expect(c.relationship).toBe('Partner');
    expect(c.memories.every((m) => m.date && m.place)).toBe(true);
    expect(c.timeline[0].date).toBeTruthy();
  });
});
