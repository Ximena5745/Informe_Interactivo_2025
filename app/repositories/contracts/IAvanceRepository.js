// Contract (interfaz) para repositorios de Avance / Kawak.
// Aplicar Interface Segregation: una sola responsabilidad por contrato.

/**
 * @typedef {Object} LineaEstrategicaRecord
 * @property {string}  id
 * @property {string}  nombre
 * @property {string}  color
 * @property {string}  icono
 * @property {string}  slideId
 * @property {string}  logroSlideId
 * @property {string}  slidePPT
 * @property {number}  real
 * @property {number}  esperado
 * @property {number}  cumplimiento
 * @property {number}  retos
 * @property {number}  areas
 * @property {string[]} logros
 */

/**
 * @typedef {Object} AvanceRecord
 * @property {string}   fuente
 * @property {{ cumplimiento: number, retos: number, areas: number }} global
 * @property {LineaEstrategicaRecord[]} lineas
 */

/**
 * Contrato base. Implementaciones: Json, Csv, Xlsx, Rest, KawakApi, GraphQL.
 * @typedef {Object} IAvanceRepository
 * @property {() => Promise<AvanceRecord>} getAll
 * @property {(lineaId: string) => Promise<LineaEstrategicaRecord|null>} findByLinea
 */

export const IAvanceRepository = Symbol('IAvanceRepository');
