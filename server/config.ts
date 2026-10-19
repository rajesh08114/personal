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
  rateLimits: { read: number; write: number; upload: number; auth: number };
  /** Accounts (needs MongoDB). */
  accounts: {
    /**
     * Where accounts live. `mongodb` is the default whenever MONGODB_URI is set; `memory` keeps them in
     * process memory (development and tests: everything is lost on restart); `off` disables accounts.
     */
    store: 'off' | 'memory' | 'mongodb';
    /** Whether new people can register. Existing accounts keep working when this is off. */
    registrationOpen: boolean;
    /** How long a login lasts. */
    sessionMs: number;
    maxWorksPerUser: number;
    /** Total size of one user's media library. */
    maxLibraryBytes: number;
  };
  /** Email, used for password resets and address verification. */
  email: {
    /** `resend` sends through Resend; `log` writes the message to the server log (development); `off` sends nothing. */
    mode: 'resend' | 'log' | 'off';
    resendApiKey: string;
    /** The From address, e.g. `Birthday Studio <hello@birthday.example.com>`. It must be on a domain verified in Resend. */
    from: string;
    /** Resend's endpoint. Only changed to point tests, or a proxy, somewhere else. */
    apiUrl: string;
    /** Emails one address may be sent per hour (reset requests and verification each count). */
    perAddressPerHour: number;
    /** Emails one visitor's IP may ask for per hour. */
    perIpPerHour: number;
    /** A ceiling on all emails in a day, so abuse can't run up the bill or exhaust the Resend quota. */
    dailyLimit: number;
    /** How long a reset link works. */
    resetLinkMs: number;
    /** How long an address-verification link works. */
    verifyLinkMs: number;
  };
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

  const mongoUri = (env.MONGODB_URI ?? '').trim();
  const requested = (env.ACCOUNTS ?? '').trim().toLowerCase();
  if (requested && !['off', 'memory', 'mongodb'].includes(requested)) {
    throw new Error(`ACCOUNTS must be "off", "memory" or "mongodb", got "${requested}".`);
  }
  const accountsStore = (requested || (mongoUri ? 'mongodb' : 'off')) as 'off' | 'memory' | 'mongodb';
  if (accountsStore === 'mongodb' && !mongoUri) throw new Error('ACCOUNTS=mongodb needs MONGODB_URI.');

  const resendApiKey = (env.RESEND_API_KEY ?? '').trim();
  const emailFrom = (env.EMAIL_FROM ?? '').trim();
  const emailMode = resendApiKey ? 'resend' : env.EMAIL === 'log' ? 'log' : 'off';
  if (emailMode === 'resend' && !emailFrom) {
    throw new Error('EMAIL_FROM is required with RESEND_API_KEY (e.g. "Birthday Studio <hello@birthday.example.com>").');
  }

  const apiUrl = (env.RESEND_API_URL ?? '').trim() || 'https://api.resend.com/emails';
  if (!/^https?:\/\/[^\s]+$/i.test(apiUrl)) throw new Error(`RESEND_API_URL must be an http(s) URL, got "${apiUrl}".`);

  return {
    port,
    host: env.HOST ?? '0.0.0.0',
    dataDir: path.resolve(/*turbopackIgnore: true*/ env.DATA_DIR ?? './data'),
    mongoUri,
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
      auth: int(env.RATE_LIMIT_AUTH, 10),
    },
    accounts: {
      store: accountsStore,
      registrationOpen: env.REGISTRATION !== 'closed',
      sessionMs: int(env.SESSION_DAYS, 30) * 24 * 60 * 60 * 1000,
      maxWorksPerUser: int(env.MAX_WORKS_PER_USER, 50),
      maxLibraryBytes: int(env.MAX_LIBRARY_MB, 200) * 1024 * 1024,
    },
    email: {
      mode: emailMode,
      resendApiKey,
      from: emailFrom,
      apiUrl,
      perAddressPerHour: int(env.RATE_LIMIT_EMAIL_PER_HOUR, 3),
      perIpPerHour: int(env.RATE_LIMIT_EMAIL_IP_PER_HOUR, 10),
      dailyLimit: int(env.EMAIL_DAILY_LIMIT, 500),
      resetLinkMs: int(env.RESET_LINK_MINUTES, 60) * 60 * 1000,
      verifyLinkMs: int(env.VERIFY_LINK_HOURS, 24) * 60 * 60 * 1000,
    },
  };
}
