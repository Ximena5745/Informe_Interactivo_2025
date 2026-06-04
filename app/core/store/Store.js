// Store reactivo minimalista. Suscripción por clave + cambio notificado.
// Implementa Observer sin librería externa.

/**
 * @template T
 */
export class Store {
  constructor(initial = {}) {
    this._state = new Map(Object.entries(initial));
    this._subscribers = new Map();
    this._nextId = 0;
  }

  /**
   * @param {string} key
   * @returns {T|undefined}
   */
  get(key) {
    return this._state.get(key);
  }

  /**
   * @param {string|object} keyOrObj  clave o patch de varias claves
   * @param {*} [value]
   */
  set(keyOrObj, value) {
    const patch =
      typeof keyOrObj === 'string' ? { [keyOrObj]: value } : keyOrObj;
    for (const [k, v] of Object.entries(patch)) {
      const prev = this._state.get(k);
      this._state.set(k, v);
      this._notify(k, v, prev);
    }
  }

  /**
   * Suscribe a cambios de una clave.
   * @param {string} key
   * @param {(value:any, prev:any)=>void} fn
   * @returns {() => void} unsubscriber
   */
  subscribe(key, fn) {
    const id = ++this._nextId;
    if (!this._subscribers.has(key)) this._subscribers.set(key, new Map());
    this._subscribers.get(key).set(id, fn);
    return () => this._subscribers.get(key)?.delete(id);
  }

  _notify(key, value, prev) {
    const subs = this._subscribers.get(key);
    if (!subs) return;
    for (const fn of subs.values()) {
      try {
        fn(value, prev);
      } catch (err) {
        console.error(`[Store] subscriber de "${key}" lanzó:`, err);
      }
    }
  }
}
