/**
 * Optional production error reporting. When VITE_ERROR_REPORT_URL is set, uncaught
 * errors are sent there as a small JSON beacon. Only technical details are sent —
 * never names, messages, photos or anything else from the birthday itself.
 */
const endpoint = import.meta.env.VITE_ERROR_REPORT_URL?.trim();
const sent = new Set<string>();

export function reportError(error: unknown, context?: string): void {
  if (import.meta.env.DEV) {
    console.warn('[birthday-studio]', context ?? 'error', error);
    return;
  }
  if (!endpoint) return;
  const err = error instanceof Error ? error : new Error(String(error));
  const key = `${err.name}:${err.message}`;
  if (sent.has(key) || sent.size > 20) return; // de-duplicate and cap per page load
  sent.add(key);
  const payload = JSON.stringify({
    name: err.name,
    message: err.message.slice(0, 500),
    stack: err.stack?.slice(0, 2000),
    context,
    path: window.location.pathname,
    userAgent: navigator.userAgent,
    time: new Date().toISOString(),
  });
  try {
    if (!navigator.sendBeacon?.(endpoint, new Blob([payload], { type: 'application/json' }))) {
      void fetch(endpoint, {
        method: 'POST',
        body: payload,
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => undefined);
    }
  } catch {
    // Reporting must never break the page.
  }
}

export function installGlobalErrorReporting(): void {
  window.addEventListener('error', (e) => reportError(e.error ?? e.message, 'window.error'));
  window.addEventListener('unhandledrejection', (e) => reportError(e.reason, 'unhandledrejection'));
}
