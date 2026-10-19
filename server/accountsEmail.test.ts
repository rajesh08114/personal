import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadConfig, type ServerConfig } from './config';
import { FileStore } from './store';
import { MemoryAccountStore } from './accounts';
import { createApi, type Api } from './api';
import { Browser, ORIGIN, PASSWORD, PNG, TestMailer, settled } from './testkit';

const NEW_PASSWORD = 'a brand new passphrase';

describe('email: password reset, verification, duplicate and claim', () => {
  let dir: string;
  let store: FileStore;
  let accounts: MemoryAccountStore;
  let mailer: TestMailer;
  let api: Api;
  let config: ServerConfig;
  const logged: Array<Record<string, unknown>> = [];

  const make = (overrides: Partial<ServerConfig> = {}, withMailer = true) => {
    const base = loadConfig({ PUBLIC_ORIGIN: ORIGIN });
    config = { ...base, rateLimits: { read: 1000, write: 1000, upload: 1000, auth: 1000 }, ...overrides };
    accounts = new MemoryAccountStore();
    mailer = new TestMailer();
    logged.length = 0;
    api = createApi(config, store, (e) => logged.push(e as Record<string, unknown>), accounts, withMailer ? mailer : undefined);
    return api;
  };
  const withEmail = (patch: Partial<ServerConfig['email']> = {}) => ({ email: { ...loadConfig({}).email, ...patch } });

  beforeAll(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'bd-email-'));
    store = new FileStore(path.join(dir, 'data'));
    await store.init();
  });
  afterAll(async () => {
    await store.close();
    await rm(dir, { recursive: true, force: true });
  });

  const signUp = async (address: string, ip = '203.0.113.1') => {
    const b = new Browser(api, ip);
    expect((await b.call('POST', '/api/auth/register', { email: address, password: PASSWORD, name: 'Maya' })).status).toBe(201);
    await settled();
    return b;
  };
  const forgot = (b: Browser, address: string) => b.call('POST', '/api/auth/forgot', { email: address });

  describe('forgot password', () => {
    it('is off, and says so, when the server has no email set up', async () => {
      make({}, false);
      const b = new Browser(api);
      expect((await forgot(b, 'maya@example.com')).status).toBe(501);
      expect((await b.call('GET', '/api/auth/me')).json!.emailEnabled).toBe(false);
    });

    it('sends a reset link to a real account, and answers an unknown address the same way', async () => {
      make();
      await signUp('maya@example.com');
      mailer.sent.length = 0;
      const stranger = new Browser(api, '198.51.100.9');
      const known = await forgot(stranger, 'maya@example.com');
      const unknown = await forgot(stranger, 'nobody@example.com');
      await settled();
      expect([known.status, unknown.status]).toEqual([202, 202]);
      expect(known.json).toEqual(unknown.json);

      expect(mailer.sent).toHaveLength(1);
      const { message, token } = mailer.latest('maya@example.com');
      expect(message!.subject).toMatch(/Reset/);
      expect(message!.text).toContain(`${ORIGIN}/reset-password?token=${token}`);
      expect(token!.length).toBeGreaterThan(30);
      expect(mailer.latest('nobody@example.com').message).toBeUndefined();
    });

    it('does not keep the token in the clear', async () => {
      make();
      await signUp('maya@example.com');
      await forgot(new Browser(api, '198.51.100.9'), 'maya@example.com');
      await settled();
      const { token } = mailer.latest('maya@example.com');
      const user = (await accounts.userByEmail('maya@example.com'))!;
      expect(await accounts.consumeToken('reset', token!)).toBeNull(); // only its hash is stored
      void user;
    });

    it('needs a valid address, and a known Origin', async () => {
      make();
      const b = new Browser(api);
      expect((await forgot(b, 'not an email')).status).toBe(400);
      expect((await b.call('POST', '/api/auth/forgot', { email: 'a@example.com' }, { origin: null })).status).toBe(403);
      expect((await b.call('POST', '/api/auth/forgot', { email: 'a@example.com' }, { origin: 'https://evil.example' })).status).toBe(403);
    });

    it('does not wait for, or reveal, a failing mail provider', async () => {
      make();
      await signUp('maya@example.com');
      mailer.failing = true;
      const res = await forgot(new Browser(api, '198.51.100.9'), 'maya@example.com');
      await settled();
      expect(res.status).toBe(202);
      expect(logged).toContainEqual(expect.objectContaining({ level: 'error', message: expect.stringContaining('email failed') }));
      expect(JSON.stringify(logged)).not.toContain('re_');
    });
  });

  describe('reset password', () => {
    const requestLink = async (address: string) => {
      await forgot(new Browser(api, '198.51.100.9'), address);
      await settled();
      return mailer.latest(address).token!;
    };
    const reset = (token: string, password = NEW_PASSWORD, b = new Browser(api, '198.51.100.10')) =>
      b.call('POST', '/api/auth/reset', { token, password });

    it('sets a new password, signs out every device, and the link works once', async () => {
      make();
      const laptop = await signUp('maya@example.com');
      const token = await requestLink('maya@example.com');

      expect((await reset(token)).status).toBe(204);
      // Whoever was signed in with the old password is out.
      expect((await laptop.call('GET', '/api/auth/me')).json!.user).toBeNull();
      const fresh = new Browser(api, '198.51.100.11');
      expect((await fresh.call('POST', '/api/auth/login', { email: 'maya@example.com', password: PASSWORD })).status).toBe(401);
      expect((await fresh.call('POST', '/api/auth/login', { email: 'maya@example.com', password: NEW_PASSWORD })).status).toBe(200);
      // The same link again does nothing.
      expect((await reset(token, 'yet another passphrase')).status).toBe(400);
      expect((await new Browser(api).call('POST', '/api/auth/login', { email: 'maya@example.com', password: NEW_PASSWORD })).status).toBe(200);
    });

    it('tells them by email that the password changed, and counts the address as confirmed', async () => {
      make();
      await signUp('maya@example.com');
      const token = await requestLink('maya@example.com');
      mailer.sent.length = 0;
      await reset(token);
      await settled();
      expect(mailer.sent.map((m) => m.subject)).toEqual(['Your Birthday Studio password was changed']);
      expect((await accounts.userByEmail('maya@example.com'))!.emailVerifiedAt).toBeTruthy();
    });

    it('rejects a weak password without using the link up', async () => {
      make();
      await signUp('maya@example.com');
      const token = await requestLink('maya@example.com');
      expect((await reset(token, 'short')).status).toBe(400);
      expect((await reset(token)).status).toBe(204);
    });

    it('rejects an invented, expired, or wrong-kind token', async () => {
      make(withEmail({ resetLinkMs: -1000 }));
      await signUp('maya@example.com');
      const expired = await requestLink('maya@example.com');
      expect((await reset(expired)).status).toBe(400);
      expect((await reset('x'.repeat(43))).status).toBe(400);
      expect((await reset('x'.repeat(500))).status).toBe(400);
      expect((await new Browser(api).call('POST', '/api/auth/reset', { password: NEW_PASSWORD })).status).toBe(400);

      // A verification link can't reset a password.
      make();
      await signUp('lee@example.com');
      const verifyToken = mailer.latest('lee@example.com').token!;
      expect((await reset(verifyToken)).status).toBe(400);
      expect((await new Browser(api).call('POST', '/api/auth/login', { email: 'lee@example.com', password: PASSWORD })).status).toBe(200);
    });

    it('lets only the newest link work', async () => {
      make();
      await signUp('maya@example.com');
      const first = await requestLink('maya@example.com');
      const second = await requestLink('maya@example.com');
      expect(second).not.toBe(first);
      expect((await reset(first)).status).toBe(400);
      expect((await reset(second)).status).toBe(204);
    });

    it('needs a known Origin', async () => {
      make();
      await signUp('maya@example.com');
      const token = await requestLink('maya@example.com');
      expect((await new Browser(api).call('POST', '/api/auth/reset', { token, password: NEW_PASSWORD }, { origin: null })).status).toBe(403);
    });
  });

  describe('rate limits', () => {
    it('allows a few emails to one address an hour, whether or not it has an account', async () => {
      make(withEmail({ perAddressPerHour: 3, perIpPerHour: 100 }));
      await signUp('maya@example.com'); // the sign-up email already used one of Maya's three
      mailer.sent.length = 0;
      const ask = async (address: string) => {
        const results: number[] = [];
        for (let i = 0; i < 5; i++) results.push((await forgot(new Browser(api, `198.51.100.${i + 20}`), address)).status);
        return results;
      };
      // Different visitors each time, so only the address's own cap is in play.
      expect(await ask('maya@example.com')).toEqual([202, 202, 429, 429, 429]);
      // An address with no account is counted the same way, so the cap reveals nothing about who has one.
      expect(await ask('ghost@example.com')).toEqual([202, 202, 202, 429, 429]);
      await settled();
      expect(mailer.sent.filter((m) => m.to === 'maya@example.com')).toHaveLength(2);
      expect(mailer.sent.filter((m) => m.to === 'ghost@example.com')).toHaveLength(0);
    });

    it('limits how many emails one visitor can ask for in an hour, across addresses', async () => {
      make(withEmail({ perAddressPerHour: 100, perIpPerHour: 4 }));
      const attacker = new Browser(api, '198.51.100.77');
      const results: number[] = [];
      for (let i = 0; i < 6; i++) results.push((await forgot(attacker, `victim${i}@example.com`)).status);
      expect(results).toEqual([202, 202, 202, 202, 429, 429]);
      // Someone else is unaffected.
      expect((await forgot(new Browser(api, '198.51.100.78'), 'victim9@example.com')).status).toBe(202);
    });

    it('also holds the per-minute limit on attempts', async () => {
      make({ ...withEmail({ perAddressPerHour: 100, perIpPerHour: 100 }), rateLimits: { read: 1000, write: 1000, upload: 1000, auth: 2 } });
      const b = new Browser(api, '198.51.100.55');
      expect([(await forgot(b, 'a@example.com')).status, (await forgot(b, 'b@example.com')).status, (await forgot(b, 'c@example.com')).status]).toEqual([202, 202, 429]);
    });

    it('limits guessing reset tokens too', async () => {
      make({ rateLimits: { read: 1000, write: 1000, upload: 1000, auth: 3 } });
      const b = new Browser(api, '198.51.100.66');
      const results: number[] = [];
      for (let i = 0; i < 5; i++) results.push((await b.call('POST', '/api/auth/reset', { token: `guess${i}`, password: NEW_PASSWORD })).status);
      expect(results).toEqual([400, 400, 400, 429, 429]);
    });
  });

  describe('verifying the email address', () => {
    it('sends a link at sign-up, and confirms the address from it', async () => {
      make();
      const b = await signUp('maya@example.com');
      expect((await b.call('GET', '/api/auth/me')).json!.user.emailVerified).toBe(false);
      const { message, token } = mailer.latest('maya@example.com');
      expect(message!.subject).toMatch(/Confirm/);
      expect(message!.text).toContain(`${ORIGIN}/verify-email?token=${token}`);

      expect((await new Browser(api, '198.51.100.30').call('POST', '/api/auth/verify', { token })).status).toBe(204);
      expect((await b.call('GET', '/api/auth/me')).json!.user.emailVerified).toBe(true);
      expect((await new Browser(api, '198.51.100.31').call('POST', '/api/auth/verify', { token })).status).toBe(400); // used up
    });

    it('signs up fine when the mail provider is down, and can send again later', async () => {
      make();
      mailer.failing = true;
      const b = await signUp('maya@example.com');
      expect((await b.call('GET', '/api/auth/me')).json!.user.name).toBe('Maya');
      expect(mailer.sent).toHaveLength(0);
      mailer.failing = false;
      expect((await b.call('POST', '/api/auth/resend-verification')).status).toBe(202);
      await settled();
      expect(mailer.latest('maya@example.com').token).toBeTruthy();
    });

    it('stops resending once confirmed, needs a login, and is rate limited', async () => {
      make(withEmail({ perAddressPerHour: 2 }));
      expect((await new Browser(api).call('POST', '/api/auth/resend-verification')).status).toBe(401);
      const b = await signUp('maya@example.com'); // the sign-up email is the first of the two this hour
      expect((await b.call('POST', '/api/auth/resend-verification')).status).toBe(202);
      expect((await b.call('POST', '/api/auth/resend-verification')).status).toBe(429);

      make();
      const c = await signUp('lee@example.com');
      await c.call('POST', '/api/auth/verify', { token: mailer.latest('lee@example.com').token });
      mailer.sent.length = 0;
      expect((await c.call('POST', '/api/auth/resend-verification')).status).toBe(202);
      await settled();
      expect(mailer.sent).toHaveLength(0);
    });

    it('sends nothing without email set up', async () => {
      make({}, false);
      const b = new Browser(api);
      expect((await b.call('POST', '/api/auth/register', { email: 'maya@example.com', password: PASSWORD })).status).toBe(201);
      expect((await b.call('POST', '/api/auth/resend-verification')).status).toBe(501);
    });
  });

  describe('duplicate', () => {
    it('copies a birthday, unpublished, and keeps it private to its owner', async () => {
      make();
      const alice = await signUp('alice@example.com', '203.0.113.10');
      const bob = await signUp('bob@example.com', '203.0.113.11');
      const photo = (await alice.upload(PNG('dup'))).json!;
      const work = (await alice.call('POST', '/api/works', { title: 'Maya', config: { birthdayPerson: 'Maya', heroImage: photo.url } })).json!;
      await alice.call('POST', `/api/works/${work.id}/publish`);

      const copy = (await alice.call('POST', `/api/works/${work.id}/duplicate`)).json!;
      expect(copy.id).not.toBe(work.id);
      expect(copy.title).toBe('Copy of Maya');
      expect(copy.shareId).toBeUndefined();
      expect(copy.config.heroImage).toBe(photo.url);
      expect((await alice.call('GET', '/api/works')).json!.works).toHaveLength(2);

      expect((await bob.call('POST', `/api/works/${work.id}/duplicate`)).status).toBe(404);
      expect((await bob.call('GET', '/api/works')).json!.works).toEqual([]);
    });

    it('respects the limit on birthdays', async () => {
      make({ accounts: { ...loadConfig({}).accounts, maxWorksPerUser: 1 } });
      const a = await signUp('a@example.com');
      const work = (await a.call('POST', '/api/works', { config: {} })).json!;
      expect((await a.call('POST', `/api/works/${work.id}/duplicate`)).status).toBe(409);
    });
  });

  describe('claiming a birthday published before accounts', () => {
    /** What the old anonymous publishing left behind: a public birthday, a hosted photo, and an edit token. */
    const legacy = async () => {
      const name = await store.putMedia(PNG(`legacy-${Math.random()}`), 'image/png');
      const created = await store.create({
        ...(await import('../src/data/defaultConfig')).createDefaultConfig(),
        birthdayPerson: 'Maya',
        heroImage: `${ORIGIN}/media/${name}`,
      });
      return { ...created, name };
    };

    it('moves it into the account, copies its photos to the library, and keeps the same link', async () => {
      make();
      const maya = await signUp('maya@example.com');
      const old = await legacy();

      const claimed = await maya.call('POST', '/api/works/claim', { id: old.id, editToken: old.editToken });
      expect(claimed.status).toBe(201);
      expect(claimed.json!.shareId).toBe(old.id);
      expect(claimed.json!.birthdayPerson).toBe('Maya');
      expect(claimed.json!.config.heroImage).toMatch(/^\/api\/library\/[a-f0-9]{24}\/file$/);
      expect((await maya.call('GET', claimed.json!.config.heroImage)).status).toBe(200);
      expect((await maya.call('GET', '/api/library')).json!.items).toHaveLength(1);

      // Publishing again updates the very same public link.
      await maya.call('PUT', `/api/works/${claimed.json!.id}`, { config: { ...claimed.json!.config, birthdayPerson: 'Maya M' } });
      const again = (await maya.call('POST', `/api/works/${claimed.json!.id}/publish`)).json!;
      expect(again.shareId).toBe(old.id);
      expect((await new Browser(api).call('GET', `/api/birthdays/${old.id}`)).json!.birthdayPerson).toBe('Maya M');
    });

    it('needs the edit token, and works for one account only', async () => {
      make();
      const maya = await signUp('maya@example.com', '203.0.113.20');
      const eve = await signUp('eve@example.com', '203.0.113.21');
      const old = await legacy();
      const other = await legacy();

      // Wrong token, unknown id and someone else's token all get the same answer.
      const wrong = await eve.call('POST', '/api/works/claim', { id: old.id, editToken: other.editToken });
      const unknown = await eve.call('POST', '/api/works/claim', { id: 'aaaaaaaaaa', editToken: old.editToken });
      expect([wrong.status, unknown.status]).toEqual([403, 403]);
      expect(wrong.json).toEqual(unknown.json);
      expect((await eve.call('POST', '/api/works/claim', { id: old.id })).status).toBe(403);

      expect((await maya.call('POST', '/api/works/claim', { id: old.id, editToken: old.editToken })).status).toBe(201);
      // Once it belongs to Maya, nobody else — even with the token — can take it.
      expect((await eve.call('POST', '/api/works/claim', { id: old.id, editToken: old.editToken })).status).toBe(409);
      expect((await maya.call('POST', '/api/works/claim', { id: old.id, editToken: old.editToken })).status).toBe(409);
      expect((await eve.call('GET', '/api/works')).json!.works).toEqual([]);
    });

    it('needs a login, and room in the library', async () => {
      make({ accounts: { ...loadConfig({}).accounts, maxLibraryBytes: 10 } });
      const old = await legacy();
      expect((await new Browser(api).call('POST', '/api/works/claim', { id: old.id, editToken: old.editToken })).status).toBe(401);
      const maya = await signUp('maya@example.com');
      expect((await maya.call('POST', '/api/works/claim', { id: old.id, editToken: old.editToken })).status).toBe(413);
      expect((await maya.call('GET', '/api/works')).json!.works).toEqual([]);
    });
  });
});
