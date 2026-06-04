// Container de Inyección de Dependencias (D de SOLID).
// Permite inyectar repositorios/servicios sin acoplar el código a su concreción.

export class Container {
  constructor() {
    this._bindings = new Map();
    this._instances = new Map();
  }

  /**
   * Registra una dependencia.
   * @param {symbol|string} key
   * @param {Function} factory
   * @param {{ singleton?: boolean }} [options]
   */
  register(key, factory, options = { singleton: true }) {
    this._bindings.set(key, { factory, options });
  }

  /**
   * Registra una instancia ya construida.
   */
  registerInstance(key, instance) {
    this._instances.set(key, instance);
  }

  /**
   * Resuelve una dependencia (lazy o singleton según registro).
   * @param {symbol|string} key
   */
  resolve(key) {
    if (this._instances.has(key)) return this._instances.get(key);
    const binding = this._bindings.get(key);
    if (!binding) throw new Error(`Container: no binding for "${String(key)}"`);
    const instance = binding.factory(this);
    if (binding.options.singleton !== false) this._instances.set(key, instance);
    return instance;
  }

  has(key) {
    return this._bindings.has(key) || this._instances.has(key);
  }
}
