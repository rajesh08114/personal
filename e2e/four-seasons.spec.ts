import { expect, test, type Page } from '@playwright/test';

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  return errors;
}

// The sample birthday is in October (northern autumn), so the year runs winter → spring → summer → autumn.
test('A Year Around You: curtains, four seasonal reveals and the finale', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/templates/four-seasons');
  await page.getByRole('button', { name: 'Open the curtains' }).click();
  await expect(page.getByText('The almanac of a year')).toBeVisible();
  expect(await page.$$eval('section[id^="fs-"]', (els) => els.map((e) => e.id))).toEqual([
    'fs-winter',
    'fs-spring',
    'fs-summer',
    'fs-autumn',
  ]);

  // Winter: wipe the frost by hand until the rest melts away.
  const winter = page.locator('#fs-winter');
  await winter.scrollIntoViewIfNeeded();
  const frost = winter.getByRole('img', { name: /Frosted window glass/ });
  await expect(frost).toBeVisible();
  const box = (await frost.boundingBox())!;
  for (let row = 0; row < 6 && (await frost.count()); row++) {
    const y = box.y + (box.height * (row + 0.5)) / 6;
    await page.mouse.move(box.x + 5, y);
    await page.mouse.move(box.x + box.width - 5, y, { steps: 30 });
  }
  await expect(frost).toHaveCount(0);

  // Spring: one bud by tap, the rest with the button.
  const spring = page.locator('#fs-spring');
  await spring.scrollIntoViewIfNeeded();
  await spring
    .getByRole('button', { name: /Open the bud/ })
    .first()
    .click();
  await spring.getByRole('button', { name: 'Let every bud bloom' }).click();
  await expect(spring.getByRole('button', { name: /Open the bud/ })).toHaveCount(0);

  // Summer: catch a firefly, then light the jar.
  const summer = page.locator('#fs-summer');
  await summer.scrollIntoViewIfNeeded();
  await summer.getByRole('button', { name: 'Catch a firefly' }).first().click();
  await expect(summer.getByRole('status')).toContainText('1 of');
  await summer.getByRole('button', { name: 'Light the jar' }).click();
  await expect(summer.getByRole('status')).toHaveText('The jar is full of light.');

  // Autumn: clear a pile from the keyboard, then rake the rest.
  const autumn = page.locator('#fs-autumn');
  await autumn.scrollIntoViewIfNeeded();
  const piles = autumn.getByRole('button', { name: 'Brush the leaves away' });
  const before = await piles.count();
  await piles.first().focus();
  await page.keyboard.press('Enter');
  await expect(piles).toHaveCount(before - 1);
  if (before > 1) await autumn.getByRole('button', { name: 'Rake all the leaves' }).click();
  await expect(piles).toHaveCount(0);

  // Opening a revealed memory shows it full screen.
  await autumn
    .getByRole('button', { name: /Open memory/ })
    .first()
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');

  // Finale: blow out the candles.
  await page.getByRole('button', { name: /Blow them all out/i }).click();
  await expect(page.getByRole('button', { name: 'Watch the year again' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('A Year Around You: reduced motion shows everything without gestures', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = watchErrors(page);
  await page.goto('/templates/four-seasons');
  await page.getByRole('button', { name: 'Open the curtains' }).click();
  await expect(page.getByText('The almanac of a year')).toBeVisible();
  await expect(page.getByRole('button', { name: /Open the bud/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Catch a firefly' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Brush the leaves away' })).toHaveCount(0);
  await expect(page.getByRole('img', { name: /Frosted window glass/ })).toHaveCount(0);
  expect(errors).toEqual([]);
  await context.close();
});
