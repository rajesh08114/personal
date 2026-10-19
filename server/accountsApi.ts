import type { BirthdayConfig } from '../src/types/birthday';
import { normalizeConfig } from '../src/data/normalizeConfig';
import { mapConfigMedia } from '../src/data/configMedia';
import type { ServerConfig } from './config';
import { BIRTHDAY_ID, MEDIA_TYPES, tokenMatches, type Store } from './store';
import type { Readable } from 'node:stream';
import { passwordChangedMessage, resetPasswordMessage, verifyEmailMessage, type Mailer } from './mailer';
import { HttpError, sniffMedia, type Log } from './http';
import { rangedResponse } from './range';
import {
  ACCOUNT_ID,
  MAX_PASSWORD,
  MIN_PASSWORD,
  burnPasswordCheck,
  hashPassword,
  hashSessionToken,
  newSessionToken,
  normalizeEmail,
  verifyPassword,
  type AccountStore,
  type MediaRecord,
  type UserRecord,
  type WorkRecord,
} from './accounts';

/** How a work's config refers to a file in its owner's library. The browser sends its session cookie with it. */
const LIBRARY_URL = /^\/api\/library\/([a-f0-9]{24})\/file$/;
const libraryUrl = (id: string) => `/api/library/${id}/file`;

export interface AccountsDeps {
  config: ServerConfig;
  accounts: AccountStore;
  /** The public store: published birthdays and the media they show. */
  store: Store;
  mediaPrefix: string;
  mailer: Mailer;
  log: Log;
  isAllowedOrigin(origin: string): boolean;
  /** Throws a 429 unless this key is under `max` requests a minute. */
  throttle(key: string, max: number): void;
  /** Counts one use of this key in the current hour. False once it is over `max`. */
  allowHour(key: string, max: number): boolean;
  limit(ip: string, kind: keyof ServerConfig['rateLimits']): void;
  json(status: number, body: unknown, headers?: HeadersInit): Response;
  readBody(req: Request, max: number): Promise<Buffer>;
  readJson(req: Request): Promise<unknown>;
}

export interface AccountsApi {
  /** Handles /api/auth, /api/works and /api/library. Returns null for any other path. */
  handle(req: Request, ip: string, pathname: string): Promise<Response | null>;
  /** The signed-in user for a request, if any. */
  userFor(req: Request): Promise<UserRecord | null>;
}

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return '';
  }
}

const publicUser = (u: UserRecord) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  emailVerified: !!u.emailVerifiedAt,
  createdAt: u.createdAt,
});

async function readAll(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk as Uint8Array));
  return Buffer.concat(chunks);
}

const mediaPayload = (m: MediaRecord) => ({
  id: m.id,
  kind: m.kind,
  mime: m.mime,
  size: m.size,
  name: m.name,
  createdAt: m.createdAt,
  url: libraryUrl(m.id),
});

const workSummary = (w: WorkRecord) => ({
  id: w.id,
  title: w.title,
  templateId: w.config.templateId,
  birthdayPerson: w.config.birthdayPerson,
  heroImage: w.config.heroImage,
  shareId: w.shareId,
  createdAt: w.createdAt,
  updatedAt: w.updatedAt,
});

const workDetail = (w: WorkRecord) => ({ ...workSummary(w), config: w.config });

const cleanTitle = (value: unknown, config?: BirthdayConfig): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value.trim().slice(0, 80);
  if (value === undefined && config) {
    return config.birthdayPerson.trim() ? `${config.birthdayPerson.trim()}’s birthday` : 'Untitled birthday';
  }
  return undefined;
};

/** Printable text only, so a file name can't carry control characters into a page or a header. */
const cleanFileName = (raw: string | null): string => {
  const name = [...safeDecode(raw ?? '')]
    .filter((ch) => ch.codePointAt(0)! > 0x1f && ch.codePointAt(0) !== 0x7f)
    .join('')
    .trim()
    .slice(0, 120);
  return name || 'Untitled';
};

export function createAccountsApi(deps: AccountsDeps): AccountsApi {
  const { config, accounts, store, mediaPrefix, mailer, json } = deps;
  const secure = config.publicOrigin.startsWith('https:');
  // The __Host- prefix pins the cookie to this exact host and to https.
  const COOKIE = secure ? '__Host-session' : 'session';
  const maxAge = Math.floor(config.accounts.sessionMs / 1000);

  const cookie = (value: string, age: number) =>
    `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${secure ? '; Secure' : ''}`;

  function sessionToken(req: Request): string | undefined {
    const header = req.headers.get('cookie') ?? '';
    for (const part of header.split(';')) {
      const [name, ...rest] = part.trim().split('=');
      if (name === COOKIE) return rest.join('=');
    }
    return undefined;
  }

  /** A browser always sends Origin with a POST, PUT or DELETE. Requiring a known one stops cross-site writes. */
  function assertSameSite(req: Request) {
    if (req.method === 'GET' || req.method === 'HEAD') return;
    const origin = req.headers.get('origin');
    if (!origin || !deps.isAllowedOrigin(origin)) {
      throw new HttpError(403, 'Requests from this site aren’t allowed.');
    }
  }

  async function currentUser(req: Request) {
    const token = sessionToken(req);
    if (!token) return null;
    const hash = hashSessionToken(token);
    const user = await accounts.userForSession(hash);
    return user ? { user, hash } : null;
  }

  async function requireUser(req: Request) {
    assertSameSite(req);
    const session = await currentUser(req);
    if (!session) throw new HttpError(401, 'Please log in to continue.');
    return session;
  }

  async function startSession(user: UserRecord, status: number): Promise<Response> {
    const token = newSessionToken();
    await accounts.createSession(hashSessionToken(token), user.id, new Date(Date.now() + config.accounts.sessionMs));
    return json(status, { user: publicUser(user) }, { 'Set-Cookie': cookie(token, maxAge) });
  }

  // ── Email ──────────────────────────────────────────────────────────────────

  const emailOn = () => mailer.mode !== 'off';

  /** Sends in the background: the answer to a request never waits on (or reveals) the mail provider. */
  function inBackground(task: Promise<unknown>) {
    task.catch((err: unknown) =>
      deps.log({ level: 'error', source: 'server', message: `email failed: ${err instanceof Error ? err.message : String(err)}` }),
    );
  }

  async function issueToken(kind: 'reset' | 'verify', user: UserRecord, ttlMs: number): Promise<string> {
    const token = newSessionToken();
    await accounts.createToken(kind, user.id, hashSessionToken(token), new Date(Date.now() + ttlMs));
    return token;
  }

  const sendVerification = (user: UserRecord) =>
    inBackground(
      (async () => {
        const token = await issueToken('verify', user, config.email.verifyLinkMs);
        const url = `${config.publicOrigin}/verify-email?token=${encodeURIComponent(token)}`;
        await mailer.send(verifyEmailMessage(user.email, user.name, url, Math.round(config.email.verifyLinkMs / 3_600_000)));
      })(),
    );

  const sendPasswordChanged = (user: UserRecord) =>
    inBackground(mailer.send(passwordChangedMessage(user.email, user.name, config.publicOrigin)));

  /** The hourly caps on mail to one address and on requests from one visitor. Throws once the visitor is over theirs. */
  function checkEmailLimits(ip: string, address: string) {
    if (!deps.allowHour(`email-ip:${ip}`, config.email.perIpPerHour) || !deps.allowHour(`email:${address}`, config.email.perAddressPerHour)) {
      throw new HttpError(429, 'Too many emails requested. Please wait a while and try again.');
    }
  }

  async function body(req: Request): Promise<Record<string, unknown>> {
    const value = await deps.readJson(req);
    if (!isObject(value)) throw new HttpError(400, 'The request body isn’t valid JSON.');
    return value;
  }

  const password = (value: unknown, label = 'password') => {
    if (typeof value !== 'string' || value.length < MIN_PASSWORD || value.length > MAX_PASSWORD) {
      throw new HttpError(400, `Your ${label} must be ${MIN_PASSWORD} to ${MAX_PASSWORD} characters.`);
    }
    return value;
  };

  /** Keeps only library files this user owns. Anything else (a data URL, another user's file) is dropped. */
  async function cleanWorkConfig(ownerId: string, input: unknown): Promise<BirthdayConfig> {
    const owned = new Set((await accounts.listMedia(ownerId)).map((m) => m.id));
    return mapConfigMedia(normalizeConfig(input), (url) => {
      const id = LIBRARY_URL.exec(url)?.[1];
      return id && owned.has(id) ? url : undefined;
    });
  }

  // ── Auth ───────────────────────────────────────────────────────────────────

  async function auth(req: Request, ip: string, action: string): Promise<Response> {
    if (action === 'me' && req.method === 'GET') {
      const session = await currentUser(req);
      return json(200, {
        accountsEnabled: true,
        registrationOpen: config.accounts.registrationOpen,
        emailEnabled: emailOn(),
        user: session ? publicUser(session.user) : null,
        limits: { maxWorks: config.accounts.maxWorksPerUser, maxLibraryBytes: config.accounts.maxLibraryBytes },
      });
    }

    if (action === 'register' && req.method === 'POST') {
      assertSameSite(req);
      deps.limit(ip, 'auth');
      if (!config.accounts.registrationOpen) throw new HttpError(403, 'New accounts aren’t being accepted right now.');
      const input = await body(req);
      const email = normalizeEmail(input.email);
      if (!email) throw new HttpError(400, 'Enter a valid email address.');
      const pass = password(input.password);
      const name =
        typeof input.name === 'string' && input.name.trim() ? input.name.trim().slice(0, 60) : email.split('@')[0];
      const user = await accounts.createUser({ email, name, passwordHash: await hashPassword(pass) });
      if (!user) throw new HttpError(409, 'An account with this email already exists. Try logging in.');
      // A failure to send must never stop someone signing up; the dashboard offers to send it again.
      if (emailOn() && deps.allowHour(`email:${email}`, config.email.perAddressPerHour)) sendVerification(user);
      return startSession(user, 201);
    }

    if (action === 'login' && req.method === 'POST') {
      assertSameSite(req);
      deps.limit(ip, 'auth');
      const input = await body(req);
      const email = normalizeEmail(input.email);
      const pass = typeof input.password === 'string' ? input.password.slice(0, MAX_PASSWORD) : '';
      // Guessing one account's password is limited on its own, however many addresses the guesses come from.
      if (email) deps.throttle(`login:${email}`, config.rateLimits.auth);
      const user = email ? await accounts.userByEmail(email) : null;
      const ok = user ? await verifyPassword(pass, user.passwordHash) : (await burnPasswordCheck(pass), false);
      if (!user || !ok) throw new HttpError(401, 'Wrong email or password.');
      return startSession(user, 200);
    }

    if (action === 'logout' && req.method === 'POST') {
      assertSameSite(req);
      const token = sessionToken(req);
      if (token) await accounts.deleteSession(hashSessionToken(token));
      return new Response(null, { status: 204, headers: { 'Set-Cookie': cookie('', 0) } });
    }

    if (action === 'profile' && req.method === 'PATCH') {
      const { user } = await requireUser(req);
      deps.limit(ip, 'write');
      const input = await body(req);
      const name = typeof input.name === 'string' ? input.name.trim() : '';
      if (!name || name.length > 60) throw new HttpError(400, 'Enter a name of up to 60 characters.');
      await accounts.setName(user.id, name);
      return json(200, { user: publicUser({ ...user, name }) });
    }

    if (action === 'logout-others' && req.method === 'POST') {
      const { user, hash } = await requireUser(req);
      deps.limit(ip, 'auth');
      await accounts.deleteSessionsForUser(user.id, hash);
      return new Response(null, { status: 204 });
    }

    if (action === 'password' && req.method === 'POST') {
      const { user, hash } = await requireUser(req);
      deps.limit(ip, 'auth');
      const input = await body(req);
      if (typeof input.current !== 'string' || !(await verifyPassword(input.current, user.passwordHash))) {
        throw new HttpError(403, 'Your current password isn’t right.');
      }
      await accounts.setPasswordHash(user.id, await hashPassword(password(input.next, 'new password')));
      await accounts.deleteSessionsForUser(user.id, hash);
      sendPasswordChanged(user);
      return new Response(null, { status: 204 });
    }

    if (action === 'account' && req.method === 'DELETE') {
      const { user } = await requireUser(req);
      deps.limit(ip, 'auth');
      const input = await body(req);
      if (typeof input.password !== 'string' || !(await verifyPassword(input.password, user.passwordHash))) {
        throw new HttpError(403, 'Your password isn’t right.');
      }
      const { shareIds } = await accounts.deleteUser(user.id);
      for (const id of shareIds) await store.delete(id);
      deps.log({ level: 'info', event: 'account-deleted', published: shareIds.length });
      return new Response(null, { status: 204, headers: { 'Set-Cookie': cookie('', 0) } });
    }

    if (action === 'forgot' && req.method === 'POST') {
      assertSameSite(req);
      if (!emailOn()) throw new HttpError(501, 'Resetting a password by email isn’t set up on this server.');
      deps.limit(ip, 'auth');
      const input = await body(req);
      const email = normalizeEmail(input.email);
      if (!email) throw new HttpError(400, 'Enter a valid email address.');
      // Counted for every address, known or not, so the limit says nothing about who has an account.
      checkEmailLimits(ip, email);
      inBackground(
        (async () => {
          const user = await accounts.userByEmail(email);
          if (!user) return;
          const token = await issueToken('reset', user, config.email.resetLinkMs);
          const url = `${config.publicOrigin}/reset-password?token=${encodeURIComponent(token)}`;
          await mailer.send(resetPasswordMessage(user.email, user.name, url, Math.round(config.email.resetLinkMs / 60_000)));
        })(),
      );
      return json(202, { ok: true });
    }

    if (action === 'reset' && req.method === 'POST') {
      assertSameSite(req);
      deps.limit(ip, 'auth');
      const input = await body(req);
      // Checked first, so a password that is too short doesn’t use up the link.
      const pass = password(input.password, 'new password');
      const userId =
        typeof input.token === 'string' && input.token.length <= 200
          ? await accounts.consumeToken('reset', hashSessionToken(input.token))
          : null;
      const user = userId ? await accounts.userById(userId) : null;
      if (!user) throw new HttpError(400, 'This link has expired or was already used. Ask for a new one.');
      await accounts.setPasswordHash(user.id, await hashPassword(pass));
      // Whoever had the old password is signed out everywhere, and any other link stops working.
      await accounts.deleteSessionsForUser(user.id);
      await accounts.deleteTokens(user.id);
      await accounts.markEmailVerified(user.id); // they just proved they can read this inbox
      sendPasswordChanged(user);
      return new Response(null, { status: 204 });
    }

    if (action === 'verify' && req.method === 'POST') {
      assertSameSite(req);
      deps.limit(ip, 'auth');
      const input = await body(req);
      const userId =
        typeof input.token === 'string' && input.token.length <= 200
          ? await accounts.consumeToken('verify', hashSessionToken(input.token))
          : null;
      if (!userId) throw new HttpError(400, 'This link has expired or was already used.');
      await accounts.markEmailVerified(userId);
      return new Response(null, { status: 204 });
    }

    if (action === 'resend-verification' && req.method === 'POST') {
      const { user } = await requireUser(req);
      if (!emailOn()) throw new HttpError(501, 'Email isn’t set up on this server.');
      deps.limit(ip, 'auth');
      if (!user.emailVerifiedAt) {
        checkEmailLimits(ip, user.email);
        sendVerification(user);
      }
      return json(202, { ok: true });
    }

    throw new HttpError(404, 'Not found.');
  }

  // ── Works ──────────────────────────────────────────────────────────────────

  /** Copies the work's library files into the public store and publishes (or updates) its birthday. */
  async function publish(work: WorkRecord): Promise<string> {
    const config = await mapConfigMedia(work.config, async (url) => {
      const id = LIBRARY_URL.exec(url)?.[1];
      const file = id ? await accounts.readMedia(work.ownerId, id) : null;
      return file ? `${mediaPrefix}${await store.putMedia(file.bytes, file.record.mime)}` : undefined;
    });
    const existing = work.shareId ? await store.get(work.shareId) : null;
    if (existing) {
      await store.update(existing, config);
      return existing.id;
    }
    return (await store.create(config)).id;
  }

  async function assertRoomForAnotherWork(ownerId: string) {
    if ((await accounts.listWorks(ownerId)).length >= config.accounts.maxWorksPerUser) {
      throw new HttpError(409, `You can keep up to ${config.accounts.maxWorksPerUser} birthdays. Delete one to make room.`);
    }
  }

  /**
   * Brings a birthday published before accounts existed into the signed-in user's account. Proving it
   * is theirs takes the edit token that only the browser that published it holds. Its photos and song
   * are copied into their library, and the same public link keeps working.
   */
  async function claim(req: Request, ip: string, user: UserRecord): Promise<Response> {
    deps.limit(ip, 'write');
    const input = await body(req);
    const id = typeof input.id === 'string' ? input.id : '';
    const record = BIRTHDAY_ID.test(id) ? await store.get(id) : null;
    // One answer for "no such birthday" and "wrong token", so this can’t be used to probe for ids.
    if (!record || !tokenMatches(record, typeof input.editToken === 'string' ? input.editToken : undefined)) {
      throw new HttpError(403, 'This birthday can’t be added with that link.');
    }
    if (await accounts.workByShareId(id)) throw new HttpError(409, 'This birthday is already in an account.');
    await assertRoomForAnotherWork(user.id);

    const extensions = new Map<string, keyof typeof MEDIA_TYPES>(
      (Object.entries(MEDIA_TYPES) as Array<[keyof typeof MEDIA_TYPES, string]>).map(([mime, ext]) => [ext, mime]),
    );
    let usage = await accounts.mediaUsage(user.id);
    let turn: Promise<unknown> = Promise.resolve(); // one file at a time, so the library limit can’t be raced past
    const cfg = await mapConfigMedia(record.config, (url) => {
      const result = turn.then(async () => {
        if (!url.startsWith(mediaPrefix)) return undefined;
        const name = url.slice(mediaPrefix.length);
        const mime = extensions.get(name.split('.').pop() ?? '');
        const file = mime ? await store.openMedia(name) : null;
        if (!mime || !file) return undefined;
        const bytes = await readAll(file.stream());
        usage += bytes.length;
        if (usage > config.accounts.maxLibraryBytes) throw new HttpError(413, 'Your library doesn’t have room for this birthday’s photos and music.');
        return libraryUrl((await accounts.putMedia(user.id, bytes, mime, `Imported.${MEDIA_TYPES[mime]}`)).id);
      });
      turn = result.catch(() => undefined);
      return result;
    });
    const created = await accounts.createWork(user.id, cleanTitle(undefined, cfg)!, cfg, id);
    return json(201, workDetail(created));
  }

  async function works(req: Request, ip: string, parts: string[]): Promise<Response> {
    const { user } = await requireUser(req);
    const [rawId, action] = parts;

    if (!rawId) {
      if (req.method === 'GET') {
        deps.limit(ip, 'read');
        return json(200, { works: (await accounts.listWorks(user.id)).map(workSummary) });
      }
      if (req.method === 'POST') {
        deps.limit(ip, 'write');
        const input = await body(req);
        if ((await accounts.listWorks(user.id)).length >= config.accounts.maxWorksPerUser) {
          throw new HttpError(409, `You can keep up to ${config.accounts.maxWorksPerUser} birthdays. Delete one to make room.`);
        }
        const cfg = await cleanWorkConfig(user.id, input.config);
        const created = await accounts.createWork(user.id, cleanTitle(input.title) ?? cleanTitle(undefined, cfg)!, cfg);
        return json(201, workDetail(created));
      }
      throw new HttpError(405, 'Method not allowed.');
    }

    if (rawId === 'claim' && !action && req.method === 'POST') return claim(req, ip, user);

    const id = safeDecode(rawId);
    if (!ACCOUNT_ID.test(id)) throw new HttpError(404, 'This birthday doesn’t exist.');
    const work = await accounts.getWork(user.id, id);
    if (!work) throw new HttpError(404, 'This birthday doesn’t exist.');

    if (!action) {
      if (req.method === 'GET') {
        deps.limit(ip, 'read');
        return json(200, workDetail(work));
      }
      if (req.method === 'PUT') {
        deps.limit(ip, 'write');
        const input = await body(req);
        const cfg = input.config === undefined ? undefined : await cleanWorkConfig(user.id, input.config);
        const updated = await accounts.updateWork(user.id, id, { title: cleanTitle(input.title), config: cfg });
        return json(200, workDetail(updated!));
      }
      if (req.method === 'DELETE') {
        deps.limit(ip, 'write');
        await accounts.deleteWork(user.id, id);
        if (work.shareId) await store.delete(work.shareId);
        return new Response(null, { status: 204 });
      }
      throw new HttpError(405, 'Method not allowed.');
    }

    if (action === 'duplicate' && req.method === 'POST') {
      deps.limit(ip, 'write');
      await assertRoomForAnotherWork(user.id);
      const copy = await accounts.createWork(user.id, `Copy of ${work.title}`.slice(0, 80), work.config);
      return json(201, workDetail(copy));
    }

    if (action === 'publish' && req.method === 'POST') {
      deps.limit(ip, 'write');
      const shareId = await publish(work);
      await accounts.updateWork(user.id, id, { shareId });
      return json(200, { shareId, path: `/birthday/${shareId}` });
    }

    if (action === 'unpublish' && req.method === 'POST') {
      deps.limit(ip, 'write');
      if (work.shareId) await store.delete(work.shareId);
      await accounts.updateWork(user.id, id, { shareId: null });
      return new Response(null, { status: 204 });
    }

    throw new HttpError(404, 'Not found.');
  }

  // ── Library ────────────────────────────────────────────────────────────────

  async function library(req: Request, ip: string, parts: string[]): Promise<Response> {
    const { user } = await requireUser(req);
    const [rawId, action] = parts;

    if (!rawId) {
      if (req.method === 'GET') {
        deps.limit(ip, 'read');
        const items = await accounts.listMedia(user.id);
        return json(200, {
          items: items.map(mediaPayload),
          usedBytes: items.reduce((sum, m) => sum + m.size, 0),
          maxBytes: config.accounts.maxLibraryBytes,
        });
      }
      if (req.method === 'POST') {
        deps.limit(ip, 'upload');
        const bytes = await deps.readBody(req, Math.max(config.maxImageBytes, config.maxAudioBytes));
        const mime = sniffMedia(bytes);
        if (!mime) throw new HttpError(415, 'Only JPG, PNG or WEBP photos and MP3 or WAV songs can be uploaded.');
        if (bytes.length > (mime.startsWith('image/') ? config.maxImageBytes : config.maxAudioBytes)) {
          throw new HttpError(413, 'That upload is too large.');
        }
        if ((await accounts.mediaUsage(user.id)) + bytes.length > config.accounts.maxLibraryBytes) {
          throw new HttpError(413, 'Your library is full. Delete something to make room.');
        }
        const record = await accounts.putMedia(user.id, bytes, mime, cleanFileName(req.headers.get('x-file-name')));
        return json(201, mediaPayload(record));
      }
      throw new HttpError(405, 'Method not allowed.');
    }

    const id = safeDecode(rawId);
    if (!ACCOUNT_ID.test(id)) throw new HttpError(404, 'Not found.');

    if (action === 'file' && (req.method === 'GET' || req.method === 'HEAD')) {
      deps.limit(ip, 'read');
      const file = await accounts.readMedia(user.id, id);
      if (!file) throw new HttpError(404, 'Not found.');
      // Revalidated on every use, so a deleted file stops loading; unchanged files cost only a 304.
      const etag = `"${file.record.sha256}"`;
      if (req.headers.get('if-none-match') === etag) {
        return new Response(null, { status: 304, headers: { ETag: etag, 'Cache-Control': 'private, no-cache' } });
      }
      return rangedResponse(
        req,
        file.bytes.length,
        {
          'Content-Type': file.record.mime,
          ETag: etag,
          // Private to this user: never shared by a cache.
          'Cache-Control': 'private, no-cache',
          'Accept-Ranges': 'bytes',
          'X-Content-Type-Options': 'nosniff',
          'X-Robots-Tag': 'noindex',
        },
        (start, end) => new Uint8Array(start === undefined ? file.bytes : file.bytes.subarray(start, end! + 1)),
      );
    }

    if (!action && req.method === 'DELETE') {
      deps.limit(ip, 'write');
      if (!(await accounts.getMedia(user.id, id))) throw new HttpError(404, 'Not found.');
      const url = libraryUrl(id);
      const using = (await accounts.listWorks(user.id)).filter((w) => JSON.stringify(w.config).includes(url));
      if (using.length) {
        throw new HttpError(
          409,
          `This file is used by ${using.length === 1 ? `“${using[0].title}”` : `${using.length} of your birthdays`}. Remove it there first.`,
        );
      }
      await accounts.deleteMedia(user.id, id);
      return new Response(null, { status: 204 });
    }

    throw new HttpError(405, 'Method not allowed.');
  }

  return {
    async userFor(req) {
      return (await currentUser(req))?.user ?? null;
    },
    async handle(req, ip, pathname) {
      const parts = pathname.split('/').filter(Boolean); // ['api', area, ...]
      const [, area, ...rest] = parts;
      if (area === 'auth' && rest.length === 1) return auth(req, ip, rest[0]);
      if (area === 'works') return works(req, ip, rest);
      if (area === 'library') return library(req, ip, rest);
      return null;
    },
  };
}
