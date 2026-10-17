import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { BirthdayConfig } from '../src/types/birthday';
import { createId } from '../src/utils/id';

export interface StoredBirthday {
  id: string;
  /** SHA-256 of the edit token. The token itself is only ever shown to the creator. */
  tokenHash: string;
  config: BirthdayConfig;
  createdAt: string;
  updatedAt: string;
}

export const MEDIA_TYPES = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
} as const;
export type MediaType = keyof typeof MEDIA_TYPES;
export const MEDIA_FILE = /^([a-f0-9]{64})\.(webp|jpg|png|mp3|wav)$/;
export const BIRTHDAY_ID = /^[a-km-np-z2-9]{10}$/;

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export function tokenMatches(record: StoredBirthday, token: string | undefined): boolean {
  if (!token) return false;
  const a = Buffer.from(hashToken(token), 'hex');
  const b = Buffer.from(record.tokenHash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * File-system storage: one JSON file per birthday, media stored once by content hash.
 * Writes are atomic (temp file + rename). Designed for a single server process with a
 * persistent volume; swap this class for a database/object-storage implementation to scale out.
 */
export class FileStore {
  private readonly birthdays: string;
  private readonly media: string;

  constructor(dataDir: string) {
    this.birthdays = path.join(dataDir, 'birthdays');
    this.media = path.join(dataDir, 'media');
  }

  async init(): Promise<void> {
    await mkdir(this.birthdays, { recursive: true });
    await mkdir(this.media, { recursive: true });
  }

  private birthdayPath(id: string): string {
    if (!BIRTHDAY_ID.test(id)) throw new Error('Invalid birthday id');
    return path.join(this.birthdays, `${id}.json`);
  }

  private async writeAtomic(file: string, data: string | Buffer): Promise<void> {
    const tmp = `${file}.${randomBytes(6).toString('hex')}.tmp`;
    await writeFile(tmp, data);
    await rename(tmp, file);
  }

  async get(id: string): Promise<StoredBirthday | null> {
    if (!BIRTHDAY_ID.test(id)) return null;
    try {
      return JSON.parse(await readFile(this.birthdayPath(id), 'utf8')) as StoredBirthday;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw err;
    }
  }

  async create(config: BirthdayConfig): Promise<{ id: string; editToken: string }> {
    let id = createId(10);
    while (await this.get(id)) id = createId(10);
    const editToken = randomBytes(24).toString('base64url');
    const now = new Date().toISOString();
    const record: StoredBirthday = {
      id,
      tokenHash: hashToken(editToken),
      config,
      createdAt: now,
      updatedAt: now,
    };
    await this.writeAtomic(this.birthdayPath(id), JSON.stringify(record));
    return { id, editToken };
  }

  async update(record: StoredBirthday, config: BirthdayConfig): Promise<void> {
    const next: StoredBirthday = { ...record, config, updatedAt: new Date().toISOString() };
    await this.writeAtomic(this.birthdayPath(record.id), JSON.stringify(next));
  }

  async delete(id: string): Promise<void> {
    await rm(this.birthdayPath(id), { force: true });
  }

  async putMedia(bytes: Buffer, type: MediaType): Promise<string> {
    const name = `${createHash('sha256').update(bytes).digest('hex')}.${MEDIA_TYPES[type]}`;
    const file = path.join(this.media, name);
    try {
      await stat(file);
    } catch {
      await this.writeAtomic(file, bytes);
    }
    return name;
  }

  /** Absolute path of a stored media file, or null if the name is invalid. */
  mediaPath(name: string): string | null {
    return MEDIA_FILE.test(name) ? path.join(this.media, name) : null;
  }

  /** Deletes uploads that no birthday references and that are older than `olderThanMs`. */
  async collectGarbage(olderThanMs: number): Promise<number> {
    const referenced = new Set<string>();
    for (const file of await readdir(this.birthdays)) {
      if (!file.endsWith('.json')) continue;
      const text = await readFile(path.join(this.birthdays, file), 'utf8').catch(() => '');
      for (const m of text.matchAll(/\/media\/([a-f0-9]{64}\.[a-z0-9]+)/g)) referenced.add(m[1]);
    }
    let removed = 0;
    const cutoff = Date.now() - olderThanMs;
    for (const file of await readdir(this.media)) {
      const full = path.join(this.media, file);
      if (referenced.has(file)) continue;
      const info = await stat(full).catch(() => null);
      if (info && info.mtimeMs < cutoff) {
        await rm(full, { force: true });
        removed++;
      }
    }
    return removed;
  }
}
