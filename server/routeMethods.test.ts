import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The API core is tested directly, which skips Next.js routing, so a method the browser client uses but the
 * route file never exports would pass every API test and answer 405 in production. This is how PATCH was missed once.
 */
describe('api route', () => {
  it('exports every HTTP method the browser client sends', async () => {
    const dir = 'src/data/api';
    const used = new Set<string>();
    for (const file of readdirSync(dir)) {
      for (const m of readFileSync(path.join(dir, file), 'utf8').matchAll(/method:\s*'([A-Z]+)'/g)) used.add(m[1]);
    }
    expect([...used].sort()).toEqual(expect.arrayContaining(['DELETE', 'PATCH', 'POST', 'PUT']));

    const route = (await import('../src/app/api/[[...path]]/route')) as Record<string, unknown>;
    for (const method of [...used, 'GET', 'OPTIONS']) {
      expect(typeof route[method], `route.ts should export ${method}`).toBe('function');
    }
  });
});
