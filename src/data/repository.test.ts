import { afterEach, describe, expect, it, vi } from 'vitest';
import { createServerRepository } from './repository';
import { createDefaultConfig } from './defaultConfig';
import { parseDataUrl } from './configMedia';

const PHOTO = 'data:image/webp;base64,UklGRgAAAABXRUJQ';

function mockServer(handler: (method: string, url: string, init: RequestInit) => { status: number; body?: unknown }) {
  const calls: Array<{ method: string; url: string; init: RequestInit }> = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const method = init.method ?? 'GET';
      calls.push({ method, url, init });
      const { status, body } = handler(method, url, init);
      return new Response(body === undefined ? null : JSON.stringify(body), { status });
    }),
  );
  return calls;
}

afterEach(() => vi.unstubAllGlobals());

describe('server repository', () => {
  it('uploads embedded photos once and publishes hosted URLs instead', async () => {
    const calls = mockServer((_method, url) =>
      url.endsWith('/media') ? { status: 201, body: { url: 'https://x.test/media/a.webp' } } : { status: 201, body: { id: 'abc', editToken: 't0k' } },
    );
    const repo = createServerRepository('/api/');
    const config = { ...createDefaultConfig(), heroImage: PHOTO, finalImage: PHOTO };
    const saved = await repo.save(config);
    expect(saved).toEqual({ id: 'abc', editToken: 't0k' });
    expect(calls.filter((c) => c.url === '/api/media')).toHaveLength(1);
    const published = JSON.parse(calls.at(-1)!.init.body as string);
    expect(published.heroImage).toBe('https://x.test/media/a.webp');
    expect(JSON.stringify(published)).not.toContain('data:');
    // The draft itself keeps its embedded photo, so backups stay self-contained.
    expect(config.heroImage).toBe(PHOTO);
  });

  it('updates with the edit token, and publishes a new link when it is rejected', async () => {
    let reject = false;
    const calls = mockServer((method) =>
      method === 'PUT' ? (reject ? { status: 403, body: { error: 'no' } } : { status: 200, body: { id: 'abc' } }) : { status: 201, body: { id: 'new', editToken: 'n3w' } },
    );
    const repo = createServerRepository('/api');
    expect(await repo.save(createDefaultConfig(), 'abc', 't0k')).toEqual({ id: 'abc', editToken: 't0k' });
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('Bearer t0k');
    reject = true;
    expect(await repo.save(createDefaultConfig(), 'abc', 't0k')).toEqual({ id: 'new', editToken: 'n3w' });
  });

  it('shows the server’s own error message', async () => {
    mockServer(() => ({ status: 429, body: { error: 'Too many requests.' } }));
    await expect(createServerRepository('/api').save(createDefaultConfig())).rejects.toThrow('Too many requests.');
  });

  it('decodes data URLs', () => {
    expect(parseDataUrl(PHOTO)?.type).toBe('image/webp');
    expect(new TextDecoder().decode(parseDataUrl(PHOTO)!.bytes.slice(0, 4))).toBe('RIFF');
    expect(parseDataUrl('https://x.test/a.png')).toBeNull();
  });
});
