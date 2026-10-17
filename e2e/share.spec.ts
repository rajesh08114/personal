import { expect, test, type Page } from '@playwright/test';

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
  await expect(linkInput).toHaveValue(/\/birthday\/[a-z2-9]{10}$/);
  const link = await linkInput.inputValue();

  // A second browser context has no IndexedDB in common with the creator: it behaves like the recipient's phone.
  const recipientContext = await browser.newContext();
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

test('first visit lands in the gallery, unknown pages 404, privacy page exists', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/templates$/);
  expect((await page.request.get('/definitely-not-a-page')).status()).toBe(404);
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { name: 'Your birthday, your data' })).toBeVisible();
});
