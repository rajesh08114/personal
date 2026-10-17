import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

/** Bundles the API + static server (server/index.ts) into dist-server/index.js. No runtime dependencies. */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    ssr: 'server/index.ts',
    outDir: 'dist-server',
    target: 'node20',
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
  },
});
