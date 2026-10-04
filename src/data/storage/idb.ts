/**
 * Tiny promise wrapper around IndexedDB. Used instead of localStorage because
 * compressed photos and music easily exceed localStorage's ~5 MB limit.
 */
const DB_NAME = 'birthday-studio';
const DB_VERSION = 1;
export const STORES = { drafts: 'drafts', birthdays: 'birthdays' } as const;
type StoreName = (typeof STORES)[keyof typeof STORES];

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      Object.values(STORES).forEach((name) => {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name);
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Could not open storage.'));
  });
  dbPromise.catch(() => {
    dbPromise = null;
  });
  return dbPromise;
}

function run<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const req = fn(tx.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error('Storage request failed.'));
        tx.onabort = () => reject(tx.error ?? new Error('Storage transaction aborted.'));
      }),
  );
}

export const idb = {
  get: <T>(store: StoreName, key: string) => run<T | undefined>(store, 'readonly', (s) => s.get(key)),
  set: (store: StoreName, key: string, value: unknown) => run(store, 'readwrite', (s) => s.put(value, key)),
  delete: (store: StoreName, key: string) => run(store, 'readwrite', (s) => s.delete(key)),
};
