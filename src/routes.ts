import { loadChunk } from '@/utils/lazyChunk';

/**
 * Page loaders. Each page is its own chunk; pages can warm up the next likely
 * page while the browser is idle (e.g. the catalogue prefetches the studio).
 */
export const pageLoaders = {
  experience: loadChunk(() => import('@/pages/ExperiencePage')),
  create: loadChunk(() => import('@/pages/CreatePage')),
  preview: loadChunk(() => import('@/pages/PreviewPage')),
  templates: loadChunk(() => import('@/pages/TemplatesPage')),
  templatePreview: loadChunk(() => import('@/pages/TemplatePreviewPage')),
  birthday: loadChunk(() => import('@/pages/BirthdayPage')),
};

/** Downloads page chunks in the background once the main thread is idle. Never on slow or data-saving connections. */
export function prefetchPagesWhenIdle(...names: Array<keyof typeof pageLoaders>): () => void {
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  if (connection?.saveData || /2g/.test(connection?.effectiveType ?? '')) return () => {};
  const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2000));
  const cancel = window.cancelIdleCallback ?? window.clearTimeout;
  const handle = idle(() => names.forEach((n) => void pageLoaders[n]().catch(() => undefined)));
  return () => cancel(handle);
}
