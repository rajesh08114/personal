import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Same policy as vercel.json and public/_headers, applied to `npm run preview`
 * so CSP problems show up locally before they reach production.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' data: blob: https:",
  "connect-src 'self' https: http://localhost:*",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiUrl = env.VITE_BIRTHDAY_API_URL?.trim();
  if (apiUrl && !/^https?:\/\/[^\s]+$/i.test(apiUrl)) {
    throw new Error(`VITE_BIRTHDAY_API_URL must be an http(s) URL, got "${apiUrl}".`);
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    preview: {
      headers: {
        'Content-Security-Policy': CSP,
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'microphone=(self), camera=(), geolocation=(), payment=()',
      },
    },
    build: {
      target: 'es2022',
      // Templates are 3–7 KB each; anything above this is worth a look.
      chunkSizeWarningLimit: 300,
      rolldownOptions: {
        output: {
          // Long-lived vendor chunks: app deploys don't invalidate the browser's copy of React or Motion.
          codeSplitting: {
            groups: [
              { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 30 },
              { name: 'router', test: /node_modules[\\/]react-router[\\/]/, priority: 20 },
              {
                name: 'motion',
                test: /node_modules[\\/](motion|motion-dom|motion-utils|framer-motion)[\\/]/,
                priority: 20,
              },
              { name: 'icons', test: /node_modules[\\/]lucide-react[\\/]/, priority: 10 },
            ],
          },
        },
      },
    },
  };
});
