import { GridFSBucket, MongoClient, MongoServerError, type Collection, type Db } from 'mongodb';
import type { BirthdayConfig } from '../src/types/birthday';
import { createId } from '../src/utils/id';
import {
  BIRTHDAY_ID,
  MEDIA_FILE,
  hashToken,
  mediaName,
  mediaReferences,
  newEditToken,
  type MediaType,
  type Store,
  type StoredBirthday,
  type StoredMedia,
} from './store';

interface BirthdayDoc extends Omit<StoredBirthday, 'id' | 'createdAt' | 'updatedAt'> {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const toRecord = ({ _id, createdAt, updatedAt, ...rest }: BirthdayDoc): StoredBirthday => ({
  ...rest,
  id: _id,
  createdAt: createdAt.toISOString(),
  updatedAt: updatedAt.toISOString(),
});

/**
 * MongoDB storage: birthdays in the `birthdays` collection, photos and songs in the
 * `media` GridFS bucket (chunked, so files aren't limited by the 16 MB document cap).
 * Uploads are named by content hash, so the same photo is stored once. Safe to share
 * between several server instances.
 */
export class MongoStore implements Store {
  private readonly client: MongoClient;
  private db!: Db;
  private birthdays!: Collection<BirthdayDoc>;
  private media!: GridFSBucket;

  constructor(
    uri: string,
    private readonly dbName?: string,
  ) {
    this.client = new MongoClient(uri, {
      appName: 'birthday-studio',
      serverSelectionTimeoutMS: 10_000,
      // Store absent optional fields as absent, not null, matching the file store.
      ignoreUndefined: true,
    });
  }

  async init(): Promise<void> {
    await this.client.connect();
    this.db = this.client.db(this.dbName || undefined);
    this.birthdays = this.db.collection<BirthdayDoc>('birthdays');
    this.media = new GridFSBucket(this.db, { bucketName: 'media' });
    await Promise.all([
      this.db.collection('media.files').createIndex({ filename: 1 }),
      this.db.collection('media.files').createIndex({ uploadDate: 1 }),
    ]);
  }

  async get(id: string): Promise<StoredBirthday | null> {
    if (!BIRTHDAY_ID.test(id)) return null;
    const doc = await this.birthdays.findOne({ _id: id });
    return doc ? toRecord(doc) : null;
  }

  async create(config: BirthdayConfig): Promise<{ id: string; editToken: string }> {
    const editToken = newEditToken();
    const now = new Date();
    for (let attempt = 0; ; attempt++) {
      const id = createId(10);
      try {
        await this.birthdays.insertOne({
          _id: id,
          tokenHash: hashToken(editToken),
          config,
          createdAt: now,
          updatedAt: now,
        });
        return { id, editToken };
      } catch (err) {
        // An id collision is astronomically rare; try another id rather than failing the publish.
        if (!(err instanceof MongoServerError && err.code === 11000) || attempt >= 3) throw err;
      }
    }
  }

  async update(record: StoredBirthday, config: BirthdayConfig): Promise<void> {
    await this.birthdays.updateOne({ _id: record.id }, { $set: { config, updatedAt: new Date() } });
  }

  async delete(id: string): Promise<void> {
    await this.birthdays.deleteOne({ _id: id });
  }

  async putMedia(bytes: Buffer, type: MediaType): Promise<string> {
    const name = mediaName(bytes, type);
    if (await this.findMedia(name)) return name;
    await new Promise<void>((resolve, reject) => {
      const upload = this.media.openUploadStream(name, { metadata: { contentType: type } });
      upload.once('finish', () => resolve());
      upload.once('error', reject);
      upload.end(bytes);
    });
    return name;
  }

  private findMedia(name: string) {
    // Two simultaneous uploads of the same photo can both be stored; any copy is identical.
    return this.db
      .collection<{ _id: unknown; length: number }>('media.files')
      .findOne({ filename: name }, { projection: { _id: 1, length: 1 }, sort: { uploadDate: 1 } });
  }

  async openMedia(name: string): Promise<StoredMedia | null> {
    if (!MEDIA_FILE.test(name)) return null;
    const file = await this.findMedia(name);
    if (!file) return null;
    return {
      size: file.length,
      // GridFS ranges are end-exclusive; HTTP ranges are inclusive.
      stream: (start, end) =>
        this.media.openDownloadStream(
          file._id as never,
          start === undefined ? {} : { start, end: (end ?? file.length - 1) + 1 },
        ),
    };
  }

  async collectGarbage(olderThanMs: number): Promise<number> {
    const referenced = new Set<string>();
    for await (const doc of this.birthdays.find({}, { projection: { config: 1 } })) {
      for (const name of mediaReferences(JSON.stringify(doc.config))) referenced.add(name);
    }
    const cutoff = new Date(Date.now() - olderThanMs);
    let removed = 0;
    for await (const file of this.media.find(
      { uploadDate: { $lt: cutoff } },
      { projection: { _id: 1, filename: 1 } },
    )) {
      if (referenced.has(file.filename)) continue;
      await this.media.delete(file._id);
      removed++;
    }
    return removed;
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}
