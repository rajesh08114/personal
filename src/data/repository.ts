import type { BirthdayConfig } from '@/types/birthday';
import { normalizeConfig } from './normalizeConfig';
import { idb, STORES } from './storage/idb';
import { createId } from '@/utils/id';

/**
 * Persistence boundary for shareable birthdays.
 * Swap the implementation (REST, Firebase, Supabase, Postgres…) without touching UI code.
 */
export interface BirthdayRepository {
  readonly kind: 'local' | 'remote';
  save(config: BirthdayConfig, existingId?: string): Promise<string>;
  get(id: string): Promise<BirthdayConfig | null>;
}

interface StoredBirthday {
  id: string;
  config: BirthdayConfig;
  createdAt: string;
  updatedAt: string;
}

/** Stores birthdays in this browser's IndexedDB. Links only open on this device. */
export const localRepository: BirthdayRepository = {
  kind: 'local',
  async save(config, existingId) {
    const id = existingId ?? createId(10);
    const now = new Date().toISOString();
    const prev = existingId ? await idb.get<StoredBirthday>(STORES.birthdays, existingId) : undefined;
    const record: StoredBirthday = { id, config, createdAt: prev?.createdAt ?? now, updatedAt: now };
    await idb.set(STORES.birthdays, id, record);
    return id;
  },
  async get(id) {
    const record = await idb.get<StoredBirthday>(STORES.birthdays, id);
    return record ? normalizeConfig(record.config) : null;
  },
};

/**
 * REST implementation. Expected API:
 *   POST {base}/birthdays            body: BirthdayConfig   → { id }
 *   PUT  {base}/birthdays/:id        body: BirthdayConfig   → { id }
 *   GET  {base}/birthdays/:id                               → BirthdayConfig
 */
export function createRestRepository(baseUrl: string): BirthdayRepository {
  const base = baseUrl.replace(/\/$/, '');
  return {
    kind: 'remote',
    async save(config, existingId) {
      const res = await fetch(existingId ? `${base}/birthdays/${existingId}` : `${base}/birthdays`, {
        method: existingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error(`Saving failed (${res.status})`);
      const data: unknown = await res.json();
      const id = typeof data === 'object' && data && 'id' in data ? String((data as { id: unknown }).id) : '';
      if (!id) throw new Error('The server did not return a birthday id.');
      return id;
    },
    async get(id) {
      const res = await fetch(`${base}/birthdays/${encodeURIComponent(id)}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Loading failed (${res.status})`);
      return normalizeConfig(await res.json());
    },
  };
}

const apiUrl = import.meta.env.VITE_BIRTHDAY_API_URL as string | undefined;
export const birthdayRepository: BirthdayRepository = apiUrl ? createRestRepository(apiUrl) : localRepository;

/** Draft (work-in-progress) persistence for the /create builder. */
const DRAFT_KEY = 'current';
export const draftStorage = {
  async load(): Promise<{ config: BirthdayConfig; shareId?: string } | null> {
    const raw = await idb.get<{ config: unknown; shareId?: string }>(STORES.drafts, DRAFT_KEY);
    return raw ? { config: normalizeConfig(raw.config), shareId: raw.shareId } : null;
  },
  save: (config: BirthdayConfig, shareId?: string) => idb.set(STORES.drafts, DRAFT_KEY, { config, shareId }),
};
