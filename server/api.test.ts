import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadConfig } from './config';
import { FileStore } from './store';
import { createApi, type Api } from './api';

const ORIGIN = 'https://birthday.test';
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);

/** The API core on its own, driven with Web-standard Request and Response (as Next.js route handlers do). */
describe('api core', () => {
  let dir: string;
  let store: FileStore;
  let api: Api;
  const call = (path: string, init?: RequestInit) => api.handleApi(new Request(`${ORIGIN}${path}`, init), '1.2.3.4');

  beforeAll(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'bd-api-'));
    store = new FileStore(path.join(dir, 'data'));
    await store.init();
    api = createApi({ ...loadConfig({ PUBLIC_ORIGIN: ORIGIN }), rateLimits: { read: 1000, write: 1000, upload: 1000, auth: 1000 } }, store);
  });
  afterAll(async () => {
    await store.close();
    await rm(dir, { recursive: true, force: true });
  });

  it('answers health, unknown routes and bad methods with JSON', async () => {
    expect(await (await call('/api/health')).json()).toEqual({ ok: true });
    expect((await call('/api/nope')).status).toBe(404);
    expect((await call('/api/birthdays/abcdefghij', { method: 'PATCH' })).status).toBe(405);
  });

  it('uploads, then serves media with Range support', async () => {
    const up = await call('/api/media', { method: 'POST', body: new Uint8Array(PNG) });
    expect(up.status).toBe(201);
    const { url } = (await up.json()) as { url: string };
    const name = url.slice(api.mediaPrefix.length);
    const part = await api.handleMedia(new Request(url, { headers: { Range: 'bytes=0-3' } }), name, '1.2.3.4');
    expect(part.status).toBe(206);
    expect(part.headers.get('content-range')).toBe(`bytes 0-3/${PNG.length}`);
    expect(Buffer.from(await part.arrayBuffer())).toEqual(PNG.subarray(0, 4));
    const head = await api.handleMedia(new Request(url, { method: 'HEAD' }), name, '1.2.3.4');
    expect(head.headers.get('content-length')).toBe(String(PNG.length));
    expect(head.body).toBeNull();
  });

  it('rate limits per IP and sends Retry-After', async () => {
    const limited = createApi(
      { ...loadConfig({ PUBLIC_ORIGIN: ORIGIN }), rateLimits: { read: 2, write: 1000, upload: 1000, auth: 1000 } },
      store,
    );
    const media = (ip: string) => limited.handleMedia(new Request(`${ORIGIN}/media/x`), 'x', ip);
    expect((await media('9.9.9.9')).status).toBe(404);
    expect((await media('9.9.9.9')).status).toBe(404);
    const third = await media('9.9.9.9');
    expect(third.status).toBe(429);
    expect(third.headers.get('retry-after')).toBe('60');
    expect((await media('8.8.8.8')).status).toBe(404);
  });
});

describe('api core: edge cases', () => {
  const ORIGIN = 'https://birthday.test';
  let dir: string;
  let store: FileStore;

  beforeAll(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'bd-api2-'));
    store = new FileStore(path.join(dir, 'data'));
    await store.init();
  });
  afterAll(async () => {
    await store.close();
    await rm(dir, { recursive: true, force: true });
  });

  it('answers a malformed percent-escape in a birthday id with 404, not a server error', async () => {
    const logged: object[] = [];
    const api = createApi(loadConfig({ PUBLIC_ORIGIN: ORIGIN }), store, (e) => logged.push(e));
    for (const bad of ['%', '%E0%A4%A', '%zz']) {
      const res = await api.handleApi(new Request(`${ORIGIN}/api/birthdays/${bad}`), '1.1.1.1');
      expect(res.status).toBe(404);
    }
    expect(logged).toEqual([]);
  });

  it('caps all visitors together, so a spoofed address cannot dodge the limit', async () => {
    const api = createApi(
      { ...loadConfig({ PUBLIC_ORIGIN: ORIGIN }), rateLimits: { read: 1, write: 1000, upload: 1000, auth: 1000 } },
      store,
    );
    // Every request claims a fresh address; the shared ceiling is 20x the per-address limit.
    const statuses: number[] = [];
    for (let i = 0; i < 22; i++)
      statuses.push((await api.handleMedia(new Request(`${ORIGIN}/media/x`), 'x', `10.0.0.${i}`)).status);
    expect(statuses.slice(0, 20).every((s) => s === 404)).toBe(true);
    expect(statuses.slice(20)).toEqual([429, 429]);
  });
});
