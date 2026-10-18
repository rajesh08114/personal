import type { BirthdayConfig } from '@/types/birthday';
import { normalizeConfig } from './normalizeConfig';
import { idb, STORES } from './storage/idb';
import { ApiError, createBirthdayApi } from './api/birthdayApi';
import { mapConfigMedia, parseDataUrl } from './configMedia';
import { createId } from '@/utils/id';

/**
 * Where shareable birthdays live:
 *  - 'local'  → this browser's IndexedDB. Links only open here; use backups to move devices.
 *  - 'server' → the REST API at VITE_BIRTHDAY_API_URL. Links open anywhere.
 */
export type StorageMode = 'local' | 'server';

export interface SavedExperience {
  id: string;
  /** Proves the creator owns this birthday (server mode). Kept only in the creator's draft. */
  editToken?: string;
}

/**
 * Persistence boundary for shareable birthdays. UI code only talks to this,
 * so the backend (REST, Firebase, Supabase, Postgres…) can change freely.
 */
export interface ExperienceRepository {
  readonly mode: StorageMode;
  save(config: BirthdayConfig, existingId?: string, editToken?: string): Promise<SavedExperience>;
  get(id: string): Promise<BirthdayConfig | null>;
  remove(id: string, editToken?: string): Promise<void>;
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
    return { id };
  },
  async get(id) {
    const record = await idb.get<StoredBirthday>(STORES.birthdays, id);
    return record ? normalizeConfig(record.config) : null;
  },
  async remove(id) {
    await idb.delete(STORES.birthdays, id);
  },
};

export function createServerRepository(baseUrl: string): ExperienceRepository {
  const api = createBirthdayApi(baseUrl);
  // The draft keeps photos as data URLs; the published copy points at uploaded files instead,
  // which keeps requests small. Each photo is uploaded once per session.
  const uploaded = new Map<string, Promise<string>>();
  const upload = (url: string) => {
    const media = url.startsWith('data:') ? parseDataUrl(url) : null;
    if (!media) return url;
    let pending = uploaded.get(url);
    if (!pending) {
      pending = api.uploadMedia(media.bytes, media.type);
      pending.catch(() => uploaded.delete(url));
      uploaded.set(url, pending);
    }
    return pending;
  };

  return {
    mode: 'server',
    async save(config, existingId, editToken) {
      const published = await mapConfigMedia(config, upload);
      if (existingId && editToken) {
        try {
          return { id: await api.updateExperience(existingId, published, editToken), editToken };
        } catch (err) {
          // The link was deleted, or this browser can't edit it (e.g. an imported backup): publish a new one.
          if (!(err instanceof ApiError && (err.status === 403 || err.status === 404))) throw err;
        }
      }
      return api.createExperience(published);
    },
    async get(id) {
      const raw = await api.getExperience(id);
      return raw === null ? null : normalizeConfig(raw);
    },
    remove: (id, editToken) => api.deleteExperience(id, editToken),
  };
}

const apiUrl = import.meta.env.VITE_BIRTHDAY_API_URL?.trim();
export const experienceRepository: ExperienceRepository = apiUrl ? createServerRepository(apiUrl) : localRepository;
export const storageMode: StorageMode = experienceRepository.mode;

/** Draft (work-in-progress) persistence for the /create builder — always local. */
const DRAFT_KEY = 'current';
export interface StoredDraft {
  config: BirthdayConfig;
  shareId?: string;
  editToken?: string;
}
export const draftStorage = {
  async load(): Promise<StoredDraft | null> {
    const raw = await idb.get<{ config: unknown; shareId?: string; editToken?: string }>(STORES.drafts, DRAFT_KEY);
    return raw ? { config: normalizeConfig(raw.config), shareId: raw.shareId, editToken: raw.editToken } : null;
  },
  save: (draft: StoredDraft) => idb.set(STORES.drafts, DRAFT_KEY, draft),
};
