import { createServer } from 'node:http';
import { loadConfig } from './config';
import { FileStore, type Store } from './store';
import { createApp } from './app';

/** One JSON line per event, ready for any log collector. */
const log = (entry: object) => {
  const line = JSON.stringify({ time: new Date().toISOString(), ...entry });
  if ((entry as { level?: string }).level === 'error') console.error(line);
  else console.log(line);
};

const config = loadConfig();
// MongoDB is loaded only when configured, so file storage needs no database driver.
const store: Store = config.mongoUri
  ? new (await import('./mongoStore')).MongoStore(config.mongoUri, config.mongoDb)
  : new FileStore(config.dataDir);
await store.init();
const app = createApp(config, store, log);

const server = createServer((req, res) => void app.handle(req, res));
server.requestTimeout = 60_000;
server.headersTimeout = 20_000;
server.keepAliveTimeout = 5_000;

const sweep = () =>
  store
    .collectGarbage(config.orphanMediaMs)
    .then((removed) => removed && log({ level: 'info', event: 'media-gc', removed }))
    .catch((err: unknown) =>
      log({ level: 'error', source: 'server', message: `media gc failed: ${String(err)}` }),
    );
const gcTimer = setInterval(sweep, 6 * 60 * 60 * 1000);
gcTimer.unref();
void sweep();

server.listen(config.port, config.host, () => {
  log({
    level: 'info',
    event: 'listening',
    port: config.port,
    origin: config.publicOrigin,
    storage: config.mongoUri ? 'mongodb' : 'files',
    static: config.staticDir || null,
  });
});

function shutdown(signal: string) {
  log({ level: 'info', event: 'shutdown', signal });
  server.close(() => void store.close().finally(() => process.exit(0)));
  server.closeIdleConnections();
  setTimeout(() => process.exit(0), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
