import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtemp, rm, utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadConfig } from './config';
import { MongoClient } from 'mongodb';
import { FileStore, type Store } from './store';
import { MongoStore } from './mongoStore';
import { createApi, sniffMedia, type Api } from './api';
import { RateLimiter } from './rateLimit';

const WEBP = Buffer.concat([Buffer.from('RIFF\0\0\0\0WEBPVP8 '), Buffer.alloc(32, 1)]);
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);

const MONGO = process.env.MONGODB_TEST_URI;

/**
 * The API suite runs once per storage backend. MongoDB runs when MONGODB_TEST_URI is set
 * (CI starts a MongoDB service), e.g. MONGODB_TEST_URI=mongodb://127.0.0.1:27017 npm test.
 */
const BACKENDS: Array<{
  name: string;
  make: (dir: string) => Store;
  /** Makes an upload look old, for the garbage-collection test. */
  age: (store: Store, name: string, when: Date) => Promise<unknown>;
  cleanup?: () => Promise<unknown>;
}> = [
  {
    name: 'file',
    make: (dir) => new FileStore(path.join(dir, 'data')),
    age: (store, name, when) => utimes((store as FileStore).mediaPath(name)!, when, when),
  },
];
if (MONGO) {
  const dbName = `birthday_test_${process.pid}_${Date.now()}`;
  const client = new MongoClient(MONGO);
  BACKENDS.push({
    name: 'mongodb',
    make: () => new MongoStore(MONGO, dbName),
    age: async (_store, name, when) => {
      await client.connect();
      return client
        .db(dbName)
        .collection('media.files')
        .updateMany({ filename: name }, { $set: { uploadDate: when } });
    },
    cleanup: async () => {
      await client.connect();
      await client.db(dbName).dropDatabase();
      await client.close();
    },
  });
}

describe.each(BACKENDS)('$name storage', ({ make, age, cleanup }) => {
  let dir: string;
  let api: Api;
  const base = 'https://birthday.test';
  let store: Store;
  const ORIGIN = base;

  /** Drives the API in-process with Web Request and Response, the way the Next.js route handlers do. */
  const fetch = (input: string, init?: RequestInit): Promise<Response> => {
    const url = new URL(input);
    const req = new Request(url, init);
    if (url.pathname.startsWith('/media/'))
      return api.handleMedia(req, decodeURIComponent(url.pathname.slice('/media/'.length)), '127.0.0.1');
    if (url.pathname.startsWith('/api/')) return api.handleApi(req, '127.0.0.1');
    return Promise.resolve(new Response(null, { status: 404 }));
  };

  beforeAll(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'bd-server-'));
    const config = {
      ...loadConfig({ DATA_DIR: path.join(dir, 'data'), PUBLIC_ORIGIN: ORIGIN }),
      rateLimits: { read: 1000, write: 1000, upload: 1000, auth: 1000 },
    };
    store = make(dir);
    await store.init();
    api = createApi(config, store);
  });

  afterAll(async () => {
    await store.close();
    await cleanup?.();
    await rm(dir, { recursive: true, force: true });
  });

  const post = (p: string, body: unknown, headers: Record<string, string> = {}) =>
    fetch(base + p, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });

  async function upload(bytes: Buffer, type = 'image/webp') {
    const res = await fetch(`${base}/api/media`, {
      method: 'POST',
      headers: { 'Content-Type': type },
      body: new Uint8Array(bytes),
    });
    return { res, url: ((await res.json()) as { url?: string }).url };
  }

  describe('birthdays API', () => {
    it('creates, reads, updates with the edit token and deletes', async () => {
      const created = await post('/api/birthdays', { birthdayPerson: 'Maya', templateId: 'starry-night' });
      expect(created.status).toBe(201);
      const { id, editToken } = (await created.json()) as { id: string; editToken: string };
      expect(id).toMatch(/^[a-z2-9]{10}$/);
      expect(editToken.length).toBeGreaterThan(20);

      const got = (await (await fetch(`${base}/api/birthdays/${id}`)).json()) as { birthdayPerson: string };
      expect(got.birthdayPerson).toBe('Maya');

      const put = (token?: string) =>
        fetch(`${base}/api/birthdays/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ birthdayPerson: 'Maya R.' }),
        });
      expect((await put()).status).toBe(403);
      expect((await put('wrong-token')).status).toBe(403);
      expect((await put(editToken)).status).toBe(200);

      const del = (token: string) =>
        fetch(`${base}/api/birthdays/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      expect((await del('nope')).status).toBe(403);
      expect((await del(editToken)).status).toBe(204);
      expect((await fetch(`${base}/api/birthdays/${id}`)).status).toBe(404);
    });

    it('never stores the edit token itself', async () => {
      const { id, editToken } = (await (await post('/api/birthdays', {})).json()) as {
        id: string;
        editToken: string;
      };
      const record = await store.get(id);
      expect(JSON.stringify(record)).not.toContain(editToken);
    });

    it('validates content and keeps only media hosted here', async () => {
      const { url } = await upload(WEBP);
      expect(url).toMatch(new RegExp(`^${ORIGIN}/media/[a-f0-9]{64}\\.webp$`));
      const res = await post('/api/birthdays', {
        birthdayPerson: 'x'.repeat(500),
        heroImage: url,
        finalImage: 'https://tracker.example/pixel.png',
        memories: [{ title: 'a', image: 'data:image/png;base64,AAAA' }],
        theme: { primary: 'red' },
        evil: '<script>',
      });
      const { id } = (await res.json()) as { id: string };
      const config = (await (await fetch(`${base}/api/birthdays/${id}`)).json()) as Record<string, unknown>;
      expect(config.heroImage).toBe(url);
      expect(config.finalImage).toBeUndefined();
      expect((config.memories as Array<{ image?: string }>)[0].image).toBeUndefined();
      expect((config.birthdayPerson as string).length).toBe(60);
      expect(config).not.toHaveProperty('evil');
    });

    it('rejects oversized, non-JSON and malformed requests', async () => {
      const big = await post('/api/birthdays', { messages: { main: 'x'.repeat(600 * 1024) } });
      expect(big.status).toBe(413);
      const text = await fetch(`${base}/api/birthdays`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: '{}',
      });
      expect(text.status).toBe(415);
      const bad = await fetch(`${base}/api/birthdays`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{',
      });
      expect(bad.status).toBe(400);
      expect((await fetch(`${base}/api/birthdays/..%2F..%2Fetc`)).status).toBe(404);
    });

    it('refuses writes from other sites but allows its own origin', async () => {
      expect((await post('/api/birthdays', {}, { Origin: 'https://evil.example' })).status).toBe(403);
      const own = await post('/api/birthdays', {}, { Origin: ORIGIN });
      expect(own.status).toBe(201);
      expect(own.headers.get('access-control-allow-origin')).toBe(ORIGIN);
    });
  });

  describe('media', () => {
    it('sniffs real file signatures', () => {
      expect(sniffMedia(WEBP)).toBe('image/webp');
      expect(sniffMedia(PNG)).toBe('image/png');
      expect(sniffMedia(Buffer.from('<svg onload=alert(1)>             '))).toBeNull();
    });

    it('rejects files that only claim to be photos, and stores duplicates once', async () => {
      const fake = await upload(Buffer.from('<html><script>alert(1)</script></html>'), 'image/png');
      expect(fake.res.status).toBe(415);
      const a = await upload(PNG, 'image/png');
      const b = await upload(PNG, 'image/png');
      expect(a.url).toBe(b.url);
    });

    it('serves uploads immutably, with byte ranges for audio players', async () => {
      const { url } = await upload(WEBP);
      const local = url!.replace(ORIGIN, base);
      const full = await fetch(local);
      expect(full.headers.get('content-type')).toBe('image/webp');
      expect(full.headers.get('cache-control')).toContain('immutable');
      const part = await fetch(local, { headers: { Range: 'bytes=0-3' } });
      expect(part.status).toBe(206);
      expect(await part.text()).toBe('RIFF');
      expect((await fetch(`${base}/media/../../package.json`)).status).toBe(404);
    });

    it('garbage-collects old uploads that nothing references', async () => {
      const orphan = Buffer.concat([PNG, Buffer.from('orphan')]);
      const { url } = await upload(orphan, 'image/png');
      const kept = await upload(Buffer.concat([WEBP, Buffer.from('kept')]));
      await post('/api/birthdays', { heroImage: kept.url });
      const old = new Date(Date.now() - 2 * 24 * 3600 * 1000);
      for (const u of [url!, kept.url!]) await age(store, u.split('/').pop()!, old);
      expect(await store.collectGarbage(24 * 3600 * 1000)).toBeGreaterThanOrEqual(1);
      expect((await fetch(url!.replace(ORIGIN, base))).status).toBe(404);
      expect((await fetch(kept.url!.replace(ORIGIN, base))).status).toBe(200);
    });
  });
});

describe('rate limiting', () => {
  it('allows a burst up to the limit, then blocks until the window resets', () => {
    const limiter = new RateLimiter(1000);
    expect([1, 2, 3].map(() => limiter.allow('ip', 2, 0))).toEqual([true, true, false]);
    expect(limiter.allow('other-ip', 2, 0)).toBe(true);
    expect(limiter.allow('ip', 2, 1001)).toBe(true);
  });
});

describe('config', () => {
  it('requires a public origin in production', () => {
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrow(/PUBLIC_ORIGIN/);
    expect(() => loadConfig({ PUBLIC_ORIGIN: 'not a url' })).toThrow();
  });
});
