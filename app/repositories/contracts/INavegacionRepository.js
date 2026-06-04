// Contrato para datos de navegación (mapa de slides, layouts, orden).
// Una sola responsabilidad: describir la topología de la app.

/**
 * @typedef {Object} SlideDef
 * @property {string}  id
 * @property {string}  titulo
 * @property {string}  layout
 * @property {string}  dataTitle
 * @property {string=} colorHeader
 * @property {string=} lineaId
 * @property {string=} imagen
 * @property {boolean=} lazy
 * @property {boolean=} pendiente
 * @property {string=} origen
 */

/**
 * @typedef {Object} NavegacionRecord
 * @property {string}    version
 * @property {string}    inicio
 * @property {SlideDef[]} slides
 */

/** @typedef {Object} INavegacionRepository
 *  @property {() => Promise<NavegacionRecord>} getAll
 *  @property {(id: string) => Promise<SlideDef|null>} findById
 *  @property {() => Promise<string>} getInicio
 *  @property {() => Promise<SlideDef[]>} getSlides
 */

export const INavegacionRepository = Symbol('INavegacionRepository');
