import type { Api } from './api';
import type { Mailer, Message } from './mailer';

export const ORIGIN = 'https://birthday.test';
export const PNG = (seed: string) =>
  Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.from(seed.padEnd(40, '.'))]);
export const WAV = (size: number) => {
  const body = Buffer.alloc(size, 1);
  body.write('RIFF', 0, 'latin1');
  body.write('WAVE', 8, 'latin1');
  return body;
};
export const PASSWORD = 'correct horse battery';

/** One browser: keeps its own session cookie, like a real person's tab. */
export class Browser {
  cookie = '';
  constructor(
    private readonly api: Api,
    private readonly ip = '203.0.113.1',
  ) {}

  async call(method: string, url: string, body?: unknown, init: { origin?: string | null; headers?: Record<string, string>; raw?: Buffer } = {}) {
    const headers: Record<string, string> = { ...init.headers };
    if (init.origin !== null) headers.Origin = init.origin ?? ORIGIN;
    if (this.cookie) headers.Cookie = this.cookie;
    let payload: BodyInit | undefined;
    if (init.raw) payload = new Uint8Array(init.raw);
    else if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
    const res = await this.api.handleApi(new Request(`${ORIGIN}${url}`, { method, headers, body: payload }), this.ip);
    const set = res.headers.get('set-cookie');
    if (set) this.cookie = set.startsWith(`${name(set)}=;`) ? '' : set.split(';')[0];
    const isJson = (res.headers.get('content-type') ?? '').includes('json');
    const text = isJson ? await res.clone().text() : '';
    return { res, status: res.status, json: text ? (JSON.parse(text) as Record<string, any>) : null }; // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  async register(email: string, name = 'Test') {
    return this.call('POST', '/api/auth/register', { email, password: PASSWORD, name });
  }
  async upload(bytes: Buffer, fileName = 'photo.png') {
    return this.call('POST', '/api/library', undefined, { raw: bytes, headers: { 'X-File-Name': fileName } });
  }
}
const name = (setCookie: string) => setCookie.split('=')[0];


/** Records the emails instead of sending them, and can be told to fail like a provider outage. */
export class TestMailer implements Mailer {
  readonly mode = 'resend' as const;
  sent: Message[] = [];
  failing = false;
  async send(message: Message) {
    if (this.failing) throw new Error('Resend answered 500: provider is down');
    this.sent.push(message);
    return true;
  }
  /** The address in the latest email to `to`, and the one-time token in it. */
  latest(to: string) {
    const message = [...this.sent].reverse().find((m) => m.to === to);
    const match = message && /[?&]token=([\w-]+)/.exec(message.text);
    return { message, token: match?.[1] };
  }
}

/** Lets fire-and-forget work (emails sent after the response) finish. */
export const settled = () => new Promise((resolve) => setTimeout(resolve, 25));
