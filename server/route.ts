import { clientIp, getRuntime, type Runtime } from './runtime';

/**
 * Wraps a Next.js route handler: resolves the runtime, adds the API's security headers
 * and writes the same access-log line the old standalone server wrote.
 */
export function apiRoute(handle: (req: Request, rt: Runtime, ip: string) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    const started = Date.now();
    const rt = await getRuntime();
    const response = await handle(req, rt, clientIp(req.headers, rt.config.trustProxy));
    response.headers.set('X-Content-Type-Options', 'nosniff');
    rt.log({
      level: 'info',
      method: req.method,
      // Birthday ids are the only key to a private page, so they never reach the logs.
      path: new URL(req.url).pathname.replace(/\/birthday(s?)\/[^/]+/, '/birthday$1/:id'),
      status: response.status,
      ms: Date.now() - started,
    });
    return response;
  };
}
