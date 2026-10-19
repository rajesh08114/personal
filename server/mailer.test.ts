import { describe, expect, it } from 'vitest';
import { loadConfig } from './config';
import { createMailer, passwordChangedMessage, resetPasswordMessage, verifyEmailMessage } from './mailer';

const base = loadConfig({}).email;
const resend = { ...base, mode: 'resend' as const, resendApiKey: 're_secret_key', from: 'Birthday Studio <hello@birthday.test>' };
const message = { to: 'maya@example.com', subject: 'Hello', text: 'Hi', html: '<p>Hi</p>' };

describe('config', () => {
  it('needs a From address with a Resend key, and is off with neither', () => {
    expect(loadConfig({}).email.mode).toBe('off');
    expect(() => loadConfig({ RESEND_API_KEY: 're_x' })).toThrow(/EMAIL_FROM/);
    const on = loadConfig({ RESEND_API_KEY: 're_x', EMAIL_FROM: 'A <a@b.test>' }).email;
    expect(on).toMatchObject({ mode: 'resend', from: 'A <a@b.test>', perAddressPerHour: 3, perIpPerHour: 10, dailyLimit: 500 });
    expect(loadConfig({ EMAIL: 'log' }).email.mode).toBe('log');
    expect(loadConfig({}).email.apiUrl).toBe('https://api.resend.com/emails');
    expect(() => loadConfig({ RESEND_API_URL: 'not a url' })).toThrow(/RESEND_API_URL/);
  });
});

describe('mailer', () => {
  it('posts to Resend with the key in the header, never in the body', async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const mailer = createMailer(resend, undefined, (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response('{"id":"1"}', { status: 200 });
    }) as unknown as typeof fetch);
    expect(await mailer.send(message)).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://api.resend.com/emails');
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('Bearer re_secret_key');
    const body = JSON.parse(calls[0].init.body as string);
    expect(body).toEqual({ from: resend.from, to: ['maya@example.com'], subject: 'Hello', text: 'Hi', html: '<p>Hi</p>' });
    expect(JSON.stringify(body)).not.toContain('re_secret_key');
  });

  it('throws when Resend refuses, without echoing the key', async () => {
    const mailer = createMailer(resend, undefined, (async () => new Response('{"message":"domain not verified"}', { status: 403 })) as unknown as typeof fetch);
    const error = await mailer.send(message).catch((e: Error) => e);
    expect((error as Error).message).toContain('403');
    expect((error as Error).message).toContain('domain not verified');
    expect((error as Error).message).not.toContain('re_secret_key');
  });

  it('stops at the daily ceiling, and starts again the next day', async () => {
    let now = Date.parse('2026-10-18T10:00:00Z');
    const logged: object[] = [];
    let sent = 0;
    const mailer = createMailer(
      { ...resend, dailyLimit: 2 },
      (entry) => logged.push(entry),
      (async () => (sent++, new Response('{}', { status: 200 }))) as unknown as typeof fetch,
      () => now,
    );
    expect([await mailer.send(message), await mailer.send(message), await mailer.send(message)]).toEqual([true, true, false]);
    expect(sent).toBe(2);
    expect(logged).toContainEqual(expect.objectContaining({ event: 'email-daily-limit' }));
    now = Date.parse('2026-10-19T00:00:01Z');
    expect(await mailer.send(message)).toBe(true);
  });

  it('logs instead of sending in log mode, and does nothing when off', async () => {
    const logged: Array<Record<string, unknown>> = [];
    let fetched = false;
    const spy = (async () => ((fetched = true), new Response('{}'))) as unknown as typeof fetch;
    expect(await createMailer({ ...base, mode: 'log' }, (e) => logged.push(e as Record<string, unknown>), spy).send(message)).toBe(true);
    expect(logged[0]).toMatchObject({ event: 'email', to: 'maya@example.com', subject: 'Hello' });
    expect(await createMailer({ ...base, mode: 'off' }, undefined, spy).send(message)).toBe(false);
    expect(fetched).toBe(false);
  });
});

describe('messages', () => {
  it('put the link in both the text and the HTML, and escape names', () => {
    const url = 'https://birthday.test/reset-password?token=abc_DEF-123';
    const m = resetPasswordMessage('maya@example.com', '<img src=x onerror=alert(1)> Maya', url, 60);
    expect(m.to).toBe('maya@example.com');
    expect(m.text).toContain(url);
    expect(m.html).toContain(`href="${url}"`);
    expect(m.html).not.toContain('<img');
    expect(m.text).toContain('60 minutes');
    const v = verifyEmailMessage('maya@example.com', 'Maya', 'https://birthday.test/verify-email?token=x', 24);
    expect(v.subject).toMatch(/Confirm/);
    expect(v.text).toContain('24 hours');
    const c = passwordChangedMessage('maya@example.com', 'Maya', 'https://birthday.test');
    expect(c.text).toContain('https://birthday.test/forgot-password');
  });
});
