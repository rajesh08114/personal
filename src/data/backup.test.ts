import { describe, expect, it } from 'vitest';
import { createDefaultConfig } from './defaultConfig';
import { normalizeConfig, normalizeFraming } from './normalizeConfig';
import { BACKUP_FORMAT, BackupError, backupFileName, createBackup, parseBackup } from './backup';
import { buildFramingMap, framingStyle } from '@/components/experience/photoFraming';

const PHOTO = 'data:image/webp;base64,AAAA';

describe('photo framing', () => {
  it('clamps out-of-range values', () => {
    expect(normalizeFraming({ fit: 'contain', position: { x: 140, y: -5 }, zoom: 9, rotation: 80 })).toEqual({
      fit: 'contain',
      position: { x: 100, y: 0 },
      zoom: 4,
      rotation: 45,
    });
  });

  it('drops default or invalid framing', () => {
    expect(normalizeFraming({ fit: 'cover', position: { x: 50, y: 50 }, zoom: 1 })).toBeUndefined();
    expect(normalizeFraming('nope')).toBeUndefined();
  });

  it('survives normalisation on hero, final and memory photos', () => {
    const framing = { fit: 'cover', position: { x: 20, y: 70 }, zoom: 1.8 };
    const c = normalizeConfig({
      ...createDefaultConfig(),
      heroImage: PHOTO,
      heroFraming: framing,
      finalFraming: framing, // no final photo → discarded
      memories: [{ id: 'm1', image: PHOTO, title: 'a', description: '', framing }],
    });
    expect(c.heroFraming).toEqual(framing);
    expect(c.finalFraming).toBeUndefined();
    expect(c.memories[0].framing).toEqual(framing);
  });

  it('maps photos to framing and produces focal-point CSS', () => {
    const c = { ...createDefaultConfig(), heroImage: PHOTO, heroFraming: normalizeFraming({ position: { x: 10, y: 90 }, zoom: 2 }) };
    const f = buildFramingMap(c).get(PHOTO);
    expect(f?.zoom).toBe(2);
    const style = framingStyle(f);
    expect(style?.objectPosition).toBe('10% 90%');
    expect(style?.transformOrigin).toBe('10% 90%');
    expect(style?.transform).toContain('scale(2.0000)');
  });
});

describe('backups', () => {
  it('round-trips the whole experience, including framing and share id', () => {
    const config = normalizeConfig({
      ...createDefaultConfig(),
      birthdayPerson: 'Ana María',
      templateId: 'vinyl-love',
      heroImage: PHOTO,
      heroFraming: { fit: 'contain', position: { x: 30, y: 40 }, zoom: 1.5, rotation: -3 },
      memories: [{ id: 'm1', image: PHOTO, title: 'Lisbon', description: 'Rain', date: 'June 2021', place: 'Lisbon' }],
    });
    const parsed = parseBackup(JSON.stringify(createBackup(config, 'abc123')));
    expect(parsed.shareId).toBe('abc123');
    expect(parsed.config).toEqual(config);
  });

  it('accepts a bare config from older exports', () => {
    const parsed = parseBackup(JSON.stringify({ birthdayPerson: 'Leo' }));
    expect(parsed.config.birthdayPerson).toBe('Leo');
    expect(parsed.shareId).toBeUndefined();
  });

  it('rejects junk and newer versions', () => {
    expect(() => parseBackup('not json')).toThrow(BackupError);
    expect(() => parseBackup(JSON.stringify({ hello: 1 }))).toThrow(BackupError);
    expect(() => parseBackup(JSON.stringify({ format: BACKUP_FORMAT, version: 99, config: {} }))).toThrow(/newer/);
  });

  it('names the file after the birthday person', () => {
    expect(backupFileName({ ...createDefaultConfig(), birthdayPerson: 'Ana María' })).toBe('ana-mar-a-experience.json');
    expect(backupFileName(createDefaultConfig())).toBe('birthday-experience.json');
  });
});
