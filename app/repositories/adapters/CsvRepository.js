// Adaptador CSV. Parsea archivos CSV con cabecera y los expone como objetos.
// Usa papaparse cuando esté disponible; fallback a parser nativo.

/**
 * Parser CSV simple con soporte de comillas dobles y escapes \n, \r, \", \\\\.
 * Suficiente para archivos institucionales pequeños/medianos.
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  while (i < n) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cell += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ',') {
      row.push(cell);
      cell = '';
      i += 1;
      continue;
    }
    if (ch === '\n' || ch === '\r') {
      row.push(cell);
      cell = '';
      rows.push(row);
      row = [];
      if (ch === '\r' && text[i + 1] === '\n') i += 2;
      else i += 1;
      continue;
    }
    cell += ch;
    i += 1;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows
    .slice(1)
    .filter((r) => r.length > 0 && r.some((c) => c !== ''))
    .map((r) => Object.fromEntries(headers.map((h, idx) => [h, (r[idx] ?? '').trim()])));
}

export class CsvRepository {
  constructor(url) {
    this.url = url;
    this._cache = null;
  }

  async _fetch() {
    if (this._cache) return this._cache;
    const res = await fetch(this.url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${this.url}`);
    const text = await res.text();
    this._cache = parseCsv(text);
    return this._cache;
  }

  async getAll() {
    return this._fetch();
  }

  /**
   * Convierte un CSV a la forma del contrato Avance.
   * Asume columnas: id, nombre, color, real, esperado, cumplimiento, retos, areas
   */
  async toAvance() {
    const rows = await this.getAll();
    const lineas = rows.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      color: r.color,
      icono: r.icono || 'default',
      slideId: `${r.id === 'transformacion' ? 'to' : r.id.slice(0, 3)}-avance`,
      logroSlideId: `${r.id.slice(0, 3)}-logro`,
      slidePPT: '',
      real: Number(r.real),
      esperado: Number(r.esperado),
      cumplimiento: Number(r.cumplimiento),
      retos: Number(r.retos),
      areas: Number(r.areas),
      logros: [],
    }));
    const total = lineas.reduce(
      (acc, l) => ({
        cumplimiento: acc.cumplimiento + l.cumplimiento,
        retos: acc.retos + l.retos,
        areas: acc.areas + l.areas,
      }),
      { cumplimiento: 0, retos: 0, areas: 0 }
    );
    return {
      fuente: this.url,
      global: {
        cumplimiento: Math.round(total.cumplimiento / lineas.length),
        retos: total.retos,
        areas: total.areas,
      },
      lineas,
    };
  }
}
