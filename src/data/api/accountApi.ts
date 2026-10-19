import type { BirthdayConfig } from '@/types/birthday';
import { ApiError } from './birthdayApi';

/**
 * Client for accounts, works and the media library. These endpoints use the login cookie, so the
 * API has to be on the same origin as the app (`NEXT_PUBLIC_BIRTHDAY_API_URL=/api`).
 */
export interface AccountUser {
  id: string;
  email: string;
  name: string;
  /** Whether they have followed the link emailed to this address. */
  emailVerified: boolean;
  createdAt?: string;
}

export interface Session {
  accountsEnabled: boolean;
  registrationOpen: boolean;
  /** Whether the server can send email, which password reset and verification need. */
  emailEnabled?: boolean;
  user: AccountUser | null;
  limits?: { maxWorks: number; maxLibraryBytes: number };
}

export interface WorkSummary {
  id: string;
  title: string;
  templateId: string;
  birthdayPerson: string;
  heroImage?: string;
  shareId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Work extends WorkSummary {
  /** The raw payload; run it through normalizeConfig before use. */
  config: unknown;
}

export interface LibraryItem {
  id: string;
  kind: 'image' | 'audio';
  mime: string;
  size: number;
  name: string;
  createdAt: string;
  /** A same-origin path; the browser sends the login cookie with it. */
  url: string;
}

export interface Library {
  items: LibraryItem[];
  usedBytes: number;
  maxBytes: number;
}

export function createAccountApi(baseUrl: string) {
  const base = baseUrl.replace(/\/+$/, '');

  async function request(path: string, init: RequestInit = {}): Promise<Response> {
    const isJson = typeof init.body === 'string';
    try {
      return await fetch(`${base}${path}`, {
        credentials: 'same-origin',
        ...init,
        headers: {
          Accept: 'application/json',
          ...(isJson ? { 'Content-Type': 'application/json' } : {}),
          ...init.headers,
        },
      });
    } catch {
      throw new ApiError('Couldn’t reach the birthday server. Check your connection and try again.');
    }
  }

  async function fail(res: Response, fallback: string): Promise<never> {
    const data: unknown = await res.json().catch(() => null);
    const message = data && typeof data === 'object' && 'error' in data ? String((data as { error: unknown }).error) : '';
    throw new ApiError(message || `${fallback} (error ${res.status}).`, res.status);
  }

  async function json<T>(res: Response, fallback: string): Promise<T> {
    if (!res.ok) return fail(res, fallback);
    return (await res.json()) as T;
  }

  const body = (value: unknown) => JSON.stringify(value);

  return {
    async session(): Promise<Session> {
      const res = await request('/auth/me');
      // A server without the account routes answers 404: treat it as "no accounts".
      if (res.status === 404) return { accountsEnabled: false, registrationOpen: false, user: null };
      return json<Session>(res, 'Couldn’t check your login');
    },
    async register(email: string, password: string, name: string): Promise<AccountUser> {
      const res = await request('/auth/register', { method: 'POST', body: body({ email, password, name }) });
      return (await json<{ user: AccountUser }>(res, 'Couldn’t create your account')).user;
    },
    async login(email: string, password: string): Promise<AccountUser> {
      const res = await request('/auth/login', { method: 'POST', body: body({ email, password }) });
      return (await json<{ user: AccountUser }>(res, 'Couldn’t log you in')).user;
    },
    async logout(): Promise<void> {
      await request('/auth/logout', { method: 'POST' });
    },
    async forgotPassword(email: string): Promise<void> {
      const res = await request('/auth/forgot', { method: 'POST', body: body({ email }) });
      if (!res.ok) await fail(res, 'Couldn’t send the email');
    },
    async resetPassword(token: string, password: string): Promise<void> {
      const res = await request('/auth/reset', { method: 'POST', body: body({ token, password }) });
      if (!res.ok) await fail(res, 'Couldn’t reset your password');
    },
    async verifyEmail(token: string): Promise<void> {
      const res = await request('/auth/verify', { method: 'POST', body: body({ token }) });
      if (!res.ok) await fail(res, 'Couldn’t confirm your email');
    },
    async resendVerification(): Promise<void> {
      const res = await request('/auth/resend-verification', { method: 'POST' });
      if (!res.ok) await fail(res, 'Couldn’t send the email');
    },
    async updateProfile(name: string): Promise<AccountUser> {
      const res = await request('/auth/profile', { method: 'PATCH', body: body({ name }) });
      return (await json<{ user: AccountUser }>(res, 'Couldn’t save your name')).user;
    },
    /** Signs out every other device, keeping this one. */
    async logoutOthers(): Promise<void> {
      const res = await request('/auth/logout-others', { method: 'POST' });
      if (!res.ok) await fail(res, 'Couldn’t sign out the other devices');
    },
    async changePassword(current: string, next: string): Promise<void> {
      const res = await request('/auth/password', { method: 'POST', body: body({ current, next }) });
      if (!res.ok) await fail(res, 'Couldn’t change your password');
    },
    async deleteAccount(password: string): Promise<void> {
      const res = await request('/auth/account', { method: 'DELETE', body: body({ password }) });
      if (!res.ok) await fail(res, 'Couldn’t delete your account');
    },

    async listWorks(): Promise<WorkSummary[]> {
      const res = await request('/works');
      return (await json<{ works: WorkSummary[] }>(res, 'Couldn’t load your birthdays')).works;
    },
    async getWork(id: string): Promise<Work | null> {
      const res = await request(`/works/${encodeURIComponent(id)}`);
      if (res.status === 404) return null;
      return json<Work>(res, 'Couldn’t open this birthday');
    },
    async createWork(config: BirthdayConfig, title?: string): Promise<Work> {
      const res = await request('/works', { method: 'POST', body: body({ config, title }) });
      return json<Work>(res, 'Couldn’t save this birthday');
    },
    async updateWork(id: string, config: BirthdayConfig, title?: string): Promise<Work> {
      const res = await request(`/works/${encodeURIComponent(id)}`, { method: 'PUT', body: body({ config, title }) });
      return json<Work>(res, 'Couldn’t save this birthday');
    },
    async duplicateWork(id: string): Promise<Work> {
      const res = await request(`/works/${encodeURIComponent(id)}/duplicate`, { method: 'POST' });
      return json<Work>(res, 'Couldn’t duplicate this birthday');
    },
    /** Brings a birthday published before accounts existed into the account. */
    async claimWork(id: string, editToken: string): Promise<Work> {
      const res = await request('/works/claim', { method: 'POST', body: body({ id, editToken }) });
      return json<Work>(res, 'Couldn’t add this birthday');
    },
    async renameWork(id: string, title: string): Promise<void> {
      const res = await request(`/works/${encodeURIComponent(id)}`, { method: 'PUT', body: body({ title }) });
      if (!res.ok) await fail(res, 'Couldn’t rename this birthday');
    },
    async deleteWork(id: string): Promise<void> {
      const res = await request(`/works/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 404) await fail(res, 'Couldn’t delete this birthday');
    },
    async publishWork(id: string): Promise<{ shareId: string }> {
      const res = await request(`/works/${encodeURIComponent(id)}/publish`, { method: 'POST' });
      return json<{ shareId: string }>(res, 'Couldn’t publish this birthday');
    },
    async unpublishWork(id: string): Promise<void> {
      const res = await request(`/works/${encodeURIComponent(id)}/unpublish`, { method: 'POST' });
      if (!res.ok) await fail(res, 'Couldn’t remove the link');
    },

    async library(): Promise<Library> {
      return json<Library>(await request('/library'), 'Couldn’t load your library');
    },
    async uploadToLibrary(bytes: Uint8Array, type: string, name: string): Promise<LibraryItem> {
      const res = await request('/library', {
        method: 'POST',
        body: new Blob([bytes as BlobPart], { type }),
        headers: { 'Content-Type': type, 'X-File-Name': encodeURIComponent(name) },
      });
      return json<LibraryItem>(res, 'The server couldn’t store this file');
    },
    async deleteFromLibrary(id: string): Promise<void> {
      const res = await request(`/library/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 404) await fail(res, 'Couldn’t delete this file');
    },
  };
}

export type AccountApi = ReturnType<typeof createAccountApi>;
