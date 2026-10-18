import { Readable } from 'node:stream';
import type { BirthdayConfig } from '../src/types/birthday';
import { normalizeConfig } from '../src/data/normalizeConfig';
import { mapConfigMedia } from '../src/data/configMedia';
import type { ServerConfig } from './config';
import { BIRTHDAY_ID, MEDIA_FILE, MEDIA_TYPES, tokenMatches, type MediaType, type Store } from './store';
import { RateLimiter } from './rateLimit';

/**
 * The HTTP API (`/api/*` and `/media/*`) written against the standard Request and Response,
 * so the same code runs behind the Node adapter in app.ts and inside Next.js route handlers.
 */

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Checks the file's leading bytes, so an upload can't claim to be a photo when it isn't. */
export function sniffMedia(bytes: Buffer): MediaType | null {
  const ascii = (start: number, end: number) => bytes.subarray(start, end).toString('latin1');
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return 'image/png';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WAVE') return 'audio/wav';
  if (ascii(0, 3) === 'ID3' || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) return 'audio/mpeg';
  return null;
}

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

export type Log =(entry: object) => void;

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

export function createApi(config: ServerConfig, store: Store, log: Log = () => {}): Api {
  const limiter = new RateLimiter(60_000);
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

  const bearer = (req: Request) => /^Bearer (\S+)$/.exec(req.headers.get('authorization') ?? '')?.[1];

  async function route(req: Request, ip: string, pathname: string, cors: Headers): Promise<Response> {
    const origin = req.headers.get('origin');
    if (origin && allowedOrigins.has(origin)) {
      cors.set('Access-Control-Allow-Origin', origin);
      cors.set('Vary', 'Origin');
      cors.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      cors.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      cors.set('Access-Control-Max-Age', '600');
    } else if (origin && req.method !== 'GET') {
      throw new HttpError(403, 'Requests from this site aren’t allowed.');
    }
    if (req.method === 'OPTIONS') return new Response(null, { status: 204 });

    if (pathname === '/api/health') return json(200, { ok: true });

    if (pathname === '/api/media' && req.method === 'POST') {
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
      const size = media.size;
      const head = req.method === 'HEAD';
      const body = (start?: number, end?: number) =>
        head ? null : (Readable.toWeb(media.stream(start, end)) as unknown as ReadableStream);
      const type = Object.entries(MEDIA_TYPES).find(([, ext]) => name.endsWith(`.${ext}`))![0];
      const headers: Record<string, string> = {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Accept-Ranges': 'bytes',
        'Cross-Origin-Resource-Policy': 'same-site',
        'X-Robots-Tag': 'noindex',
      };
      // Safari only plays audio from servers that honour Range requests.
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get('range') ?? '');
      if (range && (range[1] || range[2])) {
        let start = range[1] ? Number(range[1]) : size - Number(range[2]);
        let end = range[1] && range[2] ? Number(range[2]) : size - 1;
        start = Math.max(0, start);
        end = Math.min(end, size - 1);
        if (start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
        return new Response(body(start, end), {
          status: 206,
          headers: {
            ...headers,
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Content-Length': String(end - start + 1),
          },
        });
      }
      return new Response(body(), { status: 200, headers: { ...headers, 'Content-Length': String(size) } });
    } catch (err) {
      return errorResponse(err);
    }
  }

  return { mediaPrefix, handleApi, handleMedia, limit, errorResponse };
}
