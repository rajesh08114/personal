import { type Page } from '@playwright/test';
import { expect, stubFonts, test } from './fixtures';

/** A real PNG to upload, made by screenshotting a coloured box. */
async function makePhoto(page: Page): Promise<Buffer> {
  await page.setContent(
    '<div style="width:400px;height:300px;background:linear-gradient(45deg,#d9467a,#f6c66a)"></div>',
  );
  return page.locator('div').screenshot();
}

/** CSP violations and uncaught errors fail the test. */
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !/favicon|Failed to load resource.*404/.test(msg.text()))
      errors.push(msg.text());
  });
  return errors;
}

test('create → upload → publish → open on another device → unpublish', async ({ page, browser }) => {
  const photo = await makePhoto(page);
  const creatorErrors = watchErrors(page);

  await page.goto('/create');
  await page.getByLabel('Birthday person’s name').fill('Maya');
  await page.getByLabel('Your name').fill('Alex');

  await page.getByRole('button', { name: /Main photos/ }).click();
  await page
    .locator('input[type=file][accept*="image"]')
    .first()
    .setInputFiles({ name: 'maya.png', mimeType: 'image/png', buffer: photo });
  await expect(page.getByRole('button', { name: 'Adjust hero photo' })).toBeVisible();

  await page
    .getByRole('button', { name: /^Share/ })
    .first()
    .click();
  await page.getByRole('button', { name: /Publish & create share link/ }).click();
  const linkInput = page.getByLabel('Share link');
  await expect(linkInput).toHaveValue(/\/birthday\/[a-z2-9]{10}$/, { timeout: 20_000 });
  const link = await linkInput.inputValue();

  // A second browser context has no IndexedDB in common with the creator: it behaves like the recipient's phone.
  const recipientContext = await stubFonts(await browser.newContext());
  const recipient = await recipientContext.newPage();
  const recipientErrors = watchErrors(recipient);
  const res = await recipient.goto(link);
  expect(res?.status()).toBe(200);
  await expect(recipient).toHaveTitle(/Maya/);
  const image = await recipient.locator('meta[property="og:image"]').getAttribute('content');
  expect(image).toMatch(/\/media\/[a-f0-9]{64}\.webp$/);
  await expect(recipient.getByText('Maya').first()).toBeVisible();
  // The photo was uploaded (re-encoded to WEBP in the browser) and is served from this origin.
  const media = await recipient.request.get(image!);
  expect(media.status()).toBe(200);
  expect(media.headers()['content-type']).toBe('image/webp');
  expect(recipientErrors).toEqual([]);

  await page.getByRole('button', { name: 'Unpublish' }).click();
  await page.getByRole('button', { name: 'Remove link' }).click();
  await expect(page.getByText('The link has been removed')).toBeVisible();

  const gone = await recipient.goto(link);
  expect(gone?.status()).toBe(404);
  await expect(recipient.getByText('This surprise couldn’t be found.')).toBeVisible();
  await recipientContext.close();
  expect(creatorErrors).toEqual([]);
});

test('the home page explains the product and opens the studio without a login; unknown pages 404; privacy exists', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('A birthday they’ll keep');
  // No accounts here: nothing about logging in, and the way in is the studio itself.
  await expect(page.getByRole('link', { name: 'Log in' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Open the studio' }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /A free account keeps everything/ })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /ways to say it/ })).toBeVisible();
  await page.getByRole('link', { name: 'Browse templates' }).first().click();
  await expect(page).toHaveURL(/\/templates$/);
  expect((await page.request.get('/definitely-not-a-page')).status()).toBe(404);
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { name: 'Your birthday, your data' })).toBeVisible();
});

test('a shared link carries escaped link-preview tags and stays out of search engines', async ({ page, request }) => {
  const photo = await makePhoto(page);
  const upload = await request.post('/api/media', { data: photo, headers: { 'Content-Type': 'image/png' } });
  expect(upload.status()).toBe(201);
  const { url } = (await upload.json()) as { url: string };
  const created = await request.post('/api/birthdays', {
    data: { birthdayPerson: 'Maya "<b>', senderName: 'Alex', heroImage: url },
  });
  expect(created.status()).toBe(201);
  const { id } = (await created.json()) as { id: string };

  const res = await request.get(`/birthday/${id}`);
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toContain('<title>Happy Birthday, Maya &quot;&lt;b&gt;!</title>');
  expect(html).toContain(`<meta property="og:image" content="${url}"/>`);
  expect(html).toContain('Alex made you a birthday surprise');
  expect(html).not.toContain('<b>!');
  expect(html).toMatch(/<meta name="robots" content="noindex, nofollow"\/>/);
  expect((await request.get('/birthday/aaaaaaaaaa')).status()).toBe(404);
});

test('large songs upload in full, and over-limit ones are refused', async ({ request }) => {
  const wav = (bytes: number) => {
    const body = Buffer.alloc(bytes, 1);
    body.write('RIFF', 0, 'latin1');
    body.write('WAVE', 8, 'latin1');
    return body;
  };
  // Above the 10 MB a proxy would buffer, below the 13 MB audio limit.
  const ok = await request.post('/api/media', { data: wav(12 * 1024 * 1024), headers: { 'Content-Type': 'audio/wav' } });
  expect(ok.status()).toBe(201);
  const { url } = (await ok.json()) as { url: string };
  const head = await request.head(url);
  expect(head.headers()['content-length']).toBe(String(12 * 1024 * 1024));
  const tooBig = await request.post('/api/media', { data: wav(14 * 1024 * 1024), headers: { 'Content-Type': 'audio/wav' } });
  expect(tooBig.status()).toBe(413);
});
