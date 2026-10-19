import type { ServerConfig } from './config';
import type { Log } from './http';

export interface Message {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface Mailer {
  readonly mode: ServerConfig['email']['mode'];
  /** Sends one email. Resolves false, without sending, when the daily ceiling has been reached. Throws if the provider fails. */
  send(message: Message): Promise<boolean>;
}

/**
 * Email through Resend's HTTP API (no SDK needed). In `log` mode, which is for development, messages are
 * written to the server log instead, so a reset link can be copied from there. In `off` mode nothing is sent.
 * Whatever the mode, no more than `dailyLimit` emails go out in a UTC day.
 */
export function createMailer(
  config: ServerConfig['email'],
  log: Log = () => {},
  fetchImpl: typeof fetch = fetch,
  now: () => number = Date.now,
): Mailer {
  let day = '';
  let sentToday = 0;

  return {
    mode: config.mode,
    async send(message) {
      if (config.mode === 'off') return false;
      const today = new Date(now()).toISOString().slice(0, 10);
      if (today !== day) {
        day = today;
        sentToday = 0;
      }
      if (sentToday >= config.dailyLimit) {
        log({ level: 'warn', event: 'email-daily-limit', limit: config.dailyLimit });
        return false;
      }
      sentToday++;

      if (config.mode === 'log') {
        log({ level: 'info', event: 'email', to: message.to, subject: message.subject, text: message.text });
        return true;
      }

      const res = await fetchImpl(config.apiUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: config.from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          html: message.html,
        }),
        // A slow provider must not hold a request open.
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        // Count it against the cap anyway: a failing provider shouldn't be hammered.
        throw new Error(`Resend answered ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`);
      }
      return true;
    },
  };
}

// ── Messages ─────────────────────────────────────────────────────────────────

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function layout(heading: string, paragraphs: string[], action?: { label: string; url: string }, footer?: string): string {
  const body = paragraphs.map((p) => `<p style="margin:0 0 16px;line-height:1.6">${escapeHtml(p)}</p>`).join('');
  const button = action
    ? `<p style="margin:24px 0"><a href="${escapeHtml(action.url)}" style="background:#24201b;color:#f4efe6;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:8px;display:inline-block">${escapeHtml(action.label)}</a></p>` +
      `<p style="margin:0 0 16px;line-height:1.6;font-size:13px;color:#5b5348">Or paste this address into your browser:<br><a href="${escapeHtml(action.url)}" style="color:#5b5348;word-break:break-all">${escapeHtml(action.url)}</a></p>`
    : '';
  return (
    `<!doctype html><html><body style="margin:0;padding:24px;background:#f4efe6;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#24201b">` +
    `<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px">` +
    `<h1 style="margin:0 0 20px;font-size:22px">${escapeHtml(heading)}</h1>${body}${button}` +
    (footer ? `<p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#8a7f70">${escapeHtml(footer)}</p>` : '') +
    `</div></body></html>`
  );
}

const first = (name: string) => name.trim().split(/\s+/)[0] || 'there';

export function resetPasswordMessage(to: string, name: string, url: string, minutes: number): Message {
  const intro = `Hi ${first(name)}, someone asked to reset the password for your Birthday Studio account.`;
  const expiry = `The link works once, for ${minutes} minutes.`;
  const ignore = 'If that wasn’t you, you can ignore this email. Your password stays as it is.';
  return {
    to,
    subject: 'Reset your Birthday Studio password',
    text: `${intro}\n\nChoose a new password:\n${url}\n\n${expiry}\n\n${ignore}\n`,
    html: layout('Reset your password', [intro, expiry], { label: 'Choose a new password', url }, ignore),
  };
}

export function verifyEmailMessage(to: string, name: string, url: string, hours: number): Message {
  const intro = `Hi ${first(name)}, welcome to Birthday Studio. Please confirm this is your email address.`;
  const why = 'It lets you reset your password later if you ever forget it.';
  const expiry = `The link works once, for ${hours} hours.`;
  const ignore = 'If you didn’t create this account, you can ignore this email.';
  return {
    to,
    subject: 'Confirm your email for Birthday Studio',
    text: `${intro}\n\n${why}\n\nConfirm your email:\n${url}\n\n${expiry}\n\n${ignore}\n`,
    html: layout('Confirm your email', [intro, why, expiry], { label: 'Confirm my email', url }, ignore),
  };
}

export function passwordChangedMessage(to: string, name: string, origin: string): Message {
  const intro = `Hi ${first(name)}, the password for your Birthday Studio account was just changed, and you were signed out on your other devices.`;
  const warning = `If that wasn’t you, reset your password right away at ${origin}/forgot-password.`;
  return {
    to,
    subject: 'Your Birthday Studio password was changed',
    text: `${intro}\n\n${warning}\n`,
    html: layout('Your password was changed', [intro, warning]),
  };
}
