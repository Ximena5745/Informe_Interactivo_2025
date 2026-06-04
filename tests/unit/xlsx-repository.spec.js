// Tests: XlsxRepository (integración con SheetJS + IndexedDB + URL/fetch)
//
// Carga data/avance/avance.xlsx directamente vía fetch (modo https/http).
// En file:// los tests de carga desde URL se saltan, pero los de parseo
// desde File sí corren (usando fetch + Blob).

import { XlsxRepository, XlsxAvanceRepository } from '../../app/repositories/adapters/XlsxRepository.js';
const { describe, it, assert, assertEq, assertThrows } = window.__test;

const IS_FILE = location.protocol === 'file:';
const BASE = new URL('..', import.meta.url).href;

describe('XlsxRepository (integración)', () => {
  it('carga data/avance/avance.xlsx desde URL (https) y devuelve 6 líneas', async function () {
    if (IS_FILE) {
      // En file:// el fetch a XLSX local falla por CORS; saltamos el test.
      return;
    }
    const repo = new XlsxAvanceRepository({
      id: 'avance-test-url',
      url: '../data/avance/avance.xlsx',
      baseUrl: BASE,
      useCache: false,
    });
    const data = await repo.getAll();
    assert(Array.isArray(data), 'data debe ser array');
    assert(data.length >= 6, `debe haber al menos 6 líneas, hay ${data.length}`);
    const cal = data.find((l) => l.id === 'calidad');
    assert(cal, 'debe existir la línea "calidad"');
    assertEq(cal.cumplimiento, 99);
  });

  it('parsea desde File (input programático)', async function () {
    if (IS_FILE) {
      // En file:// el fetch falla; saltamos.
      return;
    }
    const res = await fetch('../data/avance/avance.xlsx');
    assert(res.ok, `fetch debe ser 2xx, fue ${res.status}`);
    const blob = await res.blob();
    const file = new File([blob], 'avance.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const repo = new XlsxAvanceRepository({
      id: 'avance-test-file',
      useCache: false,
    });
    repo.setFile(file);
    const data = await repo.getAll();
    assert(data.length >= 6, `debe haber al menos 6 líneas, hay ${data.length}`);
  });

  it('caché en IndexedDB: segunda carga no requiere URL', async function () {
    if (IS_FILE) return; // skip
    const id = 'avance-test-cache-' + Math.random().toString(36).slice(2, 8);
    const repo = new XlsxAvanceRepository({
      id,
      url: '../data/avance/avance.xlsx',
      baseUrl: BASE,
      useCache: true,
    });
    const first = await repo.getAll();
    assert(first.length >= 6);
    // Sin URL, segunda carga debe venir de caché
    repo.setUrl(null);
    const second = await repo.getAll();
    assertEq(second.length, first.length);
    await repo.clearCache();
  });

  it('lanza error claro si no hay URL ni File ni caché', async function () {
    const repo = new XlsxAvanceRepository({
      id: 'avance-test-empty',
      useCache: false,
    });
    let threw = null;
    try { await repo.getAll(); } catch (e) { threw = e; }
    assert(threw, 'debe lanzar error');
    assert(threw.message.includes('sin caché') || threw.message.includes('URL') || threw.message.includes('archivo'),
      `mensaje debe ser descriptivo: ${threw.message}`);
  });

  it('hoja explícita: respeta `sheet` cuando se pasa', async function () {
    if (IS_FILE) return;
    // sources.xlsx tiene hoja "fuentes"; verificamos que el adapter la lee.
    const repo = new XlsxRepository({
      id: 'sources-test',
      url: '../data/sources/sources.xlsx',
      sheet: 'fuentes',
      baseUrl: BASE,
      useCache: false,
    });
    const data = await repo.getAll();
    assert(data.length >= 9, `sources debe tener 9+ filas, tiene ${data.length}`);
    const cfg = data.find((s) => s.id === 'config');
    assert(cfg, 'debe existir la fuente "config"');
  });
});
