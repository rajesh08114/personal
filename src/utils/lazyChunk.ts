import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const RELOAD_KEY = 'bs:chunk-reload-at';

/** True for the errors browsers throw when a code-split chunk can't be fetched (offline, or removed by a new deploy). */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Failed to fetch|ChunkLoadError|Loading chunk .* failed|Failed to load chunk/i.test(
    message,
  );
}

/**
 * After a new deploy, chunk file names change and an already-open tab asks for
 * files that no longer exist. Reload once to pick up the new build; never loop.
 */
export function reloadOncePerSession(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < 30_000) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

/** Wraps a dynamic import so a stale-deploy failure triggers one reload instead of an error screen. */
export function loadChunk<T>(factory: () => Promise<T>): () => Promise<T> {
  return () =>
    factory().catch((error: unknown) => {
      if (isChunkLoadError(error) && reloadOncePerSession()) return new Promise<T>(() => {});
      throw error;
    });
}

/** `React.lazy` with stale-deploy recovery. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyChunk<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(loadChunk(factory));
}
