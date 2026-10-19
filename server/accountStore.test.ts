import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MongoClient } from 'mongodb';
import { MemoryAccountStore, type AccountStore } from './accounts';
import { MongoAccountStore } from './mongoAccounts';
import { createDefaultConfig } from '../src/data/defaultConfig';

const MONGO = process.env.MONGODB_TEST_URI;
const PNG = (seed: string) =>
  Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.from(seed.padEnd(40, '.'))]);

/**
 * The same contract for every account store: ownership is part of every lookup, so a second user
 * can never reach the first one's data. MongoDB runs when MONGODB_TEST_URI is set (CI starts a service).
 */
const dbName = `accounts_test_${process.pid}_${Date.now()}`;
const BACKENDS: Array<{ name: string; make: () => AccountStore; cleanup?: () => Promise<unknown> }> = [
  { name: 'memory', make: () => new MemoryAccountStore() },
];
if (MONGO) {
  BACKENDS.push({
    name: 'mongodb',
    make: () => new MongoAccountStore(MONGO, dbName),
    cleanup: async () => {
      const client = new MongoClient(MONGO);
      await client.connect();
      await client.db(dbName).dropDatabase();
      await client.close();
    },
  });
}

describe.each(BACKENDS)('$name account store', ({ make, cleanup }) => {
  let store: AccountStore;
  beforeAll(async () => {
    store = make();
    await store.init();
  });
  afterAll(async () => {
    await store.close();
    await cleanup?.();
  });

  const newUser = async (email: string) => (await store.createUser({ email, name: email, passwordHash: 'hash' }))!;
  const unique = (label: string) => `${label}-${Math.random().toString(36).slice(2)}@example.com`;

  it('keeps emails unique', async () => {
    const email = unique('dup');
    expect(await newUser(email)).toMatchObject({ email });
    expect(await store.createUser({ email, name: 'again', passwordHash: 'x' })).toBeNull();
    expect((await store.userByEmail(email))?.name).toBe(email);
    expect(await store.userByEmail(unique('nobody'))).toBeNull();
  });

  it('finds a user by session until it expires, and signs out', async () => {
    const user = await newUser(unique('session'));
    await store.createSession('live-hash', user.id, new Date(Date.now() + 60_000));
    await store.createSession('old-hash', user.id, new Date(Date.now() - 1000));
    await store.createSession('other-hash', user.id, new Date(Date.now() + 60_000));
    expect((await store.userForSession('live-hash'))?.id).toBe(user.id);
    expect(await store.userForSession('old-hash')).toBeNull();
    expect(await store.userForSession('unknown')).toBeNull();
    await store.deleteSessionsForUser(user.id, 'live-hash');
    expect(await store.userForSession('live-hash')).not.toBeNull();
    expect(await store.userForSession('other-hash')).toBeNull();
    await store.deleteSession('live-hash');
    expect(await store.userForSession('live-hash')).toBeNull();
  });

  it('scopes works to their owner', async () => {
    const [a, b] = [await newUser(unique('a')), await newUser(unique('b'))];
    const config = { ...createDefaultConfig(), birthdayPerson: 'Maya' };
    const work = await store.createWork(a.id, 'Mine', config);
    expect(work.config.birthdayPerson).toBe('Maya');
    expect((await store.getWork(a.id, work.id))?.title).toBe('Mine');
    expect(await store.getWork(b.id, work.id)).toBeNull();
    expect(await store.listWorks(b.id)).toEqual([]);
    expect(await store.updateWork(b.id, work.id, { title: 'Stolen' })).toBeNull();
    expect(await store.deleteWork(b.id, work.id)).toBeNull();
    expect((await store.getWork(a.id, work.id))?.title).toBe('Mine');
  });

  it('updates works, and sets and clears the published id', async () => {
    const a = await newUser(unique('upd'));
    const work = await store.createWork(a.id, 'First', createDefaultConfig());
    const renamed = await store.updateWork(a.id, work.id, { title: 'Second', shareId: 'abcdefghij' });
    expect(renamed).toMatchObject({ title: 'Second', shareId: 'abcdefghij' });
    expect((await store.updateWork(a.id, work.id, { title: 'Third' }))?.shareId).toBe('abcdefghij');
    expect((await store.updateWork(a.id, work.id, { shareId: null }))?.shareId).toBeUndefined();
    expect((await store.getWork(a.id, work.id))?.shareId).toBeUndefined();
    expect((await store.listWorks(a.id)).map((w) => w.title)).toEqual(['Third']);
    expect((await store.deleteWork(a.id, work.id))?.id).toBe(work.id);
    expect(await store.getWork(a.id, work.id)).toBeNull();
  });

  it('stores library files as bytes once per owner, and scopes them', async () => {
    const [a, b] = [await newUser(unique('lib-a')), await newUser(unique('lib-b'))];
    const bytes = PNG('library');
    const first = await store.putMedia(a.id, bytes, 'image/png', 'one.png');
    const again = await store.putMedia(a.id, bytes, 'image/png', 'two.png');
    expect(again.id).toBe(first.id);
    expect(first).toMatchObject({ kind: 'image', mime: 'image/png', size: bytes.length, name: 'one.png' });

    // The same file in another account is a separate copy.
    const theirs = await store.putMedia(b.id, bytes, 'image/png', 'copy.png');
    expect(theirs.id).not.toBe(first.id);

    const read = await store.readMedia(a.id, first.id);
    expect(read?.bytes.equals(bytes)).toBe(true);
    expect(await store.readMedia(b.id, first.id)).toBeNull();
    expect(await store.getMedia(b.id, first.id)).toBeNull();
    expect(await store.deleteMedia(b.id, first.id)).toBe(false);
    expect((await store.listMedia(a.id)).map((m) => m.id)).toEqual([first.id]);
    expect(await store.mediaUsage(a.id)).toBe(bytes.length);
    expect(await store.mediaUsage(b.id)).toBe(bytes.length);

    expect(await store.deleteMedia(a.id, first.id)).toBe(true);
    expect(await store.readMedia(a.id, first.id)).toBeNull();
    expect(await store.mediaUsage(a.id)).toBe(0);
  });

  it('keeps a large song intact', async () => {
    const a = await newUser(unique('song'));
    const song = Buffer.alloc(12 * 1024 * 1024, 7);
    song.write('RIFF', 0, 'latin1');
    song.write('WAVE', 8, 'latin1');
    const record = await store.putMedia(a.id, song, 'audio/wav', 'song.wav');
    expect(record.kind).toBe('audio');
    const back = await store.readMedia(a.id, record.id);
    expect(back?.bytes.length).toBe(song.length);
    expect(back?.bytes.equals(song)).toBe(true);
  });

  it('hands out each one-time token once, and only to its own kind, before it expires', async () => {
    const user = await newUser(unique('token'));
    const soon = new Date(Date.now() + 60_000);
    await store.createToken('reset', user.id, 'reset-1', soon);
    expect(await store.consumeToken('verify', 'reset-1')).toBeNull(); // wrong kind (and it survives that)
    expect(await store.consumeToken('reset', 'reset-1')).toBe(user.id);
    expect(await store.consumeToken('reset', 'reset-1')).toBeNull(); // used up
    expect(await store.consumeToken('reset', 'never-issued')).toBeNull();

    await store.createToken('reset', user.id, 'reset-expired', new Date(Date.now() - 1000));
    expect(await store.consumeToken('reset', 'reset-expired')).toBeNull();

    // A newer token of the same kind replaces the older one; other kinds are untouched.
    await store.createToken('reset', user.id, 'reset-old', soon);
    await store.createToken('verify', user.id, 'verify-1', soon);
    await store.createToken('reset', user.id, 'reset-new', soon);
    expect(await store.consumeToken('reset', 'reset-old')).toBeNull();
    expect(await store.consumeToken('verify', 'verify-1')).toBe(user.id);
    await store.createToken('reset', user.id, 'reset-newer', soon);
    await store.deleteTokens(user.id);
    expect(await store.consumeToken('reset', 'reset-newer')).toBeNull();
  });

  it('remembers when an address was confirmed, and finds a work by its public id', async () => {
    const user = await newUser(unique('verified'));
    expect((await store.userById(user.id))?.emailVerifiedAt).toBeUndefined();
    await store.markEmailVerified(user.id);
    const first = (await store.userById(user.id))?.emailVerifiedAt;
    expect(first).toBeTruthy();
    await store.markEmailVerified(user.id);
    expect((await store.userById(user.id))?.emailVerifiedAt).toBe(first);

    const shareId = `s${Math.random().toString(36).slice(2, 11)}`;
    expect(await store.workByShareId(shareId)).toBeNull();
    const work = await store.createWork(user.id, 'Claimed', createDefaultConfig(), shareId);
    expect(work.shareId).toBe(shareId);
    expect((await store.workByShareId(shareId))?.id).toBe(work.id);
    expect((await store.getWork(user.id, work.id))?.shareId).toBe(shareId);
  });

  it('deletes everything a user owns, and nothing else', async () => {
    const [a, b] = [await newUser(unique('del-a')), await newUser(unique('del-b'))];
    await store.createSession('del-a-session', a.id, new Date(Date.now() + 60_000));
    await store.createSession('del-b-session', b.id, new Date(Date.now() + 60_000));
    const published = await store.createWork(a.id, 'Public', createDefaultConfig());
    await store.updateWork(a.id, published.id, { shareId: 'zzzzzzzzzz' });
    await store.createWork(a.id, 'Draft', createDefaultConfig());
    await store.putMedia(a.id, PNG('a-file'), 'image/png', 'a.png');
    const keep = await store.createWork(b.id, 'Keep', createDefaultConfig());
    await store.putMedia(b.id, PNG('b-file'), 'image/png', 'b.png');

    expect((await store.deleteUser(a.id)).shareIds).toEqual(['zzzzzzzzzz']);
    expect(await store.userById(a.id)).toBeNull();
    expect(await store.userForSession('del-a-session')).toBeNull();
    expect(await store.listWorks(a.id)).toEqual([]);
    expect(await store.listMedia(a.id)).toEqual([]);

    expect((await store.userById(b.id))?.id).toBe(b.id);
    expect(await store.userForSession('del-b-session')).not.toBeNull();
    expect((await store.getWork(b.id, keep.id))?.title).toBe('Keep');
    expect(await store.listMedia(b.id)).toHaveLength(1);
  });
});
