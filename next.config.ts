import type { NextConfig } from 'next';

const apiUrl = process.env.NEXT_PUBLIC_BIRTHDAY_API_URL?.trim();
if (apiUrl && !/^(https?:\/\/[^\s]+|\/[^\s]*)$/i.test(apiUrl)) {
  throw new Error(
    `NEXT_PUBLIC_BIRTHDAY_API_URL must be an http(s) URL or a same-origin path like /api, got "${apiUrl}".`,
  );
}

const config: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // A self-contained server bundle for Docker (`node .next/standalone/server.js`).
  output: process.env.NEXT_DIST_DIR ? undefined : 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  // The MongoDB driver is loaded at runtime, only when MONGODB_URI is set.
  serverExternalPackages: ['mongodb'],
};

export default config;
