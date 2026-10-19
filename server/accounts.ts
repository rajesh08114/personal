import { createHash, randomBytes, scrypt, timingSafeEqual, type BinaryLike } from 'node:crypto';
import type { BirthdayConfig } from '../src/types/birthday';
import type { MediaType } from './store';

/**
 * Accounts: users, their sessions, their works (editable birthdays) and their media library.
 * Everything a user owns is read and written through methods that take the owner's id, so a
 * query for someone else's data simply finds nothing. See MemoryAccountStore (tests, dev) and
 * MongoAccountStore (production).
 */

export interface UserRecord {
  id: string;
  /** Lower-cased. */
  email: string;
  name: string;
  /** `scrypt$N$r$p$salt$hash`, see hashPassword. */
  passwordHash: string;
  createdAt: string;
  /** Set once they have followed the link sent to this address (or reset their password through it). */
  emailVerifiedAt?: string;
}

/** One-time links sent by email. */
export type TokenKind = 'reset' | 'verify';

export interface WorkRecord {
  id: string;
  ownerId: string;
  title: string;
  /** Media in here is `/api/library/<id>/file` references, never bytes. */
  config: BirthdayConfig;
  /** The public birthday id while this work is published. */
  shareId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaRecord {
  id: string;
  ownerId: string;
  kind: 'image' | 'audio';
  mime: MediaType;
  size: number;
  sha256: string;
  name: string;
  createdAt: string;
}

export interface AccountStore {
  init(): Promise<void>;
  close(): Promise<void>;

  /** Returns null when the email is already registered. */
  createUser(user: { email: string; name: string; passwordHash: string }): Promise<UserRecord | null>;
  userByEmail(email: string): Promise<UserRecord | null>;
  userById(id: string): Promise<UserRecord | null>;
  setPasswordHash(id: string, passwordHash: string): Promise<void>;
  setName(id: string, name: string): Promise<void>;
  markEmailVerified(id: string): Promise<void>;
  /** Removes the user, their sessions, works and library. Returns the public ids that were published. */
  deleteUser(id: string): Promise<{ shareIds: string[] }>;

  /** Stores a one-time token (as a hash). Any earlier token of that kind for the same user stops working. */
  createToken(kind: TokenKind, userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  /** Uses a token up: returns its user once, then never again, and never after it expired. */
  consumeToken(kind: TokenKind, tokenHash: string): Promise<string | null>;
  deleteTokens(userId: string, kind?: TokenKind): Promise<void>;

  createSession(tokenHash: string, userId: string, expiresAt: Date): Promise<void>;
  /** The user a session token belongs to, or null if it is unknown or expired. */
  userForSession(tokenHash: string): Promise<UserRecord | null>;
  deleteSession(tokenHash: string): Promise<void>;
  /** Signs the user out everywhere, except the session whose hash is `keep`. */
  deleteSessionsForUser(userId: string, keep?: string): Promise<void>;

  listWorks(ownerId: string): Promise<WorkRecord[]>;
  getWork(ownerId: string, id: string): Promise<WorkRecord | null>;
  /** Whoever's work is published under this public id. Only for checking it isn't taken. */
  workByShareId(shareId: string): Promise<WorkRecord | null>;
  createWork(
    ownerId: string,
    title: string,
    config: BirthdayConfig,
    shareId?: string,
  ): Promise<WorkRecord>;
  updateWork(
    ownerId: string,
    id: string,
    patch: { title?: string; config?: BirthdayConfig; shareId?: string | null },
  ): Promise<WorkRecord | null>;
  deleteWork(ownerId: string, id: string): Promise<WorkRecord | null>;

  listMedia(ownerId: string): Promise<MediaRecord[]>;
  /** Total bytes in the user's library. */
  mediaUsage(ownerId: string): Promise<number>;
  /** Stores the bytes once per user: the same file again returns the existing record. */
  putMedia(ownerId: string, bytes: Buffer, mime: MediaType, name: string): Promise<MediaRecord>;
  getMedia(ownerId: string, id: string): Promise<MediaRecord | null>;
  readMedia(ownerId: string, id: string): Promise<{ record: MediaRecord; bytes: Buffer } | null>;
  deleteMedia(ownerId: string, id: string): Promise<boolean>;
}

/** Ids are 24 hex characters: random, unguessable, and easy to validate. */
export const ACCOUNT_ID = /^[a-f0-9]{24}$/;
export const newAccountId = () => randomBytes(12).toString('hex');

export const mediaKind = (mime: MediaType): 'image' | 'audio' => (mime.startsWith('image/') ? 'image' : 'audio');

export const sha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

// ── Passwords ────────────────────────────────────────────────────────────────

const SCRYPT = { N: 32768, r: 8, p: 1, keylen: 64 } as const;

const scryptAsync = (password: BinaryLike, salt: Buffer, n: number, r: number, p: number, keylen: number) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, keylen, { N: n, r, p, maxmem: 256 * n * r }, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, SCRYPT.N, SCRYPT.r, SCRYPT.p, SCRYPT.keylen);
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString('base64'), key.toString('base64')].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const key = await scryptAsync(password, Buffer.from(salt, 'base64'), Number(n), Number(r), Number(p), expected.length);
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** Verifies against a throwaway hash, so "no such user" takes as long as "wrong password". */
let decoy: Promise<string> | undefined;
export async function burnPasswordCheck(password: string): Promise<void> {
  decoy ??= hashPassword('decoy-password-for-timing');
  await verifyPassword(password, await decoy);
}

// ── Sessions ─────────────────────────────────────────────────────────────────

export const newSessionToken = () => randomBytes(32).toString('base64url');
export const hashSessionToken = (token: string) => createHash('sha256').update(token).digest('hex');

// ── Input rules ──────────────────────────────────────────────────────────────

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD = 10;
export const MAX_PASSWORD = 200;

export const normalizeEmail = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && EMAIL.test(email) ? email : null;
};

// ── In-memory store (tests and development) ─────────────────────────────────

/** Keeps everything in process memory. Used by the tests; production uses MongoAccountStore. */
export class MemoryAccountStore implements AccountStore {
  private users = new Map<string, UserRecord>();
  private sessions = new Map<string, { userId: string; expiresAt: Date }>();
  private tokens = new Map<string, { kind: TokenKind; userId: string; expiresAt: Date }>();
  private works = new Map<string, WorkRecord>();
  private media = new Map<string, { record: MediaRecord; bytes: Buffer }>();

  async init() {}
  async close() {}

  async createUser(user: { email: string; name: string; passwordHash: string }) {
    if ([...this.users.values()].some((u) => u.email === user.email)) return null;
    const record: UserRecord = { ...user, id: newAccountId(), createdAt: new Date().toISOString() };
    this.users.set(record.id, record);
    return record;
  }
  async userByEmail(email: string) {
    return [...this.users.values()].find((u) => u.email === email) ?? null;
  }
  async userById(id: string) {
    return this.users.get(id) ?? null;
  }
  async setPasswordHash(id: string, passwordHash: string) {
    const user = this.users.get(id);
    if (user) user.passwordHash = passwordHash;
  }
  async setName(id: string, name: string) {
    const user = this.users.get(id);
    if (user) user.name = name;
  }
  async markEmailVerified(id: string) {
    const user = this.users.get(id);
    if (user && !user.emailVerifiedAt) user.emailVerifiedAt = new Date().toISOString();
  }
  async createToken(kind: TokenKind, userId: string, tokenHash: string, expiresAt: Date) {
    await this.deleteTokens(userId, kind);
    this.tokens.set(tokenHash, { kind, userId, expiresAt });
  }
  async consumeToken(kind: TokenKind, tokenHash: string) {
    const token = this.tokens.get(tokenHash);
    if (!token || token.kind !== kind) return null;
    this.tokens.delete(tokenHash);
    return token.expiresAt.getTime() > Date.now() ? token.userId : null;
  }
  async deleteTokens(userId: string, kind?: TokenKind) {
    for (const [key, t] of this.tokens) if (t.userId === userId && (!kind || t.kind === kind)) this.tokens.delete(key);
  }
  async deleteUser(id: string) {
    const shareIds = [...this.works.values()]
      .filter((w) => w.ownerId === id && w.shareId)
      .map((w) => w.shareId!);
    for (const [key, w] of this.works) if (w.ownerId === id) this.works.delete(key);
    for (const [key, m] of this.media) if (m.record.ownerId === id) this.media.delete(key);
    for (const [key, s] of this.sessions) if (s.userId === id) this.sessions.delete(key);
    await this.deleteTokens(id);
    this.users.delete(id);
    return { shareIds };
  }

  async createSession(tokenHash: string, userId: string, expiresAt: Date) {
    this.sessions.set(tokenHash, { userId, expiresAt });
  }
  async userForSession(tokenHash: string) {
    const session = this.sessions.get(tokenHash);
    if (!session || session.expiresAt.getTime() <= Date.now()) return null;
    return this.users.get(session.userId) ?? null;
  }
  async deleteSession(tokenHash: string) {
    this.sessions.delete(tokenHash);
  }
  async deleteSessionsForUser(userId: string, keep?: string) {
    for (const [key, s] of this.sessions) if (s.userId === userId && key !== keep) this.sessions.delete(key);
  }

  async listWorks(ownerId: string) {
    return [...this.works.values()]
      .filter((w) => w.ownerId === ownerId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  async getWork(ownerId: string, id: string) {
    const work = this.works.get(id);
    return work && work.ownerId === ownerId ? work : null;
  }
  async workByShareId(shareId: string) {
    return [...this.works.values()].find((w) => w.shareId === shareId) ?? null;
  }
  async createWork(ownerId: string, title: string, config: BirthdayConfig, shareId?: string) {
    const now = new Date().toISOString();
    const work: WorkRecord = { id: newAccountId(), ownerId, title, config, shareId, createdAt: now, updatedAt: now };
    this.works.set(work.id, work);
    return work;
  }
  async updateWork(ownerId: string, id: string, patch: { title?: string; config?: BirthdayConfig; shareId?: string | null }) {
    const work = await this.getWork(ownerId, id);
    if (!work) return null;
    if (patch.title !== undefined) work.title = patch.title;
    if (patch.config !== undefined) work.config = patch.config;
    if (patch.shareId !== undefined) work.shareId = patch.shareId ?? undefined;
    work.updatedAt = new Date().toISOString();
    return work;
  }
  async deleteWork(ownerId: string, id: string) {
    const work = await this.getWork(ownerId, id);
    if (work) this.works.delete(id);
    return work;
  }

  async listMedia(ownerId: string) {
    return [...this.media.values()]
      .map((m) => m.record)
      .filter((m) => m.ownerId === ownerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async mediaUsage(ownerId: string) {
    return (await this.listMedia(ownerId)).reduce((sum, m) => sum + m.size, 0);
  }
  async putMedia(ownerId: string, bytes: Buffer, mime: MediaType, name: string) {
    const hash = sha256(bytes);
    const existing = [...this.media.values()].find((m) => m.record.ownerId === ownerId && m.record.sha256 === hash);
    if (existing) return existing.record;
    const record: MediaRecord = {
      id: newAccountId(),
      ownerId,
      kind: mediaKind(mime),
      mime,
      size: bytes.length,
      sha256: hash,
      name,
      createdAt: new Date().toISOString(),
    };
    this.media.set(record.id, { record, bytes });
    return record;
  }
  async getMedia(ownerId: string, id: string) {
    const entry = this.media.get(id);
    return entry && entry.record.ownerId === ownerId ? entry.record : null;
  }
  async readMedia(ownerId: string, id: string) {
    const entry = this.media.get(id);
    return entry && entry.record.ownerId === ownerId ? entry : null;
  }
  async deleteMedia(ownerId: string, id: string) {
    if (!(await this.getMedia(ownerId, id))) return false;
    this.media.delete(id);
    return true;
  }
}
