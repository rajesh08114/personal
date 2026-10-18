import { loadConfig, type ServerConfig } from './config';
import { FileStore, type Store } from './store';
import { createApi, type Api } from './api';

/**
 * The server-side singletons shared by the API route handlers and the pages that read birthdays:
 * configuration, the store (files or MongoDB) and the API core. Created once per process,
 * on first use, and kept on globalThis so dev hot-reloads don't open a second connection.
 */
export interface Runtime {
  config: ServerConfig;
  store: Store;
  api: Api;
  log: (entry: object) => void;
}

/** One JSON line per event, ready for any log collector. */
export const log = (entry: object) => {
  const line = JSON.stringify({ time: new Date().toISOString(), ...entry });
  if ((entry as { level?: string }).level === 'error') console.error(line);
  else console.log(line);
};

const SWEEP_EVERY_MS = 6 * 60 * 60 * 1000;
const globalRuntime = globalThis as typeof globalThis & { __birthdayRuntime?: Promise<Runtime> };

async function create(): Promise<Runtime> {
  const config = loadConfig();
  // MongoDB is loaded only when configured, so file storage needs no database driver.
  const store: Store = config.mongoUri
    ? new (await import('./mongoStore')).MongoStore(config.mongoUri, config.mongoDb)
    : new FileStore(config.dataDir);
  await store.init();
  const api = createApi(config, store, log);

  const sweep = () =>
    store
      .collectGarbage(config.orphanMediaMs)
      .then((removed) => removed && log({ level: 'info', event: 'media-gc', removed }))
      .catch((err: unknown) =>
        log({ level: 'error', source: 'server', message: `media gc failed: ${String(err)}` }),
      );
  setInterval(sweep, SWEEP_EVERY_MS).unref();
  void sweep();

  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.once(signal, () => {
      log({ level: 'info', event: 'shutdown', signal });
      void store.close();
    });
  }

  log({
    level: 'info',
    event: 'ready',
    origin: config.publicOrigin,
    storage: config.mongoUri ? 'mongodb' : 'files',
  });
  return { config, store, api, log };
}

export function getRuntime(): Promise<Runtime> {
  globalRuntime.__birthdayRuntime ??= create().catch((err) => {
    // Let the next request try again instead of caching a failed start.
    globalRuntime.__birthdayRuntime = undefined;
    throw err;
  });
  return globalRuntime.__birthdayRuntime;
}

/**
 * The address rate limits are keyed on. Route handlers don't see the socket, but Next.js fills
 * X-Forwarded-For from it when the header is absent. So with TRUST_PROXY unset a server that is
 * exposed directly can have its per-IP limits dodged by a spoofed header: run it behind a proxy
 * that sets the header and set TRUST_PROXY=1.
 */
export function clientIp(headers: Headers, trustProxy: boolean): string {
  const chain = (headers.get('x-forwarded-for') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!chain.length) return 'unknown';
  // Behind a proxy we control the first entry is the visitor; otherwise only the last (the peer) can be believed.
  return trustProxy ? chain[0] : chain[chain.length - 1];
}
