import path from 'node:path';

/** Server settings, read once from the environment. Every value has a safe development default. */
export interface ServerConfig {
  port: number;
  host: string;
  /** Where birthdays and uploaded media are stored when MongoDB isn't configured. */
  dataDir: string;
  /** MongoDB connection string. When set, birthdays and uploads (GridFS) are stored in MongoDB instead of dataDir. */
  mongoUri: string;
  /** Database name; defaults to the one in the connection string, else "test" (MongoDB's default). */
  mongoDb: string;
  /** Public origin of the app, e.g. https://birthday.example.com. Used for media URLs and link previews. */
  publicOrigin: string;
  /** Extra origins allowed to call the API from a browser (the app's own origin is always allowed). */
  corsOrigins: string[];
  /** Trust X-Forwarded-For / X-Forwarded-Proto (only behind a proxy you control). */
  trustProxy: boolean;
  maxJsonBytes: number;
  maxImageBytes: number;
  maxAudioBytes: number;
  /** Uploaded media that no birthday references is deleted after this long. */
  orphanMediaMs: number;
  /** Requests per minute per IP, by kind of request. */
  rateLimits: { read: number; write: number; upload: number };
}

const int = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

export function loadConfig(env: Record<string, string | undefined> = process.env): ServerConfig {
  const production = env.NODE_ENV === 'production';
  const port = int(env.PORT, 8787);
  const publicOrigin = (env.PUBLIC_ORIGIN ?? '').trim().replace(/\/+$/, '');
  if (publicOrigin && !/^https?:\/\/[^/\s]+$/i.test(publicOrigin)) {
    throw new Error(
      `PUBLIC_ORIGIN must be an origin like https://birthday.example.com, got "${publicOrigin}".`,
    );
  }
  if (production && !publicOrigin) {
    throw new Error('PUBLIC_ORIGIN is required in production (e.g. https://birthday.example.com).');
  }

  return {
    port,
    host: env.HOST ?? '0.0.0.0',
    dataDir: path.resolve(/*turbopackIgnore: true*/ env.DATA_DIR ?? './data'),
    mongoUri: (env.MONGODB_URI ?? '').trim(),
    mongoDb: (env.MONGODB_DB ?? '').trim(),

    publicOrigin: publicOrigin || `http://localhost:${port}`,
    corsOrigins: (env.CORS_ORIGINS ?? '')
      .split(',')
      .map((s) => s.trim().replace(/\/+$/, ''))
      .filter(Boolean),
    trustProxy: env.TRUST_PROXY === '1' || env.TRUST_PROXY === 'true',
    maxJsonBytes: int(env.MAX_JSON_BYTES, 512 * 1024),
    maxImageBytes: int(env.MAX_IMAGE_BYTES, 8 * 1024 * 1024),
    maxAudioBytes: int(env.MAX_AUDIO_BYTES, 13 * 1024 * 1024),
    orphanMediaMs: int(env.ORPHAN_MEDIA_HOURS, 24) * 60 * 60 * 1000,
    rateLimits: {
      read: int(env.RATE_LIMIT_READ, 120),
      write: int(env.RATE_LIMIT_WRITE, 20),
      upload: int(env.RATE_LIMIT_UPLOAD, 60),
    },
  };
}
