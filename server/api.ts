import { Readable } from 'node:stream';
import type { BirthdayConfig } from '../src/types/birthday';
import { normalizeConfig } from '../src/data/normalizeConfig';
import { mapConfigMedia } from '../src/data/configMedia';
import type { ServerConfig } from './config';
import { BIRTHDAY_ID, MEDIA_FILE, MEDIA_TYPES, tokenMatches, type Store } from './store';
import { RateLimiter } from './rateLimit';
import { HttpError, sniffMedia, type Log } from './http';
import type { AccountStore } from './accounts';
import { createAccountsApi } from './accountsApi';
import { rangedResponse } from './range';
import { createMailer, type Mailer } from './mailer';

export { HttpError, sniffMedia, type Log };

/**
 * The HTTP API (`/api/*` and `/media/*`) written against the standard Request and Response,
 * so the same code runs inside Next.js route handlers and in plain tests.
 */

/** All visitors together may make this many times the per-address limit. */
const GLOBAL_LIMIT_FACTOR = 20;

/** Decodes a path segment; a malformed escape like `%E0%A4` gives an empty string, which no id matches. */
function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return '';
  }
}


export interface Api {
  /** Hosted media URL prefix, e.g. https://birthday.example.com/media/ */
  mediaPrefix: string;
  /** Handles one `/api/*` request. Never throws: failures become JSON error responses. */
  handleApi(req: Request, ip: string): Promise<Response>;
  /** Handles `GET` / `HEAD` of `/media/<name>`. Never throws. */
  handleMedia(req: Request, name: string, ip: string): Promise<Response>;
  /** Throws a 429 HttpError when `ip` is over the limit for this kind of request. */
  limit(ip: string, kind: keyof ServerConfig['rateLimits']): void;
  /** The same response `handleApi` gives for any failure. */
  errorResponse(err: unknown): Response;
}

export function createApi(
  config: ServerConfig,
  store: Store,
  log: Log = () => {},
  accounts?: AccountStore,
  mailer: Mailer = createMailer({ ...config.email, mode: 'off' }, log),
): Api {
  const limiter = new RateLimiter(60_000);
  const hourly = new RateLimiter(60 * 60_000);
  const mediaPrefix = `${config.publicOrigin}/media/`;
  const allowedOrigins = new Set([config.publicOrigin, ...config.corsOrigins]);

  function limit(ip: string, kind: keyof ServerConfig['rateLimits']) {
    const max = config.rateLimits[kind];
    // The second, shared bucket is a backstop for when the address can't be trusted (a spoofed X-Forwarded-For).
    if (!limiter.allow(`${kind}:${ip}`, max) || !limiter.allow(`${kind}:*`, max * GLOBAL_LIMIT_FACTOR)) {
      throw new HttpError(429, 'Too many requests. Please wait a minute and try again.');
    }
  }

  function json(status: number, body: unknown, extra?: HeadersInit): Response {
    const headers = new Headers(extra);
    headers.set('Content-Type', 'application/json; charset=utf-8');
    headers.set('Cache-Control', 'no-store');
    headers.set('X-Robots-Tag', 'noindex');
    return new Response(JSON.stringify(body), { status, headers });
  }

  function errorResponse(err: unknown): Response {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) log({ level: 'error', source: 'server', message: String((err as Error)?.stack ?? err) });
    return json(
      status,
      { error: status === 500 ? 'Something went wrong on the server.' : (err as Error).message },
      status === 429 ? { 'Retry-After': '60' } : undefined,
    );
  }

  async function readBody(req: Request, max: number): Promise<Buffer> {
    const declared = Number(req.headers.get('content-length'));
    if (declared > max) throw new HttpError(413, 'That upload is too large.');
    if (!req.body) return Buffer.alloc(0);
    const chunks: Buffer[] = [];
    let size = 0;
    const reader = req.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > max) {
        void reader.cancel().catch(() => undefined);
        throw new HttpError(413, 'That upload is too large.');
      }
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks);
  }

  async function readJson(req: Request): Promise<unknown> {
    if (!(req.headers.get('content-type') ?? '').startsWith('application/json')) {
      throw new HttpError(415, 'Expected a JSON body.');
    }
    const body = await readBody(req, config.maxJsonBytes);
    try {
      return JSON.parse(body.toString('utf8'));
    } catch {
      throw new HttpError(400, 'The request body isn’t valid JSON.');
    }
  }

  /** Validates a config with the same rules as the client, and keeps only media this server hosts. */
  async function cleanConfig(input: unknown): Promise<BirthdayConfig> {
    const normalized = normalizeConfig(input);
    return mapConfigMedia(normalized, (url) =>
      url.startsWith(mediaPrefix) && MEDIA_FILE.test(url.slice(mediaPrefix.length)) ? url : undefined,
    );
  }

  const accountsApi = accounts
    ? createAccountsApi({
        config,
        accounts,
        store,
        mediaPrefix,
        mailer,
        log,
        allowHour: (key, max) => hourly.allow(key, max),
        isAllowedOrigin: (origin) => allowedOrigins.has(origin),
        throttle(key, max) {
          if (!limiter.allow(key, max)) throw new HttpError(429, 'Too many attempts. Please wait a minute and try again.');
        },
        limit,
        json,
        readBody,
        readJson,
      })
    : null;

  /** With accounts on, publishing anonymously is off: people sign in, and publish from their works. */
  async function requireLoginWhenAccountsAreOn(req: Request) {
    if (accountsApi && !(await accountsApi.userFor(req))) {
      throw new HttpError(401, 'Please log in to continue.');
    }
  }

  const bearer = (req: Request) => /^Bearer (\S+)$/.exec(req.headers.get('authorization') ?? '')?.[1];

  async function route(req: Request, ip: string, pathname: string, cors: Headers): Promise<Response> {
    const origin = req.headers.get('origin');
    if (origin && allowedOrigins.has(origin)) {
      cors.set('Access-Control-Allow-Origin', origin);
      cors.set('Vary', 'Origin');
      cors.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      cors.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      cors.set('Access-Control-Max-Age', '600');
    } else if (origin && req.method !== 'GET') {
      throw new HttpError(403, 'Requests from this site aren’t allowed.');
    }
    if (req.method === 'OPTIONS') return new Response(null, { status: 204 });

    if (pathname === '/api/health') return json(200, { ok: true });

    if (pathname === '/api/media' && req.method === 'POST') {
      await requireLoginWhenAccountsAreOn(req);
      limit(ip, 'upload');
      const body = await readBody(req, Math.max(config.maxImageBytes, config.maxAudioBytes));
      const type = sniffMedia(body);
      if (!type)
        throw new HttpError(415, 'Only JPG, PNG or WEBP photos and MP3 or WAV songs can be uploaded.');
      const max = type.startsWith('image/') ? config.maxImageBytes : config.maxAudioBytes;
      if (body.length > max) throw new HttpError(413, 'That upload is too large.');
      const name = await store.putMedia(body, type);
      return json(201, { url: `${mediaPrefix}${name}` });
    }

    if (pathname === '/api/errors' && req.method === 'POST') {
      limit(ip, 'write');
      const body = await readBody(req, 8 * 1024).catch(() => Buffer.alloc(0));
      let report: Record<string, unknown> = {};
      try {
        report = JSON.parse(body.toString('utf8')) as Record<string, unknown>;
      } catch {
        /* ignore malformed reports */
      }
      const field = (k: string, max: number) =>
        typeof report[k] === 'string' ? (report[k] as string).slice(0, max) : undefined;
      log({
        level: 'error',
        source: 'client',
        name: field('name', 100),
        message: field('message', 500),
        stack: field('stack', 2000),
        context: field('context', 1000),
        path: field('path', 200)?.replace(/\/birthday\/[^/]+/, '/birthday/:id'),
        userAgent: field('userAgent', 300),
      });
      return new Response(null, { status: 204 });
    }

    if (pathname === '/api/birthdays' && req.method === 'POST') {
      await requireLoginWhenAccountsAreOn(req);
      limit(ip, 'write');
      const cleaned = await cleanConfig(await readJson(req));
      return json(201, await store.create(cleaned));
    }

    const match = /^\/api\/birthdays\/([^/]+)$/.exec(pathname);
    if (match) {
      const id = safeDecode(match[1]);
      if (!BIRTHDAY_ID.test(id)) throw new HttpError(404, 'This birthday doesn’t exist.');
      if (req.method === 'GET') {
        limit(ip, 'read');
        const record = await store.get(id);
        if (!record) throw new HttpError(404, 'This birthday doesn’t exist.');
        return json(200, record.config);
      }
      if (req.method === 'PUT' || req.method === 'DELETE') {
        limit(ip, 'write');
        const record = await store.get(id);
        if (!record) throw new HttpError(404, 'This birthday doesn’t exist.');
        if (!tokenMatches(record, bearer(req)))
          throw new HttpError(403, 'You can’t change this birthday from here.');
        if (req.method === 'DELETE') {
          await store.delete(id);
          return new Response(null, { status: 204 });
        }
        await store.update(record, await cleanConfig(await readJson(req)));
        return json(200, { id });
      }
      throw new HttpError(405, 'Method not allowed.');
    }

    if (accountsApi) {
      const handled = await accountsApi.handle(req, ip, pathname);
      if (handled) return handled;
    } else if (pathname === '/api/auth/me' && req.method === 'GET') {
      // Lets the app find out that this server has no accounts, and fall back to anonymous use.
      return json(200, { accountsEnabled: false, user: null });
    }

    throw new HttpError(404, 'Not found.');
  }

  async function handleApi(req: Request, ip: string): Promise<Response> {
    const cors = new Headers();
    let res: Response;
    try {
      res = await route(req, ip, new URL(req.url).pathname, cors);
    } catch (err) {
      res = errorResponse(err);
    }
    cors.forEach((value, key) => res.headers.set(key, value));
    return res;
  }

  async function handleMedia(req: Request, name: string, ip: string): Promise<Response> {
    try {
      limit(ip, 'read');
      const media = MEDIA_FILE.test(name) ? await store.openMedia(name) : null;
      if (!media) throw new HttpError(404, 'Not found.');
      const type = Object.entries(MEDIA_TYPES).find(([, ext]) => name.endsWith(`.${ext}`))![0];
      return rangedResponse(
        req,
        media.size,
        {
          'Content-Type': type,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Accept-Ranges': 'bytes',
          'Cross-Origin-Resource-Policy': 'same-site',
          'X-Robots-Tag': 'noindex',
        },
        (start, end) => Readable.toWeb(media.stream(start, end)) as unknown as ReadableStream,
      );
    } catch (err) {
      return errorResponse(err);
    }
  }

  return { mediaPrefix, handleApi, handleMedia, limit, errorResponse };
}
