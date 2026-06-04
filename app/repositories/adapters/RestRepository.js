// Adaptador REST genérico. Resuelve ${ENV.VAR} en headers y body.

/**
 * Interpola variables ${ENV.NOMBRE} desde un objeto de entorno.
 * @param {string} str
 * @param {Record<string,string>} env
 */
function interpolar(str, env = {}) {
  return String(str).replace(/\$\{ENV\.([A-Z0-9_]+)\}/g, (_, k) => env[k] ?? '');
}

export class RestRepository {
  /**
   * @param {string} endpoint  URL del endpoint REST
   * @param {Record<string,string>} headers  cabeceras (acepta ${ENV.X})
   * @param {object} [options]
   * @param {string} [options.method]  método HTTP (default GET)
   * @param {object} [options.body]    body de la petición
   * @param {Record<string,(data:any)=>any>} [options.mappers]  funciones de transformación
   * @param {Record<string,string>} [options.env]  variables de entorno para interpolación
   */
  constructor(endpoint, headers = {}, options = {}) {
    this.endpoint = endpoint;
    this.headers = headers;
    this.method = options.method || 'GET';
    this.body = options.body;
    this.mappers = options.mappers || {};
    this.env = options.env || {};
    this._cache = null;
  }

  async _fetch() {
    if (this._cache) return this._cache;
    const url = interpolar(this.endpoint, this.env);
    const headers = Object.fromEntries(
      Object.entries(this.headers).map(([k, v]) => [k, interpolar(v, this.env)])
    );

    const init = { method: this.method, headers };
    if (this.body && this.method !== 'GET') {
      init.body = typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
      if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, init);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`REST ${res.status} ${res.statusText} — ${url}\n${text}`);
    }
    const data = await res.json();
    this._cache = data;
    return data;
  }

  async getAll() {
    return this._fetch();
  }

  invalidate() {
    this._cache = null;
  }
}
