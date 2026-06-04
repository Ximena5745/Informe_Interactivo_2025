// Registry/Factory de repositorios según `data/sources.json`.
// Aplica Open/Closed: agregar una fuente nueva no requiere modificar el código;
// basta con declararla en sources.json + registrar el adapter.

/**
 * Tipo de fuente soportado.
 *  - json  : archivo estático servido por HTTP
 *  - csv   : archivo CSV parseado en cliente
 *  - xlsx  : archivo Excel parseado con SheetJS
 *  - rest  : endpoint REST externo
 *  - graphql: endpoint GraphQL
 *  - indexeddb: base de datos local
 */
export const TIPOS_FUENTE = ['json', 'csv', 'xlsx', 'rest', 'graphql', 'indexeddb'];

/**
 * Construye un repositorio concreto a partir de su declaración en sources.json.
 * @param {string} nombre  clave lógica (p. ej. "avance")
 * @param {{ tipo: string, ruta?: string, endpoint?: string, hoja?: string, headers?: object }} declaracion
 * @returns {object} repositorio listo para usar
 */
export function crearRepositorio(nombre, declaracion) {
  if (!TIPOS_FUENTE.includes(declaracion.tipo)) {
    throw new Error(`Tipo de fuente no soportado: ${declaracion.tipo} (${nombre})`);
  }

  switch (declaracion.tipo) {
    case 'json':
      return import('./adapters/HttpJsonRepository.js').then((m) => {
        if (nombre === 'avance') return new m.HttpJsonAvanceRepository(declaracion.ruta);
        if (nombre === 'navegacion') return new m.HttpJsonNavegacionRepository(declaracion.ruta);
        if (nombre === 'config') return new m.HttpJsonConfigRepository(declaracion.ruta);
        return new m.HttpJsonRepository(declaracion.ruta);
      });

    case 'csv':
      return import('./adapters/CsvRepository.js').then((m) => new m.CsvRepository(declaracion.ruta));

    case 'xlsx':
      return import('./adapters/XlsxRepository.js').then(
        (m) => new m.XlsxRepository(declaracion.ruta, declaracion.hoja)
      );

    case 'rest':
      return import('./adapters/RestRepository.js').then(
        (m) => new m.RestRepository(declaracion.endpoint, declaracion.headers || {})
      );

    case 'graphql':
      return import('./adapters/GraphqlRepository.js').then(
        (m) => new m.GraphqlRepository(declaracion.endpoint)
      );

    case 'indexeddb':
      return import('./adapters/IndexedDbRepository.js').then(
        (m) => new m.IndexedDbRepository(declaracion.store)
      );

    default:
      throw new Error(`Tipo no implementado: ${declaracion.tipo}`);
  }
}

/**
 * Carga el registro de fuentes y construye todos los repositorios.
 * @param {string} sourcesUrl  ruta al archivo sources.json
 * @returns {Promise<Record<string, object>>} mapa nombre -> repositorio
 */
export async function cargarRepositorios(sourcesUrl = '/data/sources.json') {
  const res = await fetch(sourcesUrl);
  if (!res.ok) throw new Error(`No se pudo cargar ${sourcesUrl}`);
  const sources = await res.json();

  const entries = await Promise.all(
    Object.entries(sources.fuentes).map(async ([nombre, decl]) => {
      try {
        const repo = await crearRepositorio(nombre, decl);
        return [nombre, repo];
      } catch (err) {
        if (decl.obligatorio) throw err;
        console.warn(`[sources] fuente opcional "${nombre}" omitida:`, err.message);
        return [nombre, null];
      }
    })
  );

  return Object.fromEntries(entries);
}
