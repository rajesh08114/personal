import type { BirthdayConfig } from '@/types/birthday';

/**
 * Thin client for the birthday REST API (server mode).
 *
 *   POST {base}/birthdays          body: BirthdayConfig  → { id }
 *   PUT  {base}/birthdays/:id      body: BirthdayConfig  → { id }
 *   GET  {base}/birthdays/:id                            → BirthdayConfig (404 if missing)
 *
 * The base URL comes from VITE_BIRTHDAY_API_URL — never hardcoded.
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

  async function request(path: string, init?: RequestInit): Promise<Response> {
    try {
      return await fetch(`${base}${path}`, {
        ...init,
        headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers },
      });
    } catch {
      throw new ApiError('Couldn’t reach the birthday server. Check your connection and try again.');
    }
  }

  async function readId(res: Response): Promise<string> {
    if (!res.ok) throw new ApiError(`The server couldn’t save this birthday (error ${res.status}).`, res.status);
    const data: unknown = await res.json().catch(() => null);
    const id = data && typeof data === 'object' && 'id' in data ? String((data as { id: unknown }).id) : '';
    if (!id) throw new ApiError('The server didn’t return an id for this birthday.');
    return id;
  }

  return {
    async createExperience(config: BirthdayConfig): Promise<string> {
      return readId(await request('/birthdays', { method: 'POST', body: JSON.stringify(config) }));
    },
    async updateExperience(id: string, config: BirthdayConfig): Promise<string> {
      return readId(await request(`/birthdays/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(config) }));
    },
    /** Returns the raw (un-normalised) payload, or null when the birthday doesn’t exist. */
    async getExperience(id: string): Promise<unknown | null> {
      const res = await request(`/birthdays/${encodeURIComponent(id)}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new ApiError(`The server couldn’t load this birthday (error ${res.status}).`, res.status);
      return res.json();
    },
  };
}

export type BirthdayApi = ReturnType<typeof createBirthdayApi>;
