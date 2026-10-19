import { Binary, MongoClient, MongoServerError, type Collection, type Db } from 'mongodb';
import type { BirthdayConfig } from '../src/types/birthday';
import type { MediaType } from './store';
import {
  mediaKind,
  newAccountId,
  sha256,
  type AccountStore,
  type MediaRecord,
  type TokenKind,
  type UserRecord,
  type WorkRecord,
} from './accounts';

interface UserDoc extends Omit<UserRecord, 'id' | 'createdAt' | 'emailVerifiedAt'> {
  _id: string;
  createdAt: Date;
  emailVerifiedAt?: Date;
}
interface TokenDoc {
  _id: string; // the token hash
  kind: TokenKind;
  userId: string;
  expiresAt: Date;
}
interface SessionDoc {
  _id: string; // the token hash
  userId: string;
  expiresAt: Date;
}
interface WorkDoc extends Omit<WorkRecord, 'id' | 'createdAt' | 'updatedAt' | 'shareId'> {
  _id: string;
  shareId?: string;
  createdAt: Date;
  updatedAt: Date;
}
interface MediaDoc extends Omit<MediaRecord, 'id' | 'createdAt'> {
  _id: string;
  createdAt: Date;
  /** The file itself, as BSON binary: the same bytes a base64 string would hold, without the 33% overhead. */
  data?: Binary;
}

const user = ({ _id, createdAt, emailVerifiedAt, ...rest }: UserDoc): UserRecord => ({
  ...rest,
  id: _id,
  createdAt: createdAt.toISOString(),
  emailVerifiedAt: emailVerifiedAt?.toISOString(),
});
const work = ({ _id, createdAt, updatedAt, ...rest }: WorkDoc): WorkRecord => ({
  ...rest,
  id: _id,
  createdAt: createdAt.toISOString(),
  updatedAt: updatedAt.toISOString(),
});
const media = ({ _id, createdAt, data: _data, ...rest }: MediaDoc): MediaRecord => ({
  ...rest,
  id: _id,
  createdAt: createdAt.toISOString(),
});

/**
 * MongoDB accounts. Every query on works and media includes the owner's id in its filter, so
 * another user's documents are unreachable by construction, not by a check made afterwards.
 */
export class MongoAccountStore implements AccountStore {
  private readonly client: MongoClient;
  private db!: Db;
  private users!: Collection<UserDoc>;
  private sessions!: Collection<SessionDoc>;
  private tokens!: Collection<TokenDoc>;
  private works!: Collection<WorkDoc>;
  private files!: Collection<MediaDoc>;

  constructor(
    uri: string,
    private readonly dbName?: string,
  ) {
    this.client = new MongoClient(uri, {
      appName: 'birthday-studio-accounts',
      serverSelectionTimeoutMS: 10_000,
      ignoreUndefined: true,
    });
  }

  async init(): Promise<void> {
    await this.client.connect();
    this.db = this.client.db(this.dbName || undefined);
    this.users = this.db.collection<UserDoc>('users');
    this.sessions = this.db.collection<SessionDoc>('sessions');
    this.tokens = this.db.collection<TokenDoc>('tokens');
    this.works = this.db.collection<WorkDoc>('works');
    this.files = this.db.collection<MediaDoc>('userMedia');
    await Promise.all([
      this.users.createIndex({ email: 1 }, { unique: true }),
      this.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      this.sessions.createIndex({ userId: 1 }),
      this.tokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      this.tokens.createIndex({ userId: 1, kind: 1 }),
      this.works.createIndex({ shareId: 1 }, { sparse: true }),
      this.works.createIndex({ ownerId: 1, updatedAt: -1 }),
      this.files.createIndex({ ownerId: 1, sha256: 1 }, { unique: true }),
      this.files.createIndex({ ownerId: 1, createdAt: -1 }),
    ]);
  }

  async close(): Promise<void> {
    await this.client.close();
  }

  async createUser(input: { email: string; name: string; passwordHash: string }) {
    const doc: UserDoc = { _id: newAccountId(), ...input, createdAt: new Date() };
    try {
      await this.users.insertOne(doc);
    } catch (err) {
      if (err instanceof MongoServerError && err.code === 11000) return null;
      throw err;
    }
    return user(doc);
  }
  async userByEmail(email: string) {
    const doc = await this.users.findOne({ email });
    return doc ? user(doc) : null;
  }
  async userById(id: string) {
    const doc = await this.users.findOne({ _id: id });
    return doc ? user(doc) : null;
  }
  async setPasswordHash(id: string, passwordHash: string) {
    await this.users.updateOne({ _id: id }, { $set: { passwordHash } });
  }
  async markEmailVerified(id: string) {
    await this.users.updateOne({ _id: id, emailVerifiedAt: { $exists: false } }, { $set: { emailVerifiedAt: new Date() } });
  }
  async createToken(kind: TokenKind, userId: string, tokenHash: string, expiresAt: Date) {
    await this.tokens.deleteMany({ userId, kind });
    await this.tokens.insertOne({ _id: tokenHash, kind, userId, expiresAt });
  }
  async consumeToken(kind: TokenKind, tokenHash: string) {
    // One atomic step, so two requests with the same link can't both succeed.
    const doc = await this.tokens.findOneAndDelete({ _id: tokenHash, kind, expiresAt: { $gt: new Date() } });
    return doc?.userId ?? null;
  }
  async deleteTokens(userId: string, kind?: TokenKind) {
    await this.tokens.deleteMany({ userId, ...(kind ? { kind } : {}) });
  }
  async setName(id: string, name: string) {
    await this.users.updateOne({ _id: id }, { $set: { name } });
  }
  async deleteUser(id: string) {
    const shareIds = (await this.works.find({ ownerId: id, shareId: { $exists: true } }).toArray()).map(
      (w) => w.shareId!,
    );
    await Promise.all([
      this.works.deleteMany({ ownerId: id }),
      this.files.deleteMany({ ownerId: id }),
      this.sessions.deleteMany({ userId: id }),
      this.tokens.deleteMany({ userId: id }),
    ]);
    await this.users.deleteOne({ _id: id });
    return { shareIds };
  }

  async createSession(tokenHash: string, userId: string, expiresAt: Date) {
    await this.sessions.insertOne({ _id: tokenHash, userId, expiresAt });
  }
  async userForSession(tokenHash: string) {
    // The TTL index removes expired sessions only every minute or so, so expiry is checked here too.
    const session = await this.sessions.findOne({ _id: tokenHash, expiresAt: { $gt: new Date() } });
    return session ? this.userById(session.userId) : null;
  }
  async deleteSession(tokenHash: string) {
    await this.sessions.deleteOne({ _id: tokenHash });
  }
  async deleteSessionsForUser(userId: string, keep?: string) {
    await this.sessions.deleteMany({ userId, ...(keep ? { _id: { $ne: keep } } : {}) });
  }

  async listWorks(ownerId: string) {
    return (await this.works.find({ ownerId }).sort({ updatedAt: -1 }).toArray()).map(work);
  }
  async getWork(ownerId: string, id: string) {
    const doc = await this.works.findOne({ _id: id, ownerId });
    return doc ? work(doc) : null;
  }
  async workByShareId(shareId: string) {
    const doc = await this.works.findOne({ shareId });
    return doc ? work(doc) : null;
  }
  async createWork(ownerId: string, title: string, config: BirthdayConfig, shareId?: string) {
    const now = new Date();
    const doc: WorkDoc = { _id: newAccountId(), ownerId, title, config, ...(shareId ? { shareId } : {}), createdAt: now, updatedAt: now };
    await this.works.insertOne(doc);
    return work(doc);
  }
  async updateWork(ownerId: string, id: string, patch: { title?: string; config?: BirthdayConfig; shareId?: string | null }) {
    const $set: Partial<WorkDoc> = { updatedAt: new Date() };
    if (patch.title !== undefined) $set.title = patch.title;
    if (patch.config !== undefined) $set.config = patch.config;
    if (typeof patch.shareId === 'string') $set.shareId = patch.shareId;
    const update = patch.shareId === null ? { $set, $unset: { shareId: '' as const } } : { $set };
    const doc = await this.works.findOneAndUpdate({ _id: id, ownerId }, update, { returnDocument: 'after' });
    return doc ? work(doc) : null;
  }
  async deleteWork(ownerId: string, id: string) {
    const doc = await this.works.findOneAndDelete({ _id: id, ownerId });
    return doc ? work(doc) : null;
  }

  async listMedia(ownerId: string) {
    const docs = await this.files
      .find({ ownerId }, { projection: { data: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map(media);
  }
  async mediaUsage(ownerId: string) {
    const [sum] = await this.files
      .aggregate<{ total: number }>([
        { $match: { ownerId } },
        { $group: { _id: null, total: { $sum: '$size' } } },
      ])
      .toArray();
    return sum?.total ?? 0;
  }
  async putMedia(ownerId: string, bytes: Buffer, mime: MediaType, name: string) {
    const hash = sha256(bytes);
    const find = () => this.files.findOne({ ownerId, sha256: hash }, { projection: { data: 0 } });
    const existing = await find();
    if (existing) return media(existing);
    const doc: MediaDoc = {
      _id: newAccountId(),
      ownerId,
      kind: mediaKind(mime),
      mime,
      size: bytes.length,
      sha256: hash,
      name,
      createdAt: new Date(),
      data: new Binary(bytes),
    };
    try {
      await this.files.insertOne(doc);
    } catch (err) {
      // Two uploads of the same file at once: the unique index keeps one, and both callers get it.
      if (err instanceof MongoServerError && err.code === 11000) {
        const winner = await find();
        if (winner) return media(winner);
      }
      throw err;
    }
    return media(doc);
  }
  async getMedia(ownerId: string, id: string) {
    const doc = await this.files.findOne({ _id: id, ownerId }, { projection: { data: 0 } });
    return doc ? media(doc) : null;
  }
  async readMedia(ownerId: string, id: string) {
    const doc = await this.files.findOne({ _id: id, ownerId });
    return doc?.data ? { record: media(doc), bytes: Buffer.from(doc.data.buffer) } : null;
  }
  async deleteMedia(ownerId: string, id: string) {
    const result = await this.files.deleteOne({ _id: id, ownerId });
    return result.deletedCount === 1;
  }
}
