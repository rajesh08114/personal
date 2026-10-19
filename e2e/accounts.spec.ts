import { type APIRequestContext, type Browser, type Page } from '@playwright/test';
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
    if (msg.type() === 'error' && !/favicon|Failed to load resource/.test(msg.text())) errors.push(msg.text());
  });
  return errors;
}

const PASSWORD = 'correct horse battery';
const email = (label: string) => `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

async function registerInBrowser(page: Page, address: string, name: string, next = '/dashboard') {
  await page.goto(`/register?next=${encodeURIComponent(next)}`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Your name').fill(name);
  await page.getByLabel('Email').fill(address);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  // Signed up and moved on: from here the login cookie is set.
  await page.waitForURL((url) => url.pathname !== '/register');
}

/** Logs out through the account menu, as a person would, and checks they end up on the home page. */
async function logOut(page: Page) {
  await page.getByRole('button', { name: /Account menu for/ }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/:\d+\/$/);
  await expect(page.getByRole('link', { name: 'Log in' }).first()).toBeVisible();
}

/** A second person, signed up over the API in their own browser context. */
async function otherPerson(browser: Browser, baseURL: string) {
  const context = await browser.newContext({ baseURL });
  const origin = new URL(baseURL).origin;
  const res = await context.request.post('/api/auth/register', {
    data: { email: email('other'), password: PASSWORD, name: 'Other' },
    headers: { Origin: origin },
  });
  expect(res.status()).toBe(201);
  return { context, origin };
}

test('the studio, dashboard and library need a login', async ({ page }) => {
  for (const path of ['/create', '/dashboard']) {
    await page.goto(path);
    // The first page this server renders can be slow: it is cold, and the suite starts everything at once.
    await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(path)}`), { timeout: 20_000 });
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  }
  // Templates stay public.
  expect((await page.goto('/templates'))?.status()).toBe(200);
  await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible();
  // And the API says no without a session.
  expect((await page.request.get('/api/works')).status()).toBe(401);
  expect((await page.request.get('/api/library')).status()).toBe(401);
});

test('log in is not fooled by a crafted next address', async ({ page }) => {
  await page.goto('/register?next=//evil.example/x');
  await page.getByLabel('Your name').fill('Mallory');
  await page.getByLabel('Email').fill(email('next'));
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('sign up → build with photos in the library → publish → isolation → delete', async ({ page, browser, baseURL }) => {
  const errors = watchErrors(page);
  const photo = await makePhoto(page);
  const me = email('maya');

  // Sign up, and land back in the studio.
  await registerInBrowser(page, me, 'Alex', '/create');
  await expect(page).toHaveURL(/\/create$/);
  await page.getByLabel('Birthday person’s name').fill('Maya');
  await page.getByLabel('Your name').fill('Alex');
  await page.getByRole('button', { name: /Main photos/ }).click();
  await page
    .locator('input[type=file][accept*="image"]')
    .first()
    .setInputFiles({ name: 'maya.png', mimeType: 'image/png', buffer: photo });
  await expect(page.getByRole('button', { name: 'Adjust hero photo' })).toBeVisible();

  // The photo went into the library, and the work saved itself holding only a reference to it.
  await expect
    .poll(async () => {
      const list = (await (await page.request.get('/api/works')).json()) as { works: Array<{ birthdayPerson: string; heroImage?: string }> };
      return list.works[0]?.birthdayPerson === 'Maya' ? list.works[0].heroImage : undefined;
    })
    .toMatch(/^\/api\/library\/[a-f0-9]{24}\/file$/);
  const library = (await (await page.request.get('/api/library')).json()) as { items: Array<{ id: string; kind: string }> };
  expect(library.items).toHaveLength(1);
  expect(library.items[0].kind).toBe('image');
  const works = (await (await page.request.get('/api/works')).json()) as { works: Array<{ id: string }> };
  const workId = works.works[0].id;
  const libraryId = library.items[0].id;

  // Publish; a recipient with no login can open it, and its photo is public.
  await page.getByRole('button', { name: /^Share/ }).first().click();
  await page.getByRole('button', { name: /Publish & create share link/ }).click();
  const linkInput = page.getByLabel('Share link');
  await expect(linkInput).toHaveValue(/\/birthday\/[a-z2-9]{10}$/, { timeout: 20_000 });
  const link = await linkInput.inputValue();

  const recipientContext = await stubFonts(await browser.newContext());
  const recipient = await recipientContext.newPage();
  const recipientErrors = watchErrors(recipient);
  expect((await recipient.goto(link))?.status()).toBe(200);
  await expect(recipient).toHaveTitle(/Maya/);
  const image = await recipient.locator('meta[property="og:image"]').getAttribute('content');
  expect(image).toMatch(/\/media\/[a-f0-9]{64}\.webp$/);
  expect((await recipient.request.get(image!)).status()).toBe(200);
  // The recipient has no way into the private library behind it.
  expect((await recipient.request.get(`/api/library/${libraryId}/file`, { failOnStatusCode: false })).status()).toBe(401);
  expect(recipientErrors).toEqual([]);

  // The dashboard lists it, published; the library tab lists the photo.
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Hello, Alex.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Maya’s birthday' })).toBeVisible();
  await expect(page.getByText('Published', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Library' }).click();
  await expect(page.getByRole('img', { name: 'maya.png' })).toBeVisible();

  // Someone else signed in elsewhere sees none of it, and can't reach it by id.
  const other = await otherPerson(browser, baseURL!);
  expect((await other.context.request.get(`/api/works/${workId}`)).status()).toBe(404);
  expect((await other.context.request.get(`/api/library/${libraryId}/file`)).status()).toBe(404);
  expect((await other.context.request.delete(`/api/works/${workId}`, { headers: { Origin: other.origin } })).status()).toBe(404);
  expect(((await (await other.context.request.get('/api/works')).json()) as { works: unknown[] }).works).toEqual([]);
  expect(((await (await other.context.request.get('/api/library')).json()) as { items: unknown[] }).items).toEqual([]);
  await other.context.close();

  // Deleting the birthday takes its link down.
  await page.getByRole('tab', { name: 'My birthdays' }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).first().click();
  await page.getByRole('alert').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Birthday deleted.')).toBeVisible();
  expect((await recipient.goto(link))?.status()).toBe(404);
  await recipientContext.close();
  expect(errors).toEqual([]);
});

test('log out, log back in, and delete the account', async ({ page }) => {
  const me = email('cycle');
  await registerInBrowser(page, me, 'Sam');
  await expect(page.getByRole('heading', { name: 'Hello, Sam.' })).toBeVisible();

  await logOut(page);
  await page.goto('/create');
  await expect(page).toHaveURL(/\/login\?next=%2Fcreate/);

  // Wrong password, then the right one.
  await page.getByLabel('Email').fill(me);
  await page.getByLabel('Password', { exact: true }).fill('not the password');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.locator('p[role=alert]')).toContainText('Wrong email or password.');
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/create$/);

  await page.goto('/dashboard');
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Delete my account…' }).click();
  await page.getByLabel('Enter your password to confirm').fill(PASSWORD);
  await page.getByRole('button', { name: 'Delete everything' }).click();
  await expect(page).toHaveURL(/:\d+\/$/);

  const gone = await page.request.post('/api/auth/login', {
    data: { email: me, password: PASSWORD },
    headers: { Origin: new URL(page.url()).origin },
    failOnStatusCode: false,
  });
  expect(gone.status()).toBe(401);
});

test('"Use this template" logs in first, then starts a birthday with that template', async ({ page }) => {
  await page.goto('/templates/starry-night');
  await page.getByRole('button', { name: /^Use/ }).click();
  await expect(page).toHaveURL(/\/login\?next=%2Fcreate%3Ftemplate%3Dstarry-night/);

  // The sign-up link keeps the destination.
  await page.getByRole('link', { name: 'Create an account' }).click();
  await page.getByLabel('Your name').fill('Jo');
  await page.getByLabel('Email').fill(email('tpl'));
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/create$/);

  await page.getByLabel('Birthday person’s name').fill('Ari');
  await expect
    .poll(async () => {
      const list = (await (await page.request.get('/api/works')).json()) as { works: Array<{ templateId: string; birthdayPerson: string }> };
      return list.works[0] && `${list.works[0].templateId}:${list.works[0].birthdayPerson}`;
    })
    .toBe('starry-night:Ari');
});

// ── Email: the app talks to a stand-in for Resend (see scripts/e2e-servers.mjs) ──────────────────

const MAIL = 'http://127.0.0.1:4319';

/** The newest email to `to` whose subject matches, waiting for it: mail is sent after the response. */
async function waitForMail(request: APIRequestContext, to: string, subject: RegExp) {
  let found: { subject: string; from: string; text: string } | undefined;
  await expect
    .poll(
      async () => {
        const all = (await (await request.get(`${MAIL}/outbox?to=${encodeURIComponent(to)}`)).json()) as Array<{ subject: string; from: string; text: string }>;
        found = [...all].reverse().find((m) => subject.test(m.subject));
        return !!found;
      },
      { timeout: 15_000 },
    )
    .toBe(true);
  return found!;
}

const linkIn = (text: string) => /https?:\/\/\S+/.exec(text)![0];

test('forgot password: an emailed link, once, signs everyone out and sets the new password', async ({ page, request }) => {
  const errors = watchErrors(page);
  const me = email('forgot');
  const NEW = 'a brand new passphrase';
  await registerInBrowser(page, me, 'Pat');
  await expect(page.getByRole('heading', { name: 'Hello, Pat.' })).toBeVisible();
  await logOut(page);

  // Ask for the link. An address with no account looks exactly the same from the outside.
  await page.goto('/login');
  await page.getByRole('link', { name: 'Forgot your password?' }).click();
  await expect(page.getByRole('heading', { name: 'Forgot your password?' })).toBeVisible();
  await page.getByLabel('Email').fill(email('stranger'));
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
  await page.goto('/forgot-password');
  await page.getByLabel('Email').fill(me);
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();

  const mail = await waitForMail(request, me, /Reset your Birthday Studio password/);
  expect(mail.from).toBe('Birthday Studio <hello@birthday.test>');
  const link = linkIn(mail.text);
  expect(link).toMatch(/\/reset-password\?token=[\w-]{30,}$/);

  // The link opens the form and then takes its token out of the address bar.
  await page.goto(link);
  await expect(page.getByRole('heading', { name: 'Choose a new password' })).toBeVisible();
  await expect(page).toHaveURL(/\/reset-password$/);
  await page.getByLabel('New password').fill(NEW);
  await page.getByLabel('Type it again').fill('something else entirely');
  await page.getByRole('button', { name: 'Change password' }).click();
  await expect(page.locator('p[role=alert]')).toContainText('don’t match');
  await page.getByLabel('Type it again').fill(NEW);
  await page.getByRole('button', { name: 'Change password' }).click();
  await expect(page.getByRole('heading', { name: 'Password changed' })).toBeVisible();
  await waitForMail(request, me, /password was changed/);

  // Old password out, new password in.
  await page.getByRole('link', { name: 'Log in' }).click();
  await page.getByLabel('Email').fill(me);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.locator('p[role=alert]')).toContainText('Wrong email or password.');
  await page.getByLabel('Password', { exact: true }).fill(NEW);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  // The link was one-time.
  await page.context().clearCookies();
  await page.goto(link);
  await page.getByLabel('New password').fill('yet another passphrase');
  await page.getByLabel('Type it again').fill('yet another passphrase');
  await page.getByRole('button', { name: 'Change password' }).click();
  await expect(page.locator('p[role=alert]')).toContainText('expired or was already used');
  expect(errors.filter((e) => !/status of 400/.test(e))).toEqual([]);
});

test('no email goes to an address that has no account', async ({ page, request }) => {
  const ghost = email('ghost');
  await page.goto('/forgot-password');
  await page.getByLabel('Email').fill(ghost);
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
  await page.waitForTimeout(1500);
  expect(await (await request.get(`${MAIL}/outbox?to=${encodeURIComponent(ghost)}`)).json()).toEqual([]);
});

test('confirm the email address from the link sent at sign-up', async ({ page, request }) => {
  const me = email('verify');
  await registerInBrowser(page, me, 'Val');
  await expect(page.getByText('Please confirm')).toBeVisible();

  const mail = await waitForMail(request, me, /Confirm your email/);
  await page.goto(linkIn(mail.text));
  await expect(page).toHaveURL(/\/verify-email$/);
  await page.getByRole('button', { name: 'Confirm my email' }).click();
  await expect(page.getByRole('heading', { name: 'Email confirmed' })).toBeVisible();

  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Hello, Val.' })).toBeVisible();
  await expect(page.getByText('Please confirm')).toHaveCount(0);
});

test('duplicate a birthday from the dashboard', async ({ page }) => {
  await registerInBrowser(page, email('dup'), 'Zed');
  const made = await page.request.post('/api/works', {
    data: { config: { birthdayPerson: 'Zed' } },
    headers: { Origin: new URL(page.url()).origin },
  });
  expect(made.status()).toBe(201);
  await page.reload();
  await page.getByRole('button', { name: 'Duplicate' }).click();
  await expect(page.getByRole('heading', { name: 'Copy of Zed’s birthday' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Zed’s birthday', exact: true })).toBeVisible();
});

// ── The product flow: landing → sign up → dashboard → profile ────────────────────────────────────

test('the home page says what this is and why to sign up, and the buttons follow who is looking', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('A birthday they’ll keep');
  await expect(page.getByRole('heading', { name: 'Three steps, no design skills.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /ways to say it/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /A free account keeps everything/ })).toBeVisible();
  // Signed out: the header offers Log in and Get started, the page offers the first step.
  await expect(page.getByRole('banner').getByRole('link', { name: 'Log in' })).toBeVisible();
  await expect(page.getByRole('banner').getByRole('link', { name: 'Get started' })).toBeVisible();
  const cta = page.getByRole('link', { name: 'Create your first birthday' }).first();
  await expect(cta).toHaveAttribute('href', '/register?next=%2Ftemplates');

  // Following it: sign up, then straight on to choosing a template (not an empty dashboard).
  await cta.click();
  await page.getByLabel('Your name').fill('Nia');
  await page.getByLabel('Email').fill(email('landing'));
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/templates$/);
  await expect(page.getByRole('button', { name: /Account menu for Nia/ })).toBeVisible();

  // Back on the home page, the same buttons now lead into the account.
  await page.getByRole('link', { name: 'Birthday Studio' }).first().click();
  await expect(page.getByRole('link', { name: 'Go to my birthdays' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Create your first birthday' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Go to my birthdays' }).first().click();
  await expect(page).toHaveURL(/\/dashboard$/);
  // A brand-new account sees what to do next, not a blank page.
  await expect(page.getByRole('heading', { name: 'Make your first birthday' })).toBeVisible();
});

test('the account menu reaches everything, and closes with Escape', async ({ page }) => {
  await registerInBrowser(page, email('menu'), 'Ola');
  await page.getByRole('button', { name: /Account menu for Ola/ }).click();
  const menu = page.getByRole('menu', { name: 'Account' });
  await expect(menu).toContainText('Ola');
  for (const name of ['My birthdays', 'Photo & music library', 'Open the studio', 'Profile & settings', 'Log out']) {
    await expect(menu.getByRole('menuitem', { name })).toBeVisible();
  }
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);

  await page.getByRole('button', { name: /Account menu for Ola/ }).click();
  await page.getByRole('menuitem', { name: 'Photo & music library' }).click();
  await expect(page).toHaveURL(/\/dashboard\?tab=library$/);
  await expect(page.getByRole('tab', { name: 'Library', selected: true })).toBeVisible();
  await page.getByRole('button', { name: /Account menu for Ola/ }).click();
  await page.getByRole('menuitem', { name: 'Profile & settings' }).click();
  await expect(page).toHaveURL(/\/profile$/);
});

test('the profile shows who you are and what you use, renames you, and signs out other devices', async ({ page, browser, baseURL }) => {
  const me = email('profile');
  await registerInBrowser(page, me, 'Ravi');
  await page.goto('/profile');
  await expect(page.getByRole('heading', { level: 1, name: 'Ravi' })).toBeVisible();
  await expect(page.getByText(me, { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Member since')).toBeVisible();
  const usage = page.getByRole('region', { name: 'What you’re using' });
  await expect(usage).toContainText('Birthdays');
  await expect(usage).toContainText('of 50');
  await expect(usage).toContainText('of 200 MB');

  // Rename: the heading, the menu and the greeting on the dashboard all follow.
  await page.getByLabel('Name', { exact: true }).fill('Ravi K');
  await page.getByRole('button', { name: 'Save name' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Ravi K' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Account menu for Ravi K/ })).toBeVisible();
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Hello, Ravi K.' })).toBeVisible();

  // A second device signs in, then is signed out from here while this one stays in.
  const phone = await browser.newContext({ baseURL });
  const phoneOrigin = new URL(baseURL!).origin;
  expect((await phone.request.post('/api/auth/login', { data: { email: me, password: PASSWORD }, headers: { Origin: phoneOrigin } })).status()).toBe(200);
  expect(((await (await phone.request.get('/api/auth/me')).json()) as { user: unknown }).user).not.toBeNull();
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Sign out other devices' }).click();
  await expect(page.getByText('Signed out everywhere else.')).toBeVisible();
  expect(((await (await phone.request.get('/api/auth/me')).json()) as { user: unknown }).user).toBeNull();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Ravi K' })).toBeVisible();
  await phone.close();
});

test('the profile needs a login, and logging out from it goes home', async ({ page }) => {
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/login\?next=%2Fprofile/, { timeout: 20_000 });
  await page.getByLabel('Email').fill(email('nobody'));
  await page.getByLabel('Password', { exact: true }).fill('not a real password');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.locator('p[role=alert]')).toContainText('Wrong email or password.');

  await registerInBrowser(page, email('leave'), 'Lee', '/profile');
  await expect(page.getByRole('heading', { level: 1, name: 'Lee' })).toBeVisible();
  await page.getByRole('button', { name: 'Log out', exact: true }).click();
  await expect(page).toHaveURL(/:\d+\/$/);
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
});
