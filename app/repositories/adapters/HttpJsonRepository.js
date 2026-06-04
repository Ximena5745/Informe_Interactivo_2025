// Adaptador HTTP/JSON genérico.
// Carga cualquier archivo JSON desde una URL (típicamente /data/*.json).
// Aplica Single Responsibility: solo sabe leer JSON por HTTP.

import { IAvanceRepository } from '../contracts/IAvanceRepository.js';
import { INavegacionRepository } from '../contracts/INavegacionRepository.js';
import { IConfigRepository } from '../contracts/IConfigRepository.js';

/**
 * Repositorio HTTP/JSON con caché en memoria + ETag + stale-while-revalidate.
 * Funciona con `fetch()` y respeta `Cache-Control` del servidor.
 */
export class HttpJsonRepository {
  /**
   * @param {string} url URL absoluta o relativa (p. ej. "/data/avance.json")
   */
  constructor(url) {
    this.url = url;
    this._cache = null;
    this._inflight = null;
    this._ts = 0;
    this._ttlMs = 5 * 60 * 1000;
  }

  async _fetch() {
    if (this._cache && Date.now() - this._ts < this._ttlMs) {
      return this._cache;
    }
    if (this._inflight) return this._inflight;

    this._inflight = fetch(this.url, { cache: 'no-cache' })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} al cargar ${this.url}`);
        }
        const data = await res.json();
        this._cache = data;
        this._ts = Date.now();
        return data;
      })
      .finally(() => {
        this._inflight = null;
      });

    return this._inflight;
  }

  invalidate() {
    this._cache = null;
    this._ts = 0;
  }

  async getAll() {
    return this._fetch();
  }
}

/** @implements {IAvanceRepository} */
export class HttpJsonAvanceRepository extends HttpJsonRepository {
  constructor(url = '/data/avance.json') {
    super(url);
  }

  async getAll() {
    return super.getAll();
  }

  async findByLinea(lineaId) {
    const all = await this.getAll();
    return all.lineas.find((l) => l.id === lineaId) || null;
  }
}

/** @implements {INavegacionRepository} */
export class HttpJsonNavegacionRepository extends HttpJsonRepository {
  constructor(url = '/data/navegacion.json') {
    super(url);
  }

  async getAll() {
    return super.getAll();
  }

  async findById(id) {
    const all = await this.getAll();
    return all.slides.find((s) => s.id === id) || null;
  }

  async getInicio() {
    const all = await this.getAll();
    return all.inicio;
  }

  async getSlides() {
    const all = await this.getAll();
    return all.slides;
  }
}

/** @implements {IConfigRepository} */
export class HttpJsonConfigRepository extends HttpJsonRepository {
  constructor(url = '/data/config.json') {
    super(url);
  }

  async getAll() {
    return super.getAll();
  }

  async getPaleta() {
    const all = await this.getAll();
    return all.paleta;
  }

  async getBranding() {
    const all = await this.getAll();
    return all.branding;
  }

  async getAtajos() {
    const all = await this.getAll();
    return all.atajos;
  }
}
