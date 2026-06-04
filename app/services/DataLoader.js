// DataLoader: orquesta la carga de todas las fuentes declaradas en el registry.
// Flujo por fuente:
//   1. ¿Hay copia válida en IndexedDB? → usar (instantáneo).
//   2. ¿Estamos en https/http? → fetch URL + parsear + guardar en IDB.
//   3. ¿Estamos en file://? → mostrar UI de carga de archivos (FilePicker).
//   4. Si el usuario ya subió un archivo antes, se reusa desde IDB.

import { sources } from '../../data/sources/sources.js';
import { XlsxRepository, XlsxAvanceRepository, XlsxNavegacionRepository, XlsxConfigRepository } from '../repositories/adapters/XlsxRepository.js';

function pickClass(name) {
  if (name === 'avance') return XlsxAvanceRepository;
  if (name === 'navegacion') return XlsxNavegacionRepository;
  if (name === 'config') return XlsxConfigRepository;
  return XlsxRepository;
}

export class DataLoader {
  /**
   * @param {{ baseUrl?: string }} [opts]
   */
  constructor({ baseUrl = './' } = {}) {
    this._baseUrl = baseUrl;
    this._repos = {};
    this._cache = new Map();
    this._env = typeof location !== 'undefined' ? location.protocol : 'http:';
  }

  async init() {
    for (const src of sources) {
      const Cls = pickClass(src.id);
      const repo = new Cls({
        id: src.id,
        url: src.archivo,
        sheet: src.hoja,
        baseUrl: this._baseUrl,
      });
      this._repos[src.id] = repo;
    }
    return this._repos;
  }

  get repos() {
    return this._repos;
  }

  async get(name) {
    if (this._cache.has(name)) return this._cache.get(name);
    const repo = this._repos[name];
    if (!repo) {
      const src = sources.find((s) => s.id === name);
      if (!src) throw new Error(`DataLoader: fuente "${name}" no registrada`);
      const Cls = pickClass(name);
      this._repos[name] = new Cls({ id: name, baseUrl: this._baseUrl });
    }
    try {
      const data = await this._repos[name].getAll();
      this._cache.set(name, data);
      return data;
    } catch (err) {
      const src = sources.find((s) => s.id === name);
      if (src?.obligatorio) throw err;
      console.warn(`[DataLoader] fuente opcional "${name}" no cargada:`, err.message);
      this._cache.set(name, null);
      return null;
    }
  }

  async refresh(name) {
    if (this._repos[name]) this._repos[name].invalidate();
    this._cache.delete(name);
    return this.get(name);
  }

  setFile(name, file) {
    const repo = this._repos[name];
    if (!repo) throw new Error(`DataLoader.setFile: fuente "${name}" no existe`);
    repo.setFile(file);
    this._cache.delete(name);
  }

  async status() {
    const out = [];
    for (const src of sources) {
      const repo = this._repos[src.id];
      const has = await repo?.loadFromCache().then(Boolean).catch(() => false);
      const isFile = this._env === 'file:';
      let state = 'missing';
      if (has) state = 'cached';
      else if (!isFile && repo?.url) state = 'http';
      else if (isFile) state = 'pending-file';
      out.push({ id: src.id, nombre: src.nombre, state, obligatorio: src.obligatorio });
    }
    return out;
  }

  async listMissing() {
    const st = await this.status();
    return st.filter((s) => s.state === 'missing' || s.state === 'pending-file');
  }
}
