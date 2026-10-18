import { defineConfig, devices } from '@playwright/test';

const PORT = 4317;
const origin = `http://127.0.0.1:${PORT}`;

/**
 * End-to-end tests against the real production server (server mode) with a throwaway data dir.
 * `npm run test:e2e` builds the app with NEXT_PUBLIC_BIRTHDAY_API_URL=/api into .next-e2e first.
 */
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: origin,
    trace: 'retain-on-failure',
    ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } }
      : {}),
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // A separate build directory keeps `npm run dev` and the e2e build from overwriting each other.
    command: 'npx next build && npx next start -p ' + PORT + ' -H 127.0.0.1',
    url: `${origin}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: {
      NEXT_DIST_DIR: '.next-e2e',
      NEXT_PUBLIC_BIRTHDAY_API_URL: '/api',
      PUBLIC_ORIGIN: origin,
      DATA_DIR: `.e2e-data/${Date.now()}`,
      // Set MONGODB_URI to run the same suite against MongoDB storage.
      ...(process.env.MONGODB_URI
        ? { MONGODB_URI: process.env.MONGODB_URI, MONGODB_DB: 'birthday_e2e' }
        : {}),
    },
  },
});
