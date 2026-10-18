import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

/** Every template id, read from the meta files so a new template is covered automatically. */
function templateIds(dir = 'src/templates'): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (!statSync(full).isDirectory()) return [];
    const meta = path.join(full, 'meta.tsx');
    try {
      const id = /^\s*id:\s*'([a-z0-9-]+)'/m.exec(readFileSync(meta, 'utf8'))?.[1];
      if (id) return [id];
    } catch {
      /* not a template folder */
    }
    return templateIds(full);
  });
}

const IDS = templateIds();

test('finds every template', () => {
  expect(IDS.length).toBeGreaterThanOrEqual(39);
});

for (const id of IDS) {
  test(`/templates/${id} renders without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !/favicon|Failed to load resource/.test(msg.text()))
        errors.push(msg.text());
    });

    const response = await page.goto(`/templates/${id}`);
    expect(response?.status()).toBe(200);
    // The creator bar (its label is hidden on phones, its back link is not) appears once the experience has mounted.
    await expect(page.getByRole('link', { name: 'All templates' })).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(500);

    const painted = await page.evaluate(() => {
      const root = document.body;
      return root.innerText.trim().length > 0 && root.getBoundingClientRect().height > 100;
    });
    expect(painted, 'page has visible content').toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    expect(errors).toEqual([]);
  });
}
