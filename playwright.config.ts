import { defineConfig, devices } from '@playwright/test';

const PORT = 4317;
const origin = `http://127.0.0.1:${PORT}`;
const anonymousOrigin = 'http://127.0.0.1:4318';

/**
 * End-to-end tests against the real production server (server mode) with a throwaway data dir.
 * `npm run test:e2e` builds the app with NEXT_PUBLIC_BIRTHDAY_API_URL=/api into .next-e2e first.
 */
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  // Four projects share two servers and every test signs up its own user. Fewer workers and a longer
  // default wait keep a busy machine from turning slowness into false failures.
  workers: process.env.CI ? 2 : 3,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: origin,
    trace: 'retain-on-failure',
    ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } }
      : {}),
  },
  projects: [
    // The server with accounts on: everything but the anonymous flows.
    { name: 'desktop', testIgnore: /anonymous\.spec/, use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', testIgnore: /anonymous\.spec/, use: { ...devices['Pixel 7'] } },
    // The server with accounts off: publishing without logging in.
    { name: 'desktop-anonymous', testMatch: /anonymous\.spec/, use: { ...devices['Desktop Chrome'], baseURL: anonymousOrigin } },
    { name: 'mobile-anonymous', testMatch: /anonymous\.spec/, use: { ...devices['Pixel 7'], baseURL: anonymousOrigin } },
  ],
  webServer: {
    // Builds into .next-e2e (so `npm run dev` isn't disturbed) and starts both servers; see the script.
    command: 'node scripts/e2e-servers.mjs',
    url: `${origin}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
