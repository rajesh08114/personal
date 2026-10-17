import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import type { BirthdayConfig } from '../src/types/birthday';
import { normalizeConfig, isTemplateId } from '../src/data/normalizeConfig';
import { mapConfigMedia } from '../src/data/configMedia';
import type { ServerConfig } from './config';
import { BIRTHDAY_ID, MEDIA_FILE, MEDIA_TYPES, tokenMatches, type MediaType, type Store } from './store';
import { RateLimiter } from './rateLimit';
import { birthdayMeta, injectMeta } from './meta';

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};
const COMPRESSIBLE = /^(text\/|application\/(json|manifest)|image\/svg)/;

/** Client-side routes. Anything else gets the app shell with a real 404 status. */
function isAppRoute(pathname: string): boolean {
  if (['/', '/create', '/preview', '/templates', '/privacy'].includes(pathname)) return true;
  const template = /^\/templates\/([^/]+)$/.exec(pathname);
  return !!template && isTemplateId(decodeURIComponent(template[1]));
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

export interface App {
  handle(req: IncomingMessage, res: ServerResponse): Promise<void>;
  /** Hosted media URL prefix, e.g. https://birthday.example.com/media/ */
  mediaPrefix: string;
}

export function createApp(config: ServerConfig, store: Store, log: (entry: object) => void = () => {}): App {
  const limiter = new RateLimiter(60_000);
  const mediaPrefix = `${config.publicOrigin}/media/`;
  const allowedOrigins = new Set([config.publicOrigin, ...config.corsOrigins]);
  const staticCache = new Map<string, { body: Buffer; gzip?: Buffer; type: string }>();
  let indexHtml: string | null = null;

  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "media-src 'self' data: blob:",
    "connect-src 'self'",
    "frame-src 'self'",
    "frame-ancestors 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  function securityHeaders(res: ServerResponse) {
    res.setHeader('Content-Security-Policy', csp);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'microphone=(self), camera=(), geolocation=(), payment=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    if (config.publicOrigin.startsWith('https:')) {
      res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
    }
  }

  function clientIp(req: IncomingMessage): string {
    if (config.trustProxy) {
      const forwarded = String(req.headers['x-forwarded-for'] ?? '')
        .split(',')[0]
        .trim();
      if (forwarded) return forwarded;
    }
    return req.socket.remoteAddress ?? 'unknown';
  }

  function json(res: ServerResponse, status: number, body: unknown) {
    const text = JSON.stringify(body);
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    });
    res.end(text);
  }

  async function readBody(req: IncomingMessage, limit: number): Promise<Buffer> {
    const declared = Number(req.headers['content-length']);
    if (declared > limit) throw new HttpError(413, 'That upload is too large.');
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) {
      size += (chunk as Buffer).length;
      if (size > limit) throw new HttpError(413, 'That upload is too large.');
      chunks.push(chunk as Buffer);
    }
    return Buffer.concat(chunks);
  }

  async function readJson(req: IncomingMessage): Promise<unknown> {
    if (!String(req.headers['content-type'] ?? '').startsWith('application/json')) {
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

  const bearer = (req: IncomingMessage) =>
    /^Bearer (\S+)$/.exec(String(req.headers.authorization ?? ''))?.[1];

  function limit(req: IncomingMessage, kind: keyof ServerConfig['rateLimits']) {
    if (!limiter.allow(`${kind}:${clientIp(req)}`, config.rateLimits[kind])) {
      throw new HttpError(429, 'Too many requests. Please wait a minute and try again.');
    }
  }

  async function handleApi(req: IncomingMessage, res: ServerResponse, pathname: string) {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Max-Age', '600');
    } else if (origin && req.method !== 'GET') {
      throw new HttpError(403, 'Requests from this site aren’t allowed.');
    }
    if (req.method === 'OPTIONS') {
      res.writeHead(204).end();
      return;
    }

    if (pathname === '/api/health') return json(res, 200, { ok: true });

    if (pathname === '/api/media' && req.method === 'POST') {
      limit(req, 'upload');
      const body = await readBody(req, Math.max(config.maxImageBytes, config.maxAudioBytes));
      const type = sniffMedia(body);
      if (!type)
        throw new HttpError(415, 'Only JPG, PNG or WEBP photos and MP3 or WAV songs can be uploaded.');
      const max = type.startsWith('image/') ? config.maxImageBytes : config.maxAudioBytes;
      if (body.length > max) throw new HttpError(413, 'That upload is too large.');
      const name = await store.putMedia(body, type);
      return json(res, 201, { url: `${mediaPrefix}${name}` });
    }

    if (pathname === '/api/errors' && req.method === 'POST') {
      limit(req, 'write');
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
      res.writeHead(204).end();
      return;
    }

    if (pathname === '/api/birthdays' && req.method === 'POST') {
      limit(req, 'write');
      const config = await cleanConfig(await readJson(req));
      const created = await store.create(config);
      return json(res, 201, created);
    }

    const match = /^\/api\/birthdays\/([^/]+)$/.exec(pathname);
    if (match) {
      const id = decodeURIComponent(match[1]);
      if (!BIRTHDAY_ID.test(id)) throw new HttpError(404, 'This birthday doesn’t exist.');
      if (req.method === 'GET') {
        limit(req, 'read');
        const record = await store.get(id);
        if (!record) throw new HttpError(404, 'This birthday doesn’t exist.');
        return json(res, 200, record.config);
      }
      if (req.method === 'PUT' || req.method === 'DELETE') {
        limit(req, 'write');
        const record = await store.get(id);
        if (!record) throw new HttpError(404, 'This birthday doesn’t exist.');
        if (!tokenMatches(record, bearer(req)))
          throw new HttpError(403, 'You can’t change this birthday from here.');
        if (req.method === 'DELETE') {
          await store.delete(id);
          res.writeHead(204).end();
          return;
        }
        await store.update(record, await cleanConfig(await readJson(req)));
        return json(res, 200, { id });
      }
      throw new HttpError(405, 'Method not allowed.');
    }

    throw new HttpError(404, 'Not found.');
  }

  async function serveMedia(req: IncomingMessage, res: ServerResponse, name: string) {
    limit(req, 'read');
    const media = MEDIA_FILE.test(name) ? await store.openMedia(name) : null;
    if (!media) throw new HttpError(404, 'Not found.');
    const info = { size: media.size };
    const pipe = (start?: number, end?: number) => {
      const stream = media.stream(start, end);
      stream.on('error', () => res.destroy());
      stream.pipe(res);
    };
    const type = Object.entries(MEDIA_TYPES).find(([, ext]) => name.endsWith(`.${ext}`))![0];
    const headers: Record<string, string | number> = {
      'Content-Type': type,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Accept-Ranges': 'bytes',
      'Cross-Origin-Resource-Policy': 'same-site',
      'X-Robots-Tag': 'noindex',
    };
    // Safari only plays audio from servers that honour Range requests.
    const range = /^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range ?? ''));
    if (range && (range[1] || range[2])) {
      let start = range[1] ? Number(range[1]) : info.size - Number(range[2]);
      let end = range[1] && range[2] ? Number(range[2]) : info.size - 1;
      start = Math.max(0, start);
      end = Math.min(end, info.size - 1);
      if (start > end) {
        res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end();
        return;
      }
      res.writeHead(206, {
        ...headers,
        'Content-Range': `bytes ${start}-${end}/${info.size}`,
        'Content-Length': end - start + 1,
      });
      if (req.method === 'HEAD') return void res.end();
      pipe(start, end);
      return;
    }
    res.writeHead(200, { ...headers, 'Content-Length': info.size });
    if (req.method === 'HEAD') return void res.end();
    pipe();
  }

  async function loadStatic(rel: string) {
    const cached = staticCache.get(rel);
    if (cached) return cached;
    const root = config.staticDir;
    const file = path.resolve(root, `.${rel}`);
    if (!file.startsWith(root + path.sep)) return null;
    const info = await stat(file).catch(() => null);
    if (!info?.isFile()) return null;
    const body = await readFile(file);
    const type = CONTENT_TYPES[path.extname(file)] ?? 'application/octet-stream';
    const entry = {
      body,
      type,
      gzip: COMPRESSIBLE.test(type) && body.length > 1024 ? gzipSync(body) : undefined,
    };
    staticCache.set(rel, entry);
    return entry;
  }

  function send(
    req: IncomingMessage,
    res: ServerResponse,
    status: number,
    entry: { body: Buffer; gzip?: Buffer; type: string },
    cache: string,
  ) {
    const useGzip = entry.gzip && /\bgzip\b/.test(String(req.headers['accept-encoding'] ?? ''));
    const body = useGzip ? entry.gzip! : entry.body;
    res.writeHead(status, {
      'Content-Type': entry.type,
      'Cache-Control': cache,
      'Content-Length': body.length,
      Vary: 'Accept-Encoding',
      ...(useGzip ? { 'Content-Encoding': 'gzip' } : {}),
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  }

  async function serveApp(req: IncomingMessage, res: ServerResponse, pathname: string) {
    if (!config.staticDir) throw new HttpError(404, 'Not found.');
    if (pathname !== '/' && pathname !== '/index.html') {
      const asset = await loadStatic(pathname);
      if (asset) {
        const immutable = pathname.startsWith('/assets/');
        return send(
          req,
          res,
          200,
          asset,
          immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
        );
      }
    }

    // Link previews need absolute image URLs.
    indexHtml ??=
      (await readFile(path.join(config.staticDir, 'index.html'), 'utf8').catch(() => null))?.replace(
        'content="/og-image.png"',
        `content="${config.publicOrigin}/og-image.png"`,
      ) ?? null;
    if (!indexHtml) throw new HttpError(503, 'The app hasn’t been built yet. Run `npm run build`.');

    let html = indexHtml;
    let status = isAppRoute(pathname) ? 200 : 404;
    const birthday = /^\/birthday\/([^/]+)$/.exec(pathname);
    if (birthday) {
      limit(req, 'read');
      const id = decodeURIComponent(birthday[1]);
      const record = BIRTHDAY_ID.test(id) ? await store.get(id) : null;
      // Missing ids still get the shell: in local mode the page offers a backup import.
      status = record ? 200 : 404;
      html = injectMeta(
        html,
        birthdayMeta(
          record?.config,
          `${config.publicOrigin}${pathname}`,
          mediaPrefix,
          `${config.publicOrigin}/og-image.png`,
        ),
      );
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    } else if (pathname.startsWith('/preview') || pathname.startsWith('/create')) {
      res.setHeader('X-Robots-Tag', 'noindex');
    }
    send(req, res, status, { body: Buffer.from(html), type: CONTENT_TYPES['.html'] }, 'no-cache');
  }

  return {
    mediaPrefix,
    async handle(req, res) {
      const started = Date.now();
      let pathname = '/';
      try {
        pathname = decodeURI(new URL(req.url ?? '/', 'http://x').pathname);
      } catch {
        pathname = '';
      }
      securityHeaders(res);
      try {
        if (!pathname) throw new HttpError(400, 'Bad request.');
        if (pathname.startsWith('/api/')) await handleApi(req, res, pathname);
        else if (req.method !== 'GET' && req.method !== 'HEAD')
          throw new HttpError(405, 'Method not allowed.');
        else if (pathname.startsWith('/media/')) await serveMedia(req, res, pathname.slice('/media/'.length));
        else await serveApp(req, res, pathname);
      } catch (err) {
        const status = err instanceof HttpError ? err.status : 500;
        if (status === 500)
          log({ level: 'error', source: 'server', message: String((err as Error)?.stack ?? err) });
        if (!res.headersSent) {
          if (status === 429) res.setHeader('Retry-After', '60');
          json(res, status, {
            error: status === 500 ? 'Something went wrong on the server.' : (err as Error).message,
          });
        } else {
          res.destroy();
        }
      } finally {
        log({
          level: 'info',
          method: req.method,
          // Birthday ids are the only key to a private page, so they never reach the logs.
          path: pathname.replace(/\/birthday(s?)\/[^/]+/, '/birthday$1/:id'),
          status: res.statusCode,
          ms: Date.now() - started,
        });
      }
    },
  };
}
