// EventBus: bus de eventos desacoplado. Patrón Observer.
// Usado para que componentes se comuniquen sin referencias directas.

export class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  /**
   * Suscribe un listener a un evento.
   * @param {string} event
   * @param {(payload:any)=>void} fn
   * @returns {() => void} función de desuscripción
   */
  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    this._listeners.get(event)?.delete(fn);
  }

  emit(event, payload) {
    const set = this._listeners.get(event);
    if (!set) return;
    for (const fn of set) {
      try {
        fn(payload);
      } catch (err) {
        console.error(`[EventBus] listener de "${event}" lanzó:`, err);
      }
    }
  }

  once(event, fn) {
    const off = this.on(event, (p) => {
      off();
      fn(p);
    });
    return off;
  }

  clear(event) {
    if (event) this._listeners.delete(event);
    else this._listeners.clear();
  }
}
