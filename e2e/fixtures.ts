import { test as base, expect, type BrowserContext } from '@playwright/test';

/**
 * Every page asks Google Fonts for type. That is a third party the suite shouldn't depend on: a slow or
 * reset connection stalls the page's load event and shows up as a console error. The fonts are answered
 * locally with an empty file, and the pages fall back to their system fonts.
 */
export async function stubFonts<T extends BrowserContext>(context: T): Promise<T> {
  await context.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) =>
    route.fulfill({
      status: 200,
      contentType: route.request().resourceType() === 'stylesheet' ? 'text/css' : 'font/woff2',
      body: '',
    }),
  );
  return context;
}

export const test = base.extend({
  context: async ({ context }, provide) => {
    await provide(await stubFonts(context));
  },
});

export { expect };
