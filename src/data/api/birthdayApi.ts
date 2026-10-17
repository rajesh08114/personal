import type { BirthdayConfig } from '@/types/birthday';

/**
 * Thin client for the birthday REST API (server mode). `npm run start` serves it at /api.
 *
 *   POST   {base}/media                     body: photo/song bytes   → { url }
 *   POST   {base}/birthdays                 body: BirthdayConfig     → { id, editToken }
 *   PUT    {base}/birthdays/:id   + token   body: BirthdayConfig     → { id }
 *   DELETE {base}/birthdays/:id   + token                            → 204
 *   GET    {base}/birthdays/:id                                      → BirthdayConfig (404 if missing)
 *
 * The edit token is returned once, on create, and is sent as `Authorization: Bearer <token>`.
 * The base URL comes from VITE_BIRTHDAY_API_URL (an absolute URL or a same-origin path like /api).
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

export function createBirthdayApi(baseUrl: string) {
  const base = baseUrl.replace(/\/+$/, '');

  async function request(path: string, init?: RequestInit & { token?: string }): Promise<Response> {
    const { token, ...rest } = init ?? {};
    const isJson = typeof rest.body === 'string';
    try {
      return await fetch(`${base}${path}`, {
        ...rest,
        headers: {
          Accept: 'application/json',
          ...(isJson ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...rest.headers,
        },
      });
    } catch {
      throw new ApiError('Couldn’t reach the birthday server. Check your connection and try again.');
    }
  }

  /** Prefers the server's own (friendly) error message. */
  async function fail(res: Response, fallback: string): Promise<never> {
    const data: unknown = await res.json().catch(() => null);
    const message = data && typeof data === 'object' && 'error' in data ? String((data as { error: unknown }).error) : '';
    throw new ApiError(message || `${fallback} (error ${res.status}).`, res.status);
  }

  async function readJson<T extends object>(res: Response, fallback: string): Promise<T> {
    if (!res.ok) return fail(res, fallback);
    const data: unknown = await res.json().catch(() => null);
    if (!data || typeof data !== 'object') throw new ApiError('The server sent an unexpected response.');
    return data as T;
  }

  return {
    async uploadMedia(bytes: Uint8Array, type: string): Promise<string> {
      const res = await request('/media', {
        method: 'POST',
        body: new Blob([bytes as BlobPart], { type }),
        headers: { 'Content-Type': type },
      });
      const { url } = await readJson<{ url?: unknown }>(res, 'The server couldn’t store this photo');
      if (typeof url !== 'string') throw new ApiError('The server didn’t return a media URL.');
      return url;
    },
    async createExperience(config: BirthdayConfig): Promise<{ id: string; editToken?: string }> {
      const res = await request('/birthdays', { method: 'POST', body: JSON.stringify(config) });
      const data = await readJson<{ id?: unknown; editToken?: unknown }>(res, 'The server couldn’t save this birthday');
      if (!data.id) throw new ApiError('The server didn’t return an id for this birthday.');
      return { id: String(data.id), editToken: typeof data.editToken === 'string' ? data.editToken : undefined };
    },
    async updateExperience(id: string, config: BirthdayConfig, token?: string): Promise<string> {
      const res = await request(`/birthdays/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(config), token });
      await readJson(res, 'The server couldn’t save this birthday');
      return id;
    },
    async deleteExperience(id: string, token?: string): Promise<void> {
      const res = await request(`/birthdays/${encodeURIComponent(id)}`, { method: 'DELETE', token });
      if (!res.ok && res.status !== 404) await fail(res, 'The server couldn’t remove this birthday');
    },
    /** Returns the raw (un-normalised) payload, or null when the birthday doesn’t exist. */
    async getExperience(id: string): Promise<unknown | null> {
      const res = await request(`/birthdays/${encodeURIComponent(id)}`);
      if (res.status === 404) return null;
      if (!res.ok) return fail(res, 'The server couldn’t load this birthday');
      return res.json();
    },
  };
}

export type BirthdayApi = ReturnType<typeof createBirthdayApi>;
