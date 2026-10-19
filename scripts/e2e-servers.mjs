// Builds the app once and starts two servers for the Playwright suite:
//   :4318  accounts off  (anonymous publishing, as before)
//   :4317  accounts on   (in-memory accounts, or MongoDB when MONGODB_URI is set)
// Playwright waits for :4317, which is started last, once :4318 is already answering.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';

const next = createRequire(import.meta.url).resolve('next/dist/bin/next');
const ACCOUNTS_PORT = 4317;
const ANONYMOUS_PORT = 4318;
const MAIL_PORT = 4319;
const children = [];

const baseEnv = {
  ...process.env,
  NEXT_DIST_DIR: '.next-e2e',
  NEXT_PUBLIC_BIRTHDAY_API_URL: '/api',
};

function run(args, env, name) {
  const child = spawn(process.execPath, [next, ...args], { env, stdio: 'inherit' });
  child.name = name;
  children.push(child);
  return child;
}

function stop() {
  for (const child of children) child.kill();
}
process.on('SIGTERM', () => (stop(), process.exit(0)));
process.on('SIGINT', () => (stop(), process.exit(0)));

const build = run(['build'], baseEnv, 'build');
await new Promise((resolve, reject) =>
  build.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`next build exited with ${code}`)))),
);

// A stand-in for Resend: the app talks to it exactly as it would to the real API, and the tests read
// what it was asked to send from GET /outbox?to=<address>.
const outbox = [];
const mail = createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${MAIL_PORT}`);
  if (req.method === 'GET' && url.pathname === '/outbox') {
    const to = url.searchParams.get('to');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(outbox.filter((m) => !to || m.to.includes(to))));
    return;
  }
  if (req.method === 'POST' && url.pathname === '/emails') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      if (req.headers.authorization !== 'Bearer re_e2e_key') {
        res.statusCode = 401;
        res.end('{"message":"API key is invalid"}');
        return;
      }
      const message = JSON.parse(body);
      outbox.push({ ...message, receivedAt: Date.now() });
      res.end('{"id":"e2e"}');
    });
    return;
  }
  res.statusCode = 404;
  res.end();
});
mail.listen(MAIL_PORT, '127.0.0.1');
children.push({ kill: () => mail.close(), on: () => {} });

const serverEnv = (port, accounts) => ({
  ...baseEnv,
  PORT: String(port),
  PUBLIC_ORIGIN: `http://127.0.0.1:${port}`,
  DATA_DIR: `.e2e-data/${port}-${Date.now()}`,
  ACCOUNTS: accounts,
  ...(accounts === 'off'
    ? {}
    : { RESEND_API_KEY: 're_e2e_key', EMAIL_FROM: 'Birthday Studio <hello@birthday.test>', RESEND_API_URL: `http://127.0.0.1:${MAIL_PORT}/emails` }),
  // Every test comes from 127.0.0.1, so the per-address limits would otherwise stop the suite, not abusers.
  ...(accounts === 'off' ? {} : { RATE_LIMIT_AUTH: '1000', RATE_LIMIT_WRITE: '1000', RATE_LIMIT_UPLOAD: '1000', RATE_LIMIT_READ: '5000' }),
  ...(process.env.MONGODB_URI
    ? { MONGODB_URI: process.env.MONGODB_URI, MONGODB_DB: `birthday_e2e_${port}` }
    : {}),
});

run(['start', '-p', String(ANONYMOUS_PORT), '-H', '127.0.0.1'], serverEnv(ANONYMOUS_PORT, 'off'), 'anonymous');
for (let i = 0; i < 120; i++) {
  try {
    if ((await fetch(`http://127.0.0.1:${ANONYMOUS_PORT}/api/health`)).ok) break;
  } catch {
    /* not up yet */
  }
  await new Promise((r) => setTimeout(r, 500));
}
run(
  ['start', '-p', String(ACCOUNTS_PORT), '-H', '127.0.0.1'],
  serverEnv(ACCOUNTS_PORT, process.env.MONGODB_URI ? 'mongodb' : 'memory'),
  'accounts',
);

// Stay alive until Playwright stops us (or a server dies).
await new Promise((resolve) => children.forEach((c) => c.on('exit', resolve)));
stop();
