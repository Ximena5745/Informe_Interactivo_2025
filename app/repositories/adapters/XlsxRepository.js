// XlsxRepository: carga libros Excel desde URL (HTTP), File (file://) o caché IndexedDB.
// Resuelve la fuente primaria de datos (XLSX) en cualquier entorno:
//   - GitHub Pages / servidor local → loadFromUrl() (fetch)
//   - file:// → loadFromFile() (FileReader sobre <input type=file>)
//   - Siempre → loadFromCache() primero (IndexedDB), evita re-cargar.

const IDB_NAME = 'pdi2025-cache';
const IDB_VERSION = 1;
const STORE_NAME = 'sources';

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbOp(mode, fn) {
  return openIDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const req = fn(tx.objectStore(STORE_NAME));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

const idbGet = (key) => idbOp('readonly', (s) => s.get(key));
const idbSet = (entry) => idbOp('readwrite', (s) => s.put(entry));
const idbDel = (key) => idbOp('readwrite', (s) => s.delete(key));
const idbKeys = () => idbOp('readonly', (s) => s.getAllKeys());

function getLib() {
  if (typeof XLSX === 'undefined') {
    throw new Error(
      'SheetJS (window.XLSX) no está cargado. Incluye vendor/xlsx.full.min.js en index.html antes de app/main.js.'
    );
  }
  return XLSX;
}

function resolveUrl(base, ref) {
  if (!ref) return base;
  if (/^(https?:|file:|data:|blob:)/i.test(ref)) return ref;
  return new URL(ref, base).href;
}

export class XlsxRepository {
  /**
   * @param {{
   *   id: string,
   *   url?: string,
   *   sheet?: string,
   *   file?: File,
   *   useCache?: boolean,
   *   baseUrl?: string
   * }} opts
   */
  constructor({ id, url, sheet, file, useCache = true, baseUrl = './' } = {}) {
    if (!id) throw new Error('XlsxRepository: id es obligatorio');
    this.id = id;
    this.url = url ? resolveUrl(baseUrl, url) : null;
    this.sheet = sheet || null;
    this.file = file || null;
    this.useCache = useCache;
    this._cache = null;
  }

  setUrl(url, baseUrl) {
    this.url = url ? resolveUrl(baseUrl || this.baseUrl || './', url) : null;
    this._cache = null;
  }

  setFile(file) {
    this.file = file || null;
    this._cache = null;
  }

  async _parse(arrayBuffer) {
    const XLSX = getLib();
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = this.sheet || wb.SheetNames[0];
    if (!wb.Sheets[sheetName]) {
      throw new Error(
        `XlsxRepository[${this.id}]: hoja "${sheetName}" no existe. Hojas disponibles: ${wb.SheetNames.join(', ')}`
      );
    }
    return XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });
  }

  async loadFromUrl(url = this.url) {
    if (!url) throw new Error(`XlsxRepository[${this.id}]: no URL configurada`);
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${url}`);
    const buf = await res.arrayBuffer();
    return this._parse(buf);
  }

  async loadFromFile(file = this.file) {
    if (!file) throw new Error(`XlsxRepository[${this.id}]: no se proporcionó archivo`);
    const buf = await file.arrayBuffer();
    return this._parse(buf);
  }

  async loadFromCache() {
    if (!this.useCache) return null;
    const entry = await idbGet(this.id);
    if (!entry || !entry.data) return null;
    return entry.data;
  }

  async saveToCache(data) {
    if (!this.useCache) return;
    await idbSet({ key: this.id, data, ts: Date.now() });
  }

  /**
   * Carga los datos probando: caché → URL → archivo.
   * Si todo falla, lanza error descriptivo.
   */
  async getAll() {
    if (this._cache) return this._cache;

    const cached = await this.loadFromCache();
    if (cached) {
      this._cache = cached;
      return cached;
    }

    if (this.url) {
      const data = await this.loadFromUrl();
      this._cache = data;
      await this.saveToCache(data);
      return data;
    }

    if (this.file) {
      const data = await this.loadFromFile();
      this._cache = data;
      await this.saveToCache(data);
      return data;
    }

    throw new Error(
      `XlsxRepository[${this.id}]: sin caché, sin URL y sin archivo. ` +
        'En file:// debes subir el archivo .xlsx desde la UI.'
    );
  }

  invalidate() {
    this._cache = null;
  }

  async clearCache() {
    if (!this.useCache) return;
    await idbDel(this.id);
    this._cache = null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Wrappers con semántica de dominio (cumplen IAvanceRepository, etc.)
// ────────────────────────────────────────────────────────────────────────────

/**
 * @param {Array<{lineas?:any[]}>} data
 * @param {string} lineaId
 */
function findLinea(data, lineaId) {
  const lineas = Array.isArray(data?.lineas) ? data.lineas : [];
  return lineas.find((l) => l.id === lineaId) || null;
}

export class XlsxAvanceRepository extends XlsxRepository {
  async findByLinea(lineaId) {
    const data = await this.getAll();
    return findLinea(data, lineaId);
  }
}

export class XlsxNavegacionRepository extends XlsxRepository {
  async findById(id) {
    const data = await this.getAll();
    const slides = Array.isArray(data?.slides) ? data.slides : [];
    return slides.find((s) => s.id === id) || null;
  }

  async getInicio() {
    const data = await this.getAll();
    return data?.inicio || 'home';
  }

  async getSlides() {
    const data = await this.getAll();
    return Array.isArray(data?.slides) ? data.slides : [];
  }
}

export class XlsxConfigRepository extends XlsxRepository {
  async getPaleta() {
    const data = await this.getAll();
    return data?.paleta;
  }

  async getBranding() {
    const data = await this.getAll();
    return data?.branding;
  }

  async getAtajos() {
    const data = await this.getAll();
    return data?.atajos;
  }
}

export const __testing = { openIDB, idbGet, idbSet, idbDel, idbKeys };
