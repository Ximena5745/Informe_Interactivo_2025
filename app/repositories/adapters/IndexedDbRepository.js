// Adaptador IndexedDB. Persistencia local para modo offline + datos derivados.

const DB_NAME = 'pdi2025';
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(db, mode, fn) {
  return new Promise((resolve, reject) => {
    const t = db.transaction('kv', mode);
    const store = t.objectStore('kv');
    const result = fn(store);
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
  });
}

export class IndexedDbRepository {
  /**
   * @param {string} key  clave lógica dentro del object store
   */
  constructor(key) {
    this.key = key;
    this._dbPromise = null;
  }

  _db() {
    if (!this._dbPromise) this._dbPromise = openDb();
    return this._dbPromise;
  }

  async getAll() {
    const db = await this._db();
    return new Promise((resolve, reject) => {
      const req = db.transaction('kv').objectStore('kv').get(this.key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  }

  async set(value) {
    const db = await this._db();
    return new Promise((resolve, reject) => {
      const t = db.transaction('kv', 'readwrite');
      t.objectStore('kv').put(value, this.key);
      t.oncomplete = () => resolve(value);
      t.onerror = () => reject(t.error);
    });
  }

  async clear() {
    const db = await this._db();
    return new Promise((resolve, reject) => {
      const t = db.transaction('kv', 'readwrite');
      t.objectStore('kv').delete(this.key);
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
    });
  }
}
