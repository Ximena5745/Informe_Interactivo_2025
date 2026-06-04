// Contrato para configuración (paleta, branding, atajos).

/** @typedef {Object} ConfigRecord
 *  @property {string} tenant
 *  @property {string} periodo
 *  @property {{ nombre: string, subtitulo: string, logo: string, diagramaLineas: string }} branding
 *  @property {Record<string,{hex:string,rol:string}>} paleta
 *  @property {{ familia: string, pesos: number[], fuente: string }} tipografia
 *  @property {Record<string,string[]>} atajos
 */

/** @typedef {Object} IConfigRepository
 *  @property {() => Promise<ConfigRecord>} getAll
 *  @property {() => Promise<Record<string,{hex:string,rol:string}>>} getPaleta
 *  @property {() => Promise<{ nombre: string, subtitulo: string, logo: string, diagramaLineas: string }>} getBranding
 *  @property {() => Promise<Record<string,string[]>>} getAtajos
 */

export const IConfigRepository = Symbol('IConfigRepository');
