import { defineConfig, devices } from '@playwright/test';

const PORT = 4317;
const origin = `http://127.0.0.1:${PORT}`;

/**
 * End-to-end tests against the real production server (server mode) with a throwaway data dir.
 * `npm run test:e2e` builds the app with VITE_BIRTHDAY_API_URL=/api into dist-e2e first.
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
    command:
      'rm -rf .e2e-data && VITE_BIRTHDAY_API_URL=/api npx vite build --outDir dist-e2e --emptyOutDir && npm run build:server && node dist-server/index.js',
    url: `${origin}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PORT: String(PORT),
      HOST: '127.0.0.1',
      PUBLIC_ORIGIN: origin,
      DATA_DIR: '.e2e-data',
      STATIC_DIR: 'dist-e2e',
    },
  },
});
