import type { BirthdayConfig } from '@/types/birthday';
import { normalizeConfig } from './normalizeConfig';
import { idb, STORES } from './storage/idb';
import { createBirthdayApi } from './api/birthdayApi';
import { createId } from '@/utils/id';

/**
 * Where shareable birthdays live:
 *  - 'local'  → this browser's IndexedDB. Links only open here; use backups to move devices.
 *  - 'server' → the REST API at VITE_BIRTHDAY_API_URL. Links open anywhere.
 */
export type StorageMode = 'local' | 'server';

/**
 * Persistence boundary for shareable birthdays. UI code only talks to this,
 * so the backend (REST, Firebase, Supabase, Postgres…) can change freely.
 */
export interface ExperienceRepository {
  readonly mode: StorageMode;
  save(config: BirthdayConfig, existingId?: string): Promise<string>;
  get(id: string): Promise<BirthdayConfig | null>;
}

interface StoredBirthday {
  id: string;
  config: BirthdayConfig;
  createdAt: string;
  updatedAt: string;
}

export const localRepository: ExperienceRepository = {
  mode: 'local',
  async save(config, existingId) {
    const id = existingId ?? createId(10);
    const now = new Date().toISOString();
    const prev = existingId ? await idb.get<StoredBirthday>(STORES.birthdays, existingId) : undefined;
    await idb.set(STORES.birthdays, id, { id, config, createdAt: prev?.createdAt ?? now, updatedAt: now } satisfies StoredBirthday);
    return id;
  },
  async get(id) {
    const record = await idb.get<StoredBirthday>(STORES.birthdays, id);
    return record ? normalizeConfig(record.config) : null;
  },
};

export function createServerRepository(baseUrl: string): ExperienceRepository {
  const api = createBirthdayApi(baseUrl);
  return {
    mode: 'server',
    save: (config, existingId) => (existingId ? api.updateExperience(existingId, config) : api.createExperience(config)),
    async get(id) {
      const raw = await api.getExperience(id);
      return raw === null ? null : normalizeConfig(raw);
    },
  };
}

const apiUrl = import.meta.env.VITE_BIRTHDAY_API_URL?.trim();
export const experienceRepository: ExperienceRepository = apiUrl ? createServerRepository(apiUrl) : localRepository;
export const storageMode: StorageMode = experienceRepository.mode;

/** Draft (work-in-progress) persistence for the /create builder — always local. */
const DRAFT_KEY = 'current';
export const draftStorage = {
  async load(): Promise<{ config: BirthdayConfig; shareId?: string } | null> {
    const raw = await idb.get<{ config: unknown; shareId?: string }>(STORES.drafts, DRAFT_KEY);
    return raw ? { config: normalizeConfig(raw.config), shareId: raw.shareId } : null;
  },
  save: (config: BirthdayConfig, shareId?: string) => idb.set(STORES.drafts, DRAFT_KEY, { config, shareId }),
};
