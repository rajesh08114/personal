import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadConfig, type ServerConfig } from './config';
import { FileStore } from './store';
import { MemoryAccountStore } from './accounts';
import { createApi, type Api } from './api';
import { Browser, ORIGIN, PASSWORD, PNG, WAV } from './testkit';

describe('accounts API', () => {
  let dir: string;
  let store: FileStore;
  let accounts: MemoryAccountStore;
  let api: Api;
  let config: ServerConfig;
  const make = (overrides: Partial<ServerConfig> = {}) => {
    config = { ...loadConfig({ PUBLIC_ORIGIN: ORIGIN }), rateLimits: { read: 1000, write: 1000, upload: 1000, auth: 1000 }, ...overrides };
    accounts = new MemoryAccountStore();
    api = createApi(config, store, undefined, accounts);
    return api;
  };

  beforeAll(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'bd-accounts-'));
    store = new FileStore(path.join(dir, 'data'));
    await store.init();
  });
  afterAll(async () => {
    await store.close();
    await rm(dir, { recursive: true, force: true });
  });

  describe('registration and login', () => {
    it('registers, signs the person in with a locked-down cookie, and knows who they are', async () => {
      make();
      const a = new Browser(api);
      const reg = await a.register('Maya@Example.com', 'Maya');
      expect(reg.status).toBe(201);
      expect(reg.json!.user.email).toBe('maya@example.com');
      expect(reg.json!.user.passwordHash).toBeUndefined();
      const cookie = reg.res.headers.get('set-cookie')!;
      expect(cookie).toMatch(/^__Host-session=/);
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
      expect(cookie).toContain('Secure');
      expect(cookie).toContain('Path=/');
      const me = await a.call('GET', '/api/auth/me');
      expect(me.json!.user.name).toBe('Maya');
      expect(me.json!.accountsEnabled).toBe(true);
    });

    it('never stores the password or the session token in the clear', async () => {
      make();
      const a = new Browser(api);
      await a.register('a@example.com');
      const user = (await accounts.userByEmail('a@example.com'))!;
      expect(user.passwordHash.startsWith('scrypt$')).toBe(true);
      expect(user.passwordHash).not.toContain(PASSWORD);
      const token = a.cookie.split('=')[1];
      expect(await accounts.userForSession(token)).toBeNull(); // only the hash is stored
    });

    it('rejects bad emails, short passwords and duplicate accounts', async () => {
      make();
      const a = new Browser(api);
      expect((await a.call('POST', '/api/auth/register', { email: 'nope', password: PASSWORD })).status).toBe(400);
      expect((await a.call('POST', '/api/auth/register', { email: 'a@example.com', password: 'short' })).status).toBe(400);
      expect((await a.register('a@example.com')).status).toBe(201);
      expect((await new Browser(api).register('A@EXAMPLE.com')).status).toBe(409);
    });

    it('logs in, gives the same error for a wrong password and an unknown email, and logs out', async () => {
      make();
      await new Browser(api).register('a@example.com');
      const b = new Browser(api);
      const wrong = await b.call('POST', '/api/auth/login', { email: 'a@example.com', password: 'wrong password!' });
      const unknown = await b.call('POST', '/api/auth/login', { email: 'who@example.com', password: PASSWORD });
      expect([wrong.status, unknown.status]).toEqual([401, 401]);
      expect(wrong.json!.error).toBe(unknown.json!.error);
      const ok = await b.call('POST', '/api/auth/login', { email: 'a@example.com', password: PASSWORD });
      expect(ok.status).toBe(200);
      expect((await b.call('GET', '/api/auth/me')).json!.user.email).toBe('a@example.com');
      expect((await b.call('POST', '/api/auth/logout')).status).toBe(204);
      expect((await b.call('GET', '/api/auth/me')).json!.user).toBeNull();
    });

    it('stops sessions that expired', async () => {
      make({ accounts: { ...loadConfig({}).accounts, sessionMs: -1000 } });
      const a = new Browser(api);
      await a.register('a@example.com');
      expect((await a.call('GET', '/api/auth/me')).json!.user).toBeNull();
    });

    it('can close registration without locking existing accounts out', async () => {
      make({ accounts: { ...loadConfig({}).accounts, registrationOpen: false } });
      expect((await new Browser(api).register('a@example.com')).status).toBe(403);
    });

    it('limits password guessing per account, whatever the address', async () => {
      make({ rateLimits: { read: 1000, write: 1000, upload: 1000, auth: 3 } });
      for (let i = 0; i < 3; i++) {
        const res = await new Browser(api, `198.51.100.${i}`).call('POST', '/api/auth/login', { email: 'a@example.com', password: 'guess number ' + i });
        expect(res.status).toBe(401);
      }
      const blocked = await new Browser(api, '198.51.100.99').call('POST', '/api/auth/login', { email: 'a@example.com', password: 'guess number 4' });
      expect(blocked.status).toBe(429);
    });

    it('changes a password, and signs out the other devices', async () => {
      make();
      const laptop = new Browser(api);
      await laptop.register('a@example.com');
      const phone = new Browser(api);
      await phone.call('POST', '/api/auth/login', { email: 'a@example.com', password: PASSWORD });
      expect((await laptop.call('POST', '/api/auth/password', { current: 'not my password', next: 'brand new password' })).status).toBe(403);
      expect((await laptop.call('POST', '/api/auth/password', { current: PASSWORD, next: 'brand new password' })).status).toBe(204);
      expect((await laptop.call('GET', '/api/auth/me')).json!.user).not.toBeNull();
      expect((await phone.call('GET', '/api/auth/me')).json!.user).toBeNull();
      const again = new Browser(api);
      expect((await again.call('POST', '/api/auth/login', { email: 'a@example.com', password: 'brand new password' })).status).toBe(200);
    });
  });

  describe('cross-site requests', () => {
    it('refuses writes without a known Origin, even with a valid session', async () => {
      make();
      const a = new Browser(api);
      await a.register('a@example.com');
      const body = { config: {} };
      expect((await a.call('POST', '/api/works', body, { origin: null })).status).toBe(403);
      expect((await a.call('POST', '/api/works', body, { origin: 'https://evil.example' })).status).toBe(403);
      expect((await a.call('POST', '/api/works', body)).status).toBe(201);
      // Reading is a plain GET, which the cookie's SameSite=Lax already keeps same-site.
      expect((await a.call('GET', '/api/works', undefined, { origin: null })).status).toBe(200);
    });

    it('refuses to log in or register from another site', async () => {
      make();
      const a = new Browser(api);
      expect((await a.call('POST', '/api/auth/register', { email: 'a@example.com', password: PASSWORD }, { origin: 'https://evil.example' })).status).toBe(403);
    });
  });

  describe('works', () => {
    it('needs a login for everything', async () => {
      make();
      const anon = new Browser(api);
      const id = 'a'.repeat(24);
      const calls: Array<[string, string]> = [
        ['GET', '/api/works'],
        ['POST', '/api/works'],
        ['GET', `/api/works/${id}`],
        ['PUT', `/api/works/${id}`],
        ['DELETE', `/api/works/${id}`],
        ['POST', `/api/works/${id}/publish`],
        ['GET', '/api/library'],
        ['POST', '/api/library'],
        ['GET', `/api/library/${id}/file`],
        ['DELETE', `/api/library/${id}`],
      ];
      for (const [method, url] of calls) expect((await anon.call(method, url, method === 'POST' || method === 'PUT' ? {} : undefined)).status, `${method} ${url}`).toBe(401);
    });

    it('creates, lists, updates and deletes', async () => {
      make();
      const a = new Browser(api);
      await a.register('a@example.com');
      const created = await a.call('POST', '/api/works', { config: { birthdayPerson: 'Maya', templateId: 'starry-night' } });
      expect(created.status).toBe(201);
      expect(created.json!.title).toBe('Maya’s birthday');
      const id = created.json!.id as string;
      expect((await a.call('GET', '/api/works')).json!.works.map((w: { id: string }) => w.id)).toEqual([id]);
      const put = await a.call('PUT', `/api/works/${id}`, { title: 'For Maya', config: { birthdayPerson: 'Maya M', templateId: 'polaroid-memories' } });
      expect(put.json!.title).toBe('For Maya');
      const got = await a.call('GET', `/api/works/${id}`);
      expect(got.json!.config.birthdayPerson).toBe('Maya M');
      expect(got.json!.templateId).toBe('polaroid-memories');
      expect((await a.call('DELETE', `/api/works/${id}`)).status).toBe(204);
      expect((await a.call('GET', `/api/works/${id}`)).status).toBe(404);
    });

    it('caps how many birthdays one person keeps', async () => {
      make({ accounts: { ...loadConfig({}).accounts, maxWorksPerUser: 2 } });
      const a = new Browser(api);
      await a.register('a@example.com');
      expect((await a.call('POST', '/api/works', { config: {} })).status).toBe(201);
      expect((await a.call('POST', '/api/works', { config: {} })).status).toBe(201);
      expect((await a.call('POST', '/api/works', { config: {} })).status).toBe(409);
    });

    it('drops data URLs and files that are not in the person’s own library', async () => {
      make();
      const a = new Browser(api);
      await a.register('a@example.com');
      const photo = (await a.upload(PNG('mine'))).json!;
      const work = await a.call('POST', '/api/works', {
        config: {
          heroImage: photo.url,
          finalImage: 'data:image/png;base64,AAAA',
          memories: [{ id: 'm1', title: 'x', description: '', image: `/api/library/${'b'.repeat(24)}/file` }],
        },
      });
      expect(work.json!.config.heroImage).toBe(photo.url);
      expect(work.json!.config.finalImage).toBeUndefined();
      expect(work.json!.config.memories[0].image).toBeUndefined();
    });
  });

  describe('isolation between people', () => {
    it('keeps one person’s works and files invisible and untouchable to another', async () => {
      make();
      const alice = new Browser(api, '203.0.113.10');
      const bob = new Browser(api, '203.0.113.11');
      await alice.register('alice@example.com');
      await bob.register('bob@example.com');

      const photo = (await alice.upload(PNG('alice-secret'))).json!;
      const work = (await alice.call('POST', '/api/works', { config: { birthdayPerson: 'Secret', heroImage: photo.url } })).json!;
      const published = (await alice.call('POST', `/api/works/${work.id}/publish`)).json!;
      expect(published.shareId).toBeTruthy();

      // Bob sees nothing of Alice's.
      expect((await bob.call('GET', '/api/works')).json!.works).toEqual([]);
      expect((await bob.call('GET', '/api/library')).json!.items).toEqual([]);
      for (const [method, url, body] of [
        ['GET', `/api/works/${work.id}`],
        ['PUT', `/api/works/${work.id}`, { title: 'hijacked', config: {} }],
        ['DELETE', `/api/works/${work.id}`],
        ['POST', `/api/works/${work.id}/publish`],
        ['POST', `/api/works/${work.id}/unpublish`],
        ['GET', `/api/library/${photo.id}/file`],
        ['DELETE', `/api/library/${photo.id}`],
      ] as Array<[string, string, unknown?]>) {
        expect((await bob.call(method, url, body)).status, `${method} ${url}`).toBe(404);
      }

      // Bob can't pull Alice's file into his own birthday by naming its id.
      const sneaky = await bob.call('POST', '/api/works', { config: { heroImage: photo.url } });
      expect(sneaky.json!.config.heroImage).toBeUndefined();

      // Alice's data is intact.
      expect((await alice.call('GET', `/api/works/${work.id}`)).json!.title).toBe('Secret’s birthday');
      expect((await alice.call('GET', `/api/library/${photo.id}/file`)).status).toBe(200);
      expect((await alice.call('GET', '/api/library')).json!.items).toHaveLength(1);
    });

    it('does not let a work id or file id from the other person be guessed from the error', async () => {
      make();
      const alice = new Browser(api, '203.0.113.10');
      const bob = new Browser(api, '203.0.113.11');
      await alice.register('alice@example.com');
      await bob.register('bob@example.com');
      const work = (await alice.call('POST', '/api/works', { config: {} })).json!;
      const real = await bob.call('GET', `/api/works/${work.id}`);
      const fake = await bob.call('GET', `/api/works/${'0'.repeat(24)}`);
      expect(real.status).toBe(fake.status);
      expect(real.json).toEqual(fake.json);
    });

    it('serves a published birthday’s photos publicly while the library file itself stays private', async () => {
      make();
      const alice = new Browser(api);
      await alice.register('alice@example.com');
      const photo = (await alice.upload(PNG('shared-photo'))).json!;
      const work = (await alice.call('POST', '/api/works', { config: { birthdayPerson: 'Maya', heroImage: photo.url } })).json!;
      const { shareId } = (await alice.call('POST', `/api/works/${work.id}/publish`)).json!;

      // Anyone, with no login, can open the published birthday and its photo.
      const anon = new Browser(api, '198.51.100.7');
      const pub = await anon.call('GET', `/api/birthdays/${shareId}`);
      expect(pub.status).toBe(200);
      expect(pub.json!.heroImage).toMatch(new RegExp(`^${ORIGIN}/media/[a-f0-9]{64}\\.png$`));
      const file = await api.handleMedia(new Request(pub.json!.heroImage), pub.json!.heroImage.slice(`${ORIGIN}/media/`.length), '198.51.100.7');
      expect(file.status).toBe(200);
      // But the library URL, which is what is stored in the editable work, needs the owner's login.
      expect((await anon.call('GET', photo.url)).status).toBe(401);
    });
  });

  describe('library', () => {
    it('uploads once per file, lists, streams with ranges and deletes', async () => {
      make();
      const a = new Browser(api);
      await a.register('a@example.com');
      const first = await a.upload(PNG('one'), 'Holiday.png');
      expect(first.status).toBe(201);
      expect(first.json).toMatchObject({ kind: 'image', mime: 'image/png', name: 'Holiday.png' });
      const again = await a.upload(PNG('one'), 'Renamed.png');
      expect(again.json!.id).toBe(first.json!.id);
      expect((await a.call('GET', '/api/library')).json!.items).toHaveLength(1);

      const part = await api.handleApi(
        new Request(`${ORIGIN}${first.json!.url}`, { headers: { Cookie: a.cookie, Range: 'bytes=1-3' } }),
        '1.1.1.1',
      );
      expect(part.status).toBe(206);
      expect(Buffer.from(await part.arrayBuffer()).toString('latin1')).toBe('PNG');
      expect(part.headers.get('cache-control')).toContain('private');

      expect((await a.call('DELETE', `/api/library/${first.json!.id}`)).status).toBe(204);
      expect((await a.call('GET', `/api/library/${first.json!.id}/file`)).status).toBe(404);
    });

    it('rejects files that only claim to be photos, and cleans file names', async () => {
      make();
      const a = new Browser(api);
      await a.register('a@example.com');
      expect((await a.upload(Buffer.from('<html><script>alert(1)</script></html>'))).status).toBe(415);
      const named = await a.upload(PNG('x'), encodeURIComponent('bad\u0001name\n.png'));
      expect(named.json!.name).toBe('badname.png');
    });

    it('enforces the size limit for each person’s library', async () => {
      make({ accounts: { ...loadConfig({}).accounts, maxLibraryBytes: 1000 } });
      const a = new Browser(api);
      await a.register('a@example.com');
      expect((await a.upload(PNG('small'))).status).toBe(201);
      expect((await a.upload(WAV(2000))).status).toBe(413);
      // Another person has their own room.
      const b = new Browser(api, '203.0.113.50');
      await b.register('b@example.com');
      expect((await b.upload(PNG('small'))).status).toBe(201);
    });

    it('stores a large song as it is and protects files that birthdays still use', async () => {
      make();
      const a = new Browser(api);
      await a.register('a@example.com');
      const song = await a.upload(WAV(12 * 1024 * 1024), 'Song.wav');
      expect(song.status).toBe(201);
      expect(song.json!.size).toBe(12 * 1024 * 1024);
      const work = (await a.call('POST', '/api/works', { config: { music: { url: song.json!.url, name: 'Song', enabled: true, volume: 0.8 } } })).json!;
      expect(work.config.music.url).toBe(song.json!.url);
      const blocked = await a.call('DELETE', `/api/library/${song.json!.id}`);
      expect(blocked.status).toBe(409);
      await a.call('PUT', `/api/works/${work.id}`, { config: {} });
      expect((await a.call('DELETE', `/api/library/${song.json!.id}`)).status).toBe(204);
    });
  });

  describe('publishing', () => {
    it('publishes, updates the same link, and unpublishes', async () => {
      make();
      const a = new Browser(api);
      await a.register('a@example.com');
      const work = (await a.call('POST', '/api/works', { config: { birthdayPerson: 'Maya' } })).json!;
      const first = (await a.call('POST', `/api/works/${work.id}/publish`)).json!;
      expect((await a.call('GET', `/api/birthdays/${first.shareId}`)).json!.birthdayPerson).toBe('Maya');

      await a.call('PUT', `/api/works/${work.id}`, { config: { birthdayPerson: 'Maya M' } });
      // Edits stay private until published again.
      expect((await a.call('GET', `/api/birthdays/${first.shareId}`)).json!.birthdayPerson).toBe('Maya');
      const second = (await a.call('POST', `/api/works/${work.id}/publish`)).json!;
      expect(second.shareId).toBe(first.shareId);
      expect((await a.call('GET', `/api/birthdays/${first.shareId}`)).json!.birthdayPerson).toBe('Maya M');
      expect((await a.call('GET', `/api/works/${work.id}`)).json!.shareId).toBe(first.shareId);

      expect((await a.call('POST', `/api/works/${work.id}/unpublish`)).status).toBe(204);
      expect((await a.call('GET', `/api/birthdays/${first.shareId}`)).status).toBe(404);
      expect((await a.call('GET', `/api/works/${work.id}`)).json!.shareId).toBeUndefined();
    });

    it('takes the link down when the work is deleted', async () => {
      make();
      const a = new Browser(api);
      await a.register('a@example.com');
      const work = (await a.call('POST', '/api/works', { config: {} })).json!;
      const { shareId } = (await a.call('POST', `/api/works/${work.id}/publish`)).json!;
      await a.call('DELETE', `/api/works/${work.id}`);
      expect((await a.call('GET', `/api/birthdays/${shareId}`)).status).toBe(404);
    });
  });

  describe('deleting an account', () => {
    it('removes the person, their works, their library and their published links', async () => {
      make();
      const a = new Browser(api);
      await a.register('a@example.com');
      const photo = (await a.upload(PNG('bye'))).json!;
      const work = (await a.call('POST', '/api/works', { config: { heroImage: photo.url } })).json!;
      const { shareId } = (await a.call('POST', `/api/works/${work.id}/publish`)).json!;
      const user = (await accounts.userByEmail('a@example.com'))!;

      expect((await a.call('DELETE', '/api/auth/account', { password: 'not my password' })).status).toBe(403);
      expect((await a.call('DELETE', '/api/auth/account', { password: PASSWORD })).status).toBe(204);

      expect((await a.call('GET', '/api/auth/me')).json!.user).toBeNull();
      expect(await accounts.userByEmail('a@example.com')).toBeNull();
      expect(await accounts.listWorks(user.id)).toEqual([]);
      expect(await accounts.listMedia(user.id)).toEqual([]);
      expect((await new Browser(api).call('GET', `/api/birthdays/${shareId}`)).status).toBe(404);
      // The email is free to register again.
      expect((await new Browser(api).register('a@example.com')).status).toBe(201);
    });
  });

  describe('anonymous publishing', () => {
    it('is closed once accounts are on, for photos and for birthdays', async () => {
      make();
      const anon = new Browser(api);
      expect((await anon.upload(PNG('anon'))).status).toBe(401);
      expect((await anon.call('POST', '/api/media', undefined, { raw: PNG('anon'), headers: { 'Content-Type': 'image/png' } })).status).toBe(401);
      expect((await anon.call('POST', '/api/birthdays', { birthdayPerson: 'Maya' })).status).toBe(401);
      const a = new Browser(api);
      await a.register('a@example.com');
      expect((await a.call('POST', '/api/birthdays', { birthdayPerson: 'Maya' })).status).toBe(201);
      expect((await a.call('POST', '/api/media', undefined, { raw: PNG('anon'), headers: { 'Content-Type': 'image/png' } })).status).toBe(201);
    });
  });

  describe('caching', () => {
    it('answers an unchanged library file with 304, and still demands the login', async () => {
      make();
      const a = new Browser(api);
      await a.register('a@example.com');
      const photo = (await a.upload(PNG('cached'))).json!;
      const first = await a.call('GET', photo.url);
      const etag = first.res.headers.get('etag')!;
      expect(etag).toMatch(/^"[a-f0-9]{64}"$/);
      expect((await a.call('GET', photo.url, undefined, { headers: { 'If-None-Match': etag } })).status).toBe(304);
      expect((await new Browser(api).call('GET', photo.url, undefined, { headers: { 'If-None-Match': etag } })).status).toBe(401);
    });
  });

  describe('profile', () => {
    it('renames the account, and rejects an empty or very long name', async () => {
      make();
      const a = new Browser(api);
      await a.register('a@example.com', 'Old Name');
      const ok = await a.call('PATCH', '/api/auth/profile', { name: '  New Name  ' });
      expect(ok.status).toBe(200);
      expect(ok.json!.user.name).toBe('New Name');
      expect((await a.call('GET', '/api/auth/me')).json!.user).toMatchObject({ name: 'New Name', email: 'a@example.com' });
      expect((await a.call('PATCH', '/api/auth/profile', { name: '   ' })).status).toBe(400);
      expect((await a.call('PATCH', '/api/auth/profile', { name: 'x'.repeat(61) })).status).toBe(400);
      expect((await a.call('PATCH', '/api/auth/profile', {})).status).toBe(400);
    });

    it('changes only the signed-in person, needs a login and a known Origin', async () => {
      make();
      const a = new Browser(api, '203.0.113.30');
      const b = new Browser(api, '203.0.113.31');
      await a.register('a@example.com', 'Alice');
      await b.register('b@example.com', 'Bob');
      expect((await new Browser(api).call('PATCH', '/api/auth/profile', { name: 'X' })).status).toBe(401);
      expect((await a.call('PATCH', '/api/auth/profile', { name: 'X' }, { origin: null })).status).toBe(403);
      await a.call('PATCH', '/api/auth/profile', { name: 'Alice 2', id: 'someone-else', email: 'b@example.com' });
      expect((await b.call('GET', '/api/auth/me')).json!.user).toMatchObject({ name: 'Bob', email: 'b@example.com' });
      expect((await a.call('GET', '/api/auth/me')).json!.user).toMatchObject({ name: 'Alice 2', email: 'a@example.com' });
    });

    it('reports when the account was made, and signs out the other devices on request', async () => {
      make();
      const laptop = new Browser(api);
      await laptop.register('a@example.com');
      const phone = new Browser(api);
      await phone.call('POST', '/api/auth/login', { email: 'a@example.com', password: PASSWORD });
      const me = (await laptop.call('GET', '/api/auth/me')).json!.user;
      expect(Date.now() - Date.parse(me.createdAt)).toBeLessThan(60_000);

      expect((await new Browser(api).call('POST', '/api/auth/logout-others')).status).toBe(401);
      expect((await laptop.call('POST', '/api/auth/logout-others')).status).toBe(204);
      expect((await laptop.call('GET', '/api/auth/me')).json!.user).not.toBeNull();
      expect((await phone.call('GET', '/api/auth/me')).json!.user).toBeNull();
    });
  });

  describe('without accounts', () => {
    it('tells the app so, and has no account routes', async () => {
      const plain = createApi({ ...loadConfig({ PUBLIC_ORIGIN: ORIGIN }) }, store);
      const me = await plain.handleApi(new Request(`${ORIGIN}/api/auth/me`), '1.1.1.1');
      expect(await me.json()).toEqual({ accountsEnabled: false, user: null });
      expect((await plain.handleApi(new Request(`${ORIGIN}/api/works`), '1.1.1.1')).status).toBe(404);
    });
  });
});
